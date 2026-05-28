import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

interface IProps extends HTMLAttributes<HTMLDivElement> {
  text?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  text,
  fullScreen = false,
  className,
  ...props
}: IProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        fullScreen && 'min-h-[60vh]',
        className,
      )}
      {...props}
    >
      <span className="loading loading-spinner loading-md text-primary" />
      {text && <p className="text-sm opacity-60">{text}</p>}
    </div>
  );
}
