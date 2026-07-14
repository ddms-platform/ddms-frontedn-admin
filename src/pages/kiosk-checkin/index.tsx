import { useCallback, useEffect, useRef, useState } from 'react';
import { Html5Qrcode, type CameraDevice } from 'html5-qrcode';
import {
  ArrowLeft,
  CheckCircle2,
  Keyboard,
  Loader2,
  QrCode,
  ScanLine,
  XCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { routeName } from '@/constants/route-name';
import {
  checkInService,
  type CheckInBookingResponse,
} from '@/services/checkInService';
import {
  consumeKioskFullscreenRequest,
  enterKioskFullscreen,
  exitKioskFullscreen,
} from '@/utils/kiosk-fullscreen';

const ACCENT = '#FF385C';
const SCANNER_ID = 'kiosk-qr-reader';

function isLocalHost(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

/** Mobile/LAN over HTTP cannot use camera — browser security policy. */
function getCameraBlockedReason(): string | null {
  if (typeof window === 'undefined') return null;
  if (window.isSecureContext || isLocalHost(window.location.hostname)) {
    return null;
  }
  return 'Trình duyệt không cho phép camera qua HTTP + IP LAN (chỉ hỗ trợ HTTPS hoặc localhost). Dùng laptop để quét QR, hoặc nhập mã vé thủ công bên dưới.';
}

function formatCameraError(error: unknown): string {
  const message =
    error instanceof Error ? error.message : 'Không tìm thấy camera';
  if (message.includes('Permission') || message.includes('NotAllowed')) {
    return 'Trình duyệt đã chặn quyền camera. Vui lòng cho phép camera trong cài đặt trình duyệt, hoặc dùng nhập mã thủ công.';
  }
  if (getCameraBlockedReason()) {
    return getCameraBlockedReason()!;
  }
  return `Không thể mở camera: ${message}. Bạn có thể nhập mã vé thủ công.`;
}

function playBeep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
  } catch {
    // ignore if audio blocked
  }
}

function extractBookingCode(raw: string): string {
  const text = raw.trim();
  if (!text) return '';

  try {
    const json = JSON.parse(text) as {
      bookingId?: string;
      bookingCode?: string;
    };
    if (json.bookingId) return json.bookingId;
    if (json.bookingCode) return json.bookingCode;
  } catch {
    // not JSON
  }

  const guidMatch = text.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
  );
  if (guidMatch) return guidMatch[0];

  return text;
}

async function startCameraWithFallback(
  scanner: Html5Qrcode,
  onDecode: (decodedText: string) => void,
) {
  const scanConfig = { fps: 10, qrbox: { width: 280, height: 280 } };
  const noop = () => {};

  const tryStart = async (camera: string | MediaTrackConstraints) => {
    await scanner.start(camera, scanConfig, onDecode, noop);
  };

  const attempts: Array<string | MediaTrackConstraints> = [
    { facingMode: 'environment' },
    { facingMode: 'user' },
  ];

  let lastError: unknown;
  for (const camera of attempts) {
    try {
      await tryStart(camera);
      return;
    } catch (error) {
      lastError = error;
    }
  }

  let cameras: CameraDevice[] = [];
  try {
    cameras = await Html5Qrcode.getCameras();
  } catch (error) {
    lastError = error;
  }

  for (const camera of cameras) {
    try {
      await tryStart(camera.id);
      return;
    } catch (error) {
      lastError = error;
    }
  }

  const detail =
    lastError instanceof Error ? lastError.message : 'Không tìm thấy camera';
  throw new Error(detail);
}

type ScanState = 'idle' | 'scanning' | 'processing' | 'success' | 'error';

