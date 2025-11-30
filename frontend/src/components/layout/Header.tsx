'use client';

import { useEffect } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

export function Header() {
  const { setQueryModalOpen, setSearchModalOpen } = useAppStore();

  // Initialize theme from localStorage or system preference on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('theme');
      if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      }
    } catch {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  return (
    <header className="sticky top-0 z-50 h-14 bg-surface/95 backdrop-blur-sm border-b border-border shadow-sm pt-safe">
      <div className="h-full px-4 flex items-center justify-between max-w-screen-2xl mx-auto">
        {/* Logo / Title */}
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-foreground">
            Family Tree
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Search Button */}
          <button
            onClick={() => setSearchModalOpen(true)}
            className={cn(
              'flex items-center gap-2 h-9 px-3 rounded-full',
              'bg-background hover:bg-border',
              'text-sm text-muted',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
            )}
            aria-label="Search people (⌘K)"
            title="Search (⌘K)"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs bg-surface rounded border border-border text-muted">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>

          {/* Dev Query Button */}
          <button
            onClick={() => setQueryModalOpen(true)}
            className={cn(
              'w-8 h-8 rounded-full',
              'bg-muted/20 hover:bg-muted/30',
              'border border-border',
              'flex items-center justify-center',
              'transform hover:scale-105 active:scale-95',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
            )}
            aria-label="Open Cypher Query"
            title="Open Cypher Query (Developer Tool)"
          >
            <Sparkles className="w-4 h-4 text-muted" />
          </button>
        </div>
      </div>
    </header>
  );
}
