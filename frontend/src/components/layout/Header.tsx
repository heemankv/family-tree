'use client';

import { useEffect, useState } from 'react';
import { Search, Sparkles, Moon, Sun } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

export function Header() {
  const { setQueryModalOpen, setSearchModalOpen } = useAppStore();
  const [isDark, setIsDark] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

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
            title="Search (⌘K)"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs bg-surface rounded border border-border text-muted">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center',
              'bg-background hover:bg-border',
              'text-muted',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
            )}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Siri-style Query Button */}
          <button
            onClick={() => setQueryModalOpen(true)}
            className={cn(
              'relative w-10 h-10 rounded-full',
              'bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500',
              'flex items-center justify-center',
              'shadow-lg hover:shadow-xl',
              'transform hover:scale-105 active:scale-95',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2'
            )}
            title="Open Cypher Query (Developer Tool)"
          >
            <Sparkles className="w-5 h-5 text-white" />

            {/* Subtle glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 blur-md opacity-50 -z-10" />
          </button>
        </div>
      </div>
    </header>
  );
}
