'use client';

import { useState, useEffect } from 'react';
import { useReactFlow } from '@xyflow/react';
import { ZoomIn, ZoomOut, Maximize2, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function CanvasControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const [isDark, setIsDark] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    try {
      const stored = localStorage.getItem('theme');
      if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        setIsDark(true);
      }
    } catch {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setIsDark(true);
      }
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);

    if (newIsDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    try {
      localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
    } catch {
      // localStorage not available
    }
  };

  return (
    <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2">
      {/* Theme Toggle */}
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        className="bg-surface dark:bg-surface shadow-md border-border"
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </Button>

      {/* Divider */}
      <div className="h-px bg-border my-1" />

      <Button
        variant="outline"
        size="icon"
        onClick={() => zoomIn({ duration: 200 })}
        className="bg-surface dark:bg-surface shadow-md border-border"
        aria-label="Zoom in"
        title="Zoom In"
      >
        <ZoomIn className="w-4 h-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={() => zoomOut({ duration: 200 })}
        className="bg-surface dark:bg-surface shadow-md border-border"
        aria-label="Zoom out"
        title="Zoom Out"
      >
        <ZoomOut className="w-4 h-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={() => fitView({ duration: 300, padding: 0.2 })}
        className="bg-surface dark:bg-surface shadow-md border-border"
        aria-label="Fit to view"
        title="Fit to View"
      >
        <Maximize2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
