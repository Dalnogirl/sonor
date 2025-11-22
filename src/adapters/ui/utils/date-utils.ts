/**
 * Date utility functions for UI components
 *
 * **Important:** All functions normalize time to midnight (00:00:00.000)
 * This ensures database queries with >= and <= work correctly:
 * - startDate >= weekStart includes lessons starting at any time on first day
 * - endDate <= weekEnd includes lessons ending at any time on last day
 *
 * **Applies:**
 * - Single Responsibility (SOLID): Only handles date calculations
 * - Information Expert (GRASP): Knows date manipulation logic
 * - Pure functions: No side effects, testable
 */

/**
 * Gets the start of the week (Monday at 00:00:00.000)
 *
 * @param date - Reference date
 * @returns Monday of the week containing the date, at midnight
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0); // Reset to midnight
  return d;
}

/**
 * Gets the end of the week (Monday of next week at 00:00:00.000)
 *
 * **Pattern:** End = start of next period (not 23:59:59 of last day)
 * This is cleaner and avoids millisecond precision issues
 *
 * @param weekStart - Start of the week (Monday at midnight)
 * @returns Monday of next week at midnight
 */
export function getWeekEnd(weekStart: Date): Date {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 7);
  end.setHours(0, 0, 0, 0); // Ensure midnight (defensive)
  return end;
}

/**
 * Generates array of dates for each day in the week
 *
 * @param weekStart - Start of the week (Monday at midnight)
 * @returns Array of 7 dates (Monday - Sunday), each at midnight
 */
export function generateWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    return day;
  });
}

/**
 * Gets the start of the month (1st day at 00:00:00.000)
 *
 * @param date - Reference date
 * @returns First day of the month containing the date, at midnight
 */
export function getMonthStart(date: Date): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Gets the end of the month (1st day of next month at 00:00:00.000)
 *
 * **Pattern:** End = start of next period (consistent with getWeekEnd)
 *
 * @param monthStart - Start of the month (1st day at midnight)
 * @returns First day of next month at midnight
 */
export function getMonthEnd(monthStart: Date): Date {
  const end = new Date(monthStart);
  end.setMonth(end.getMonth() + 1);
  end.setHours(0, 0, 0, 0);
  return end;
}

/**
 * Generates array of dates for each day in the month
 *
 * @param monthStart - Start of the month (1st day at midnight)
 * @returns Array of dates for all days in month, each at midnight
 */
export function generateMonthDays(monthStart: Date): Date[] {
  const daysInMonth = new Date(
    monthStart.getFullYear(),
    monthStart.getMonth() + 1,
    0
  ).getDate();

  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = new Date(monthStart);
    day.setDate(i + 1);
    return day;
  });
}

/**
 * Gets the day of week for a date (0 = Sunday, 6 = Saturday)
 * Adjusted so Monday = 0, Sunday = 6 (ISO week standard)
 *
 * @param date - Date to check
 * @returns Day of week (0-6, Monday = 0)
 */
export function getISODayOfWeek(date: Date): number {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1; // Convert Sunday from 0 to 6
}

/**
 * Checks if two dates are on the same calendar day
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns true if dates are on same day (ignoring time)
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Normalizes date to start of day (midnight)
 *
 * @param date - Date to normalize
 * @returns New date at 00:00:00.000
 */
export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Normalizes date to end of day (23:59:59.999)
 *
 * @param date - Date to normalize
 * @returns New date at 23:59:59.999
 */
export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

// ==================== Formatting Functions ====================
// Pure presentation logic for displaying dates in UI components
// Separated from components following Single Responsibility principle

/**
 * Formats date as abbreviated weekday (e.g., "MON", "TUE")
 *
 * @param date - Date to format
 * @returns Uppercase abbreviated weekday name
 */
export function formatDayName(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
}

/**
 * Formats week range for display (e.g., "Jan 1 - Jan 7, 2024")
 *
 * @param start - Week start date
 * @param end - Week end date
 * @returns Formatted date range string
 */
export function formatWeekRange(start: Date, end: Date): string {
  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endStr = end.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  return `${startStr} - ${endStr}`;
}

/**
 * Formats time range for display (e.g., "10:00 AM - 11:00 AM")
 *
 * @param start - Start time
 * @param end - End time
 * @returns Formatted time range string
 */
export function formatTimeRange(start: Date, end: Date): string {
  const startTime = start.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
  const endTime = end.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
  return `${startTime} - ${endTime}`;
}

/**
 * Formats full date with weekday (e.g., "Monday, January 1, 2024")
 *
 * @param date - Date to format
 * @returns Full date string with weekday
 */
export function formatFullDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formats date and time (e.g., "Jan 1, 2024, 10:00 AM")
 *
 * @param date - Date to format
 * @returns Formatted date and time string
 */
export function formatDateTime(date: Date): string {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formats month and year (e.g., "January 2024")
 *
 * @param date - Date to format
 * @returns Formatted month and year string
 */
export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}
