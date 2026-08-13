import { useState, useEffect } from 'react';
import {
  Users,
  Ship,
  CalendarCheck,
  TrendingUp,
  ShieldCheck,
  Anchor,
  Star,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  QrCode,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { routeName } from '@/constants/route-name';
import { markKioskFullscreenRequest } from '@/utils/kiosk-fullscreen';
import { Api } from '@/services/axios';

const ACCENT = '#FF385C';
const CARD = {
  backgroundColor: '#0d1629',
  border: '1px solid rgba(255,255,255,0.06)',
} as const;

const ST_MAP: Record<string, { label: string; color: string; bg: string }> = {
  completed: {
    label: 'Hoàn thành',
    color: '#10B981',
    bg: 'rgba(16,185,129,0.12)',
  },
  pending: {
    label: 'Chờ xử lý',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.12)',
  },
  cancelled: { label: 'Đã hủy', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
  ongoing: {
    label: 'Đang diễn ra',
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.12)',
  },
};

const iconMap: Record<string, any> = {
  'Tổng người dùng': Users,
  'Tour đang hoạt động': CalendarCheck,
  'Thuyền đang rảnh': Ship,
  'Doanh thu tháng này': TrendingUp,
};

interface DashboardStats {
  stats: Array<{
    label: string;
    value: string;
    change: string;
    up: boolean;
    color: string;
    bg: string;
  }>;
  bookingStatus: Array<{
    label: string;
    value: number;
    color: string;
    pct: number;
  }>;
  recentBookings: Array<{
    id: string;
    customer: string;
    tour: string;
    amount: string;
    status: string;
    date: string;
  }>;
  pendingVerify: Array<{
    name: string;
    license: string;
    ago: string;
  }>;
  revenueBars: number[];
  months: string[];
  systemStats: {
    totalDocks: number;
    activePromotions: number;
    todayAuditLogs: number;
  };
  totalBookingsThisMonth: number;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const openKioskCheckin = () => {
    markKioskFullscreenRequest();
    navigate(routeName.kioskCheckin);
  };

