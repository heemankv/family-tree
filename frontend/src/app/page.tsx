'use client';

import { useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomSheet } from '@/components/layout/BottomSheet';
import { FamilyTreeCanvas } from '@/components/canvas/FamilyTreeCanvas';
import { QueryModal } from '@/components/modals/QueryModal';
import { SearchModal } from '@/components/modals/SearchModal';
import { useTreeData } from '@/hooks/useTreeData';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useAppStore } from '@/store/useAppStore';

export default function HomePage() {
  const isMobile = useIsMobile();
  const selectedPersonId = useAppStore((state) => state.selectedPersonId);

  // Load initial tree data
  useTreeData();

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  // Update URL without navigation (shallow update) to preserve state
  useEffect(() => {
    const newUrl = selectedPersonId ? `/person/${selectedPersonId}` : '/';
    window.history.replaceState(null, '', newUrl);
  }, [selectedPersonId]);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Header />

      <main className="flex-1 relative overflow-hidden">
        <FamilyTreeCanvas />

        {/* Desktop: Sidebar */}
        {!isMobile && <Sidebar />}

        {/* Mobile: Bottom Sheet */}
        {isMobile && <BottomSheet />}
      </main>

      <QueryModal />
      <SearchModal />
    </div>
  );
}
