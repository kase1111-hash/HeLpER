/**
 * Format a Date object to ISO date string (YYYY-MM-DD)
 */
export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Format a date for display (e.g., "December 26, 2025")
 */
export function formatDateDisplay(dateString: string, locale = 'en-US'): string {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format a date for short display (e.g., "Dec 26")
 */
export function formatDateShort(dateString: string, locale = 'en-US'): string {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get current ISO timestamp
 */
export function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Check if a date string is today
 */
export function isToday(dateString: string): boolean {
  return dateString === formatDateISO(new Date());
}

/**
 * Get relative day description (Today, Yesterday, Tomorrow, or date)
 */
export function getRelativeDay(dateString: string, locale = 'en-US'): string {
  const today = formatDateISO(new Date());
  const yesterday = formatDateISO(new Date(Date.now() - 86400000));
  const tomorrow = formatDateISO(new Date(Date.now() + 86400000));

  if (dateString === today) return 'Today';
  if (dateString === yesterday) return 'Yesterday';
  if (dateString === tomorrow) return 'Tomorrow';

  return formatDateDisplay(dateString, locale);
}

/**
 * Parse a date string and return a Date object
 */
export function parseDate(dateString: string): Date {
  return new Date(dateString + 'T00:00:00');
}

/**
 * Add days to a date string
 */
export function addDays(dateString: string, days: number): string {
  const date = parseDate(dateString);
  date.setDate(date.getDate() + days);
  return formatDateISO(date);
}
