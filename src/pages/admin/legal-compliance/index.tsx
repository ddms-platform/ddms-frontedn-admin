import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  Loader2,
  RefreshCw,
  FileWarning,
  Unlock,
  Ship,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  certificateApi,
  COMPLIANCE_STATUS_META,
  buildTypeLabelMap,
  isOwnerDocsAwaitingReview,
  normalizeOwnerVerification,
  ownerVerificationApi,
  type CertificateListItem,
  type OwnerVerificationItem,
} from '@/services/certificate-api';
import { boatApi, type BoatListItemResponse } from '@/services/boat-api';
import CertificateReviewTable from '@/pages/admin/components/CertificateReviewTable';
import CertificateTypesManager from '@/pages/admin/components/CertificateTypesManager';
import OwnerDocumentsReviewPanel from '@/pages/admin/components/OwnerDocumentsReviewPanel';

const ACCENT = '#FF385C';
const CARD = {
  backgroundColor: '#0d1629',
  border: '1px solid rgba(255,255,255,0.06)',
} as const;

type Tab = 'pending' | 'approved' | 'expiring' | 'blocked' | 'types';

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  count,
  accent,
}: {
  icon: typeof User;
  title: string;
  subtitle: string;
  count: number;
  accent: string;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="flex items-start gap-3 min-w-0">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${accent}22` }}
        >
          <Icon size={18} style={{ color: accent }} />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-bold" style={{ color: '#fff' }}>
            {title}
          </h2>
          <p className="mt-0.5 text-xs" style={{ color: '#8892a0' }}>
            {subtitle}
          </p>
        </div>
      </div>
      <span
        className="inline-flex min-w-6 shrink-0 items-center justify-center rounded-lg px-2 py-0.5 text-[11px] font-bold"
        style={{
          backgroundColor: 'rgba(255,255,255,0.06)',
          color: '#c8d0e0',
        }}
      >
        {count}
      </span>
    </div>
  );
}

function CardShell({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl p-5" style={CARD}>
      {children}
    </div>
  );
}

export default function AdminLegalCompliance() {
  const [tab, setTab] = useState<Tab>('pending');
  const [pending, setPending] = useState<CertificateListItem[]>([]);
  const [approved, setApproved] = useState<CertificateListItem[]>([]);
  const [expiring, setExpiring] = useState<CertificateListItem[]>([]);
  const [blockedBoats, setBlockedBoats] = useState<BoatListItemResponse[]>([]);
  const [owners, setOwners] = useState<OwnerVerificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlockingId, setUnlockingId] = useState<string | null>(null);
  const [typeLabels, setTypeLabels] = useState<Record<string, string>>({});

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([
      certificateApi.getPending(),
      certificateApi.getApproved(),
      certificateApi.getExpiring(),
      boatApi.getAll(),
      certificateApi.getTypes(),
      ownerVerificationApi.list().catch(() => null),
    ])
      .then(
        ([
          pendingRes,
          approvedRes,
          expiringRes,
          boatsRes,
          typesRes,
          ownersRes,
        ]) => {
          if (pendingRes.status === 200 && pendingRes.data?.code === 1000) {
            setPending(pendingRes.data.result || []);
          }
          if (approvedRes.status === 200 && approvedRes.data?.code === 1000) {
            setApproved(approvedRes.data.result || []);
          }
          if (expiringRes.status === 200 && expiringRes.data?.code === 1000) {
            setExpiring(expiringRes.data.result || []);
          }
          if (boatsRes.status === 200 && boatsRes.data?.code === 1000) {
            const boats = boatsRes.data.result || [];
            setBlockedBoats(
              boats.filter(
                (b) =>
                  b.complianceStatus === 'hidden' ||
                  b.complianceStatus === 'locked',
              ),
            );
          }
          if (typesRes.status === 200 && typesRes.data?.code === 1000) {
            setTypeLabels(buildTypeLabelMap(typesRes.data.result || []));
          }
          if (ownersRes?.status === 200 && ownersRes.data?.code === 1000) {
            setOwners(
              (ownersRes.data.result || []).map(normalizeOwnerVerification),
            );
          }
        },
      )
      .catch((err) => {
        console.error(err);
        toast.error('Không thể tải dữ liệu kiểm duyệt pháp lý');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const pendingOwners = useMemo(
    () => owners.filter(isOwnerDocsAwaitingReview),
    [owners],
  );
  const approvedOwners = useMemo(
    () => owners.filter((o) => o.isDocumentApproved),
    [owners],
  );

  const handleUnlock = async (boatId: string) => {
    if (
      !confirm(
        'Mở khóa tàu này? Tàu phải có ít nhất một giấy tờ đã duyệt và còn hạn.',
      )
    ) {
      return;
    }
    setUnlockingId(boatId);
    try {
      const res = await certificateApi.unlockBoat(boatId);
      if (res.status === 200 && res.data?.code === 1000) {
        toast.success('Đã mở khóa tàu thành công');
        fetchData();
      } else {
        toast.error('Không thể mở khóa tàu');
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Có lỗi xảy ra khi mở khóa tàu';
      toast.error(message);
    } finally {
      setUnlockingId(null);
    }
  };

  const stats = useMemo(
    () => [
      {
        label: 'Chờ duyệt',
        value: pending.length + pendingOwners.length,
        color: '#F59E0B',
        bg: 'rgba(245,158,11,0.12)',
        icon: Clock,
      },
      {
        label: 'Đã duyệt',
        value: approved.length + approvedOwners.length,
        color: '#10B981',
        bg: 'rgba(16,185,129,0.12)',
        icon: CheckCircle,
      },
      {
        label: 'Sắp hết hạn',
        value: expiring.length,
        color: '#F97316',
        bg: 'rgba(249,115,22,0.12)',
        icon: AlertTriangle,
      },
      {
        label: 'Tàu bị chặn',
        value: blockedBoats.length,
        color: '#EF4444',
        bg: 'rgba(239,68,68,0.12)',
        icon: FileWarning,
      },
    ],
    [
      pending.length,
      pendingOwners.length,
      approved.length,
      approvedOwners.length,
      expiring.length,
      blockedBoats.length,
    ],
  );

  const tabs: { id: Tab; label: string; count?: number }[] = [
    {
      id: 'pending',
      label: 'Chờ duyệt',
      count: pending.length + pendingOwners.length,
    },
    {
      id: 'approved',
      label: 'Đã duyệt',
      count: approved.length + approvedOwners.length,
    },
    { id: 'expiring', label: 'Sắp hết hạn', count: expiring.length },
    { id: 'blocked', label: 'Tàu bị chặn', count: blockedBoats.length },
    { id: 'types', label: 'Loại giấy tờ' },
  ];

  return (
    <div className="px-4 py-6 lg:px-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: '#fff', letterSpacing: '-0.44px' }}
          >
            Kiểm duyệt pháp lý
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#8892a0' }}>
            Duyệt giấy tờ chủ thuyền và giấy tờ tàu, theo dõi hạn và mở khóa tàu
            bị chặn
          </p>
        </div>
        <button
          type="button"
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
          style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            color: '#c8d0e0',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Làm mới
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-5 flex items-center gap-4"
            style={CARD}
          >
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl"
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

      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="rounded-xl px-4 py-2 text-xs font-semibold transition-all"
            style={
              tab === t.id
                ? { backgroundColor: ACCENT, color: '#fff' }
                : {
                    backgroundColor: '#0d1629',
                    color: '#8892a0',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }
            }
          >
            {t.label}
            {typeof t.count === 'number' && (
              <span
                className="ml-1.5 inline-flex min-w-4.5 items-center justify-center rounded-md px-1.5 py-0.5 text-[10px]"
                style={{
                  backgroundColor:
                    tab === t.id
                      ? 'rgba(255,255,255,0.2)'
                      : 'rgba(255,255,255,0.06)',
                }}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'pending' && (
        <div className="space-y-6">
          <CardShell>
            <SectionHeader
              icon={User}
              title="Giấy tờ chủ thuyền"
              subtitle="Duyệt cả hồ sơ pháp lý của chủ thuyền (CCCD, giấy phép kinh doanh, …). Sau khi duyệt, tính năng thương mại sẽ được mở khóa."
              count={pendingOwners.length}
              accent="#60A5FA"
            />
            <OwnerDocumentsReviewPanel
              owners={pendingOwners}
              loading={loading}
              typeLabels={typeLabels}
              showActions
              emptyMessage="Không có hồ sơ chủ thuyền chờ duyệt"
              onChanged={fetchData}
            />
          </CardShell>
          <CardShell>
            <SectionHeader
              icon={Ship}
              title="Giấy tờ thuyền"
              subtitle="Duyệt từng giấy tờ tàu: đăng kiểm, bảo hiểm trách nhiệm dân sự, …"
              count={pending.length}
              accent="#FF385C"
            />
            <CertificateReviewTable
              certificates={pending}
              loading={loading}
              showBoatInfo
              showOwnerInfo
              typeLabels={typeLabels}
              emptyMessage="Không có giấy tờ thuyền chờ duyệt"
              onChanged={fetchData}
            />
          </CardShell>
        </div>
      )}

      {tab === 'approved' && (
        <div className="space-y-6">
          <CardShell>
            <SectionHeader
              icon={User}
              title="Giấy tờ chủ thuyền"
              subtitle="Hồ sơ pháp lý chủ thuyền đã được Ban quản trị phê duyệt."
              count={approvedOwners.length}
              accent="#60A5FA"
            />
            <OwnerDocumentsReviewPanel
              owners={approvedOwners}
              loading={loading}
              typeLabels={typeLabels}
              showActions={false}
              emptyMessage="Chưa có hồ sơ chủ thuyền nào được duyệt"
              onChanged={fetchData}
            />
          </CardShell>
          <CardShell>
            <SectionHeader
              icon={Ship}
              title="Giấy tờ thuyền"
              subtitle="Giấy tờ tàu đã duyệt và còn hiệu lực trong danh sách này."
              count={approved.length}
              accent="#FF385C"
            />
            <CertificateReviewTable
              certificates={approved}
              loading={loading}
              showBoatInfo
              showOwnerInfo
              typeLabels={typeLabels}
              emptyMessage="Chưa có giấy tờ thuyền nào được duyệt"
              onChanged={fetchData}
            />
          </CardShell>
        </div>
      )}

      {tab === 'expiring' && (
        <CardShell>
          <CertificateReviewTable
            certificates={expiring}
            loading={loading}
            showBoatInfo
            showOwnerInfo
            typeLabels={typeLabels}
            emptyMessage="Không có giấy tờ hết hạn trong cửa sổ cảnh báo hiện tại"
            onChanged={fetchData}
          />
        </CardShell>
      )}

      {tab === 'types' && (
        <CardShell>
          <CertificateTypesManager />
        </CardShell>
      )}

      {tab === 'blocked' && (
        <CardShell>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2
                size={24}
                className="animate-spin"
                style={{ color: '#8892a0' }}
              />
            </div>
          ) : blockedBoats.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center gap-2 py-12"
              style={{ color: '#8892a0' }}
            >
              <CheckCircle size={28} style={{ color: '#10B981' }} />
              <p className="text-sm">Không có tàu bị tạm ẩn hoặc khóa</p>
            </div>
          ) : (
            <div className="space-y-3">
              {blockedBoats.map((boat) => {
                const meta =
                  COMPLIANCE_STATUS_META[boat.complianceStatus ?? 'locked'] ??
                  COMPLIANCE_STATUS_META.locked;
                const busy = unlockingId === boat.id;
                return (
                  <div
                    key={boat.id}
                    className="flex items-center justify-between gap-4 rounded-xl p-4"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: meta.bg }}
                      >
                        <Ship size={16} style={{ color: meta.color }} />
                      </div>
                      <div className="min-w-0">
                        <p
                          className="text-sm font-semibold truncate"
                          style={{ color: '#fff' }}
                        >
                          {boat.name}
                        </p>
                        <span
                          className="inline-flex mt-1 rounded-lg px-2 py-0.5 text-[10px] font-semibold"
                          style={{
                            backgroundColor: meta.bg,
                            color: meta.color,
                          }}
                        >
                          {meta.label}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleUnlock(boat.id)}
                      className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all hover:opacity-80 disabled:opacity-50 shrink-0"
                      style={{
                        backgroundColor: 'rgba(16,185,129,0.12)',
                        color: '#10B981',
                      }}
                    >
                      {busy ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Unlock size={13} />
                      )}
                      Mở khóa
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </CardShell>
      )}
    </div>
  );
}
