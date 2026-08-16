import { useState } from 'react';
import { Star, Trash2, Search, MessageSquare } from 'lucide-react';
import Pagination from '@/components/shared/pagination';

const ACCENT = '#FF385C';
const CARD = {
  backgroundColor: '#0d1629',
  border: '1px solid rgba(255,255,255,0.06)',
} as const;

const REVIEWS = [
  {
    id: 1,
    customer: 'Nguyễn Văn A',
    tour: 'Vịnh Hạ Long 3N2Đ',
    rating: 5,
    comment:
      'Chuyến đi tuyệt vời! Đội ngũ phục vụ nhiệt tình, cảnh đẹp không thể tả được. Sẽ quay lại lần sau.',
    date: '24/05/2026',
    flagged: false,
  },
  {
    id: 2,
    customer: 'Trần Thị B',
    tour: 'Sunset Dinner Cruise',
    rating: 4,
    comment:
      'Bữa tối rất ngon, view đẹp. Tuy nhiên thuyền hơi chật so với số khách.',
    date: '23/05/2026',
    flagged: false,
  },
  {
    id: 3,
    customer: 'Lê Hoàng C',
    tour: 'Cát Bà Island Escape',
    rating: 2,
    comment:
      'Dịch vụ không như quảng cáo. Phòng không sạch, hướng dẫn viên thiếu chuyên nghiệp.',
    date: '22/05/2026',
    flagged: true,
  },
  {
    id: 4,
    customer: 'Phạm Thùy D',
    tour: 'Nha Trang Snorkel',
    rating: 5,
    comment: 'Cực kỳ satisfied! Hướng dẫn viên tốt, an toàn được đảm bảo.',
    date: '21/05/2026',
    flagged: false,
  },
  {
    id: 5,
    customer: 'Hoàng Minh E',
    tour: 'Mekong Delta Explorer',
    rating: 3,
    comment: 'Đường đi khá xa, mệt. Cảnh đẹp nhưng cần cải thiện khâu hậu cần.',
    date: '20/05/2026',
    flagged: false,
  },
  {
    id: 6,
    customer: 'Võ Thanh F',
    tour: 'Phú Quốc Day Trip',
    rating: 1,
    comment:
      'Thất vọng hoàn toàn. Hủy tour phút chót mà không thông báo trước.',
    date: '19/05/2026',
    flagged: true,
  },
];

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={12}
          fill={s <= n ? '#F59E0B' : 'none'}
          style={{ color: '#F59E0B' }}
        />
      ))}
    </div>
  );
}

export default function AdminReviews() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'flagged' | 'low'>('all');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filtered = REVIEWS.filter((r) => {
    const matchSearch =
      r.customer.toLowerCase().includes(search.toLowerCase()) ||
      r.tour.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all'
        ? true
        : filter === 'flagged'
          ? r.flagged
          : r.rating <= 2;
    return matchSearch && matchFilter;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedReviews = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const avg = (
    REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length
  ).toFixed(2);

  return (
    <div className="px-4 py-6 lg:px-8 space-y-6">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ color: '#fff', letterSpacing: '-0.44px' }}
        >
          Giám sát Đánh giá
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#8892a0' }}>
          Kiểm duyệt đánh giá của khách hàng để đảm bảo chất lượng nền tảng
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: 'Tổng đánh giá',
            value: REVIEWS.length,
            color: ACCENT,
            bg: 'rgba(255,56,92,0.12)',
          },
          {
            label: 'Rating trung bình',
            value: avg,
            color: '#F59E0B',
            bg: 'rgba(245,158,11,0.12)',
          },
          {
            label: 'Đánh dấu vi phạm',
            value: REVIEWS.filter((r) => r.flagged).length,
            color: '#EF4444',
            bg: 'rgba(239,68,68,0.12)',
          },
          {
            label: 'Đánh giá thấp (1-2★)',
            value: REVIEWS.filter((r) => r.rating <= 2).length,
            color: '#F97316',
            bg: 'rgba(249,115,22,0.12)',
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-4 flex items-center gap-3"
            style={CARD}
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
              style={{ backgroundColor: s.bg }}
            >
              <MessageSquare size={16} style={{ color: s.color }} />
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: '#8892a0' }}
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm theo khách hàng, tour..."
            className="w-full rounded-xl py-2.5 pl-9 pr-4 text-sm outline-none"
            style={{
              backgroundColor: '#0d1629',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#fff',
            }}
          />
        </div>
        <div className="flex gap-2">
          {(
            [
              ['all', 'Tất cả'],
              ['flagged', 'Vi phạm'],
              ['low', 'Thấp ≤2★'],
            ] as const
          ).map(([v, l]) => (
            <button
              key={v}
              onClick={() => {
                setFilter(v);
                setCurrentPage(1);
              }}
              className="rounded-xl px-4 py-2 text-xs font-semibold transition-all"
              style={
                filter === v
                  ? { backgroundColor: ACCENT, color: '#fff' }
                  : {
                      backgroundColor: '#0d1629',
                      color: '#8892a0',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }
              }
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-3">
        {paginatedReviews.map((r) => (
          <div
            key={r.id}
            className="rounded-2xl p-5 space-y-3 transition-all hover:scale-[1.005]"
            style={{
              ...CARD,
              border: r.flagged ? '1px solid rgba(239,68,68,0.3)' : CARD.border,
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold shrink-0"
                  style={{
                    background: `linear-gradient(135deg,${ACCENT},#c00030)`,
                    color: '#fff',
                  }}
                >
                  {r.customer
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold" style={{ color: '#fff' }}>
                    {r.customer}
                  </p>
                  <p className="text-xs" style={{ color: '#8892a0' }}>
                    {r.tour}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Stars n={r.rating} />
                <span className="text-[10px]" style={{ color: '#8892a0' }}>
                  {r.date}
                </span>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#c8d0e0' }}>
              "{r.comment}"
            </p>
            <div className="flex items-center justify-between">
              {r.flagged ? (
                <span
                  className="rounded-lg px-2.5 py-1 text-xs font-semibold"
                  style={{
                    backgroundColor: 'rgba(239,68,68,0.12)',
                    color: '#EF4444',
                  }}
                >
                  ⚑ Đánh dấu vi phạm
                </span>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <button
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold hover:opacity-80 transition-all"
                  style={{
                    backgroundColor: 'rgba(239,68,68,0.1)',
                    color: '#EF4444',
                  }}
                >
                  <Trash2 size={12} className="inline mr-1" />
                  Xóa
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center py-12 text-sm" style={{ color: '#8892a0' }}>
            Không có đánh giá nào
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
                <strong style={{ color: '#fff' }}>{filtered.length}</strong>{' '}
                đánh giá
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
      </div>
    </div>
  );
}
