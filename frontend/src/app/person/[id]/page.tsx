'use client';

import { useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  const router = useRouter();
  const personId = params.id as string;
  const isMobile = useIsMobile();
  const { selectedPersonId, setSelectedPerson, nodes } = useAppStore();
  const hasInitialized = useRef(false);

  // Load tree data - only once, always centered on "me-001"
  // Don't pass personId here to avoid re-fetching on every person change
  useTreeData();

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  // Set the person as selected when page loads (only for initial URL load)
  useEffect(() => {
    if (personId && nodes.length > 0 && !hasInitialized.current) {
      // Only set selection if this person exists in our data
      const personExists = nodes.some(n => n.id === personId);
      if (personExists) {
        setSelectedPerson(personId);
      }
      hasInitialized.current = true;
    }
  }, [personId, nodes, setSelectedPerson]);

  // Navigate to home when person is deselected
  useEffect(() => {
    if (selectedPersonId === null && hasInitialized.current) {
      router.push('/', { scroll: false });
    } else if (selectedPersonId && selectedPersonId !== personId && hasInitialized.current) {
      // Navigate to new person's page when selection changes
      router.replace(`/person/${selectedPersonId}`, { scroll: false });
    }
  }, [selectedPersonId, personId, router]);

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