export default function KioskCheckinPage() {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const processingRef = useRef(false);
  const lastScanRef = useRef('');
  const shouldStartCameraRef = useRef(false);

  const [scanState, setScanState] = useState<ScanState>('idle');
  const [result, setResult] = useState<CheckInBookingResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [showManualInput, setShowManualInput] = useState(
    () => !!getCameraBlockedReason(),
  );
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(() =>
    consumeKioskFullscreenRequest(),
  );

  const stopScanner = useCallback(async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
    }
    scannerRef.current?.clear();
    scannerRef.current = null;
  }, []);

  const resetToScan = useCallback(async () => {
    setResult(null);
    setErrorMsg('');
    setManualCode('');
    setShowManualInput(false);
    setScanState('idle');
    processingRef.current = false;
    lastScanRef.current = '';
    shouldStartCameraRef.current = false;
    await stopScanner();
  }, [stopScanner]);

  const handleCheckIn = useCallback(
    async (decodedText: string) => {
      const code = extractBookingCode(decodedText);
      if (!code || processingRef.current) return;
      if (lastScanRef.current === code) return;

      processingRef.current = true;
      lastScanRef.current = code;
      setScanState('processing');
      setErrorMsg('');

      try {
        const data = await checkInService.checkIn(code);
        playBeep();
        setResult(data);
        setScanState('success');
        await stopScanner();
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Không thể check-in vé này';
        setErrorMsg(msg);
        setScanState('error');
        setTimeout(() => {
          processingRef.current = false;
          lastScanRef.current = '';
          setScanState('scanning');
          setErrorMsg('');
        }, 2500);
      }
    },
    [stopScanner],
  );

  const requestStartScanner = useCallback(async () => {
    const blockedReason = getCameraBlockedReason();
    if (blockedReason) {
      setResult(null);
      setErrorMsg(blockedReason);
      setScanState('error');
      setShowManualInput(true);
      return;
    }

    await enterKioskFullscreen();
    await stopScanner();
    setResult(null);
    setErrorMsg('');
    setShowManualInput(false);
    shouldStartCameraRef.current = true;
    setScanState('scanning');
  }, [stopScanner]);

  const handleManualSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      const code = manualCode.trim();
      if (!code) return;
      await stopScanner();
      shouldStartCameraRef.current = false;
      await handleCheckIn(code);
    },
    [handleCheckIn, manualCode, stopScanner],
  );

  const handleEnterKioskMode = useCallback(async () => {
    setShowFullscreenPrompt(false);
    await requestStartScanner();
  }, [requestStartScanner]);

  useEffect(() => {
    if (scanState !== 'scanning' || !shouldStartCameraRef.current) return;

    let cancelled = false;

    const bootScanner = async () => {
      await stopScanner();

      const scanner = new Html5Qrcode(SCANNER_ID);
      scannerRef.current = scanner;

      try {
        await startCameraWithFallback(scanner, (decoded) => {
          void handleCheckIn(decoded);
        });
        if (!cancelled) {
          shouldStartCameraRef.current = false;
        }
      } catch (error) {
        if (cancelled) return;
        shouldStartCameraRef.current = false;
        setScanState('error');
        setErrorMsg(formatCameraError(error));
        setShowManualInput(true);
        await stopScanner();
      }
    };

    void bootScanner();

    return () => {
      cancelled = true;
    };
  }, [handleCheckIn, scanState, stopScanner]);

  useEffect(() => {
    return () => {
      void stopScanner();
      void exitKioskFullscreen();
    };
  }, [stopScanner]);

  const scannerVisible = scanState === 'scanning' || scanState === 'processing';
  const cameraBlockedReason = getCameraBlockedReason();

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col overflow-hidden min-h-screen min-w-screen"
      style={{ backgroundColor: '#060d1a' }}
    >
      {showFullscreenPrompt && (
        <div
          className="absolute inset-0 z-60 flex flex-col items-center justify-center gap-6 p-8 text-center"
          style={{ backgroundColor: 'rgba(6,13,26,0.98)' }}
        >
          <ScanLine size={72} style={{ color: ACCENT }} />
          <div>
            <h2 className="text-3xl font-bold text-white">Chế độ Kiosk</h2>
            <p className="mt-3 max-w-md text-sm" style={{ color: '#8892a0' }}>
              Nhấn nút bên dưới để vào toàn màn hình và bắt đầu quét QR vé
            </p>
          </div>
          <button
            type="button"
            onClick={handleEnterKioskMode}
            className="flex items-center gap-3 rounded-2xl px-12 py-5 text-xl font-bold text-white transition-transform hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${ACCENT}, #c00030)`,
            }}
          >
            <QrCode size={28} />
            Vào toàn màn hình & Quét QR
          </button>
        </div>
      )}
      <header
        className="flex shrink-0 items-center justify-between px-6 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: 'rgba(255,56,92,0.15)' }}
          >
            <QrCode size={22} style={{ color: ACCENT }} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Kiosk Check-in</h1>
            <p className="text-xs" style={{ color: '#8892a0' }}>
              Quét mã QR trên vé điện tử để ghi nhận lên tàu
            </p>
          </div>
        </div>
        <Link
          to={routeName.admin}
          onClick={() => exitKioskFullscreen()}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors hover:bg-white/5"
          style={{
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <ArrowLeft size={16} />
          Dashboard
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6 overflow-y-auto">
        <div
          id={SCANNER_ID}
          className={`w-full max-w-lg overflow-hidden rounded-2xl ${
            scannerVisible ? 'block' : 'hidden'
          }`}
          style={{ border: '2px solid rgba(255,56,92,0.3)', minHeight: 280 }}
        />

        {scanState === 'idle' && (
          <div className="flex flex-col items-center gap-6 text-center">
            {cameraBlockedReason && (
              <div
                className="w-full max-w-lg rounded-2xl px-5 py-4 text-left text-sm"
                style={{
                  backgroundColor: 'rgba(255,56,92,0.12)',
                  border: '1px solid rgba(255,56,92,0.35)',
                  color: '#ffb4c2',
                }}
              >
                <p className="font-semibold text-white">
                  Camera không khả dụng trên điện thoại / LAN
                </p>
                <p className="mt-2">{cameraBlockedReason}</p>
              </div>
            )}
            <div
              className="flex h-32 w-32 items-center justify-center rounded-3xl"
              style={{
                backgroundColor: 'rgba(255,56,92,0.1)',
                border: '2px dashed rgba(255,56,92,0.3)',
              }}
            >
              <ScanLine size={56} style={{ color: ACCENT }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Sẵn sàng quét</h2>
              <p className="mt-2 text-sm" style={{ color: '#8892a0' }}>
                {cameraBlockedReason ? (
                  'Dùng laptop (localhost hoặc HTTPS) để quét QR, hoặc nhập mã vé thủ công bên dưới.'
                ) : (
                  <>
                    Nhấn nút để bật camera. Trình duyệt sẽ hỏi quyền truy cập
                    camera — chọn{' '}
                    <strong className="text-white">Cho phép</strong>.
                  </>
                )}
              </p>
            </div>
            {!cameraBlockedReason && (
              <button
                type="button"
                onClick={requestStartScanner}
                className="flex items-center gap-3 rounded-2xl px-10 py-4 text-lg font-bold text-white transition-transform hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${ACCENT}, #c00030)`,
                }}
              >
                <QrCode size={24} />
                Bắt đầu quét QR
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowManualInput((v) => !v)}
              className="flex items-center gap-2 text-sm font-medium"
              style={{ color: '#8892a0' }}
            >
              <Keyboard size={16} />
              {showManualInput
                ? 'Ẩn nhập mã thủ công'
                : 'Nhập mã vé thủ công (test)'}
            </button>
          </div>
        )}

        {(scanState === 'scanning' || scanState === 'processing') && (
          <div className="flex w-full max-w-lg flex-col items-center gap-4">
            {scanState === 'processing' && (
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                <Loader2
                  className="h-5 w-5 animate-spin"
                  style={{ color: ACCENT }}
                />
                Đang xác nhận vé...
              </div>
            )}
            {scanState === 'scanning' && (
              <p className="text-sm" style={{ color: '#8892a0' }}>
                Đưa mã QR vào khung hình — hệ thống sẽ tự động quét
              </p>
            )}
            <button
              type="button"
              onClick={resetToScan}
              className="rounded-xl px-6 py-2 text-sm font-semibold text-white hover:bg-white/5"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}
            >
              Dừng quét
            </button>
          </div>
        )}

        {scanState === 'success' && result && (
          <div
            className="w-full max-w-md rounded-2xl p-8 text-center"
            style={{
              backgroundColor: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.25)',
            }}
          >
            <CheckCircle2
              size={64}
              className="mx-auto mb-4"
              style={{ color: '#10B981' }}
            />
            <h2 className="text-2xl font-bold text-white">
              Check-in thành công!
            </h2>
            <p className="mt-1 text-sm font-mono" style={{ color: '#10B981' }}>
              Bíp ✓
            </p>
            <div
              className="mt-6 space-y-3 rounded-xl p-5 text-left"
              style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
            >
              <Row label="Mã vé" value={result.bookingCode} />
              <Row label="Khách hàng" value={result.customerName} />
              <Row label="Tour" value={result.tourName} />
              <Row label="Tàu" value={result.boatName} />
              <Row label="Số khách" value={`${result.numPeople} người`} />
              <Row label="Khởi hành" value={result.departureTime} />
            </div>
            <button
              type="button"
              onClick={resetToScan}
              className="mt-6 w-full rounded-xl py-3 text-sm font-bold text-white"
              style={{ backgroundColor: '#10B981' }}
            >
              Quét vé tiếp theo
            </button>
          </div>
        )}

        {scanState === 'error' && errorMsg && (
          <div
            className="w-full max-w-md rounded-2xl p-8 text-center"
            style={{
              backgroundColor: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.25)',
            }}
          >
            <XCircle
              size={56}
              className="mx-auto mb-4"
              style={{ color: '#EF4444' }}
            />
            <h2 className="text-xl font-bold text-white">Quét thất bại</h2>
            <p className="mt-2 text-sm" style={{ color: '#EF4444' }}>
              {errorMsg}
            </p>
            <button
              type="button"
              onClick={resetToScan}
              className="mt-6 rounded-xl px-8 py-3 text-sm font-bold text-white"
              style={{ backgroundColor: ACCENT }}
            >
              Thử lại
            </button>
          </div>
        )}

        {showManualInput && scanState !== 'success' && (
          <form
            onSubmit={handleManualSubmit}
            className="w-full max-w-md rounded-2xl p-5"
            style={{
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <p className="mb-3 text-sm font-semibold text-white">
              Nhập mã vé / dán nội dung QR
            </p>
            <input
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="VD: A1B2C3D4 hoặc booking UUID"
              className="w-full rounded-xl border px-4 py-3 text-sm text-white outline-none"
              style={{
                borderColor: 'rgba(255,255,255,0.12)',
                backgroundColor: 'rgba(0,0,0,0.25)',
              }}
            />
            <button
              type="submit"
              disabled={!manualCode.trim() || scanState === 'processing'}
              className="mt-3 w-full rounded-xl py-3 text-sm font-bold text-white disabled:opacity-50"
              style={{ backgroundColor: ACCENT }}
            >
              Xác nhận check-in
            </button>
          </form>
        )}
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span style={{ color: '#8892a0' }}>{label}</span>
      <span className="font-semibold text-white text-right">{value}</span>
    </div>
  );
}
