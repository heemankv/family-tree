'use client';

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-3',
};

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-gray-300 border-t-primary',
        sizeClasses[size],
        className
      )}
    />
  );
}

export function FullPageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background animate-fade-in">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <LoadingSpinner size="lg" />
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
        </div>
        <p className="text-muted text-sm animate-pulse-subtle">Loading family tree...</p>
      </div>
    </div>
  );
}
