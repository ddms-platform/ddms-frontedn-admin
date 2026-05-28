import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  /** Display label */
  label: string;
  /** Route path (omit for current/last item) */
  to?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  /** Show home icon for first item (default: true) */
  showHomeIcon?: boolean;
}

export default function Breadcrumb({
  items,
  showHomeIcon = true,
}: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isFirst = index === 0;

          return (
            <li key={index} className="flex items-center gap-1.5">
              {/* Separator */}
              {index > 0 && (
                <ChevronRight
                  size={14}
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                  className="shrink-0"
                />
              )}

              {isLast || !item.to ? (
                /* Current page — no link */
                <span
                  className="font-medium"
                  style={{ color: '#ffffff' }}
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                /* Clickable link */
                <Link
                  to={item.to}
                  className="flex items-center gap-1 font-medium transition-colors hover:text-[#00F0FF]"
                  style={{ color: '#ecf0ff' }}
                >
                  {isFirst && showHomeIcon && <Home size={14} />}
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
