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
        className="flex h-10 w-10 items-center justify-center rounded-lg transition-all hover:shadow-md active:scale-[0.96] disabled:pointer-events-none disabled:opacity-30"
        style={{ color: '#ffffff' }}
        aria-label="Previous page"
      >
        <ChevronLeft size={18} />
      </button>

      {pages.map((page, index) =>
        page === '...' ? (
          <span
            key={`ellipsis-${index}`}
            className="flex h-10 w-10 items-center justify-center text-sm"
            style={{ color: '#ecf0ff' }}
          >
            ···
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold transition-all hover:shadow-md active:scale-[0.96]"
            style={{
              backgroundColor: page === currentPage ? '#00F0FF' : 'transparent',
              color: page === currentPage ? '#0A192F' : '#ecf0ff',
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
        className="flex h-10 w-10 items-center justify-center rounded-lg transition-all hover:shadow-md active:scale-[0.96] disabled:pointer-events-none disabled:opacity-30"
        style={{ color: '#ffffff' }}
        aria-label="Next page"
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  );
}
