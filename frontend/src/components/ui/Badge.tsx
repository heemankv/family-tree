'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}

const variantClasses = {
  default: 'bg-primary text-white',
  secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  destructive: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  outline: 'border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300',
};

export const Badge = memo(function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
});

// Special badge for deceased persons
export const LateBadge = memo(function LateBadge() {
  return (
    <Badge variant="secondary" className="bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
      Late
    </Badge>
  );
});
