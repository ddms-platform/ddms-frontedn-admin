import { Star, TrendingUp, DollarSign, CalendarCheck } from 'lucide-react';

const ACCENT = '#FF385C';
const CARD = {
  backgroundColor: '#0d1629',
  border: '1px solid rgba(255,255,255,0.06)',
} as const;

const TOP_TOURS = [
  {
    rank: 1,
    name: 'Vịnh Hạ Long 3N2Đ VIP',
    owner: 'Du thuyền Hoàng Gia',
    bookings: 312,
    revenue: 1404000000,
    avgRating: 4.92,
  },
  {
    rank: 2,
    name: 'Đảo Cát Bà Luxury Cruise',
    owner: 'HTX Tàu biển Cần Giờ',
    bookings: 245,
    revenue: 892500000,
    avgRating: 4.87,
  },
  {
    rank: 3,
    name: 'Sunset Dinner Cruise Sài Gòn',
    owner: 'TNHH Biển Xanh',
    bookings: 201,
    revenue: 361800000,
    avgRating: 4.83,
  },
  {
    rank: 4,
    name: 'Nha Trang Island Hopping',
    owner: 'Du thuyền Phúc Hải',
    bookings: 178,
    revenue: 623000000,
    avgRating: 4.79,
  },
  {
    rank: 5,
    name: 'Mekong Delta Explorer',
    owner: 'Tàu du lịch Mekong',
    bookings: 156,
    revenue: 390000000,
    avgRating: 4.75,
  },
  {
    rank: 6,
    name: 'Phú Quốc Snorkel Day Trip',
    owner: 'Công ty Tàu nhanh PQ',
    bookings: 143,
    revenue: 214500000,
    avgRating: 4.71,
  },
  {
    rank: 7,
    name: 'Hạ Long Kayak & Cave',
    owner: 'Du thuyền Hoàng Gia',
    bookings: 128,
    revenue: 448000000,
    avgRating: 4.68,
  },
  {
    rank: 8,
    name: 'Cần Thơ Night Market Cruise',
    owner: 'HTX Tàu biển Cần Giờ',
    bookings: 112,
    revenue: 123200000,
    avgRating: 4.65,
  },
];

const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

function StarBar({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={11}
          fill={s <= Math.round(rating) ? '#F59E0B' : 'none'}
          style={{ color: '#F59E0B' }}
        />
      ))}
      <span className="text-xs font-semibold ml-1" style={{ color: '#F59E0B' }}>
        {rating.toFixed(2)}
      </span>
    </div>
  );
}

export default function AdminTopTours() {
  const totalRevenue = TOP_TOURS.reduce((s, t) => s + t.revenue, 0);
  const totalBookings = TOP_TOURS.reduce((s, t) => s + t.bookings, 0);

  return (
    <div className="px-4 py-6 lg:px-8 space-y-6">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ color: '#fff', letterSpacing: '-0.44px' }}
        >
          Tour nổi bật
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#8892a0' }}>
          Xếp hạng hiệu quả tour theo booking, doanh thu và đánh giá
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'Tổng lượt booking (Top 8)',
            value: totalBookings.toLocaleString(),
            icon: CalendarCheck,
            color: '#10B981',
            bg: 'rgba(16,185,129,0.12)',
          },
          {
            label: 'Tổng doanh thu (Top 8)',
            value: `₫ ${(totalRevenue / 1000000).toFixed(0)}M`,
            icon: DollarSign,
            color: '#8B5CF6',
            bg: 'rgba(139,92,246,0.12)',
          },
          {
            label: 'Rating trung bình',
            value: (
              TOP_TOURS.reduce((s, t) => s + t.avgRating, 0) / TOP_TOURS.length
            ).toFixed(2),
            icon: Star,
            color: '#F59E0B',
            bg: 'rgba(245,158,11,0.12)',
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-5 flex items-center gap-4"
            style={CARD}
          >
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl shrink-0"
              style={{ backgroundColor: s.bg }}
            >
              <s.icon size={20} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-xl font-bold" style={{ color: '#fff' }}>
                {s.value}
              </p>
              <p className="text-xs" style={{ color: '#8892a0' }}>
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Podium Top 3 */}
      <div className="grid grid-cols-3 gap-4">
        {TOP_TOURS.slice(0, 3).map((t, i) => (
          <div
            key={t.rank}
            className="rounded-2xl p-5 space-y-3 transition-all hover:scale-[1.02]"
            style={{
              ...CARD,
              border: `1px solid ${RANK_COLORS[i]}30`,
              backgroundColor: `${RANK_COLORS[i]}08`,
            }}
          >
            <div className="flex items-center justify-between">
              <div
                className="text-2xl font-black"
                style={{ color: RANK_COLORS[i] }}
              >
                #{t.rank}
              </div>
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${RANK_COLORS[i]}20` }}
              >
                <TrendingUp size={16} style={{ color: RANK_COLORS[i] }} />
              </div>
            </div>
            <div>
              <p
                className="font-semibold leading-tight"
                style={{ color: '#fff' }}
              >
                {t.name}
              </p>
              <p className="text-xs mt-1" style={{ color: '#8892a0' }}>
                {t.owner}
              </p>
            </div>
            <StarBar rating={t.avgRating} />
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <p
                  className="text-[10px] uppercase tracking-wider"
                  style={{ color: '#8892a0' }}
                >
                  Booking
                </p>
                <p className="text-sm font-bold" style={{ color: '#fff' }}>
                  {t.bookings}
                </p>
              </div>
              <div>
                <p
                  className="text-[10px] uppercase tracking-wider"
                  style={{ color: '#8892a0' }}
                >
                  Doanh thu
                </p>
                <p
                  className="text-sm font-bold"
                  style={{ color: RANK_COLORS[i] }}
                >
                  ₫{(t.revenue / 1000000).toFixed(0)}M
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full table */}
      <div className="rounded-2xl overflow-hidden" style={CARD}>
        <div
          className="px-6 py-4 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <h2 className="text-base font-semibold" style={{ color: '#fff' }}>
            Bảng xếp hạng đầy đủ
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
                  '#',
                  'Tour',
                  'Chủ thuyền',
                  'Lượt booking',
                  'Doanh thu',
                  'Đánh giá',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: '#8892a0' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TOP_TOURS.map((t) => (
                <tr
                  key={t.rank}
                  className="border-b hover:bg-white/2 transition-colors"
                  style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                >
                  <td className="px-6 py-3.5">
                    <span
                      className="text-base font-black"
                      style={{ color: RANK_COLORS[t.rank - 1] ?? '#8892a0' }}
                    >
                      #{t.rank}
                    </span>
                  </td>
                  <td
                    className="px-6 py-3.5 font-semibold max-w-50 truncate"
                    style={{ color: '#fff' }}
                  >
                    {t.name}
                  </td>
                  <td
                    className="px-6 py-3.5 text-xs"
                    style={{ color: '#8892a0' }}
                  >
                    {t.owner}
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold" style={{ color: '#fff' }}>
                        {t.bookings}
                      </span>
                      <div
                        className="h-1 w-20 rounded-full"
                        style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                      >
                        <div
                          className="h-1 rounded-full"
                          style={{
                            width: `${(t.bookings / TOP_TOURS[0].bookings) * 100}%`,
                            backgroundColor: ACCENT,
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td
                    className="px-6 py-3.5 font-bold"
                    style={{ color: ACCENT }}
                  >
                    ₫ {(t.revenue / 1000000).toFixed(0)}M
                  </td>
                  <td className="px-6 py-3.5">
                    <StarBar rating={t.avgRating} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
