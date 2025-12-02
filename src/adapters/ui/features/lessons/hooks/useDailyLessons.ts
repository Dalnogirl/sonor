import { useState, useMemo, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { startOfDay, endOfDay, isSameDay } from '@/adapters/ui/utils/date-utils';
import { sortLessonsByTime, type SerializedLesson } from '../services/lessonViewService';

/**
 * useDailyLessons - Daily lesson view state management
 *
 * **Applies:**
 * - Single Responsibility: Only manages daily view state
 * - Controller (GRASP): Coordinates day state and data fetching
 * - Information Expert: Knows how to navigate days
 */

interface UseDailyLessonsOptions {
  initialDate?: Date | null;
  onDateChange?: (date: Date) => void;
}

export const useDailyLessons = (options: UseDailyLessonsOptions = {}) => {
  const { initialDate, onDateChange } = options;

  const [currentDay, setCurrentDay] = useState(() => startOfDay(initialDate || new Date()));

  useEffect(() => {
    if (initialDate) {
      setCurrentDay(startOfDay(initialDate));
    }
  }, [initialDate]);

  const dayEnd = useMemo(() => endOfDay(currentDay), [currentDay]);

  const { data: lessons, isLoading, error } = trpc.lesson.getMyTeachingLessonsForPeriod.useQuery({
    startDate: currentDay,
    endDate: dayEnd,
  });

  const sortedLessons = useMemo(
    () => sortLessonsByTime((lessons || []) as SerializedLesson[]),
    [lessons]
  );

  const isToday = useMemo(() => isSameDay(currentDay, new Date()), [currentDay]);

  const goToPreviousDay = () => {
    const prev = new Date(currentDay);
    prev.setDate(prev.getDate() - 1);
    const normalized = startOfDay(prev);
    setCurrentDay(normalized);
    onDateChange?.(normalized);
  };

  const goToNextDay = () => {
    const next = new Date(currentDay);
    next.setDate(next.getDate() + 1);
    const normalized = startOfDay(next);
    setCurrentDay(normalized);
    onDateChange?.(normalized);
  };

  const goToToday = () => {
    const today = startOfDay(new Date());
    setCurrentDay(today);
    onDateChange?.(today);
  };

  return {
    currentDay,
    dayEnd,
    isToday,
    lessons: sortedLessons,
    isLoading,
    error,
    goToPreviousDay,
    goToNextDay,
    goToToday,
  };
};

export type UseDailyLessonsReturn = ReturnType<typeof useDailyLessons>;
