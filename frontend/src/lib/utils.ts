import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Person } from '@/types';

// Merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Check if a date string is valid
function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

// Calculate age from birth date
export function calculateAge(birthDate: string, deathDate?: string | null): number {
  const birth = new Date(birthDate);
  const end = deathDate ? new Date(deathDate) : new Date();

  if (!isValidDate(birth) || (deathDate && !isValidDate(end))) {
    return 0;
  }

  let age = end.getFullYear() - birth.getFullYear();
  const monthDiff = end.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

// Format date for display
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  if (!isValidDate(date)) {
    return 'Unknown';
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Get year from date string
export function getYear(dateString: string): string {
  const date = new Date(dateString);
  if (!isValidDate(date)) {
    return '?';
  }
  return date.getFullYear().toString();
}

// Get years display (birth - death or birth - present)
export function getYearsDisplay(person: Person): string {
  const birthYear = getYear(person.birth_date);
  if (person.death_date) {
    return `${birthYear} - ${getYear(person.death_date)}`;
  }
  return `${birthYear} - present`;
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Get default avatar color based on gender
export function getAvatarColor(gender: string): string {
  switch (gender) {
    case 'Male':
      return 'bg-blue-100 text-blue-600';
    case 'Female':
      return 'bg-pink-100 text-pink-600';
    default:
      return 'bg-purple-100 text-purple-600';
  }
}

// Truncate text with ellipsis
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}
