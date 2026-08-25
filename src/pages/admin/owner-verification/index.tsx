import { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldX,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Phone,
  MapPin,
  Mail,
  FileText,
  Ship,
  Info,
  AlertTriangle,
  ExternalLink,
  Building2,
  Bell,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Api } from '@/services/axios';
import { toast } from 'sonner';
import Pagination from '@/components/shared/pagination';
import CertificateReviewTable from '@/pages/admin/components/CertificateReviewTable';
import RejectDocumentsModal from './components/RejectDocumentsModal';
import {
  CERTIFICATE_STATUS_META,
  OWNER_ENTITY_TYPE_LABELS,
  buildTypeLabelMap,
  certificateApi,
  type CertificateListItem,
  type OwnerDocumentListItem,
  type OwnerEntityType,
} from '@/services/certificate-api';

const ACCENT = '#FF385C';
const CARD = {
  backgroundColor: '#0d1629',
  border: '1px solid rgba(255,255,255,0.06)',
} as const;

type Status = 'pending' | 'verified' | 'rejected';
type FilterType = 'all' | Status | 'overdue';

const ST_MAP: Record<
  Status,
  { label: string; color: string; bg: string; icon: typeof Clock }
> = {
  pending: {
    label: 'Đang chờ',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.12)',
    icon: Clock,
  },
  verified: {
    label: 'Đã xác thực',
    color: '#10B981',
    bg: 'rgba(16,185,129,0.12)',
    icon: CheckCircle,
  },
  rejected: {
    label: 'Từ chối',
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.12)',
    icon: XCircle,
  },
};

interface VesselData {
  id: string;
  name: string;
  type: string;
  length?: number;
  beam?: number;
  registrationNumber: string;
  mooringType: string;
  expectedDockingDate: string;
  requiredServices: string[];
  documentUrls: string[];
  imageUrls: string[];
  certificates?: CertificateListItem[];
  maxPassengers?: number;
  status: string;
}

interface OwnerData {
  id: string;
  name: string;
  owner: string;
  email: string;
  phone: string;
  address: string;
  license: string;
  entityType: OwnerEntityType | string;
  submitted: string;
  status: Status;
  boats: number;
  documentUploadDeadline?: string | null;
  isDocumentDeadlineExpired?: boolean;
  isDocumentCompleted?: boolean;
  isDocumentPendingReview?: boolean;
  isDocumentApproved?: boolean;
  isDocumentRejected?: boolean;
  isDocumentResubmitted?: boolean;
  lastDocumentRejectedAt?: string | null;
  lastDocumentUpdatedAt?: string | null;
  documents?: OwnerDocumentListItem[];
  vessels?: VesselData[];
}

function formatExpiryDate(value?: string | null) {
  if (!value) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : value;
}

function formatDateTime(value?: string | null) {
  if (!value) return '';
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return value;
  }
}

function getOwnerCertAlerts(owner: OwnerData) {
  const certs = owner.vessels?.flatMap((v) => v.certificates || []) ?? [];
  const pendingCount = certs.filter((c) => c.status === 'pending').length;
  const rejectedCount = certs.filter((c) => c.status === 'rejected').length;
  const expiredCount = certs.filter((c) => c.status === 'expired').length;
  return { pendingCount, rejectedCount, expiredCount, total: certs.length };
}

