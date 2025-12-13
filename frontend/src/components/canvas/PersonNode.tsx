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
  'w-[160px] cursor-pointer',
  'transition-all duration-200 ease-out',
  'hover:shadow-xl hover:-translate-y-1',
] as const;

const CARD_SELECTED_STYLES = 'border-green-600 dark:border-green-500 shadow-xl -translate-y-1';
const CARD_ME_STYLES = 'border-amber-400 dark:border-amber-500';
const CARD_DEFAULT_STYLES = 'border-border hover:border-muted';

const ME_BADGE_STYLES = [
  'absolute -top-2 -right-2',
  'bg-amber-400 text-amber-900',
  'text-[10px] font-bold px-1.5 py-0.5',
  'rounded-full flex items-center gap-0.5 shadow-sm',
].join(' ');

const HANDLE_STYLES = '!opacity-0 !w-3 !h-3 !min-w-0 !min-h-0';

const NAME_MAX_LENGTH = 18;

// Types
interface PersonNodeData {
  person: Person;
  isSelected: boolean;
}

interface PersonNodeProps {
  data: PersonNodeData;
}

// Helper to get card border styles based on state
function getCardBorderStyles(isSelected: boolean, isMe: boolean): string {
  if (isSelected) return CARD_SELECTED_STYLES;
  if (isMe) return CARD_ME_STYLES;
  return CARD_DEFAULT_STYLES;
}

function PersonNodeComponent({ data }: PersonNodeProps) {
  const { person, isSelected } = data;
  const isMe = person.id === ME_PERSON_ID;
  const cardBorderStyles = getCardBorderStyles(isSelected, isMe);

  return (
    <div className={cn(CARD_BASE_STYLES, cardBorderStyles)}>
      {isMe && (
        <div className={ME_BADGE_STYLES}>
          <Star className="w-2.5 h-2.5 fill-current" />
          Me
        </div>
      )}

      <Handle type="target" position={Position.Top} id="top" className={HANDLE_STYLES} />
      <Handle type="source" position={Position.Bottom} id="bottom" className={HANDLE_STYLES} />

      <div className="flex flex-col items-center text-center gap-2">
        <Avatar person={person} size="md" />

        <div className="flex flex-col items-center gap-1">
          <span className="font-medium text-sm text-foreground leading-tight">
            {truncate(person.name, NAME_MAX_LENGTH)}
          </span>
          {!person.is_alive && <LateBadge />}
        </div>

        <span className="text-xs text-muted">
          {getYearsDisplay(person)}
        </span>
      </div>
    </div>
  );
}

// Custom comparison for memo
function arePropsEqual(prevProps: PersonNodeProps, nextProps: PersonNodeProps): boolean {
  return (
    prevProps.data.isSelected === nextProps.data.isSelected &&
    prevProps.data.person.id === nextProps.data.person.id
  );
}

export const PersonNode = memo(PersonNodeComponent, arePropsEqual);
