'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Star } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { LateBadge } from '@/components/ui/Badge';
import { cn, getYearsDisplay, truncate } from '@/lib/utils';
import { ME_PERSON_ID } from '@/lib/constants';
import { Person } from '@/types';

// Style constants
const CARD_BASE_STYLES = [
  'bg-surface rounded-2xl shadow-lg border-2 p-4 relative',
  'flex gap-4 cursor-pointer',
  'transition-all duration-200 ease-out',
  'hover:shadow-xl hover:-translate-y-1',
] as const;

const CARD_SELECTED_STYLES = 'border-green-600 dark:border-green-500 shadow-xl -translate-y-1';
const CARD_ME_STYLES = 'border-amber-400 dark:border-amber-500';
const CARD_DEFAULT_STYLES = 'border-border hover:border-muted';

const PERSON_BASE_STYLES = [
  'flex flex-col items-center text-center gap-2 p-2 rounded-xl cursor-pointer min-w-[110px] relative',
  'transition-all duration-150',
  'hover:bg-muted/50',
] as const;

const PERSON_SELECTED_STYLES = 'bg-muted/70';

const ME_BADGE_STYLES = 'absolute -top-1.5 -right-1.5 bg-amber-400 text-amber-900 p-1 rounded-full shadow-sm z-10';
const HANDLE_STYLES = '!opacity-0 !w-3 !h-3 !min-w-0 !min-h-0';
const DIVIDER_STYLES = 'w-px bg-border self-stretch my-2';

const NAME_MAX_LENGTH = 14;

// Types
interface CoupleNodeData {
  person1: Person;
  person2: Person;
  isSelected: boolean;
  selectedPersonId: string | null;
}

interface CoupleNodeProps {
  data: CoupleNodeData;
}

interface PersonState {
  person: Person;
  isSelected: boolean;
  isMe: boolean;
}

// Helper functions
function getCardBorderStyles(isSelected: boolean, hasMe: boolean): string {
  if (isSelected) return CARD_SELECTED_STYLES;
  if (hasMe) return CARD_ME_STYLES;
  return CARD_DEFAULT_STYLES;
}

function getPersonStyles(isSelected: boolean): string {
  return cn(PERSON_BASE_STYLES, isSelected && PERSON_SELECTED_STYLES);
}

// Sub-component for individual person in couple
function PersonCard({ person, isSelected, isMe }: PersonState) {
  return (
    <div
      className={getPersonStyles(isSelected)}
      data-person-id={person.id}
    >
      {isMe && (
        <div className={ME_BADGE_STYLES}>
          <Star className="w-2.5 h-2.5 fill-current" />
        </div>
      )}
      <Avatar person={person} size="md" />
      <span className="font-medium text-sm text-foreground leading-tight">
        {truncate(person.name, NAME_MAX_LENGTH)}
      </span>
      {!person.is_alive && <LateBadge />}
      <span className="text-xs text-muted">
        {getYearsDisplay(person)}
      </span>
    </div>
  );
}

function CoupleNodeComponent({ data }: CoupleNodeProps) {
  const { person1, person2, isSelected, selectedPersonId } = data;

  const person1State: PersonState = {
    person: person1,
    isSelected: selectedPersonId === person1.id,
    isMe: person1.id === ME_PERSON_ID,
  };

  const person2State: PersonState = {
    person: person2,
    isSelected: selectedPersonId === person2.id,
    isMe: person2.id === ME_PERSON_ID,
  };

  const hasMe = person1State.isMe || person2State.isMe;
  const cardBorderStyles = getCardBorderStyles(isSelected, hasMe);

  return (
    <div className={cn(CARD_BASE_STYLES, cardBorderStyles)}>
      <Handle type="source" position={Position.Top} id="top" className={HANDLE_STYLES} />
      <Handle type="target" position={Position.Bottom} id="bottom" className={HANDLE_STYLES} />

      <PersonCard {...person1State} />
      <div className={DIVIDER_STYLES} />
      <PersonCard {...person2State} />
    </div>
  );
}

// Custom comparison for memo
function arePropsEqual(prevProps: CoupleNodeProps, nextProps: CoupleNodeProps): boolean {
  return (
    prevProps.data.isSelected === nextProps.data.isSelected &&
    prevProps.data.selectedPersonId === nextProps.data.selectedPersonId &&
    prevProps.data.person1.id === nextProps.data.person1.id &&
    prevProps.data.person2.id === nextProps.data.person2.id
  );
}

export const CoupleNode = memo(CoupleNodeComponent, arePropsEqual);
