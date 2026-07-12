import { useCallback, useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  ArrowLeft,
  CheckCircle2,
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
    if (json.bookingCode) return json.bookingCode;
    if (json.bookingId) return json.bookingId;
  } catch {
    // not JSON
  }

  const guidMatch = text.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
  );
  if (guidMatch) return guidMatch[0];

  return text;
}

type ScanState = 'idle' | 'scanning' | 'processing' | 'success' | 'error';

export default function KioskCheckinPage() {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const processingRef = useRef(false);
  const lastScanRef = useRef('');

  const [scanState, setScanState] = useState<ScanState>('idle');
  const [result, setResult] = useState<CheckInBookingResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
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
    setScanState('idle');
    processingRef.current = false;
    lastScanRef.current = '';
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

  const startScanner = useCallback(async () => {
    await enterKioskFullscreen();
    await stopScanner();
    setScanState('scanning');
    setResult(null);
    setErrorMsg('');

    const scanner = new Html5Qrcode(SCANNER_ID);
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 280, height: 280 } },
        (decoded) => handleCheckIn(decoded),
        () => {},
      );
    } catch {
      setScanState('error');
      setErrorMsg('Không thể mở camera. Vui lòng cấp quyền camera và thử lại.');
    }
  }, [handleCheckIn, stopScanner]);

  const handleEnterKioskMode = useCallback(async () => {
    setShowFullscreenPrompt(false);
    await startScanner();
  }, [startScanner]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner();
      exitKioskFullscreen();
    };
  }, [stopScanner]);

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

      <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
        {scanState === 'idle' && (
          <div className="flex flex-col items-center gap-6 text-center">
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
                Nhấn nút bên dưới để bật camera và quét mã QR trên vé
              </p>
            </div>
            <button
              onClick={startScanner}
              className="flex items-center gap-3 rounded-2xl px-10 py-4 text-lg font-bold text-white transition-transform hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${ACCENT}, #c00030)`,
              }}
            >
              <QrCode size={24} />
              Bắt đầu quét QR
            </button>
          </div>
        )}

        {(scanState === 'scanning' || scanState === 'processing') && (
          <div className="flex w-full max-w-lg flex-col items-center gap-4">
            <div
              id={SCANNER_ID}
              className="w-full overflow-hidden rounded-2xl"
              style={{ border: '2px solid rgba(255,56,92,0.3)' }}
            />
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
              onClick={resetToScan}
              className="mt-6 rounded-xl px-8 py-3 text-sm font-bold text-white"
              style={{ backgroundColor: ACCENT }}
            >
              Thử lại
            </button>
          </div>
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
