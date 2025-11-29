'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, User } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Avatar } from '@/components/ui/Avatar';
import { cn, getYearsDisplay } from '@/lib/utils';

export function SearchModal() {
  const { searchModalOpen, setSearchModalOpen, nodes, setSelectedPerson } = useAppStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter persons based on query
  const filteredPersons = useMemo(() => {
    if (!query.trim()) return nodes.slice(0, 8); // Show first 8 when no query

    const lowerQuery = query.toLowerCase();
    return nodes.filter(person =>
      person.name.toLowerCase().includes(lowerQuery) ||
      person.profession.toLowerCase().includes(lowerQuery) ||
      person.current_location.toLowerCase().includes(lowerQuery)
    ).slice(0, 8);
  }, [query, nodes]);

  // Focus input when modal opens
  useEffect(() => {
    if (searchModalOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [searchModalOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!searchModalOpen) return;

      switch (e.key) {
        case 'Escape':
          setSearchModalOpen(false);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev =>
            prev < filteredPersons.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredPersons[selectedIndex]) {
            handleSelectPerson(filteredPersons[selectedIndex].id);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchModalOpen, filteredPersons, selectedIndex]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredPersons.length]);

  const handleSelectPerson = (personId: string) => {
    setSelectedPerson(personId);
    setSearchModalOpen(false);
  };

  const handleClose = () => {
    setSearchModalOpen(false);
  };

  if (!searchModalOpen) {
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
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
        <div
          className={cn(
            'w-full max-w-lg bg-surface rounded-2xl shadow-2xl',
            'pointer-events-auto',
            'animate-scale-in',
            'overflow-hidden'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="relative border-b border-border">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search people by name, profession, or location..."
              className={cn(
                'w-full h-14 pl-12 pr-12',
                'text-lg bg-transparent text-foreground',
                'focus:outline-none',
                'placeholder:text-muted'
              )}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-background rounded-full"
              >
                <X className="w-4 h-4 text-muted" />
              </button>
            )}
          </div>

          {/* Results */}
          <div className="max-h-[50vh] overflow-y-auto">
            {filteredPersons.length > 0 ? (
              <ul className="py-2">
                {filteredPersons.map((person, index) => (
                  <li key={person.id}>
                    <button
                      onClick={() => handleSelectPerson(person.id)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        'w-full px-4 py-3 flex items-center gap-3',
                        'transition-colors duration-100',
                        index === selectedIndex
                          ? 'bg-primary/10'
                          : 'hover:bg-background'
                      )}
                    >
                      <Avatar person={person} size="sm" />
                      <div className="flex-1 text-left">
                        <p className="font-medium text-foreground">{person.name}</p>
                        <p className="text-sm text-muted">
                          {person.profession} • {getYearsDisplay(person)}
                        </p>
                      </div>
                      {!person.is_alive && (
                        <span className="text-xs text-muted bg-background px-2 py-0.5 rounded">
                          Late
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-12 text-center">
                <User className="w-12 h-12 text-muted mx-auto mb-3" />
                <p className="text-muted">No people found</p>
                <p className="text-sm text-muted mt-1">
                  Try a different search term
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-background border-t border-border">
            <div className="flex items-center justify-between text-xs text-muted">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-surface rounded border border-border font-mono">↑</kbd>
                  <kbd className="px-1.5 py-0.5 bg-surface rounded border border-border font-mono">↓</kbd>
                  <span className="ml-1">Navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-surface rounded border border-border font-mono">↵</kbd>
                  <span className="ml-1">Select</span>
                </span>
              </div>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-surface rounded border border-border font-mono">Esc</kbd>
                <span className="ml-1">Close</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
