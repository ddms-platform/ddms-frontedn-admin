import {
  AlertTriangle,
  Check,
  Clock3,
  Eye,
  Ship,
  Wrench,
  X,
  type LucideIcon,
} from 'lucide-react';

export type BadgeVariant =
  | 'available'
  | 'unavailable'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'ownerBoarding'
  | 'ownerScheduled'
  | 'ownerAttention'
  | 'ownerPending'
  | 'ownerPaid'
  | 'ownerReview'
  | 'ownerRunning'
  | 'ownerIdle'
  | 'ownerMaintenance';

const VARIANT_CONFIG: Record<
  BadgeVariant,
  { bg: string; color: string; icon: LucideIcon }
> = {
  available: {
    bg: 'rgba(16, 185, 129, 0.9)',
    color: '#ffffff',
    icon: Check,
  },
  unavailable: {
    bg: 'rgba(239, 68, 68, 0.9)',
    color: '#ffffff',
    icon: X,
  },
  success: {
    bg: 'rgba(16, 185, 129, 0.9)',
    color: '#ffffff',
    icon: Check,
  },
  error: {
    bg: 'rgba(239, 68, 68, 0.9)',
    color: '#ffffff',
    icon: X,
  },
  warning: {
    bg: 'rgba(245, 158, 11, 0.9)',
    color: '#ffffff',
    icon: X,
  },
  info: {
    bg: 'rgba(59, 130, 246, 0.9)',
    color: '#ffffff',
    icon: Check,
  },
  ownerBoarding: {
    bg: 'rgba(0, 240, 255, 0.1)',
    color: '#00F0FF',
    icon: Clock3,
  },
  ownerScheduled: {
    bg: 'rgba(16, 185, 129, 0.14)',
    color: '#10B981',
    icon: Check,
  },
  ownerAttention: {
    bg: 'rgba(245, 158, 11, 0.14)',
    color: '#F59E0B',
    icon: AlertTriangle,
  },
  ownerPending: {
    bg: 'rgba(245, 158, 11, 0.14)',
    color: '#F59E0B',
    icon: Clock3,
  },
  ownerPaid: {
    bg: 'rgba(16, 185, 129, 0.14)',
    color: '#10B981',
    icon: Check,
  },
  ownerReview: {
    bg: 'rgba(0, 240, 255, 0.1)',
    color: '#00F0FF',
    icon: Eye,
  },
  ownerRunning: {
    bg: 'rgba(0, 240, 255, 0.1)',
    color: '#00F0FF',
    icon: Ship,
  },
  ownerIdle: {
    bg: 'rgba(16, 185, 129, 0.14)',
    color: '#10B981',
    icon: Check,
  },
  ownerMaintenance: {
    bg: 'rgba(245, 158, 11, 0.14)',
    color: '#F59E0B',
    icon: Wrench,
  },
};

export interface StatusBadgeProps {
  /** Display label */
  label: string;
  /** Visual variant controlling color & icon */
  variant?: BadgeVariant;
  /** Override the default icon */
  icon?: LucideIcon;
  /** Icon size in px (default: 12) */
  iconSize?: number;
  /** Show icon (default: true) */
  showIcon?: boolean;
  /** Enable backdrop blur (default: true) */
  blur?: boolean;
  /** Extra CSS classes */
  className?: string;
}

export default function StatusBadge({
  label,
  variant = 'available',
  icon,
  iconSize = 12,
  showIcon = true,
  blur = true,
  className = '',
}: StatusBadgeProps) {
  const config = VARIANT_CONFIG[variant];
  const Icon = icon || config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}
      style={{
        backgroundColor: config.bg,
        color: config.color,
        backdropFilter: blur ? 'blur(8px)' : undefined,
      }}
    >
      {showIcon && <Icon size={iconSize} />}
      {label}
    </div>
  );
}
