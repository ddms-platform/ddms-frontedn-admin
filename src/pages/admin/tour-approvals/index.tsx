import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  Search,
  Ship,
  Timer,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import Pagination from '@/components/shared/pagination';
import {
  tourApprovalApi,
  type TourApprovalItem,
} from '@/services/tour-approval-api';

const ACCENT = '#FF385C';
const CARD = {
  backgroundColor: '#0d1629',
  border: '1px solid rgba(255,255,255,0.06)',
} as const;

type StatusFilter = 'all' | 'pending' | 'active' | 'rejected' | 'inactive';

const STATUS_META: Record<
  string,
  { label: string; color: string; bg: string; icon: typeof Clock }
> = {
  pending: {
    label: 'Chờ duyệt',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.12)',
    icon: Clock,
  },
  active: {
    label: 'Đã duyệt',
    color: '#10B981',
    bg: 'rgba(16,185,129,0.12)',
    icon: CheckCircle,
  },
  approved: {
    label: 'Đã duyệt',
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
  inactive: {
    label: 'Tạm ngưng',
    color: '#94A3B8',
    bg: 'rgba(148,163,184,0.12)',
    icon: AlertTriangle,
  },
};

function normalizeStatus(status?: string | null) {
  return (status || 'pending').toLowerCase();
}

function getDuration(tour: TourApprovalItem) {
  return tour.duration_minutes ?? tour.durationMinutes ?? 0;
}

function getRating(tour: TourApprovalItem) {
  return tour.avg_rating ?? tour.avgRating ?? 0;
}

function getReviews(tour: TourApprovalItem) {
  return tour.total_reviews ?? tour.totalReviews ?? 0;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function StatusBadge({ status }: { status?: string | null }) {
  const normalized = normalizeStatus(status);
  const meta = STATUS_META[normalized] ?? {
    label: status || 'Không rõ',
    color: '#94A3B8',
    bg: 'rgba(148,163,184,0.12)',
    icon: Clock,
  };
  const Icon = meta.icon;

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ color: meta.color, backgroundColor: meta.bg }}
    >
      <Icon size={13} />
      {meta.label}
    </span>
  );
}

