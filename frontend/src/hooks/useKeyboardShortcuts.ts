'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';

export function useKeyboardShortcuts() {
  const {
    setSearchModalOpen,
    setQueryModalOpen,
    searchModalOpen,
    queryModalOpen,
    selectedPersonId,
    setSelectedPerson,
    setSidebarOpen,
    nodes,
  } = useAppStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Cmd/Ctrl + K: Open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }

      // Cmd/Ctrl + Shift + P: Open query modal (developer)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'p') {
        e.preventDefault();
        setQueryModalOpen(true);
      }

      // Escape: Close modals or deselect person
      if (e.key === 'Escape') {
        if (searchModalOpen) {
          setSearchModalOpen(false);
        } else if (queryModalOpen) {
          setQueryModalOpen(false);
        } else if (selectedPersonId) {
          setSelectedPerson(null);
          setSidebarOpen(false);
        }
      }

      // Navigate between persons with arrow keys when someone is selected
      if (selectedPersonId && nodes.length > 0) {
        const currentIndex = nodes.findIndex(n => n.id === selectedPersonId);

        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : nodes.length - 1;
          setSelectedPerson(nodes[prevIndex].id);
        }

        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          const nextIndex = currentIndex < nodes.length - 1 ? currentIndex + 1 : 0;
          setSelectedPerson(nodes[nextIndex].id);
        }
      }

      // / key: Focus search (like many apps)
      if (e.key === '/' && !searchModalOpen && !queryModalOpen) {
        e.preventDefault();
        setSearchModalOpen(true);
      }

      // ? key: Show keyboard shortcuts help (future feature)
      // if (e.key === '?' && e.shiftKey) {
      //   e.preventDefault();
      //   // Show shortcuts modal
      // }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    setSearchModalOpen,
    setQueryModalOpen,
    searchModalOpen,
    queryModalOpen,
    selectedPersonId,
    setSelectedPerson,
    setSidebarOpen,
    nodes,
  ]);
}
