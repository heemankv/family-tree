'use client';

import { useState, useEffect, useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { ZoomIn, ZoomOut, Maximize2, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Constants
const ZOOM_DURATION = 200;
const FIT_VIEW_DURATION = 300;
const FIT_VIEW_PADDING = 0.2;
const THEME_STORAGE_KEY = 'theme';

type Theme = 'light' | 'dark';

// Style constants
const BUTTON_STYLES = 'bg-surface dark:bg-surface shadow-md border-border';
const ICON_STYLES = 'w-4 h-4';

// Helper functions
function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'dark' || stored === 'light' ? stored : null;
  } catch {
    return null;
  }
}

function saveTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // localStorage not available
  }
}

function applyTheme(theme: Theme): void {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

// Custom hook for theme management
function useTheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const storedTheme = getStoredTheme();
    const initialTheme = storedTheme || getSystemTheme();
    setIsDark(initialTheme === 'dark');
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const newIsDark = !prev;
      const newTheme: Theme = newIsDark ? 'dark' : 'light';
      applyTheme(newTheme);
      saveTheme(newTheme);
      return newIsDark;
    });
  }, []);

  return { isDark, toggleTheme };
}

// Component
export function CanvasControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { isDark, toggleTheme } = useTheme();

  const handleZoomIn = useCallback(() => {
    zoomIn({ duration: ZOOM_DURATION });
  }, [zoomIn]);

  const handleZoomOut = useCallback(() => {
    zoomOut({ duration: ZOOM_DURATION });
  }, [zoomOut]);

  const handleFitView = useCallback(() => {
    fitView({ duration: FIT_VIEW_DURATION, padding: FIT_VIEW_PADDING });
  }, [fitView]);

  return (
    <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        className={BUTTON_STYLES}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? <Sun className={ICON_STYLES} /> : <Moon className={ICON_STYLES} />}
      </Button>

      <div className="h-px bg-border my-1" />

      <Button
        variant="outline"
        size="icon"
        onClick={handleZoomIn}
        className={BUTTON_STYLES}
        aria-label="Zoom in"
        title="Zoom In"
      >
        <ZoomIn className={ICON_STYLES} />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={handleZoomOut}
        className={BUTTON_STYLES}
        aria-label="Zoom out"
        title="Zoom Out"
      >
        <ZoomOut className={ICON_STYLES} />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={handleFitView}
        className={BUTTON_STYLES}
        aria-label="Fit to view"
        title="Fit to View"
      >
        <Maximize2 className={ICON_STYLES} />
      </Button>
    </div>
  );
}
