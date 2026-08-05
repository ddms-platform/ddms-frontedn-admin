import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ShieldAlert,
  Volume2,
  VolumeX,
  CheckCircle,
  ExternalLink,
  Anchor,
  User,
  Phone,
  MapPin,
  Bell,
} from 'lucide-react';
import { sosService, type SosAlert } from '@/services/sosService';
import { sosSignalRService } from '@/services/sosSignalRService';

export const AdminSosAlertWidget: React.FC = () => {
  const [activeAlerts, setActiveAlerts] = useState<SosAlert[]>([]);
  const [currentAlert, setCurrentAlert] = useState<SosAlert | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sirenIntervalRef = useRef<number | null>(null);

  const stopSirenAudio = useCallback(() => {
    if (sirenIntervalRef.current) {
      clearInterval(sirenIntervalRef.current);
      sirenIntervalRef.current = null;
    }
  }, []);

  // Synthesize realistic dual-tone loud emergency alarm siren
  const startSirenAudio = useCallback(() => {
    if (isAudioMuted) return;

    try {
      if (!audioContextRef.current) {
        const AudioCtx =
          window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioCtx();
      }

      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (sirenIntervalRef.current) return; // already playing

      let highPitch = true;
      sirenIntervalRef.current = window.setInterval(() => {
        if (!audioContextRef.current || isAudioMuted) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(highPitch ? 960 : 640, ctx.currentTime);

        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);

        highPitch = !highPitch;
      }, 400);
    } catch (err) {
      console.warn('Audio Siren playback error:', err);
    }
  }, [isAudioMuted]);

  const initSignalR = useCallback(async () => {
    await sosSignalRService.startConnection();

    sosSignalRService.onReceiveSosAlert((newAlert) => {
      console.log('🔴 RECEIVED REAL-TIME SOS ALERT IN ADMIN:', newAlert);
      setActiveAlerts((prev) => [
        newAlert,
        ...prev.filter((a) => a.id !== newAlert.id),
      ]);
      setCurrentAlert(newAlert);
      startSirenAudio();
    });

    sosSignalRService.onSosAlertResolved((sosId) => {
      console.log('🟢 SOS ALERT RESOLVED:', sosId);
      setActiveAlerts((prev) => {
        const updated = prev.filter((a) => a.id !== sosId);
        if (updated.length === 0) {
          setCurrentAlert(null);
          stopSirenAudio();
        } else {
          setCurrentAlert(updated[0]);
        }
        return updated;
      });
    });
  }, [startSirenAudio, stopSirenAudio]);

  // Auto unlock AudioContext on user interaction anywhere on screen
  useEffect(() => {
    const handleUserGesture = () => {
      if (!audioUnlocked) {
        if (!audioContextRef.current) {
          const AudioCtx =
            window.AudioContext || (window as any).webkitAudioContext;
          audioContextRef.current = new AudioCtx();
        }
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume().then(() => {
            setAudioUnlocked(true);
          });
        } else {
          setAudioUnlocked(true);
        }
      }
    };

    window.addEventListener('click', handleUserGesture, { once: true });
    window.addEventListener('keydown', handleUserGesture, { once: true });

    return () => {
      window.removeEventListener('click', handleUserGesture);
      window.removeEventListener('keydown', handleUserGesture);
    };
  }, [audioUnlocked]);

  // Fetch active alerts on mount & start SignalR listener
  useEffect(() => {
    let isMounted = true;

    sosService
      .getActiveAlerts()
      .then((list) => {
        if (isMounted) {
          setActiveAlerts(list);
          if (list.length > 0) {
            setCurrentAlert(list[0]);
          }
        }
      })
      .catch((err) => {
        console.warn('Could not fetch active SOS alerts:', err);
      });

    initSignalR();

    return () => {
      isMounted = false;
      stopSirenAudio();
    };
  }, [initSignalR, stopSirenAudio]);

  // Control siren playback based on active alerts state
  useEffect(() => {
    if (activeAlerts.length > 0 && !isAudioMuted) {
      startSirenAudio();
    } else {
      stopSirenAudio();
    }
  }, [activeAlerts, isAudioMuted, startSirenAudio, stopSirenAudio]);

  const handleResolve = async (id: string) => {
    try {
      await sosService.resolveSos(
        id,
        'Đã cử lực lượng Cảng vụ ứng cứu kịp thời',
      );
      setActiveAlerts((prev) => prev.filter((a) => a.id !== id));
      if (activeAlerts.length <= 1) {
        setCurrentAlert(null);
        stopSirenAudio();
      } else {
        setCurrentAlert(activeAlerts[1]);
      }
    } catch (err) {
      console.error('Failed to resolve SOS alert:', err);
    }
  };

  const toggleMute = () => {
    if (isAudioMuted) {
      setIsAudioMuted(false);
      startSirenAudio();
    } else {
      setIsAudioMuted(true);
      stopSirenAudio();
    }
  };

  const unlockAudioManual = () => {
    if (!audioContextRef.current) {
      const AudioCtx =
        window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioCtx();
    }
    audioContextRef.current.resume().then(() => {
      setAudioUnlocked(true);
      if (activeAlerts.length > 0) {
        startSirenAudio();
      }
    });
  };

  if (!currentAlert) {
    return (
      // Silent audio unlock button if audio is suspended and no current modal
      !audioUnlocked ? (
        <button
          onClick={unlockAudioManual}
          className="fixed bottom-4 right-4 z-99999 bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 shadow-xl flex items-center gap-2 transition cursor-pointer"
        >
          <Bell className="w-4 h-4 text-yellow-400 animate-pulse" />
          <span>Kích hoạt còi báo SOS</span>
        </button>
      ) : null
    );
  }

  const googleMapsUrl = `https://www.google.com/maps?q=${currentAlert.latitude},${currentAlert.longitude}`;

  return (
    <div className="fixed inset-0 z-999999 pointer-events-auto">
      {/* ── Flashing Fullscreen Red Emergency Border ── */}
      <div className="fixed inset-0 pointer-events-none z-999990 border-12 border-red-600 animate-pulse" />

      {/* ── Flashing Emergency Header Banner ── */}
      <div className="fixed top-0 left-0 right-0 z-999995 bg-red-600 text-white px-6 py-3 shadow-2xl flex items-center justify-between animate-pulse">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-7 h-7 text-yellow-300 animate-bounce" />
          <div>
            <h3 className="font-black tracking-wider text-base uppercase">
              CẢNH BÁO SOS THỜI GIAN THỰC - YÊU CẦU CỨU HỘ KHẨN CẤP (
              {activeAlerts.length} SỰ CỐ)
            </h3>
            <p className="text-xs text-red-100 font-medium">
              Tín hiệu nguy cấp từ Thuyền trưởng trên biển Đà Nẵng
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!audioUnlocked && (
            <button
              onClick={unlockAudioManual}
              className="px-3 py-1.5 bg-yellow-400 text-slate-900 font-black rounded-lg text-xs animate-bounce shadow-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>BẬT CÒI BÁO ĐỘNG</span>
            </button>
          )}

          <button
            onClick={toggleMute}
            className="p-2 bg-red-800 hover:bg-red-700 text-white rounded-lg border border-red-400/50 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          >
            {isAudioMuted ? (
              <VolumeX className="w-4 h-4 text-red-300" />
            ) : (
              <Volume2 className="w-4 h-4 text-yellow-300 animate-bounce" />
            )}
            <span>{isAudioMuted ? 'Mở Tiếng Còi' : 'Tắt Tiếng Còi'}</span>
          </button>
        </div>
      </div>

      {/* ── Emergency Modal Overlay Card ── */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-999998 flex items-center justify-center p-4">
        <div className="bg-linear-to-b from-[#130707] via-[#0d1424] to-[#080d19] border-2 border-red-500 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden text-slate-100">
          <div className="absolute top-0 right-0 w-40 h-40 bg-red-600/20 rounded-full blur-3xl -mr-12 -mt-12 animate-pulse" />

          {/* Alert Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-red-500/30">
            <div className="flex items-center gap-3">
              <div className="p-3.5 bg-red-600/30 border border-red-500/50 rounded-2xl animate-pulse">
                <ShieldAlert className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 bg-red-600/40 text-red-300 border border-red-500/40 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                  CẢNH BÁO KHẨN CẤP
                </span>
                <h2 className="text-xl font-black text-white mt-1">
                  SỰ CỐ CẦN ỨNG CỨU GẤP
                </h2>
              </div>
            </div>

            <span className="text-xs text-red-300 font-mono">
              {new Date(currentAlert.created_at).toLocaleTimeString('vi-VN')}
            </span>
          </div>

          {/* Captain & Boat Details */}
          <div className="space-y-3.5 mb-6 text-sm">
            <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-400 text-xs">Thuyền trưởng:</span>
              </div>
              <span className="font-bold text-white">
                {currentAlert.user_name || 'Đang cập nhật'}
              </span>
            </div>

            <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-400 text-xs">Số điện thoại:</span>
              </div>
              <span className="font-bold text-emerald-300 font-mono">
                {currentAlert.user_phone || 'Chưa có SĐT'}
              </span>
            </div>

            <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2.5">
                <Anchor className="w-4 h-4 text-blue-400" />
                <span className="text-slate-400 text-xs">Tàu du lịch:</span>
              </div>
              <span className="font-bold text-cyan-200">
                {currentAlert.boat_name || 'Tàu du lịch'} (
                {currentAlert.registration_number || 'SỐ HIỆU ĐN'})
              </span>
            </div>

            <div className="flex items-center justify-between bg-rose-950/40 p-3.5 rounded-2xl border border-rose-500/40">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-5 h-5 text-rose-400 animate-bounce" />
                <span className="text-rose-200 text-xs font-bold">
                  Tọa độ GPS phát SOS:
                </span>
              </div>
              <span className="font-mono font-black text-white text-sm">
                {currentAlert.latitude.toFixed(5)},{' '}
                {currentAlert.longitude.toFixed(5)}
              </span>
            </div>

            {currentAlert.note && (
              <p className="text-xs text-slate-300 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 leading-relaxed">
                <span className="text-red-400 font-bold">Ghi chú: </span>
                {currentAlert.note}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition border border-cyan-500/30 shadow-lg"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Xem Bản Đồ Maps</span>
            </a>

            <button
              onClick={() => handleResolve(currentAlert.id)}
              className="flex-1 py-3 px-4 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-xl transition cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Xác Nhận Đã Cứu Hộ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
