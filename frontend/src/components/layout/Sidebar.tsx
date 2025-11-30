'use client';

import { useAppStore, useSelectedPerson } from '@/store/useAppStore';
import { PersonDetail } from '@/components/person/PersonDetail';
import { CoupleDetail } from '@/components/person/CoupleDetail';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen, setSelectedPerson, selectedCouple, setSelectedCouple } = useAppStore();
  const selectedPerson = useSelectedPerson();

  const handlePersonClick = (personId: string) => {
    setSelectedPerson(personId);
  };

  const handleClose = () => {
    setSidebarOpen(false);
    setSelectedPerson(null);
    setSelectedCouple(null);
  };

  const renderContent = () => {
    if (selectedPerson) {
      return (
        <PersonDetail
          person={selectedPerson}
          onClose={handleClose}
          onPersonClick={handlePersonClick}
        />
      );
    }

    if (selectedCouple) {
      return (
        <CoupleDetail
          couple={selectedCouple}
          onClose={handleClose}
          onPersonClick={handlePersonClick}
        />
      );
    }

    return (
      <div className="flex items-center justify-center h-full text-muted">
        <p>Select a person or couple to view details</p>
      </div>
    );
  };

  return (
    <aside
      className={cn(
        'fixed top-14 right-0 h-[calc(100vh-56px)] w-96 bg-surface shadow-2xl z-40',
        'transform transition-transform duration-300 ease-in-out',
        'border-l border-border',
        sidebarOpen ? 'translate-x-0' : 'translate-x-full'
      )}
    >
      {renderContent()}
    </aside>
  );
}
