'use client';

import { useState, useEffect, useCallback } from 'react';
import { RotateCcw, X } from 'lucide-react';
import { useIsMobile, useIsPortrait } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

// Constants
const STORAGE_KEY = 'family-tree-rotate-prompt-dismissed';
const SHOW_DELAY_MS = 1000;

// Style constants
const OVERLAY_STYLES = [
  'fixed inset-0 z-50 flex items-center justify-center p-4',
  'bg-black/50 backdrop-blur-sm',
  'animate-fade-in',
] as const;

const MODAL_STYLES = 'bg-surface rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-border animate-scale-in';
const CLOSE_BUTTON_STYLES = 'absolute top-3 right-3 p-1 rounded-full hover:bg-muted/50 transition-colors';
const ICON_CONTAINER_STYLES = 'w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center';
const PRIMARY_BUTTON_STYLES = 'w-full py-2.5 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors';
const SECONDARY_BUTTON_STYLES = 'w-full py-2 px-4 text-sm text-muted hover:text-foreground transition-colors';

// Helper functions
function getDismissedState(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function saveDismissedState(): void {
  try {
    localStorage.setItem(STORAGE_KEY, 'true');
  } catch {
    // localStorage not available
  }
}

// Custom hook for prompt visibility
function usePromptVisibility() {
  const isMobile = useIsMobile();
  const isPortrait = useIsPortrait();
  const [isDismissed, setIsDismissed] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    setIsDismissed(getDismissedState());
  }, []);

  // Show prompt when on mobile portrait and not dismissed
  useEffect(() => {
    if (isMobile && isPortrait && !isDismissed) {
      const timer = setTimeout(() => setIsVisible(true), SHOW_DELAY_MS);
      return () => clearTimeout(timer);
    }
    setIsVisible(false);
  }, [isMobile, isPortrait, isDismissed]);

  const dismiss = useCallback(() => {
    setIsVisible(false);
    setIsDismissed(true);
  }, []);

  const dismissPermanently = useCallback(() => {
    saveDismissedState();
    dismiss();
  }, [dismiss]);

  return { isVisible, dismiss, dismissPermanently };
}

// Component
export function RotateDevicePrompt() {
  const { isVisible, dismiss, dismissPermanently } = usePromptVisibility();

  if (!isVisible) {
    return null;
  }

  return (
    <div className={cn(OVERLAY_STYLES)}>
      <div className={MODAL_STYLES}>
        <button
          onClick={dismiss}
          className={CLOSE_BUTTON_STYLES}
          aria-label="Dismiss"
        >
          <X className="w-5 h-5 text-muted" />
        </button>

        <div className="flex justify-center mb-4">
          <div className={ICON_CONTAINER_STYLES}>
            <RotateCcw className="w-8 h-8 text-primary animate-pulse-subtle" />
          </div>
        </div>

        <h3 className="text-lg font-semibold text-foreground text-center mb-2">
          Rotate for Better View
        </h3>

        <p className="text-sm text-muted text-center mb-6">
          Family trees are best viewed in landscape mode. Rotate your device for an optimal experience.
        </p>

        <div className="flex flex-col gap-2">
          <button onClick={dismiss} className={PRIMARY_BUTTON_STYLES}>
            Got it
          </button>
          <button onClick={dismissPermanently} className={SECONDARY_BUTTON_STYLES}>
            Don't show again
          </button>
        </div>
      </div>
    </div>
  );
}
