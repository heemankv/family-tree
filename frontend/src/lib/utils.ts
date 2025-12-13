import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Person } from '@/types';

/**
 * Merge Tailwind classes with conflict resolution
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Check if a Date object is valid
 */
function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Parse a date string safely
 * Supports formats: DD-MM-YYYY, YYYY-MM-DD, ISO dates
 */
function parseDate(dateString: string): Date | null {
  if (!dateString || dateString.trim() === '') {
    return null;
  }

  // Try DD-MM-YYYY format first (most common in CSV)
  const ddmmyyyyMatch = dateString.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (ddmmyyyyMatch) {
    const [, day, month, year] = ddmmyyyyMatch;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return isValidDate(date) ? date : null;
  }

  // Try YYYY-MM-DD format
  const yyyymmddMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (yyyymmddMatch) {
    const [, year, month, day] = yyyymmddMatch;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return isValidDate(date) ? date : null;
  }

  // Fallback to native Date parsing (ISO dates, etc.)
  const date = new Date(dateString);
  return isValidDate(date) ? date : null;
}

/**
 * Calculate age from birth date to death date or current date
 */
export function calculateAge(birthDate: string, deathDate?: string | null): number {
  const birth = parseDate(birthDate);
  const end = deathDate ? parseDate(deathDate) : new Date();

  if (!birth || !end) {
    return 0;
  }

  let age = end.getFullYear() - birth.getFullYear();
  const monthDiff = end.getMonth() - birth.getMonth();
  const dayDiff = end.getDate() - birth.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age;
}

/**
 * Format date string for display (e.g., "January 15, 1990")
 */
export function formatDate(dateString: string): string {
  const date = parseDate(dateString);

  if (!date) {
    return 'Unknown';
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Extract year from date string
 */
export function getYear(dateString: string): string {
  const date = parseDate(dateString);
  return date ? date.getFullYear().toString() : '?';
}

/**
 * Get years display for a person (e.g., "1990 - present" or "1920 - 2000")
 */
export function getYearsDisplay(person: Person): string {
  const birthYear = getYear(person.birth_date);
  const deathYear = person.death_date ? getYear(person.death_date) : 'present';
  return `${birthYear} - ${deathYear}`;
}

/**
 * Truncate text with ellipsis if it exceeds max length
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 3)}...`;
}
