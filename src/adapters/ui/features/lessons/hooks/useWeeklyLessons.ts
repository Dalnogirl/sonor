import { useState, useMemo, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { getWeekStart, getWeekEnd, generateWeekDays } from '@/adapters/ui/utils/date-utils';
import { getLessonsForDay, type SerializedLesson } from '../services/lessonViewService';

/**
 * useWeeklyLessons - Weekly lesson view state management
 *
 * **Applies:**
 * - Single Responsibility: Only manages weekly view state
 * - Controller (GRASP): Coordinates week state and data fetching
 * - Information Expert: Knows how to navigate weeks
 */

interface UseWeeklyLessonsOptions {
  initialDate?: Date | null;
  onDateChange?: (date: Date) => void;
}

export const useWeeklyLessons = (options: UseWeeklyLessonsOptions = {}) => {
  const { initialDate, onDateChange } = options;

  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    getWeekStart(initialDate || new Date())
  );

  useEffect(() => {
    if (initialDate) {
      setCurrentWeekStart(getWeekStart(initialDate));
    }
  }, [initialDate]);

  const weekEnd = useMemo(() => getWeekEnd(currentWeekStart), [currentWeekStart]);
  const weekDays = useMemo(() => generateWeekDays(currentWeekStart), [currentWeekStart]);

  const { data: lessons, isLoading, error } = trpc.lesson.getMyTeachingLessonsForPeriod.useQuery({
    startDate: currentWeekStart,
    endDate: weekEnd,
  });

  const getLessonsForDayMemo = useMemo(() => {
    const lessonsArray = (lessons || []) as SerializedLesson[];
    return (day: Date) => getLessonsForDay(lessonsArray, day);
  }, [lessons]);

  const goToPreviousWeek = () => {
    const prev = new Date(currentWeekStart);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekStart(prev);
    onDateChange?.(prev);
  };

  const goToNextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + 7);
    setCurrentWeekStart(next);
    onDateChange?.(next);
  };

  const goToToday = () => {
    const today = getWeekStart(new Date());
    setCurrentWeekStart(today);
    onDateChange?.(today);
  };

  return {
    currentWeekStart,
    weekEnd,
    weekDays,
    lessons: (lessons || []) as SerializedLesson[],
    getLessonsForDay: getLessonsForDayMemo,
    isLoading,
    error,
    goToPreviousWeek,
    goToNextWeek,
    goToToday,
  };
};

export type UseWeeklyLessonsReturn = ReturnType<typeof useWeeklyLessons>;
