import { isSameDay, getWeekStart } from '@/adapters/ui/utils/date-utils';

/**
 * SerializedLesson type - lessons after tRPC serialization
 */
export type SerializedLesson = {
  id: string;
  title: string;
  description?: string;
  teacherIds: string[];
  pupilIds: string[];
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * LessonViewService - Pure functions for lesson view operations
 *
 * **Architectural Role:** Service layer (adapter)
 * - Contains pure business/presentation logic
 * - No React dependencies - testable without React
 * - Reusable across components
 *
 * **Applies:**
 * - Pure Fabrication (GRASP): Service class for cohesive operations
 * - Single Responsibility: Only lesson view transformations
 * - DRY: Shared logic extracted from components
 */

/**
 * Filter lessons for a specific day
 */
export function getLessonsForDay(lessons: SerializedLesson[], day: Date): SerializedLesson[] {
  return lessons
    .filter((lesson) => isSameDay(new Date(lesson.startDate), day))
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
}

/**
 * Sort lessons by start time
 */
export function sortLessonsByTime(lessons: SerializedLesson[]): SerializedLesson[] {
  return [...lessons].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
}

/**
 * Calculate duration string from start/end dates
 */
export function calculateDuration(start: Date, end: Date): string {
  const durationMs = end.getTime() - start.getTime();
  const minutes = Math.floor(durationMs / 1000 / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) return `${minutes} min`;
  if (remainingMinutes === 0) return `${hours} hr`;
  return `${hours} hr ${remainingMinutes} min`;
}

/**
 * Group month days into weeks (for mobile layout)
 */
export function groupDaysByWeek(monthDays: Date[]): Date[][] {
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  let lastWeekStart: Date | null = null;

  monthDays.forEach((day) => {
    const weekStart = getWeekStart(day);
    const weekKey = weekStart.toISOString();

    if (lastWeekStart?.toISOString() !== weekKey) {
      if (currentWeek.length > 0) {
        weeks.push(currentWeek);
      }
      currentWeek = [];
      lastWeekStart = weekStart;
    }
    currentWeek.push(day);
  });

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return weeks;
}

/**
 * Build lesson detail URL with occurrence date
 * Returns Route type for Next.js Link compatibility
 */
export function buildLessonDetailUrl(lessonId: string, occurrenceDate: string) {
  const date = new Date(occurrenceDate).toISOString().split('T')[0];
  return `/lessons/${lessonId}?date=${date}` as const;
}

/**
 * Parse occurrence date from query param
 */
export function parseOccurrenceDate(dateParam: string | null): Date | null {
  if (!dateParam) return null;
  const date = new Date(dateParam);
  return isNaN(date.getTime()) ? null : date;
}