export default function AdminTourApprovals() {
  const [tours, setTours] = useState<TourApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchTours = () => {
    setLoading(true);
    tourApprovalApi
      .getTours()
      .then((res) => {
        if (res.status === 200 && res.data?.code === 1000) {
          setTours(res.data.result || []);
          return;
        }
        toast.error('Không tải được danh sách tour.');
      })
      .catch((err) => {
        console.error('Failed to fetch tours:', err);
        toast.error('Không tải được danh sách tour.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTours();
  }, []);

  const stats = useMemo(() => {
    const pending = tours.filter(
      (t) => normalizeStatus(t.status) === 'pending',
    );
    const active = tours.filter((t) =>
      ['active', 'approved'].includes(normalizeStatus(t.status)),
    );
    const rejected = tours.filter(
      (t) => normalizeStatus(t.status) === 'rejected',
    );
    const inactive = tours.filter(
      (t) => normalizeStatus(t.status) === 'inactive',
    );

    return {
      total: tours.length,
      pending: pending.length,
      active: active.length,
      rejected: rejected.length,
      inactive: inactive.length,
    };
  }, [tours]);

  const filteredTours = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return tours.filter((tour) => {
      const status = normalizeStatus(tour.status);
      const matchStatus =
        filter === 'all' ||
        status === filter ||
        (filter === 'active' && status === 'approved');
      const matchSearch =
        !keyword ||
        tour.name?.toLowerCase().includes(keyword) ||
        tour.location?.toLowerCase().includes(keyword) ||
        tour.description?.toLowerCase().includes(keyword);

      return matchStatus && matchSearch;
    });
  }, [filter, search, tours]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredTours.length / pageSize));
  const paginatedTours = filteredTours.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handleApprove = async (tour: TourApprovalItem) => {
    if (
      !confirm(`Duyệt tour "${tour.name || 'không tên'}" để được kinh doanh?`)
    ) {
      return;
    }

    setProcessingId(tour.id);
    try {
      const res = await tourApprovalApi.approveTour(tour);
      if (res.status === 200 && res.data?.code === 1000) {
        toast.success('Đã duyệt tour. Chủ tour có thể kinh doanh.');
        fetchTours();
      } else {
        toast.error('Không duyệt được tour.');
      }
    } catch (err) {
      console.error('Failed to approve tour:', err);
      toast.error('Không duyệt được tour.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (tour: TourApprovalItem) => {
    const reason = window.prompt(
      `Nhập lý do từ chối tour "${tour.name || 'không tên'}" (bắt buộc — chủ thuyền sẽ thấy lý do này):`,
    );
    if (reason === null) return;

    const trimmed = reason.trim();
    if (!trimmed) {
      toast.error('Phải nhập lý do từ chối.');
      return;
    }

    setProcessingId(tour.id);
    try {
      const res = await tourApprovalApi.rejectTour(tour, trimmed);
      if (res.status === 200 && res.data?.code === 1000) {
        toast.success('Đã từ chối tour và gửi lý do cho chủ thuyền.');
        fetchTours();
      } else {
        toast.error('Không từ chối được tour.');
      }
    } catch (err) {
      console.error('Failed to reject tour:', err);
      toast.error('Không từ chối được tour.');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[85vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            className="h-10 w-10 animate-spin"
            style={{ color: ACCENT }}
          />
          <p className="text-sm font-medium" style={{ color: '#8892a0' }}>
            Đang tải danh sách tour chờ duyệt...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: '#fff', letterSpacing: '-0.44px' }}
          >
            Duyệt tour
          </h1>
          <p className="mt-1 max-w-3xl text-sm" style={{ color: '#8892a0' }}>
            Tour mới đăng ký sẽ ở trạng thái chờ duyệt. Admin duyệt thì tour
            chuyển sang hoạt động và chủ tour mới được phép kinh doanh.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchTours}
          className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-white/10"
          style={{ color: '#fff', backgroundColor: ACCENT }}
        >
          <Clock size={16} />
          Làm mới
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Chờ duyệt',
            value: stats.pending,
            icon: Clock,
            color: '#F59E0B',
            bg: 'rgba(245,158,11,0.12)',
          },
          {
            label: 'Đã duyệt',
            value: stats.active,
            icon: CheckCircle,
            color: '#10B981',
            bg: 'rgba(16,185,129,0.12)',
          },
          {
            label: 'Từ chối',
            value: stats.rejected,
            icon: XCircle,
            color: '#EF4444',
            bg: 'rgba(239,68,68,0.12)',
          },
          {
            label: 'Tổng tour',
            value: stats.total,
            icon: Ship,
            color: ACCENT,
            bg: 'rgba(255,56,92,0.12)',
          },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-4 rounded-2xl p-5"
            style={CARD}
          >
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: item.bg }}
            >
              <item.icon size={20} style={{ color: item.color }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: '#fff' }}>
                {item.value}
              </p>
              <p className="text-xs" style={{ color: '#8892a0' }}>
                {item.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-4" style={CARD}>
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-md">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: '#8892a0' }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên tour, địa điểm, mô tả..."
              className="h-11 w-full rounded-xl border bg-transparent pl-10 pr-3 text-sm outline-none"
              style={{
                color: '#fff',
                borderColor: 'rgba(255,255,255,0.08)',
              }}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              ['pending', 'Chờ duyệt', stats.pending],
              ['active', 'Đã duyệt', stats.active],
              ['rejected', 'Từ chối', stats.rejected],
              ['inactive', 'Tạm ngưng', stats.inactive],
              ['all', 'Tất cả', stats.total],
            ].map(([key, label, count]) => {
              const isActive = filter === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key as StatusFilter)}
                  className="rounded-xl px-3 py-2 text-sm font-semibold transition-colors"
                  style={{
                    backgroundColor: isActive
                      ? ACCENT
                      : 'rgba(255,255,255,0.04)',
                    color: isActive ? '#fff' : '#c8d0e0',
                  }}
                >
                  {label} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl" style={CARD}>
        <div
          className="border-b px-6 py-4"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <h2 className="text-base font-semibold" style={{ color: '#fff' }}>
            Danh sách tour cần kiểm duyệt
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {[
                  'Tour',
                  'Giá',
                  'Thời lượng',
                  'Địa điểm',
                  'Đánh giá',
                  'Trạng thái',
                  'Thao tác',
                ].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: '#8892a0' }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedTours.map((tour) => {
                const status = normalizeStatus(tour.status);
                const canReview = status === 'pending';
                const isProcessing = processingId === tour.id;

                return (
                  <tr
                    key={tour.id}
                    className="border-b transition-colors hover:bg-white/3"
                    style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                  >
                    <td className="px-6 py-4">
                      <div className="min-w-64">
                        <p className="font-semibold" style={{ color: '#fff' }}>
                          {tour.name || 'Tour chưa đặt tên'}
                        </p>
                        <p
                          className="mt-1 line-clamp-2 text-xs"
                          style={{ color: '#8892a0' }}
                        >
                          {tour.description || 'Chưa có mô tả'}
                        </p>
                        {status === 'rejected' &&
                          (tour.rejection_reason || tour.rejectionReason) && (
                            <p
                              className="mt-2 line-clamp-2 text-xs"
                              style={{ color: '#FCA5A5' }}
                            >
                              Lý do:{' '}
                              {tour.rejection_reason || tour.rejectionReason}
                            </p>
                          )}
                      </div>
                    </td>
                    <td
                      className="px-6 py-4 font-semibold"
                      style={{ color: ACCENT }}
                    >
                      {formatCurrency(tour.price)}
                    </td>
                    <td className="px-6 py-4" style={{ color: '#c8d0e0' }}>
                      <div className="flex items-center gap-2">
                        <Timer size={15} style={{ color: '#8892a0' }} />
                        {getDuration(tour)} phút
                      </div>
                    </td>
                    <td className="px-6 py-4" style={{ color: '#c8d0e0' }}>
                      {tour.location || '-'}
                    </td>
                    <td className="px-6 py-4" style={{ color: '#F59E0B' }}>
                      {getRating(tour).toFixed(1)} ({getReviews(tour)})
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={tour.status} />
                    </td>
                    <td className="px-6 py-4">
                      {canReview ? (
                        <div className="flex min-w-44 items-center gap-2">
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleApprove(tour)}
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                            style={{
                              color: '#fff',
                              backgroundColor: '#10B981',
                            }}
                          >
                            {isProcessing ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <CheckCircle size={14} />
                            )}
                            Duyệt
                          </button>
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleReject(tour)}
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                            style={{
                              color: '#fff',
                              backgroundColor: '#EF4444',
                            }}
                          >
                            <XCircle size={14} />
                            Từ chối
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs" style={{ color: '#8892a0' }}>
                          Không cần xử lý
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredTours.length === 0 && (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <CheckCircle size={42} style={{ color: '#10B981' }} />
            <div>
              <p className="font-semibold" style={{ color: '#fff' }}>
                Không có tour trong bộ lọc này
              </p>
              <p className="mt-1 text-sm" style={{ color: '#8892a0' }}>
                Khi chủ tour đăng ký tour mới với trạng thái chờ duyệt, tour sẽ
                xuất hiện tại đây.
              </p>
            </div>
          </div>
        )}

        {/* Pagination Bar */}
        {filteredTours.length > 0 && (
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <div
              className="flex items-center gap-3 text-xs"
              style={{ color: '#8892a0' }}
            >
              <span>
                Hiển thị{' '}
                <strong style={{ color: '#fff' }}>
                  {(currentPage - 1) * pageSize + 1} -{' '}
                  {Math.min(currentPage * pageSize, filteredTours.length)}
                </strong>{' '}
                trên tổng số{' '}
                <strong style={{ color: '#fff' }}>
                  {filteredTours.length}
                </strong>{' '}
                tour
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
                <option value={10}>10 / trang</option>
                <option value={20}>20 / trang</option>
                <option value={50}>50 / trang</option>
              </select>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
