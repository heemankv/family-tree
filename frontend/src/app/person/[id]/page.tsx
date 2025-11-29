'use client';

import { useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
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

export default function PersonPage() {
  const params = useParams();
  const personId = params.id as string;
  const isMobile = useIsMobile();
  const selectedPersonId = useAppStore((state) => state.selectedPersonId);
  const setSelectedPerson = useAppStore((state) => state.setSelectedPerson);
  const nodes = useAppStore((state) => state.nodes);
  const hasInitialized = useRef(false);

  // Load tree data - only once, always centered on "me-001"
  useTreeData();

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  // Set the person as selected when page loads via direct URL access
  useEffect(() => {
    if (personId && nodes.length > 0 && !hasInitialized.current) {
      const personExists = nodes.some(n => n.id === personId);
      if (personExists) {
        setSelectedPerson(personId);
      }
      hasInitialized.current = true;
    }
  }, [personId, nodes, setSelectedPerson]);

  // Update URL without navigation (shallow update) to preserve state
  useEffect(() => {
    if (hasInitialized.current) {
      const newUrl = selectedPersonId ? `/person/${selectedPersonId}` : '/';
      window.history.replaceState(null, '', newUrl);
    }
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