export default function AdminOwnerVerification() {
  const { t } = useTranslation();
  const [owners, setOwners] = useState<OwnerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selected, setSelected] = useState<string | null>(null);
  const [typeLabels, setTypeLabels] = useState<Record<string, string>>({});

  // Reject Modal state
  const [rejectModalOwner, setRejectModalOwner] = useState<OwnerData | null>(
    null,
  );

  // Extend Deadline states
  const [extendModalOwner, setExtendModalOwner] = useState<OwnerData | null>(
    null,
  );
  const [extendDays, setExtendDays] = useState(14);
  const [extendReason, setExtendReason] = useState('');
  const [isExtending, setIsExtending] = useState(false);
  const [isSendingReminder, setIsSendingReminder] = useState<string | null>(
    null,
  );

  const entityTypeLabel = (entityType?: string) =>
    t(`adminOwnerVerification.entityTypes.${entityType || 'individual'}`, {
      defaultValue:
        OWNER_ENTITY_TYPE_LABELS[entityType || 'individual'] ||
        entityType ||
        'individual',
    });

  const documentTypeLabel = (code: string) => typeLabels[code] || code;

  const getMissingRequiredDocs = (owner: OwnerData) => {
    const req = [
      'national_id',
      'transport_license',
      'business_registration',
      'residence_proof',
      'authorization_letter',
    ];
    const uploaded = new Set(
      (owner.documents || []).map((d) => d.documentType),
    );
    return req.filter((r) => !uploaded.has(r));
  };

  const fetchOwners = () => {
    setIsLoading(true);
    Promise.all([
      Api.get('/admin/owners/verifications'),
      certificateApi.getTypes().catch(() => null),
    ])
      .then(([res, typesRes]) => {
        if (typesRes?.status === 200 && typesRes.data?.code === 1000) {
          setTypeLabels(buildTypeLabelMap(typesRes.data.result || []));
        }
        if (res.status === 200 && res.data?.code === 1000) {
          const list = (res.data.result || []).map((o: any) => ({
            ...o,
            status: o.status === 'approved' ? 'verified' : o.status,
            entityType: o.entityType || 'individual',
            documents: o.documents || [],
            vessels: (o.vessels || []).map((v: any) => ({
              ...v,
              certificates: v.certificates || [],
            })),
          }));
          setOwners(list);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch owners verifications:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  const handleApprove = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn duyệt hồ sơ chủ thuyền này?')) {
      try {
        const res = await Api.post(`/admin/owners/verifications/${id}/approve`);
        if (res.status === 200) {
          toast.success('Đã duyệt hồ sơ chủ thuyền thành công!');
          fetchOwners();
        } else {
          toast.error('Có lỗi xảy ra khi duyệt hồ sơ.');
        }
      } catch (err) {
        console.error(err);
        toast.error('Có lỗi xảy ra khi duyệt hồ sơ.');
      }
    }
  };

  const handleReject = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn từ chối hồ sơ chủ thuyền này?')) {
      try {
        const res = await Api.post(`/admin/owners/verifications/${id}/reject`);
        if (res.status === 200) {
          toast.success('Đã từ chối hồ sơ thành công!');
          fetchOwners();
        } else {
          toast.error('Có lỗi xảy ra khi từ chối hồ sơ.');
        }
      } catch (err) {
        console.error(err);
        toast.error('Có lỗi xảy ra khi từ chối hồ sơ.');
      }
    }
  };

  const handleApproveDocuments = async (id: string) => {
    if (
      confirm(
        'Bạn có chắc chắn muốn phê duyệt hồ sơ pháp lý của chủ thuyền này? Sau khi duyệt, tất cả tính năng thương mại (tạo tour, quản lý tàu, rút tiền) sẽ được mở khóa hoàn toàn.',
      )
    ) {
      try {
        const res = await Api.post(
          `/admin/owners/verifications/${id}/approve-documents`,
        );
        if (res.status === 200) {
          toast.success(
            'Đã phê duyệt hồ sơ pháp lý và mở khóa cho chủ thuyền thành công!',
          );
          fetchOwners();
        } else {
          toast.error('Có lỗi xảy ra khi phê duyệt hồ sơ pháp lý.');
        }
      } catch (err: any) {
        console.error(err);
        const msg = err?.response?.data?.message;
        toast.error(msg || 'Có lỗi xảy ra khi phê duyệt hồ sơ pháp lý.');
      }
    }
  };

  const handleRejectDocuments = (owner: OwnerData) => {
    setRejectModalOwner(owner);
  };

  const handleExtendDeadline = async () => {
    if (!extendModalOwner) return;
    setIsExtending(true);
    try {
      const res = await Api.post(
        `/admin/owners/verifications/${extendModalOwner.id}/extend-deadline`,
        {
          additionalDays: extendDays,
          reason: extendReason || undefined,
        },
      );
      if (res.status === 200) {
        toast.success('Đã gia hạn thời gian bổ sung hồ sơ thành công!');
        setExtendModalOwner(null);
        setExtendReason('');
        fetchOwners();
      } else {
        toast.error('Có lỗi xảy ra khi gia hạn hồ sơ.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra khi gia hạn hồ sơ.');
    } finally {
      setIsExtending(false);
    }
  };

  const handleSendReminder = async (id: string) => {
    setIsSendingReminder(id);
    try {
      const res = await Api.post(`/admin/owners/verifications/${id}/remind`);
      if (res.status === 200) {
        toast.success(
          'Đã gửi thông báo nhắc nhở nộp hồ sơ đến chủ thuyền thành công!',
        );
      } else {
        toast.error('Có lỗi xảy ra khi gửi thông báo nhắc nhở.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra khi gửi thông báo nhắc nhở.');
    } finally {
      setIsSendingReminder(null);
    }
  };

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const filtered =
    filter === 'all'
      ? owners
      : filter === 'overdue'
        ? owners.filter(
            (o) => o.isDocumentDeadlineExpired && !o.isDocumentCompleted,
          )
        : owners.filter((o) => o.status === filter);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedOwners = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const pending = owners.filter((o) => o.status === 'pending').length;
  const verified = owners.filter((o) => o.status === 'verified').length;
  const overdueCount = owners.filter(
    (o) => o.isDocumentDeadlineExpired && !o.isDocumentCompleted,
  ).length;
  const rejected = owners.filter((o) => o.status === 'rejected').length;

  if (isLoading) {
    return (
      <div className="flex h-[85vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            className="h-10 w-10 animate-spin"
            style={{ color: ACCENT }}
          />
          <p className="text-sm font-medium" style={{ color: '#8892a0' }}>
            Đang tải danh sách xác thực...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 lg:px-8 space-y-6">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ color: '#fff', letterSpacing: '-0.44px' }}
        >
          Xác thực Chủ thuyền
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#8892a0' }}>
          Kiểm duyệt hồ sơ kinh doanh và thời hạn giấy tờ pháp lý của đối tác
          chủ thuyền
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: 'Chờ xét duyệt',
            value: pending,
            color: '#F59E0B',
            bg: 'rgba(245,158,11,0.12)',
            icon: Clock,
          },
          {
            label: 'Đã xác thực',
            value: verified,
            color: '#10B981',
            bg: 'rgba(16,185,129,0.12)',
            icon: CheckCircle,
          },
          {
            label: 'Quá hạn giấy tờ',
            value: overdueCount,
            color: '#F43F5E',
            bg: 'rgba(244,63,94,0.12)',
            icon: AlertTriangle,
          },
          {
            label: 'Đã từ chối',
            value: rejected,
            color: '#EF4444',
            bg: 'rgba(239,68,68,0.12)',
            icon: XCircle,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-5 flex items-center gap-4 cursor-pointer hover:border-white/20 transition-all"
            style={CARD}
            onClick={() => {
              if (s.label === 'Chờ xét duyệt') setFilter('pending');
              else if (s.label === 'Đã xác thực') setFilter('verified');
              else if (s.label === 'Quá hạn giấy tờ') setFilter('overdue');
              else if (s.label === 'Đã từ chối') setFilter('rejected');
            }}
          >
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl shrink-0"
              style={{ backgroundColor: s.bg }}
            >
              <s.icon size={20} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: '#fff' }}>
                {s.value}
              </p>
              <p className="text-xs" style={{ color: '#8892a0' }}>
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'Tất cả' },
          { key: 'pending', label: ST_MAP.pending.label },
          { key: 'verified', label: ST_MAP.verified.label },
          {
            key: 'overdue',
            label: `Quá hạn giấy tờ (${overdueCount})`,
            color: '#F43F5E',
          },
          { key: 'rejected', label: ST_MAP.rejected.label },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as FilterType)}
            className="rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer"
            style={
              filter === f.key
                ? { backgroundColor: f.color || ACCENT, color: '#fff' }
                : {
                    backgroundColor: '#0d1629',
                    color: f.color || '#8892a0',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {paginatedOwners.map((o) => {
          const st = ST_MAP[o.status] || ST_MAP.pending;
          const Icon = st.icon;
          const alerts = getOwnerCertAlerts(o);
          return (
            <div
              key={o.id}
              className="rounded-2xl p-5 transition-all hover:scale-[1.005]"
              style={CARD}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3
                      className="text-base font-semibold"
                      style={{ color: '#fff' }}
                    >
                      {o.name}
                    </h3>
                    <span
                      className="flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-xs font-semibold"
                      style={{
                        backgroundColor: 'rgba(59,130,246,0.12)',
                        color: '#3B82F6',
                      }}
                    >
                      <Building2 size={11} />
                      {entityTypeLabel(o.entityType)}
                    </span>
                    <span
                      className="flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-xs font-semibold"
                      style={{ backgroundColor: st.bg, color: st.color }}
                    >
                      <Icon size={11} />
                      {st.label}
                    </span>
                    {o.isDocumentApproved ? (
                      <span
                        className="flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-xs font-semibold"
                        style={{
                          backgroundColor: 'rgba(16,185,129,0.12)',
                          color: '#10B981',
                        }}
                      >
                        <CheckCircle size={11} /> Đã duyệt hồ sơ pháp lý
                      </span>
                    ) : o.isDocumentResubmitted ? (
                      <span
                        className="flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-xs font-bold"
                        style={{
                          backgroundColor: 'rgba(6,182,212,0.18)',
                          color: '#22D3EE',
                          border: '1px solid rgba(6,182,212,0.35)',
                        }}
                      >
                        <RefreshCw
                          size={11}
                          className="animate-spin"
                          style={{ animationDuration: '4s' }}
                        />
                        Đã nộp lại (Chờ duyệt lại)
                      </span>
                    ) : o.isDocumentRejected ? (
                      <span
                        className="flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-xs font-semibold"
                        style={{
                          backgroundColor: 'rgba(239,68,68,0.12)',
                          color: '#EF4444',
                        }}
                      >
                        <XCircle size={11} /> Hồ sơ bị từ chối (Cần nộp lại)
                      </span>
                    ) : o.isDocumentPendingReview ? (
                      <span
                        className="flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-xs font-semibold"
                        style={{
                          backgroundColor: 'rgba(59,130,246,0.12)',
                          color: '#60A5FA',
                        }}
                      >
                        <Clock size={11} /> Đã nộp - Chờ duyệt hồ sơ
                      </span>
                    ) : o.isDocumentDeadlineExpired ? (
                      <span
                        className="flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-xs font-semibold"
                        style={{
                          backgroundColor: 'rgba(239,68,68,0.12)',
                          color: '#EF4444',
                        }}
                      >
                        <AlertTriangle size={11} /> Quá hạn (Đã khóa)
                      </span>
                    ) : o.documentUploadDeadline ? (
                      <span
                        className="flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-xs font-semibold"
                        style={{
                          backgroundColor: 'rgba(245,158,11,0.12)',
                          color: '#F59E0B',
                        }}
                      >
                        <Clock size={11} /> Hạn nộp:{' '}
                        {new Date(o.documentUploadDeadline).toLocaleDateString(
                          'vi-VN',
                        )}
                      </span>
                    ) : null}
                    {alerts.pendingCount > 0 && (
                      <span
                        className="flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-xs font-semibold"
                        style={{
                          backgroundColor: CERTIFICATE_STATUS_META.pending.bg,
                          color: CERTIFICATE_STATUS_META.pending.color,
                        }}
                      >
                        <AlertTriangle size={11} />
                        {alerts.pendingCount} giấy tờ chờ duyệt
                      </span>
                    )}
                    {alerts.rejectedCount > 0 && (
                      <span
                        className="flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-xs font-semibold"
                        style={{
                          backgroundColor: CERTIFICATE_STATUS_META.rejected.bg,
                          color: CERTIFICATE_STATUS_META.rejected.color,
                        }}
                      >
                        {alerts.rejectedCount} bị từ chối
                      </span>
                    )}
                    {alerts.expiredCount > 0 && (
                      <span
                        className="flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-xs font-semibold"
                        style={{
                          backgroundColor: CERTIFICATE_STATUS_META.expired.bg,
                          color: CERTIFICATE_STATUS_META.expired.color,
                        }}
                      >
                        {alerts.expiredCount} hết hạn
                      </span>
                    )}
                  </div>
                  <p className="text-sm mt-1" style={{ color: '#8892a0' }}>
                    Đại diện:{' '}
                    <span style={{ color: '#c8d0e0' }}>{o.owner}</span> ·{' '}
                    {o.email}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-4">
                    <div>
                      <p
                        className="text-[10px] uppercase tracking-wider"
                        style={{ color: '#8892a0' }}
                      >
                        {t('adminOwnerVerification.fields.nationalId')}
                      </p>
                      <p
                        className="text-sm font-mono font-semibold"
                        style={{ color: '#fff' }}
                      >
                        {o.license}
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-[10px] uppercase tracking-wider"
                        style={{ color: '#8892a0' }}
                      >
                        {t('adminOwnerVerification.fields.entityType')}
                      </p>
                      <p className="text-sm" style={{ color: '#fff' }}>
                        {entityTypeLabel(o.entityType)}
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-[10px] uppercase tracking-wider"
                        style={{ color: '#8892a0' }}
                      >
                        Ngày nộp
                      </p>
                      <p className="text-sm" style={{ color: '#fff' }}>
                        {o.submitted}
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-[10px] uppercase tracking-wider"
                        style={{ color: '#8892a0' }}
                      >
                        Số thuyền
                      </p>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: '#fff' }}
                      >
                        {o.boats}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all hover:opacity-80"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      color: '#c8d0e0',
                    }}
                    onClick={() => setSelected(selected === o.id ? null : o.id)}
                  >
                    <Eye size={13} /> Xem hồ sơ
                  </button>
                  {o.status === 'verified' && (
                    <>
                      {!o.isDocumentApproved &&
                        o.documents &&
                        o.documents.length > 0 && (
                          <>
                            <button
                              onClick={() => handleApproveDocuments(o.id)}
                              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all hover:opacity-80 cursor-pointer"
                              style={{
                                backgroundColor: 'rgba(16,185,129,0.15)',
                                color: '#10B981',
                                border: '1px solid rgba(16,185,129,0.3)',
                              }}
                              title="Duyệt & chấp thuận giấy tờ pháp lý để mở khóa hoàn toàn"
                            >
                              <ShieldCheck size={13} /> Duyệt hồ sơ pháp lý
                            </button>
                            <button
                              onClick={() => handleRejectDocuments(o)}
                              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all hover:opacity-80 cursor-pointer"
                              style={{
                                backgroundColor: 'rgba(239,68,68,0.12)',
                                color: '#EF4444',
                              }}
                              title="Từ chối giấy tờ và yêu cầu nộp lại"
                            >
                              <ShieldX size={13} /> Từ chối giấy tờ
                            </button>
                          </>
                        )}
                      <button
                        onClick={() => {
                          setExtendModalOwner(o);
                          setExtendDays(14);
                          setExtendReason('');
                        }}
                        className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all hover:opacity-80 cursor-pointer"
                        style={{
                          backgroundColor: 'rgba(245,158,11,0.12)',
                          color: '#F59E0B',
                        }}
                      >
                        <Clock size={13} /> Gia hạn hồ sơ
                      </button>
                      {!o.isDocumentApproved && (
                        <button
                          disabled={isSendingReminder === o.id}
                          onClick={() => handleSendReminder(o.id)}
                          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all hover:opacity-80 cursor-pointer disabled:opacity-50"
                          style={{
                            backgroundColor: 'rgba(59,130,246,0.12)',
                            color: '#60A5FA',
                          }}
                        >
                          {isSendingReminder === o.id ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Bell size={13} />
                          )}
                          Nhắc nộp hồ sơ
                        </button>
                      )}
                    </>
                  )}
                  {o.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(o.id)}
                        className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all hover:opacity-80"
                        style={{
                          backgroundColor: 'rgba(16,185,129,0.12)',
                          color: '#10B981',
                        }}
                      >
                        <ShieldCheck size={13} /> Xác thực
                      </button>
                      <button
                        onClick={() => handleReject(o.id)}
                        className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all hover:opacity-80"
                        style={{
                          backgroundColor: 'rgba(239,68,68,0.12)',
                          color: '#EF4444',
                        }}
                      >
                        <ShieldX size={13} /> Từ chối
                      </button>
                    </>
                  )}
                </div>
              </div>
              {/* Expanded detail */}
              {selected === o.id && (
                <div
                  className="mt-4 rounded-xl p-5 space-y-6"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-1.5 text-rose-400">
                      <Info size={14} /> Thông tin hồ sơ đăng ký
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-sm">
                      <div className="space-y-1">
                        <p
                          className="text-xs flex items-center gap-1"
                          style={{ color: '#8892a0' }}
                        >
                          Doanh nghiệp / Hộ kinh doanh
                        </p>
                        <p className="font-semibold text-white">{o.name}</p>
                      </div>
                      <div className="space-y-1">
                        <p
                          className="text-xs flex items-center gap-1"
                          style={{ color: '#8892a0' }}
                        >
                          Người đại diện
                        </p>
                        <p className="font-semibold text-white">{o.owner}</p>
                      </div>
                      <div className="space-y-1">
                        <p
                          className="text-xs flex items-center gap-1.5"
                          style={{ color: '#8892a0' }}
                        >
                          <Building2 size={12} />{' '}
                          {t('adminOwnerVerification.fields.entityType')}
                        </p>
                        <p className="font-semibold text-white">
                          {entityTypeLabel(o.entityType)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p
                          className="text-xs flex items-center gap-1.5"
                          style={{ color: '#8892a0' }}
                        >
                          <Phone size={12} /> Số điện thoại
                        </p>
                        <p className="font-semibold text-white">{o.phone}</p>
                      </div>
                      <div className="space-y-1">
                        <p
                          className="text-xs flex items-center gap-1.5"
                          style={{ color: '#8892a0' }}
                        >
                          <Mail size={12} /> Email liên hệ
                        </p>
                        <p className="font-semibold text-white">{o.email}</p>
                      </div>
                      <div className="space-y-1">
                        <p
                          className="text-xs flex items-center gap-1"
                          style={{ color: '#8892a0' }}
                        >
                          {t('adminOwnerVerification.fields.nationalIdNumber')}
                        </p>
                        <p className="font-mono font-semibold text-white">
                          {o.license}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p
                          className="text-xs flex items-center gap-1.5"
                          style={{ color: '#8892a0' }}
                        >
                          <MapPin size={12} /> Địa chỉ đăng ký
                        </p>
                        <p className="font-semibold text-white">{o.address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Owner documents (reference only — no per-doc approve) */}
                  <div className="border-t border-white/5 pt-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#8892a0] flex items-center gap-1.5">
                          <FileText size={14} />{' '}
                          {t('adminOwnerVerification.ownerDocuments.title')} (
                          {o.documents?.length ?? 0})
                        </p>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: '#8892a0' }}
                        >
                          {t('adminOwnerVerification.ownerDocuments.hint')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        {!o.isDocumentCompleted && (
                          <button
                            disabled={isSendingReminder === o.id}
                            onClick={() => handleSendReminder(o.id)}
                            className="flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all hover:opacity-90 cursor-pointer disabled:opacity-50"
                            style={{
                              backgroundColor: 'rgba(59,130,246,0.2)',
                              color: '#60A5FA',
                              border: '1px solid rgba(59,130,246,0.3)',
                            }}
                          >
                            {isSendingReminder === o.id ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Bell size={13} />
                            )}
                            Nhắc nộp hồ sơ
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setExtendModalOwner(o);
                            setExtendDays(14);
                            setExtendReason('');
                          }}
                          className="flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all shrink-0 hover:opacity-90 cursor-pointer w-fit"
                          style={{
                            backgroundColor: '#F59E0B',
                            color: '#000',
                          }}
                        >
                          <Clock size={13} /> Gia hạn nộp hồ sơ
                        </button>
                      </div>
                    </div>

                    {/* Deadline info box */}
                    <div
                      className="rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs"
                      style={{
                        backgroundColor: o.isDocumentCompleted
                          ? 'rgba(16,185,129,0.08)'
                          : o.isDocumentPendingReview
                            ? 'rgba(59,130,246,0.08)'
                            : o.isDocumentDeadlineExpired
                              ? 'rgba(239,68,68,0.08)'
                              : 'rgba(245,158,11,0.08)',
                        border: o.isDocumentApproved
                          ? '1px solid rgba(16,185,129,0.2)'
                          : o.isDocumentPendingReview
                            ? '1px solid rgba(59,130,246,0.2)'
                            : o.isDocumentDeadlineExpired
                              ? '1px solid rgba(239,68,68,0.2)'
                              : '1px solid rgba(245,158,11,0.2)',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Clock
                          size={15}
                          style={{
                            color: o.isDocumentApproved
                              ? '#10B981'
                              : o.isDocumentPendingReview
                                ? '#60A5FA'
                                : o.isDocumentDeadlineExpired
                                  ? '#EF4444'
                                  : '#F59E0B',
                          }}
                        />
                        <span className="font-semibold text-white">
                          {o.isDocumentApproved ? (
                            <span className="text-emerald-400">
                              Hồ sơ pháp lý:{' '}
                              <strong>
                                Đã được Ban quản trị phê duyệt hoàn tất
                              </strong>
                            </span>
                          ) : (
                            <>
                              Hạn chót bổ sung giấy tờ:{' '}
                              <strong
                                style={{
                                  color: o.isDocumentPendingReview
                                    ? '#60A5FA'
                                    : o.isDocumentDeadlineExpired
                                      ? '#EF4444'
                                      : '#F59E0B',
                                }}
                              >
                                {o.documentUploadDeadline
                                  ? new Date(
                                      o.documentUploadDeadline,
                                    ).toLocaleDateString('vi-VN')
                                  : '14 ngày từ khi duyệt'}
                              </strong>
                            </>
                          )}
                        </span>
                      </div>
                      <span
                        className="font-bold px-2.5 py-1 rounded-md text-[11px]"
                        style={{
                          backgroundColor: o.isDocumentApproved
                            ? 'rgba(16,185,129,0.2)'
                            : o.isDocumentResubmitted
                              ? 'rgba(6,182,212,0.2)'
                              : o.isDocumentRejected
                                ? 'rgba(239,68,68,0.2)'
                                : o.isDocumentPendingReview
                                  ? 'rgba(59,130,246,0.2)'
                                  : o.isDocumentDeadlineExpired
                                    ? 'rgba(239,68,68,0.2)'
                                    : 'rgba(245,158,11,0.2)',
                          color: o.isDocumentApproved
                            ? '#10B981'
                            : o.isDocumentResubmitted
                              ? '#22D3EE'
                              : o.isDocumentRejected
                                ? '#EF4444'
                                : o.isDocumentPendingReview
                                  ? '#60A5FA'
                                  : o.isDocumentDeadlineExpired
                                    ? '#EF4444'
                                    : '#F59E0B',
                        }}
                      >
                        {o.isDocumentApproved
                          ? '✓ Đã duyệt hoàn tất'
                          : o.isDocumentResubmitted
                            ? '🔄 Đã nộp lại (Chờ duyệt lại)'
                            : o.isDocumentRejected
                              ? '✕ Hồ sơ bị từ chối'
                              : o.isDocumentPendingReview
                                ? '⏳ Chờ Admin xét duyệt'
                                : o.isDocumentDeadlineExpired
                                  ? 'Quá hạn (Đã khóa)'
                                  : 'Đang mở nộp'}
                      </span>
                    </div>

                    {/* Missing required documents list */}
                    {!o.isDocumentApproved &&
                      getMissingRequiredDocs(o).length > 0 && (
                        <div
                          className="rounded-xl p-3 flex flex-col sm:flex-row sm:items-center gap-2 text-xs"
                          style={{
                            backgroundColor: 'rgba(239,68,68,0.06)',
                            border: '1px solid rgba(239,68,68,0.15)',
                          }}
                        >
                          <span className="font-semibold text-rose-400 shrink-0 flex items-center gap-1">
                            <AlertTriangle size={13} />
                            Giấy tờ bắt buộc còn thiếu (
                            {getMissingRequiredDocs(o).length}):
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {getMissingRequiredDocs(o).map((code) => (
                              <span
                                key={code}
                                className="px-2 py-0.5 rounded-md font-bold text-[11px]"
                                style={{
                                  backgroundColor: 'rgba(239,68,68,0.15)',
                                  color: '#FCA5A5',
                                  border: '1px solid rgba(239,68,68,0.3)',
                                }}
                              >
                                {documentTypeLabel(code)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    {o.documents && o.documents.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {o.documents.map((doc) => {
                          const isRejected = Boolean(doc.adminNote);
                          const isReuploaded = Boolean(doc.isReuploaded);
                          return (
                            <div
                              key={doc.id}
                              className={`rounded-xl p-3.5 flex flex-col justify-between gap-3 transition-all ${
                                isReuploaded
                                  ? 'bg-cyan-500/[0.04] border border-cyan-500/30'
                                  : isRejected
                                    ? 'bg-rose-500/[0.04] border border-rose-500/30'
                                    : 'bg-white/[0.015] border border-white/[0.05]'
                              }`}
                            >
                              <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="text-sm font-bold text-white truncate">
                                      {documentTypeLabel(doc.documentType)}
                                    </p>
                                    <p
                                      className="text-[10px] font-mono"
                                      style={{ color: '#8892a0' }}
                                    >
                                      {doc.documentType}
                                    </p>
                                  </div>
                                  <div className="shrink-0">
                                    {isReuploaded ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
                                        <Sparkles size={10} /> Mới tải lại
                                      </span>
                                    ) : isRejected ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                        <XCircle size={10} /> Bị từ chối
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                        <CheckCircle size={10} /> Đã nộp
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="space-y-1 text-xs pt-1 border-t border-white/5">
                                  {doc.expiryDate && (
                                    <p style={{ color: '#c8d0e0' }}>
                                      {t(
                                        'adminOwnerVerification.ownerDocuments.expiresOn',
                                        {
                                          date: formatExpiryDate(
                                            doc.expiryDate,
                                          ),
                                        },
                                      )}
                                    </p>
                                  )}
                                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                                    <Clock
                                      size={11}
                                      className="text-slate-500"
                                    />
                                    Cập nhật:{' '}
                                    {formatDateTime(
                                      doc.updatedAt || doc.createdAt,
                                    )}
                                  </p>
                                </div>

                                {doc.adminNote && (
                                  <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 space-y-1">
                                    <span className="font-bold text-rose-400 flex items-center gap-1">
                                      <AlertTriangle size={12} /> Lý do từ chối:
                                    </span>
                                    <p className="leading-snug text-[11px] text-rose-200">
                                      {doc.adminNote}
                                    </p>
                                  </div>
                                )}
                              </div>

                              <div className="pt-2 flex justify-end">
                                <a
                                  href={doc.documentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors hover:opacity-90 cursor-pointer"
                                  style={{
                                    backgroundColor: 'rgba(255,56,92,0.12)',
                                    color: '#FF385C',
                                    border: '1px solid rgba(255,56,92,0.25)',
                                  }}
                                >
                                  <ExternalLink size={12} />
                                  {t(
                                    'adminOwnerVerification.ownerDocuments.view',
                                  )}
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p
                        className="text-xs italic"
                        style={{ color: '#8892a0' }}
                      >
                        {t('adminOwnerVerification.ownerDocuments.empty')}
                      </p>
                    )}
                  </div>

                  {/* Registered Vessels */}
                  {o.vessels && o.vessels.length > 0 && (
                    <div className="border-t border-white/5 pt-5 space-y-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#8892a0] flex items-center gap-1.5">
                        <Ship size={14} /> Danh sách tàu thuyền đăng ký (
                        {o.vessels.length})
                      </p>
                      <div className="grid grid-cols-1 gap-4">
                        {o.vessels.map((vessel) => (
                          <div
                            key={vessel.id}
                            className="rounded-xl p-4 space-y-4"
                            style={{
                              backgroundColor: 'rgba(255,255,255,0.015)',
                              border: '1px solid rgba(255,255,255,0.04)',
                            }}
                          >
                            <div className="flex flex-col lg:flex-row gap-4 justify-between">
                              <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white text-base">
                                    {vessel.name}
                                  </span>
                                  <span
                                    className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider"
                                    style={{
                                      backgroundColor: 'rgba(59,130,246,0.12)',
                                      color: '#3B82F6',
                                    }}
                                  >
                                    {vessel.type}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                                  <div>
                                    <p
                                      className="text-[10px] uppercase tracking-wider"
                                      style={{ color: '#8892a0' }}
                                    >
                                      Số đăng ký
                                    </p>
                                    <p className="font-semibold text-white mt-0.5 font-mono">
                                      {vessel.registrationNumber}
                                    </p>
                                  </div>
                                  <div>
                                    <p
                                      className="text-[10px] uppercase tracking-wider"
                                      style={{ color: '#8892a0' }}
                                    >
                                      Sức chứa
                                    </p>
                                    <p className="font-semibold text-white mt-0.5">
                                      {vessel.maxPassengers &&
                                      vessel.maxPassengers > 0
                                        ? `${vessel.maxPassengers} khách`
                                        : 'N/A'}
                                    </p>
                                  </div>
                                  <div>
                                    <p
                                      className="text-[10px] uppercase tracking-wider"
                                      style={{ color: '#8892a0' }}
                                    >
                                      Kích thước
                                    </p>
                                    <p className="font-semibold text-white mt-0.5">
                                      {vessel.length
                                        ? `${vessel.length}m`
                                        : 'N/A'}{' '}
                                      ×{' '}
                                      {vessel.beam ? `${vessel.beam}m` : 'N/A'}
                                    </p>
                                  </div>
                                  <div>
                                    <p
                                      className="text-[10px] uppercase tracking-wider"
                                      style={{ color: '#8892a0' }}
                                    >
                                      Loại neo đậu
                                    </p>
                                    <p className="font-semibold text-white mt-0.5">
                                      {vessel.mooringType}
                                    </p>
                                  </div>
                                  <div>
                                    <p
                                      className="text-[10px] uppercase tracking-wider"
                                      style={{ color: '#8892a0' }}
                                    >
                                      Ngày cập bến dự kiến
                                    </p>
                                    <p className="font-semibold text-white mt-0.5">
                                      {vessel.expectedDockingDate}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Images */}
                            <div className="pt-3 border-t border-white/5">
                              <p
                                className="text-[11px] font-bold uppercase tracking-wider mb-2"
                                style={{ color: '#8892a0' }}
                              >
                                Hình ảnh tàu thuyền
                              </p>
                              {vessel.imageUrls &&
                              vessel.imageUrls.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {vessel.imageUrls.map((url, idx) => (
                                    <a
                                      key={idx}
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="relative group block overflow-hidden rounded-lg border border-white/10 shrink-0"
                                    >
                                      <img
                                        src={url}
                                        alt={`boat-img-${idx}`}
                                        className="h-16 w-24 object-cover transition-transform group-hover:scale-105"
                                      />
                                    </a>
                                  ))}
                                </div>
                              ) : (
                                <p
                                  className="text-xs italic"
                                  style={{ color: '#8892a0' }}
                                >
                                  Không có hình ảnh đính kèm
                                </p>
                              )}
                            </div>

                            {/* Certificates (per-document review) */}
                            <div className="pt-3 border-t border-white/5 space-y-2">
                              <p
                                className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                                style={{ color: '#8892a0' }}
                              >
                                <FileText size={12} /> Giấy tờ pháp lý
                              </p>
                              <CertificateReviewTable
                                certificates={vessel.certificates || []}
                                showBoatInfo={false}
                                showOwnerInfo={false}
                                typeLabels={typeLabels}
                                emptyMessage="Chưa có giấy tờ pháp lý"
                                onChanged={fetchOwners}
                              />
                              {(!vessel.certificates ||
                                vessel.certificates.length === 0) &&
                                vessel.documentUrls &&
                                vessel.documentUrls.length > 0 && (
                                  <div className="flex flex-col gap-1.5 mt-2">
                                    {vessel.documentUrls.map((url, idx) => (
                                      <a
                                        key={idx}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors w-fit"
                                      >
                                        <FileText size={12} />
                                        <span>
                                          Giấy đăng ký / Hồ sơ kỹ thuật #
                                          {idx + 1}
                                        </span>
                                      </a>
                                    ))}
                                  </div>
                                )}
                            </div>

                            {/* Required Services */}
                            {vessel.requiredServices &&
                              vessel.requiredServices.length > 0 && (
                                <div className="pt-3 border-t border-white/5">
                                  <p
                                    className="text-[11px] font-bold uppercase tracking-wider mb-2"
                                    style={{ color: '#8892a0' }}
                                  >
                                    Dịch vụ yêu cầu
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {vessel.requiredServices.map(
                                      (service, sidx) => (
                                        <span
                                          key={sidx}
                                          className="text-[10px] px-2.5 py-0.5 rounded-md font-medium"
                                          style={{
                                            backgroundColor:
                                              'rgba(255,255,255,0.05)',
                                            color: '#c8d0e0',
                                            border:
                                              '1px solid rgba(255,255,255,0.05)',
                                          }}
                                        >
                                          {service}
                                        </span>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="py-12 text-center text-sm" style={{ color: '#8892a0' }}>
          Không có yêu cầu xác thực nào trong mục này
        </p>
      )}

      {/* Pagination Bar */}
      {filtered.length > 0 && (
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl"
          style={CARD}
        >
          <div
            className="flex items-center gap-3 text-xs"
            style={{ color: '#8892a0' }}
          >
            <span>
              Hiển thị{' '}
              <strong style={{ color: '#fff' }}>
                {(currentPage - 1) * pageSize + 1} -{' '}
                {Math.min(currentPage * pageSize, filtered.length)}
              </strong>{' '}
              trên tổng số{' '}
              <strong style={{ color: '#fff' }}>{filtered.length}</strong> hồ sơ
            </span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded-lg px-2.5 py-1.5 text-xs outline-none cursor-pointer"
              style={{
                backgroundColor: '#141e35',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
              }}
            >
              <option value={5}>5 / trang</option>
              <option value={10}>10 / trang</option>
              <option value={20}>20 / trang</option>
            </select>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Extend Deadline Modal */}
      {extendModalOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div
            className="w-full max-w-md rounded-2xl p-6 space-y-5 shadow-2xl border"
            style={{
              backgroundColor: '#0d1629',
              borderColor: 'rgba(255,255,255,0.1)',
            }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock size={18} style={{ color: '#F59E0B' }} />
                Gia hạn nộp hồ sơ pháp lý
              </h3>
              <button
                onClick={() => setExtendModalOwner(null)}
                className="text-[#8892a0] hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1 text-xs text-[#8892a0]">
              <p>
                Chủ thuyền:{' '}
                <strong className="text-white">
                  {extendModalOwner.name} ({extendModalOwner.owner})
                </strong>
              </p>
              <p>
                Hạn hiện tại:{' '}
                <strong className="text-amber-400">
                  {extendModalOwner.documentUploadDeadline
                    ? new Date(
                        extendModalOwner.documentUploadDeadline,
                      ).toLocaleDateString('vi-VN')
                    : 'Chưa đặt'}
                </strong>
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-[#8892a0] block">
                Chọn số ngày gia hạn thêm:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[7, 14, 30].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setExtendDays(days)}
                    className={`rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer ${
                      extendDays === days
                        ? 'bg-amber-500 text-black shadow-lg'
                        : 'bg-white/5 text-[#c8d0e0] hover:bg-white/10'
                    }`}
                  >
                    +{days} ngày
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-[#8892a0] shrink-0">
                  Hoặc nhập số ngày:
                </span>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={extendDays}
                  onChange={(e) =>
                    setExtendDays(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-24 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-white text-center font-bold outline-none focus:border-amber-500/50"
                />
                <span className="text-xs text-[#8892a0]">ngày</span>
              </div>

              {/* Preview new deadline */}
              {(() => {
                const base = extendModalOwner.documentUploadDeadline
                  ? new Date(extendModalOwner.documentUploadDeadline).getTime()
                  : Date.now();
                const start = Math.max(Date.now(), base);
                const newDate = new Date(start + extendDays * 86400000);
                return (
                  <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-xs text-amber-300">
                    Hạn mới sau khi gia hạn:{' '}
                    <strong>{newDate.toLocaleDateString('vi-VN')}</strong>
                  </div>
                );
              })()}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#8892a0] block">
                Lý do gia hạn (tùy chọn):
              </label>
              <textarea
                value={extendReason}
                onChange={(e) => setExtendReason(e.target.value)}
                placeholder="VD: Chủ thuyền xin bổ sung Giấy phép vận tải do sở GTVT đang thụ lý..."
                rows={3}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white placeholder:text-[#8892a0] outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setExtendModalOwner(null)}
                className="flex-1 rounded-xl py-2.5 text-xs font-semibold bg-white/5 text-[#8892a0] hover:bg-white/10 hover:text-white transition-all"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isExtending}
                onClick={handleExtendDeadline}
                className="flex-1 rounded-xl py-2.5 text-xs font-semibold bg-amber-500 text-black hover:bg-amber-400 font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isExtending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Clock size={14} />
                )}
                Xác nhận gia hạn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Documents Modal */}
      <RejectDocumentsModal
        isOpen={Boolean(rejectModalOwner)}
        owner={rejectModalOwner}
        onClose={() => setRejectModalOwner(null)}
        onSuccess={() => fetchOwners()}
        documentTypeLabel={documentTypeLabel}
      />
    </div>
  );
}
