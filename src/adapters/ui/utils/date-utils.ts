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
