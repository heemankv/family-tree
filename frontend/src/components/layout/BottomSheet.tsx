'use client';

import { useRef, useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, X, Heart } from 'lucide-react';
import { useAppStore, useSelectedPerson } from '@/store/useAppStore';
import { PersonDetail } from '@/components/person/PersonDetail';
import { CoupleDetail } from '@/components/person/CoupleDetail';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';

type SheetState = 'collapsed' | 'half' | 'full';

export function BottomSheet() {
  const { sidebarOpen, setSidebarOpen, setSelectedPerson, selectedCouple, setSelectedCouple } = useAppStore();
  const selectedPerson = useSelectedPerson();
  const [sheetState, setSheetState] = useState<SheetState>('collapsed');
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number>(0);
  const dragStartState = useRef<SheetState>('collapsed');

  // Reset to collapsed when person or couple changes
  useEffect(() => {
    if (selectedPerson || selectedCouple) {
      setSheetState('half');
    } else {
      setSheetState('collapsed');
    }
  }, [selectedPerson?.id, selectedCouple]);

  const handlePersonClick = (personId: string) => {
    setSelectedPerson(personId);
  };

  const handleClose = () => {
    setSheetState('collapsed');
    setTimeout(() => {
      setSidebarOpen(false);
      setSelectedPerson(null);
      setSelectedCouple(null);
    }, 300);
  };

  const getSheetHeight = (state: SheetState): string => {
    switch (state) {
      case 'collapsed':
        return '0px';
      case 'half':
        return '50vh';
      case 'full':
        return 'calc(100vh - 56px)';
    }
  };

  const toggleState = () => {
    if (sheetState === 'collapsed') {
      setSheetState('half');
    } else if (sheetState === 'half') {
      setSheetState('full');
    } else {
      setSheetState('half');
    }
  };

  // Touch handlers for drag
  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    dragStartState.current = sheetState;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaY = dragStartY.current - e.changedTouches[0].clientY;
    const threshold = 50;

    if (deltaY > threshold) {
      // Dragged up
      if (sheetState === 'collapsed') setSheetState('half');
      else if (sheetState === 'half') setSheetState('full');
    } else if (deltaY < -threshold) {
      // Dragged down
      if (sheetState === 'full') setSheetState('half');
      else if (sheetState === 'half') setSheetState('collapsed');
    }
  };

  if (!sidebarOpen || (!selectedPerson && !selectedCouple)) {
    return null;
  }

  // Get display name for collapsed view
  const displayName = selectedPerson
    ? selectedPerson.name
    : selectedCouple
      ? `${selectedCouple.person1.name.split(' ')[0]} & ${selectedCouple.person2.name.split(' ')[0]}`
      : '';

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/20 z-40 transition-opacity duration-300',
          sheetState !== 'collapsed' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setSheetState('collapsed')}
      />

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-label={`Details for ${displayName}`}
        aria-modal="true"
        className={cn(
          'fixed bottom-0 left-0 right-0 bg-surface z-50',
          'rounded-t-3xl shadow-2xl',
          'transition-all duration-300 ease-out'
        )}
        style={{ height: getSheetHeight(sheetState) }}
      >
        {/* Handle / Header */}
        <div
          className="sticky top-0 bg-surface rounded-t-3xl z-10"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Drag Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-border rounded-full" />
          </div>

          {/* Collapsed Preview */}
          {sheetState !== 'full' && (
            <button
              onClick={toggleState}
              className="w-full px-4 pb-3 flex items-center gap-3"
              aria-label={sheetState === 'collapsed' ? 'Expand panel' : 'Toggle panel size'}
            >
              {selectedPerson ? (
                <Avatar person={selectedPerson} size="sm" />
              ) : selectedCouple ? (
                <div className="flex items-center gap-1">
                  <Avatar person={selectedCouple.person1} size="sm" />
                  <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                  <Avatar person={selectedCouple.person2} size="sm" />
                </div>
              ) : null}
              <span className="flex-1 text-left font-medium text-foreground">
                {displayName}
              </span>
              {sheetState === 'collapsed' ? (
                <ChevronUp className="w-5 h-5 text-muted" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted" />
              )}
            </button>
          )}

          {/* Full Header with Close */}
          {sheetState === 'full' && (
            <div className="px-4 pb-2 flex items-center justify-between">
              <button
                onClick={() => setSheetState('half')}
                aria-label="Minimize panel"
              >
                <ChevronDown className="w-5 h-5 text-muted" />
              </button>
              <span className="font-medium text-foreground">
                {displayName}
              </span>
              <button
                onClick={handleClose}
                aria-label="Close panel"
              >
                <X className="w-5 h-5 text-muted" />
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        {sheetState !== 'collapsed' && (
          <div className="overflow-y-auto h-full pb-safe">
            {selectedPerson ? (
              <PersonDetail
                person={selectedPerson}
                onPersonClick={handlePersonClick}
              />
            ) : selectedCouple ? (
              <CoupleDetail
                couple={selectedCouple}
                onPersonClick={handlePersonClick}
              />
            ) : null}
          </div>
        )}
      </div>
    </>
  );
}
