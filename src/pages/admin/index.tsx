import {
  Users,
  Ship,
  CalendarCheck,
  TrendingUp,
  ShieldCheck,
  Anchor,
  Star,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { routeName } from '@/constants/route-name';

const ACCENT = '#FF385C';
const CARD = {
  backgroundColor: '#0d1629',
  border: '1px solid rgba(255,255,255,0.06)',
} as const;

const STATS = [
  {
    label: 'Tổng người dùng',
    value: '2,847',
    change: '+12.4%',
    up: true,
    icon: Users,
    color: '#FF385C',
    bg: 'rgba(255,56,92,0.12)',
  },
  {
    label: 'Tour đang hoạt động',
    value: '134',
    change: '+5.1%',
    up: true,
    icon: CalendarCheck,
    color: '#10B981',
    bg: 'rgba(16,185,129,0.12)',
  },
  {
    label: 'Thuyền đang rảnh',
    value: '38',
    change: '-3.2%',
    up: false,
    icon: Ship,
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.12)',
  },
  {
    label: 'Doanh thu tháng này',
    value: '₫ 482M',
    change: '+21.7%',
    up: true,
    icon: TrendingUp,
    color: '#8B5CF6',
    bg: 'rgba(139,92,246,0.12)',
  },
];

const BOOKING_STATUS = [
  { label: 'Hoàn thành', value: 312, color: '#10B981', pct: 65 },
  { label: 'Chờ xử lý', value: 87, color: '#F59E0B', pct: 18 },
  { label: 'Đã hủy', value: 43, color: '#EF4444', pct: 9 },
  { label: 'Đang diễn ra', value: 39, color: '#3B82F6', pct: 8 },
];

const RECENT = [
  {
    id: 'BK-2041',
    customer: 'Nguyễn Văn A',
    tour: 'Vịnh Hạ Long 3N2Đ',
    amount: '₫ 4,500,000',
    status: 'completed',
    date: '26/05/2026',
  },
  {
    id: 'BK-2040',
    customer: 'Trần Thị B',
    tour: 'Đảo Cát Bà Express',
    amount: '₫ 1,200,000',
    status: 'pending',
    date: '26/05/2026',
  },
  {
    id: 'BK-2039',
    customer: 'Lê Hoàng C',
    tour: 'Sunset Cruise HCM',
    amount: '₫ 800,000',
    status: 'completed',
    date: '25/05/2026',
  },
  {
    id: 'BK-2038',
    customer: 'Phạm Thùy D',
    tour: 'Vịnh Hạ Long 5N4Đ',
    amount: '₫ 8,200,000',
    status: 'cancelled',
    date: '25/05/2026',
  },
  {
    id: 'BK-2037',
    customer: 'Hoàng Minh E',
    tour: 'Nha Trang Snorkel',
    amount: '₫ 2,100,000',
    status: 'ongoing',
    date: '24/05/2026',
  },
];

const PENDING_VERIFY = [
  {
    name: 'Công ty Du thuyền Phúc Hải',
    license: 'DL-2024-0091',
    ago: '2 ngày trước',
  },
  {
    name: 'HTX Tàu biển Cần Giờ',
    license: 'DL-2024-0088',
    ago: '4 ngày trước',
  },
  {
    name: 'TNHH Dịch vụ Biển Xanh',
    license: 'DL-2024-0085',
    ago: '1 tuần trước',
  },
];

const REV_BARS = [42, 68, 55, 79, 91, 65, 83, 74, 110, 98, 125, 108];
const MONTHS = [
  'T6',
  'T7',
  'T8',
  'T9',
  'T10',
  'T11',
  'T12',
  'T1',
  'T2',
  'T3',
  'T4',
  'T5',
];

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

export default function AdminDashboard() {
  const maxBar = Math.max(...REV_BARS);
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

      {/* KPI */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((s) => (
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
                <s.icon size={20} style={{ color: s.color }} />
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
        ))}
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
          <div className="flex items-end gap-2 h-40">
            {REV_BARS.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md hover:opacity-80 transition-all"
                  style={{
                    height: `${(val / maxBar) * 100}%`,
                    minHeight: 4,
                    background:
                      i === REV_BARS.length - 1
                        ? `linear-gradient(180deg,${ACCENT},#c00030)`
                        : 'rgba(255,56,92,0.3)',
                  }}
                />
                <span className="text-[9px]" style={{ color: '#8892a0' }}>
                  {MONTHS[i]}
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
            Tháng hiện tại · 481 bookings
          </p>
          <div className="space-y-4">
            {BOOKING_STATUS.map((item) => (
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
          {RECENT.map((bk) => {
            const st = ST_MAP[bk.status];
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
            {PENDING_VERIFY.map((v, i) => (
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
            ))}
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
              { label: 'Tổng bến tàu', value: '12', icon: Anchor },
              { label: 'Mã KM đang active', value: '5', icon: Star },
              {
                label: 'Log kiểm toán hôm nay',
                value: '138',
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
