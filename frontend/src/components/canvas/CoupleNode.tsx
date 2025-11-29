'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Star } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { LateBadge } from '@/components/ui/Badge';
import { cn, getYearsDisplay, truncate } from '@/lib/utils';
import { Person } from '@/types';

const ME_PERSON_ID = 'me-001';

interface CoupleNodeProps {
  data: {
    person1: Person;
    person2: Person;
    isSelected: boolean;
    selectedPersonId: string | null;
  };
}

function CoupleNodeComponent({ data }: CoupleNodeProps) {
  const { person1, person2, isSelected, selectedPersonId } = data;
  const person1Selected = selectedPersonId === person1.id;
  const person2Selected = selectedPersonId === person2.id;
  const person1IsMe = person1.id === ME_PERSON_ID;
  const person2IsMe = person2.id === ME_PERSON_ID;

  return (
    <div
      className={cn(
        'bg-surface rounded-2xl shadow-lg border-2 p-3 relative',
        'flex gap-3 cursor-pointer',
        'transition-all duration-200 ease-out',
        'hover:shadow-xl hover:-translate-y-1',
        isSelected
          ? 'border-primary ring-2 ring-primary/30 ring-offset-2 shadow-primary/20 shadow-xl'
          : 'border-border hover:border-muted'
      )}
    >
      {/* Hidden handles for edges */}
      <Handle
        type="target"
        position={Position.Top}
        className="!opacity-0 !w-0 !h-0"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!opacity-0 !w-0 !h-0"
      />

      {/* Person 1 */}
      <div
        className={cn(
          'flex flex-col items-center text-center gap-1 p-2 rounded-xl cursor-pointer min-w-[100px] relative',
          'transition-all duration-150',
          'hover:bg-muted/50',
          person1IsMe && 'bg-amber-50 dark:bg-amber-900/30 ring-2 ring-amber-400 ring-inset',
          person1Selected && 'bg-muted/70'
        )}
        data-person-id={person1.id}
      >
        {/* Star marker for "me" person */}
        {person1IsMe && (
          <div className="absolute -top-1.5 -right-1.5 bg-amber-400 text-amber-900 p-1 rounded-full shadow-sm z-10">
            <Star className="w-2.5 h-2.5 fill-current" />
          </div>
        )}
        <Avatar person={person1} size="sm" />
        <span className="font-medium text-sm text-foreground leading-tight">
          {truncate(person1.name, 14)}
        </span>
        {!person1.is_alive && <LateBadge />}
        <span className="text-xs text-muted">
          {getYearsDisplay(person1)}
        </span>
      </div>

      {/* Divider */}
      <div className="w-px bg-border self-stretch my-2" />

      {/* Person 2 */}
      <div
        className={cn(
          'flex flex-col items-center text-center gap-1 p-2 rounded-xl cursor-pointer min-w-[100px] relative',
          'transition-all duration-150',
          'hover:bg-muted/50',
          person2IsMe && 'bg-amber-50 dark:bg-amber-900/30 ring-2 ring-amber-400 ring-inset',
          person2Selected && 'bg-muted/70'
        )}
        data-person-id={person2.id}
      >
        {/* Star marker for "me" person */}
        {person2IsMe && (
          <div className="absolute -top-1.5 -right-1.5 bg-amber-400 text-amber-900 p-1 rounded-full shadow-sm z-10">
            <Star className="w-2.5 h-2.5 fill-current" />
          </div>
        )}
        <Avatar person={person2} size="sm" />
        <span className="font-medium text-sm text-foreground leading-tight">
          {truncate(person2.name, 14)}
        </span>
        {!person2.is_alive && <LateBadge />}
        <span className="text-xs text-muted">
          {getYearsDisplay(person2)}
        </span>
      </div>
    </div>
  );
}

export const CoupleNode = memo(CoupleNodeComponent);
