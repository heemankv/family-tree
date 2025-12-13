'use client';

import { memo, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Person, Gender } from '@/types';

// Size configuration
type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_CLASSES: Record<AvatarSize, string> = {
  xs: 'w-8 h-8',
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
  xl: 'w-40 h-40',
} as const;

// Image paths
const IMAGES_PATH = '/images/';
const DEFAULT_AVATARS: Record<Gender, string> = {
  Male: '/images/default-avatar-male.png',
  Female: '/images/default-avatar-female.png',
  Other: '/images/default-avatar-male.png',
} as const;

// Types
interface AvatarProps {
  person: Person;
  size?: AvatarSize;
  className?: string;
}

// Helper functions
function getDefaultAvatar(gender: Gender): string {
  return DEFAULT_AVATARS[gender] || DEFAULT_AVATARS.Male;
}

function resolveImageSrc(photoUrl: string | undefined, gender: Gender): string {
  if (!photoUrl) {
    return getDefaultAvatar(gender);
  }

  if (photoUrl.startsWith('/')) {
    return photoUrl;
  }

  return `${IMAGES_PATH}${photoUrl}`;
}

function AvatarComponent({ person, size = 'md', className }: AvatarProps) {
  const [hasError, setHasError] = useState(false);

  const imageSrc = hasError
    ? getDefaultAvatar(person.gender)
    : resolveImageSrc(person.photo_url, person.gender);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  const hasProcessedImage = person.photo_url?.includes('/images/processed/');

  return (
    <div className={cn('relative', SIZE_CLASSES[size], className)}>
      <img
        src={imageSrc}
        alt={person.name}
        onError={handleError}
        className={cn(
          'rounded-full object-cover w-full h-full',
          hasProcessedImage && 'bg-gradient-to-br from-blue-50 to-purple-50'
        )}
      />
    </div>
  );
}

export const Avatar = memo(AvatarComponent);
