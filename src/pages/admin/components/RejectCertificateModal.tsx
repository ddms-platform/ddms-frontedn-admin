import { useState } from 'react';
import { X, ShieldX, Loader2 } from 'lucide-react';
import type { CertificateListItem } from '@/services/certificate-api';
import { CERTIFICATE_TYPE_LABELS } from '@/services/certificate-api';

const ACCENT = '#FF385C';

interface RejectCertificateModalProps {
  open: boolean;
  certificate: CertificateListItem | null;
  submitting?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export default function RejectCertificateModal({
  open,
  certificate,
  submitting = false,
  onClose,
  onConfirm,
}: RejectCertificateModalProps) {
  const [reason, setReason] = useState('');

  if (!open || !certificate) return null;

  const typeLabel =
    CERTIFICATE_TYPE_LABELS[certificate.certificateType] ??
    certificate.certificateType;

  return (
    <>
      <div
        className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm"
        onClick={submitting ? undefined : onClose}
      />
      <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
        <div
          className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
          style={{
            backgroundColor: '#0d1629',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: 'rgba(239,68,68,0.12)' }}
              >
                <ShieldX size={18} style={{ color: '#EF4444' }} />
              </div>
              <div>
                <h3 className="text-base font-bold" style={{ color: '#fff' }}>
                  Từ chối giấy tờ
                </h3>
                <p className="text-xs mt-0.5" style={{ color: '#8892a0' }}>
                  {certificate.boatName} · {typeLabel}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg p-1.5 hover:bg-white/10"
              style={{ color: '#8892a0' }}
            >
              <X size={16} />
            </button>
          </div>

          <label
            className="block text-xs font-semibold mb-2"
            style={{ color: '#c8d0e0' }}
          >
            Lý do từ chối <span style={{ color: ACCENT }}>*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            disabled={submitting}
            placeholder="Ví dụ: Ảnh mờ, thiếu chữ ký, ngày hết hạn không khớp..."
            className="w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
            }}
          />

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl px-4 py-2 text-xs font-semibold transition-all hover:bg-white/5"
              style={{
                color: '#c8d0e0',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={submitting || !reason.trim()}
              onClick={() => onConfirm(reason.trim())}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#EF4444', color: '#fff' }}
            >
              {submitting ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <ShieldX size={13} />
              )}
              Xác nhận từ chối
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
