import { useState } from 'react';
import {
  FileText,
  ExternalLink,
  ShieldCheck,
  ShieldX,
  Loader2,
  Ship,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  certificateApi,
  CERTIFICATE_TYPE_LABELS,
  CERTIFICATE_STATUS_META,
  type CertificateListItem,
} from '@/services/certificate-api';
import RejectCertificateModal from './RejectCertificateModal';

interface CertificateReviewTableProps {
  certificates: CertificateListItem[];
  loading?: boolean;
  showBoatInfo?: boolean;
  showOwnerInfo?: boolean;
  typeLabels?: Record<string, string>;
  emptyMessage?: string;
  onChanged?: () => void;
}

function formatDate(value: string) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    // DateOnly often comes as YYYY-MM-DD
    const parts = value.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return value;
  }
  return d.toLocaleDateString('vi-VN');
}

export default function CertificateReviewTable({
  certificates,
  loading = false,
  showBoatInfo = true,
  showOwnerInfo = false,
  typeLabels,
  emptyMessage = 'Không có giấy tờ nào',
  onChanged,
}: CertificateReviewTableProps) {
  const labels = typeLabels ?? CERTIFICATE_TYPE_LABELS;
  const [actionId, setActionId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<CertificateListItem | null>(
    null,
  );
  const [rejecting, setRejecting] = useState(false);

  const handleApprove = async (cert: CertificateListItem) => {
    if (
      !confirm(
        `Duyệt giấy tờ "${labels[cert.certificateType] ?? cert.certificateType}" của tàu ${cert.boatName}?`,
      )
    ) {
      return;
    }
    setActionId(cert.id);
    try {
      const res = await certificateApi.approve(cert.id);
      if (res.status === 200 && res.data?.code === 1000) {
        toast.success('Đã duyệt giấy tờ thành công');
        onChanged?.();
      } else {
        toast.error('Không thể duyệt giấy tờ');
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Có lỗi xảy ra khi duyệt giấy tờ';
      toast.error(message);
    } finally {
      setActionId(null);
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!rejectTarget) return;
    setRejecting(true);
    try {
      const res = await certificateApi.reject(rejectTarget.id, reason);
      if (res.status === 200 && res.data?.code === 1000) {
        toast.success('Đã từ chối giấy tờ');
        setRejectTarget(null);
        onChanged?.();
      } else {
        toast.error('Không thể từ chối giấy tờ');
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Có lỗi xảy ra khi từ chối giấy tờ';
      toast.error(message);
    } finally {
      setRejecting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2
          size={24}
          className="animate-spin"
          style={{ color: '#8892a0' }}
        />
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <div
        className="rounded-xl py-10 text-center text-sm"
        style={{
          color: '#8892a0',
          backgroundColor: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      <div
        className="overflow-hidden rounded-xl"
        style={{ border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 640 }}>
            <thead style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
              <tr className="text-left">
                {[
                  'Loại giấy tờ',
                  ...(showBoatInfo ? ['Tàu'] : []),
                  ...(showOwnerInfo ? ['Chủ thuyền'] : []),
                  'Hết hạn',
                  'Trạng thái',
                  'Tài liệu',
                  'Thao tác',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: '#8892a0' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {certificates.map((cert) => {
                const statusMeta =
                  CERTIFICATE_STATUS_META[cert.status] ??
                  CERTIFICATE_STATUS_META.pending;
                const busy = actionId === cert.id;
                const canReview = cert.status === 'pending';

                return (
                  <tr
                    key={cert.id}
                    className="border-t"
                    style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                  >
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <FileText size={14} style={{ color: '#FF385C' }} />
                        <span
                          className="text-xs font-semibold"
                          style={{ color: '#fff' }}
                        >
                          {labels[cert.certificateType] ?? cert.certificateType}
                        </span>
                      </div>
                      {cert.rejectionReason && (
                        <p
                          className="mt-1 text-[10px]"
                          style={{ color: '#EF4444' }}
                        >
                          Lý do: {cert.rejectionReason}
                        </p>
                      )}
                    </td>
                    {showBoatInfo && (
                      <td className="px-3 py-3">
                        <div
                          className="flex items-center gap-1.5 text-xs"
                          style={{ color: '#c8d0e0' }}
                        >
                          <Ship size={12} style={{ color: '#8892a0' }} />
                          {cert.boatName}
                        </div>
                      </td>
                    )}
                    {showOwnerInfo && (
                      <td className="px-3 py-3">
                        <div
                          className="flex items-center gap-1.5 text-xs"
                          style={{ color: '#c8d0e0' }}
                        >
                          <User size={12} style={{ color: '#8892a0' }} />
                          {cert.ownerName || '—'}
                        </div>
                      </td>
                    )}
                    <td
                      className="px-3 py-3 text-xs"
                      style={{ color: '#c8d0e0' }}
                    >
                      {formatDate(cert.expiryDate)}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className="inline-flex rounded-lg px-2 py-0.5 text-[10px] font-semibold"
                        style={{
                          backgroundColor: statusMeta.bg,
                          color: statusMeta.color,
                        }}
                      >
                        {statusMeta.label}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <a
                        href={cert.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold transition-colors hover:opacity-80"
                        style={{ color: '#FF385C' }}
                      >
                        <ExternalLink size={12} /> Xem
                      </a>
                    </td>
                    <td className="px-3 py-3">
                      {canReview ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => handleApprove(cert)}
                            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold transition-all hover:opacity-80 disabled:opacity-50"
                            style={{
                              backgroundColor: 'rgba(16,185,129,0.12)',
                              color: '#10B981',
                            }}
                          >
                            {busy ? (
                              <Loader2 size={11} className="animate-spin" />
                            ) : (
                              <ShieldCheck size={11} />
                            )}
                            Duyệt
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => setRejectTarget(cert)}
                            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold transition-all hover:opacity-80 disabled:opacity-50"
                            style={{
                              backgroundColor: 'rgba(239,68,68,0.12)',
                              color: '#EF4444',
                            }}
                          >
                            <ShieldX size={11} /> Từ chối
                          </button>
                        </div>
                      ) : (
                        <span
                          className="text-[10px]"
                          style={{ color: '#8892a0' }}
                        >
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <RejectCertificateModal
        key={rejectTarget?.id ?? 'closed'}
        open={!!rejectTarget}
        certificate={rejectTarget}
        submitting={rejecting}
        onClose={() => !rejecting && setRejectTarget(null)}
        onConfirm={handleRejectConfirm}
      />
    </>
  );
}
