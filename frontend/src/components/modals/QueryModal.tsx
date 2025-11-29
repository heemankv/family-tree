'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Play, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export function QueryModal() {
  const { queryModalOpen, setQueryModalOpen } = useAppStore();
  const [query, setQuery] = useState('MATCH (n:Person) RETURN n LIMIT 5');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (queryModalOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [queryModalOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && queryModalOpen) {
        setQueryModalOpen(false);
      }
      // Cmd/Ctrl + Enter to execute
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && queryModalOpen) {
        handleExecute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [queryModalOpen, query]);

  const handleExecute = async () => {
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
  };

  const handleClose = () => {
    setQueryModalOpen(false);
  };

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
          className={cn(
            'w-full max-w-2xl bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl',
            'pointer-events-auto',
            'animate-scale-in'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/50">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Cypher Query
              </h2>
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
            <div className="relative">
              <textarea
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="MATCH (n:Person) RETURN n LIMIT 10"
                className={cn(
                  'w-full h-24 px-4 py-3 rounded-xl',
                  'bg-gray-50 border-2 border-gray-200',
                  'font-mono text-sm',
                  'focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100',
                  'transition-all duration-200',
                  'resize-none'
                )}
              />

              {/* Glow effect when focused */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 opacity-0 focus-within:opacity-100 -z-10 blur-xl transition-opacity" />
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted">
                Press <kbd className="px-1.5 py-0.5 rounded bg-gray-100 font-mono">⌘</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-gray-100 font-mono">Enter</kbd> to execute
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
              <div
                className={cn(
                  'rounded-xl overflow-hidden',
                  error ? 'bg-red-50 border border-red-200' : 'code-block'
                )}
              >
                {error ? (
                  <div className="p-4 text-red-700 text-sm">
                    <p className="font-medium">Error</p>
                    <p>{error}</p>
                  </div>
                ) : (
                  <pre className="p-4 overflow-x-auto max-h-80 text-sm">
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
