import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  /** Current active page (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Max sibling pages to show on each side (default: 1) */
  siblingCount?: number;
}

function generatePages(
  current: number,
  total: number,
  siblings: number,
): (number | '...')[] {
  const pages: (number | '...')[] = [];

  pages.push(1);

  const leftBound = Math.max(2, current - siblings);
  const rightBound = Math.min(total - 1, current + siblings);
  if (leftBound > 2) pages.push('...');

  for (let i = leftBound; i <= rightBound; i++) {
    pages.push(i);
  }
  if (rightBound < total - 1) pages.push('...');
  if (total > 1) pages.push(total);

  return pages;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = generatePages(currentPage, totalPages, siblingCount);

  return (
    <nav
      className="flex items-center justify-center gap-1.5"
      aria-label="Pagination"
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex h-9 w-9 items-center justify-center rounded-xl transition-all hover:bg-white/5 active:scale-[0.96] disabled:pointer-events-none disabled:opacity-25 cursor-pointer"
        style={{
          backgroundColor: '#0d1629',
          border: '1px solid rgba(255,255,255,0.08)',
          color: '#8892a0',
        }}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((page, index) =>
        page === '...' ? (
          <span
            key={`ellipsis-${index}`}
            className="flex h-9 w-9 items-center justify-center text-xs"
            style={{ color: '#8892a0' }}
          >
            ···
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-semibold transition-all hover:shadow-md active:scale-[0.96] cursor-pointer"
            style={{
              backgroundColor: page === currentPage ? '#FF385C' : '#0d1629',
              border:
                page === currentPage
                  ? '1px solid #FF385C'
                  : '1px solid rgba(255,255,255,0.08)',
              color: page === currentPage ? '#ffffff' : '#8892a0',
            }}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="flex h-9 w-9 items-center justify-center rounded-xl transition-all hover:bg-white/5 active:scale-[0.96] disabled:pointer-events-none disabled:opacity-25 cursor-pointer"
        style={{
          backgroundColor: '#0d1629',
          border: '1px solid rgba(255,255,255,0.08)',
          color: '#8892a0',
        }}
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
