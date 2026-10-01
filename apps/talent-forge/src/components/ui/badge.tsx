import * as React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'secondary' | 'outline';

const variants: Record<BadgeVariant, string> = {
  secondary: 'border-transparent bg-secondary text-secondary-foreground',
  outline: 'border-border bg-transparent text-foreground',
};

export function Badge({
  className,
  variant = 'secondary',
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
