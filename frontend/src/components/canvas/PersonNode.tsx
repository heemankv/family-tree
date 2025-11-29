'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Star } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { LateBadge } from '@/components/ui/Badge';
import { cn, getYearsDisplay, truncate } from '@/lib/utils';
import { Person } from '@/types';

const ME_PERSON_ID = 'me-001';

interface PersonNodeProps {
  data: {
    person: Person;
    isSelected: boolean;
  };
}

function PersonNodeComponent({ data }: PersonNodeProps) {
  const { person, isSelected } = data;
  const isMe = person.id === ME_PERSON_ID;

  return (
    <div
      className={cn(
        'bg-surface rounded-2xl shadow-lg border-2 p-3 relative',
        'w-[140px] cursor-pointer',
        'transition-all duration-200 ease-out',
        'hover:shadow-xl hover:-translate-y-1',
        isMe && 'border-amber-400 bg-amber-50/50 dark:bg-amber-900/20',
        isSelected
          ? 'border-primary ring-2 ring-primary/30 ring-offset-2 shadow-primary/20 shadow-xl scale-105'
          : !isMe && 'border-border hover:border-muted'
      )}
    >
      {/* "You" marker for me */}
      {isMe && (
        <div className="absolute -top-2 -right-2 bg-amber-400 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
          <Star className="w-2.5 h-2.5 fill-current" />
          You
        </div>
      )}
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

      {/* Content */}
      <div className="flex flex-col items-center text-center gap-2">
        {/* Avatar */}
        <Avatar person={person} size="md" />

        {/* Name and Badge */}
        <div className="flex flex-col items-center gap-1">
          <span className="font-medium text-sm text-foreground leading-tight">
            {truncate(person.name, 18)}
          </span>

          {!person.is_alive && <LateBadge />}
        </div>

        {/* Years */}
        <span className="text-xs text-muted">
          {getYearsDisplay(person)}
        </span>
      </div>
    </div>
  );
}

export const PersonNode = memo(PersonNodeComponent);
