'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Play, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

// Constants
const DEFAULT_QUERY = 'MATCH (n:Person) RETURN n LIMIT 5';

// Styles
const MODAL_STYLES = [
  'w-full max-w-2xl',
  'bg-surface rounded-2xl shadow-2xl',
  'border border-border',
  'pointer-events-auto',
  'animate-scale-in',
] as const;

const HEADER_STYLES = 'flex items-center justify-between px-6 py-4 border-b border-border';
const TITLE_STYLES = 'text-lg font-semibold text-foreground';

const TEXTAREA_STYLES = [
  'w-full h-24 px-4 py-3 rounded-xl',
  'bg-background border-2 border-border',
  'text-foreground font-mono text-sm',
  'placeholder:text-muted',
  'focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20',
  'transition-all duration-200',
  'resize-none',
] as const;

const KBD_STYLES = 'px-1.5 py-0.5 rounded bg-muted/30 font-mono text-foreground';

const RESULT_SUCCESS_STYLES = 'bg-background border border-border rounded-xl overflow-hidden';
const RESULT_ERROR_STYLES = 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl overflow-hidden';
const ERROR_TEXT_STYLES = 'text-red-700 dark:text-red-400';

export function QueryModal() {
  const { queryModalOpen, setQueryModalOpen } = useAppStore();
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleExecute = useCallback(async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.executeQuery(query);
      setResult(JSON.stringify(response, null, 2));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Query failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleClose = useCallback(() => {
    setQueryModalOpen(false);
  }, [setQueryModalOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (queryModalOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [queryModalOpen]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!queryModalOpen) return;

      if (e.key === 'Escape') {
        handleClose();
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        handleExecute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [queryModalOpen, handleClose, handleExecute]);

  if (!queryModalOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-fade-in"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className={cn(MODAL_STYLES)}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={HEADER_STYLES}>
            <div>
              <h2 className={TITLE_STYLES}>Cypher Query</h2>
              <p className="text-sm text-muted">
                Execute queries against the Neo4j database
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Query Input */}
          <div className="p-6 space-y-4">
            <textarea
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="MATCH (n:Person) RETURN n LIMIT 10"
              className={cn(TEXTAREA_STYLES)}
            />

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted">
                Press <kbd className={KBD_STYLES}>⌘</kbd> + <kbd className={KBD_STYLES}>Enter</kbd> to execute
              </p>
              <Button
                onClick={handleExecute}
                disabled={loading || !query.trim()}
                className="gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Execute
              </Button>
            </div>
          </div>

          {/* Results */}
          {(result || error) && (
            <div className="px-6 pb-6">
              <div className={error ? RESULT_ERROR_STYLES : RESULT_SUCCESS_STYLES}>
                {error ? (
                  <div className={cn('p-4 text-sm', ERROR_TEXT_STYLES)}>
                    <p className="font-medium">Error</p>
                    <p>{error}</p>
                  </div>
                ) : (
                  <pre className="p-4 overflow-x-auto max-h-80 text-sm text-foreground font-mono">
                    {result}
                  </pre>
                )}
              </div>
            </div>
          )}

          {/* Footer hint */}
          <div className="px-6 pb-4">
            <p className="text-xs text-muted text-center">
              Read-only queries only. Write operations are blocked.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
