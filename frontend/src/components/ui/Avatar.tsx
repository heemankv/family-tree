'use client';

import { memo } from 'react';
import { User } from 'lucide-react';
import { cn, getAvatarColor } from '@/lib/utils';
import { Person } from '@/types';

interface AvatarProps {
  person: Person;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

const iconSizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

export const Avatar = memo(function Avatar({ person, size = 'md', className }: AvatarProps) {
  const colorClass = getAvatarColor(person.gender);

  if (person.photo_url) {
    return (
      <img
        src={person.photo_url}
        alt={person.name}
        className={cn(
          'rounded-full object-cover',
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center',
        sizeClasses[size],
        colorClass,
        className
      )}
    >
      <User className={cn(iconSizeClasses[size], 'opacity-70')} />
    </div>
  );
});