  useEffect(() => {
    let active = true;
    Api.get('/admin/dashboard/stats')
      .then((res) => {
        if (active && res.status === 200 && res.data?.code === 1000) {
          setData(res.data.result);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch dashboard stats:', err);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[85vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            className="h-10 w-10 animate-spin"
            style={{ color: ACCENT }}
          />
          <p className="text-sm font-medium" style={{ color: '#8892a0' }}>
            Đang tải dữ liệu hệ thống...
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-[85vh] flex-col items-center justify-center gap-2">
        <p className="text-sm text-red-500">
          Đã xảy ra lỗi khi kết nối máy chủ.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg px-4 py-2 text-sm font-semibold transition-colors hover:bg-white/5 border border-white/10"
          style={{ color: '#fff' }}
        >
          Tải lại trang
        </button>
      </div>
    );
  }

  const maxBar = Math.max(...data.revenueBars, 1);

  return (
    <div className="px-4 py-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: '#fff', letterSpacing: '-0.44px' }}
          >
            Bảng điều khiển
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#8892a0' }}>
            Tổng quan hoạt động hệ thống ·{' '}
            {new Date().toLocaleDateString('vi-VN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openKioskCheckin}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:scale-[1.02]"
            style={{
              background: `linear-gradient(135deg, ${ACCENT}, #c00030)`,
              color: '#fff',
              boxShadow: '0 4px 20px rgba(255,56,92,0.3)',
            }}
          >
            <QrCode size={18} />
            Quét QR Check-in
          </button>
          <div
            className="hidden sm:flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold"
            style={{
              backgroundColor: 'rgba(255,56,92,0.1)',
              color: ACCENT,
              border: '1px solid rgba(255,56,92,0.2)',
            }}
          >
            <ShieldCheck size={16} /> Admin Portal
          </div>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {data.stats.map((s) => {
          const Icon = iconMap[s.label] || Users;
          return (
            <div
              key={s.label}
              className="rounded-2xl p-5 transition-all hover:scale-[1.02]"
              style={CARD}
            >
              <div className="flex items-start justify-between">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: s.bg }}
                >
                  <Icon size={20} style={{ color: s.color }} />
                </div>
                <span
                  className="flex items-center gap-1 text-xs font-semibold"
                  style={{ color: s.up ? '#10B981' : '#EF4444' }}
                >
                  {s.up ? (
                    <ArrowUpRight size={13} />
                  ) : (
                    <ArrowDownRight size={13} />
                  )}
                  {s.change}
                </span>
              </div>
              <p className="mt-4 text-2xl font-bold" style={{ color: '#fff' }}>
                {s.value}
              </p>
              <p className="mt-0.5 text-xs" style={{ color: '#8892a0' }}>
                {s.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Revenue + Booking Status */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl p-6" style={CARD}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold" style={{ color: '#fff' }}>
                Doanh thu theo tháng
              </h2>
              <p className="text-xs mt-0.5" style={{ color: '#8892a0' }}>
                12 tháng gần nhất · triệu VND
              </p>
            </div>
            <Link
              to={routeName.adminRevenue}
              className="text-xs font-medium hover:underline"
              style={{ color: ACCENT }}
            >
              Xem chi tiết →
            </Link>
          </div>
          <div className="flex items-end gap-2 h-48">
            {data.revenueBars.map((val, i) => (
              <div
                key={i}
                className="flex-1 h-full flex flex-col justify-end items-center gap-1"
              >
                <div
                  className="w-full rounded-t-md hover:opacity-80 transition-all"
                  title={`${data.months[i]}: ${val} triệu VND`}
                  style={{
                    height: `${Math.max((val / maxBar) * 100, 2)}%`,
                    minHeight: 6,
                    background:
                      i === data.revenueBars.length - 1
                        ? `linear-gradient(180deg,${ACCENT},#c00030)`
                        : 'rgba(255,56,92,0.35)',
                  }}
                />
                <span className="text-[9px]" style={{ color: '#8892a0' }}>
                  {data.months[i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-6" style={CARD}>
          <h2 className="text-base font-semibold" style={{ color: '#fff' }}>
            Trạng thái Booking
          </h2>
          <p className="text-xs mt-0.5 mb-5" style={{ color: '#8892a0' }}>
            Tháng hiện tại · {data.totalBookingsThisMonth} bookings
          </p>
          <div className="space-y-4">
            {data.bookingStatus.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between mb-1.5">
                  <span
                    className="text-xs font-medium"
                    style={{ color: '#c8d0e0' }}
                  >
                    {item.label}
                  </span>
                  <span
                    className="text-xs font-bold"
                    style={{ color: item.color }}
                  >
                    {item.value}
                  </span>
                </div>
                <div
                  className="h-1.5 rounded-full"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                >
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      width: `${item.pct}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent + Pending */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl overflow-hidden" style={CARD}>
          <div
            className="flex items-center justify-between px-6 py-4 border-b"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <h2 className="text-base font-semibold" style={{ color: '#fff' }}>
              Booking gần đây
            </h2>
            <Link
              to={routeName.admin}
              className="text-xs font-medium"
              style={{ color: ACCENT }}
            >
              Xem tất cả →
            </Link>
          </div>
          {data.recentBookings.map((bk) => {
            const st = ST_MAP[bk.status] || ST_MAP.pending;
            return (
              <div
                key={bk.id}
                className="flex items-center gap-4 px-6 py-3.5 hover:bg-white/2 transition-colors border-b last:border-0"
                style={{ borderColor: 'rgba(255,255,255,0.04)' }}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-mono"
                      style={{ color: '#8892a0' }}
                    >
                      {bk.id}
                    </span>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: '#fff' }}
                    >
                      {bk.customer}
                    </span>
                  </div>
                  <p
                    className="text-xs mt-0.5 truncate"
                    style={{ color: '#8892a0' }}
                  >
                    {bk.tour}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className="text-xs font-semibold"
                    style={{ color: '#fff' }}
                  >
                    {bk.amount}
                  </p>
                  <p className="text-[10px]" style={{ color: '#8892a0' }}>
                    {bk.date}
                  </p>
                </div>
                <span
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold shrink-0"
                  style={{ backgroundColor: st.bg, color: st.color }}
                >
                  {st.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl overflow-hidden" style={CARD}>
          <div
            className="flex items-center justify-between px-6 py-4 border-b"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <h2 className="text-base font-semibold" style={{ color: '#fff' }}>
              Chờ xác thực Owner
            </h2>
            <Link
              to={routeName.adminOwnerVerification}
              className="text-xs font-medium"
              style={{ color: ACCENT }}
            >
              Xử lý →
            </Link>
          </div>
          <div className="p-4 space-y-3">
            {data.pendingVerify.length === 0 ? (
              <p
                className="text-xs text-center py-8"
                style={{ color: '#8892a0' }}
              >
                Không có yêu cầu xác thực nào.
              </p>
            ) : (
              data.pendingVerify.map((v, i) => (
                <div
                  key={i}
                  className="rounded-xl p-4 space-y-2 hover:scale-[1.01] transition-all"
                  style={{
                    backgroundColor: 'rgba(255,56,92,0.06)',
                    border: '1px solid rgba(255,56,92,0.12)',
                  }}
                >
                  <div className="flex items-start gap-2">
                    <ShieldCheck
                      size={14}
                      style={{ color: ACCENT, flexShrink: 0, marginTop: 2 }}
                    />
                    <p
                      className="text-xs font-semibold leading-tight"
                      style={{ color: '#fff' }}
                    >
                      {v.name}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <span
                      className="text-[10px] font-mono"
                      style={{ color: '#8892a0' }}
                    >
                      {v.license}
                    </span>
                    <span className="text-[10px]" style={{ color: '#8892a0' }}>
                      {v.ago}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div
            className="px-6 pb-5 pt-2 border-t space-y-3"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: '#8892a0' }}
            >
              Hệ thống
            </p>
            {[
              {
                label: 'Tổng bến tàu',
                value: data.systemStats.totalDocks.toString(),
                icon: Anchor,
              },
              {
                label: 'Mã KM đang active',
                value: data.systemStats.activePromotions.toString(),
                icon: Star,
              },
              {
                label: 'Log kiểm toán hôm nay',
                value: data.systemStats.todayAuditLogs.toString(),
                icon: AlertCircle,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <item.icon size={13} style={{ color: '#8892a0' }} />
                  <span className="text-xs" style={{ color: '#8892a0' }}>
                    {item.label}
                  </span>
                </div>
                <span className="text-xs font-bold" style={{ color: '#fff' }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
