import { useState } from 'react';
import {
  FileText,
  ExternalLink,
  ShieldCheck,
  ShieldX,
  Loader2,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  ownerVerificationApi,
  type OwnerVerificationItem,
} from '@/services/certificate-api';
import RejectDocumentsModal from '@/pages/admin/owner-verification/components/RejectDocumentsModal';

interface OwnerDocumentsReviewPanelProps {
  owners: OwnerVerificationItem[];
  loading?: boolean;
  typeLabels?: Record<string, string>;
  emptyMessage?: string;
  showActions?: boolean;
  onChanged?: () => void;
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

function docStatus(
  doc: NonNullable<OwnerVerificationItem['documents']>[number],
) {
  if (doc.isReuploaded) {
    return {
      label: 'Đã nộp lại',
      color: '#22D3EE',
      bg: 'rgba(6,182,212,0.18)',
    };
  }
  if (doc.adminNote) {
    return {
      label: 'Bị từ chối',
      color: '#EF4444',
      bg: 'rgba(239,68,68,0.12)',
    };
  }
  return { label: 'Đã nộp', color: '#10B981', bg: 'rgba(16,185,129,0.12)' };
}

function ownerBadge(owner: OwnerVerificationItem) {
  if (owner.isDocumentApproved) {
    return { label: 'Đã duyệt', color: '#10B981', bg: 'rgba(16,185,129,0.12)' };
  }
  if (owner.isDocumentResubmitted) {
    return {
      label: 'Đã nộp lại — chờ duyệt',
      color: '#22D3EE',
      bg: 'rgba(6,182,212,0.18)',
    };
  }
  if (owner.isDocumentRejected) {
    return {
      label: 'Bị từ chối',
      color: '#EF4444',
      bg: 'rgba(239,68,68,0.12)',
    };
  }
  return {
    label: 'Chờ Admin duyệt',
    color: '#60A5FA',
    bg: 'rgba(59,130,246,0.12)',
  };
}

export default function OwnerDocumentsReviewPanel({
  owners,
  loading = false,
  typeLabels = {},
  emptyMessage = 'Không có hồ sơ chủ thuyền',
  showActions = true,
  onChanged,
}: OwnerDocumentsReviewPanelProps) {
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectOwner, setRejectOwner] = useState<OwnerVerificationItem | null>(
    null,
  );

  const documentTypeLabel = (code: string) => typeLabels[code] || code;

  const handleApprove = async (owner: OwnerVerificationItem) => {
    if (
      !confirm(
        `Phê duyệt hồ sơ pháp lý của "${owner.name}"? Sau khi duyệt, tạo tour, quản lý tàu và rút tiền sẽ được mở khóa.`,
      )
    ) {
      return;
    }
    setApprovingId(owner.id);
    try {
      const res = await ownerVerificationApi.approveDocuments(owner.id);
      if (res.status === 200) {
        toast.success('Đã phê duyệt hồ sơ pháp lý chủ thuyền');
        onChanged?.();
      } else {
        toast.error('Không thể phê duyệt hồ sơ pháp lý');
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Có lỗi xảy ra khi phê duyệt hồ sơ pháp lý';
      toast.error(message);
    } finally {
      setApprovingId(null);
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

  if (owners.length === 0) {
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
      <div className="space-y-4">
        {owners.map((owner) => {
          const badge = ownerBadge(owner);
          const docs = owner.documents || [];
          const busy = approvingId === owner.id;
          const canReview =
            showActions && !owner.isDocumentApproved && docs.length > 0;

          return (
            <div
              key={owner.id}
              className="overflow-hidden rounded-xl"
              style={{
                backgroundColor: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <User size={14} style={{ color: '#8892a0' }} />
                    <p
                      className="text-sm font-semibold"
                      style={{ color: '#fff' }}
                    >
                      {owner.name}
                    </p>
                    <span
                      className="inline-flex rounded-lg px-2 py-0.5 text-[10px] font-semibold"
                      style={{ backgroundColor: badge.bg, color: badge.color }}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <p className="mt-1 text-xs" style={{ color: '#8892a0' }}>
                    {owner.owner}
                    {owner.email ? ` · ${owner.email}` : ''}
                    {docs.length ? ` · ${docs.length} giấy tờ` : ''}
                  </p>
                </div>
                {canReview && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleApprove(owner)}
                      className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold transition-all hover:opacity-80 disabled:opacity-50"
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
                      Duyệt hồ sơ
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setRejectOwner(owner)}
                      className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold transition-all hover:opacity-80 disabled:opacity-50"
                      style={{
                        backgroundColor: 'rgba(239,68,68,0.12)',
                        color: '#EF4444',
                      }}
                    >
                      <ShieldX size={11} /> Từ chối
                    </button>
                  </div>
                )}
              </div>

              {docs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" style={{ minWidth: 520 }}>
                    <thead
                      style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                    >
                      <tr className="text-left">
                        {[
                          'Loại giấy tờ',
                          'Hết hạn',
                          'Trạng thái',
                          'Tài liệu',
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider"
                            style={{ color: '#8892a0' }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {docs.map((doc) => {
                        const status = owner.isDocumentApproved
                          ? {
                              label: 'Đã duyệt',
                              color: '#10B981',
                              bg: 'rgba(16,185,129,0.12)',
                            }
                          : docStatus(doc);
                        return (
                          <tr
                            key={doc.id}
                            className="border-t"
                            style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                          >
                            <td className="px-3 py-2.5">
                              <div className="flex items-center gap-2">
                                <FileText
                                  size={14}
                                  style={{ color: '#60A5FA' }}
                                />
                                <span
                                  className="text-xs font-semibold"
                                  style={{ color: '#fff' }}
                                >
                                  {documentTypeLabel(doc.documentType)}
                                </span>
                              </div>
                              {doc.adminNote && (
                                <p
                                  className="mt-1 text-[10px]"
                                  style={{ color: '#EF4444' }}
                                >
                                  Lý do: {doc.adminNote}
                                </p>
                              )}
                            </td>
                            <td
                              className="px-3 py-2.5 text-xs"
                              style={{ color: '#c8d0e0' }}
                            >
                              {formatDate(doc.expiryDate)}
                            </td>
                            <td className="px-3 py-2.5">
                              <span
                                className="inline-flex rounded-lg px-2 py-0.5 text-[10px] font-semibold"
                                style={{
                                  backgroundColor: status.bg,
                                  color: status.color,
                                }}
                              >
                                {status.label}
                              </span>
                            </td>
                            <td className="px-3 py-2.5">
                              <a
                                href={doc.documentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-semibold transition-colors hover:opacity-80"
                                style={{ color: '#FF385C' }}
                              >
                                <ExternalLink size={12} /> Xem
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p
                  className="px-4 pb-4 text-xs italic"
                  style={{ color: '#8892a0' }}
                >
                  Chưa có giấy tờ chủ thuyền
                </p>
              )}
            </div>
          );
        })}
      </div>

      <RejectDocumentsModal
        isOpen={Boolean(rejectOwner)}
        owner={rejectOwner}
        documentTypeLabel={documentTypeLabel}
        onClose={() => setRejectOwner(null)}
        onSuccess={() => onChanged?.()}
      />
    </>
  );
}
