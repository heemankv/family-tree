'use client';

import { memo, ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Types
type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

// Style constants
const BASE_STYLES = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium';

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  default: 'bg-primary text-white',
  secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  destructive: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  outline: 'border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300',
} as const;

const LATE_BADGE_STYLES = 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300';

// Components
export const Badge = memo(function Badge({
  children,
  variant = 'default',
  className
}: BadgeProps) {
  return (
    <span className={cn(BASE_STYLES, VARIANT_STYLES[variant], className)}>
      {children}
    </span>
  );
});

export const LateBadge = memo(function LateBadge() {
  return (
    <Badge variant="secondary" className={LATE_BADGE_STYLES}>
      Late
    </Badge>
  );
});
