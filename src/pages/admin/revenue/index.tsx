import { TrendingUp, TrendingDown, BarChart3, CreditCard } from 'lucide-react';

const ACCENT = '#FF385C';
const CARD = {
  backgroundColor: '#0d1629',
  border: '1px solid rgba(255,255,255,0.06)',
} as const;

const MONTHLY = [
  { month: 'Tháng 6/2025', revenue: 342000000, payments: 89 },
  { month: 'Tháng 7/2025', revenue: 415000000, payments: 112 },
  { month: 'Tháng 8/2025', revenue: 389000000, payments: 98 },
  { month: 'Tháng 9/2025', revenue: 467000000, payments: 125 },
  { month: 'Tháng 10/2025', revenue: 521000000, payments: 143 },
  { month: 'Tháng 11/2025', revenue: 398000000, payments: 104 },
  { month: 'Tháng 12/2025', revenue: 612000000, payments: 167 },
  { month: 'Tháng 1/2026', revenue: 445000000, payments: 119 },
  { month: 'Tháng 2/2026', revenue: 378000000, payments: 96 },
  { month: 'Tháng 3/2026', revenue: 589000000, payments: 158 },
  { month: 'Tháng 4/2026', revenue: 734000000, payments: 201 },
  { month: 'Tháng 5/2026', revenue: 482000000, payments: 134 },
];

const fmt = (n: number) =>
  n >= 1000000000
    ? `${(n / 1000000000).toFixed(2)} tỷ`
    : `${(n / 1000000).toFixed(0)}M`;

export default function AdminRevenue() {
  const totalRevenue = MONTHLY.reduce((s, m) => s + m.revenue, 0);
  const totalPayments = MONTHLY.reduce((s, m) => s + m.payments, 0);
  const maxRev = Math.max(...MONTHLY.map((m) => m.revenue));
  const lastMonth = MONTHLY[MONTHLY.length - 1];
  const prevMonth = MONTHLY[MONTHLY.length - 2];
  const growth =
    ((lastMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100;

  return (
    <div className="px-4 py-6 lg:px-8 space-y-6">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ color: '#fff', letterSpacing: '-0.44px' }}
        >
          Thống kê Doanh thu
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#8892a0' }}>
          Theo dõi tổng doanh thu và thanh toán thành công của toàn hệ thống
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: 'Tổng doanh thu',
            value: `₫ ${fmt(totalRevenue)}`,
            icon: BarChart3,
            color: '#FF385C',
            bg: 'rgba(255,56,92,0.12)',
            sub: '12 tháng gần nhất',
          },
          {
            label: 'Thanh toán thành công',
            value: totalPayments.toLocaleString(),
            icon: CreditCard,
            color: '#10B981',
            bg: 'rgba(16,185,129,0.12)',
            sub: 'Tổng giao dịch',
          },
          {
            label: 'Tháng này',
            value: `₫ ${fmt(lastMonth.revenue)}`,
            icon: TrendingUp,
            color: '#8B5CF6',
            bg: 'rgba(139,92,246,0.12)',
            sub: `${lastMonth.payments} giao dịch`,
          },
          {
            label: 'Tăng trưởng MoM',
            value: `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`,
            icon: growth >= 0 ? TrendingUp : TrendingDown,
            color: growth >= 0 ? '#10B981' : '#EF4444',
            bg: growth >= 0 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
            sub: 'So với tháng trước',
          },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-5" style={CARD}>
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: s.bg }}
            >
              <s.icon size={20} style={{ color: s.color }} />
            </div>
            <p className="mt-3 text-xl font-bold" style={{ color: '#fff' }}>
              {s.value}
            </p>
            <p className="text-xs mt-0.5 font-medium" style={{ color: '#fff' }}>
              {s.label}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#8892a0' }}>
              {s.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="rounded-2xl p-6" style={CARD}>
        <h2 className="text-base font-semibold mb-1" style={{ color: '#fff' }}>
          Doanh thu theo tháng
        </h2>
        <p className="text-xs mb-6" style={{ color: '#8892a0' }}>
          Đơn vị: triệu VND
        </p>
        <div className="flex items-end gap-3 h-52">
          {MONTHLY.map((m, i) => {
            const pct = (m.revenue / maxRev) * 100;
            const isLast = i === MONTHLY.length - 1;
            return (
              <div
                key={m.month}
                className="flex-1 flex flex-col items-center gap-1.5 group"
              >
                <div
                  className="w-full relative flex items-end justify-center"
                  style={{ height: `${pct}%`, minHeight: 6 }}
                >
                  <div
                    className="w-full rounded-t-lg transition-all group-hover:opacity-90"
                    style={{
                      height: '100%',
                      background: isLast
                        ? `linear-gradient(180deg,${ACCENT},#c00030)`
                        : 'rgba(255,56,92,0.3)',
                    }}
                  />
                  <div
                    className="absolute -top-6 text-[9px] font-semibold hidden group-hover:block"
                    style={{ color: '#fff' }}
                  >
                    ₫{fmt(m.revenue)}
                  </div>
                </div>
                <span
                  className="text-[9px] text-center leading-tight"
                  style={{ color: '#8892a0' }}
                >
                  {m.month.replace('Tháng ', 'T').replace('/20', '/')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly table */}
      <div className="rounded-2xl overflow-hidden" style={CARD}>
        <div
          className="px-6 py-4 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <h2 className="text-base font-semibold" style={{ color: '#fff' }}>
            Chi tiết theo tháng
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
                  'Tháng',
                  'Doanh thu',
                  'Thanh toán',
                  'TB / giao dịch',
                  'Tăng trưởng',
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
              {[...MONTHLY].reverse().map((m, i, arr) => {
                const prev = arr[i + 1];
                const g = prev
                  ? ((m.revenue - prev.revenue) / prev.revenue) * 100
                  : null;
                return (
                  <tr
                    key={m.month}
                    className="border-b hover:bg-white/2 transition-colors"
                    style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                  >
                    <td
                      className="px-6 py-3.5 font-medium"
                      style={{ color: '#fff' }}
                    >
                      {m.month}
                    </td>
                    <td
                      className="px-6 py-3.5 font-bold"
                      style={{ color: ACCENT }}
                    >
                      ₫ {m.revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5" style={{ color: '#c8d0e0' }}>
                      {m.payments} giao dịch
                    </td>
                    <td className="px-6 py-3.5" style={{ color: '#8892a0' }}>
                      ₫ {Math.round(m.revenue / m.payments).toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5">
                      {g !== null ? (
                        <span
                          className="flex items-center gap-1 text-xs font-semibold"
                          style={{ color: g >= 0 ? '#10B981' : '#EF4444' }}
                        >
                          {g >= 0 ? (
                            <TrendingUp size={12} />
                          ) : (
                            <TrendingDown size={12} />
                          )}
                          {g > 0 ? '+' : ''}
                          {g.toFixed(1)}%
                        </span>
                      ) : (
                        <span style={{ color: '#8892a0' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
