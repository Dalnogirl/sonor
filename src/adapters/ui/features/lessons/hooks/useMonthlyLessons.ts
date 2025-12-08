import { useState, useMemo, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import {
  getMonthStart,
  getMonthEnd,
  generateMonthDays,
  getISODayOfWeek,
} from '@/adapters/ui/utils/date-utils';
import {
  getLessonsForDay,
  groupDaysByWeek,
  type SerializedLesson,
} from '../services/lessonViewService';

/**
 * useMonthlyLessons - Monthly lesson view state management
 *
 * **Applies:**
 * - Single Responsibility: Only manages monthly view state
 * - Controller (GRASP): Coordinates month state and data fetching
 * - Information Expert: Knows how to navigate months
 */

interface UseMonthlyLessonsOptions {
  initialDate?: Date | null;
  onDateChange?: (date: Date) => void;
}

export const useMonthlyLessons = (options: UseMonthlyLessonsOptions = {}) => {
  const { initialDate, onDateChange } = options;

  const [currentMonthStart, setCurrentMonthStart] = useState(() =>
    getMonthStart(initialDate || new Date())
  );

  useEffect(() => {
    if (initialDate) {
      setCurrentMonthStart(getMonthStart(initialDate));
    }
  }, [initialDate]);

  const monthEnd = useMemo(
    () => getMonthEnd(currentMonthStart),
    [currentMonthStart]
  );
  const monthDays = useMemo(
    () => generateMonthDays(currentMonthStart),
    [currentMonthStart]
  );

  // Calendar grid padding (for first week alignment)
  const paddingDays = useMemo(() => {
    const firstDayOfWeek = getISODayOfWeek(monthDays[0]);
    return Array.from({ length: firstDayOfWeek }, () => null);
  }, [monthDays]);

  // Week groups for mobile layout
  const weeks = useMemo(() => groupDaysByWeek(monthDays), [monthDays]);

  const [data, { data: lessons, isLoading, error }] =
    trpc.lesson.getMyTeachingLessonsForPeriod.useSuspenseQuery({
      startDate: currentMonthStart,
      endDate: monthEnd,
    });

  const getLessonsForDayMemo = useMemo(() => {
    const lessonsArray = (lessons || []) as SerializedLesson[];
    return (day: Date) => getLessonsForDay(lessonsArray, day);
  }, [lessons]);

  const goToPreviousMonth = () => {
    const prev = new Date(currentMonthStart);
    prev.setMonth(prev.getMonth() - 1);
    setCurrentMonthStart(prev);
    onDateChange?.(prev);
  };

  const goToNextMonth = () => {
    const next = new Date(currentMonthStart);
    next.setMonth(next.getMonth() + 1);
    setCurrentMonthStart(next);
    onDateChange?.(next);
  };

  const goToToday = () => {
    const today = getMonthStart(new Date());
    setCurrentMonthStart(today);
    onDateChange?.(today);
  };

  return {
    currentMonthStart,
    monthEnd,
    monthDays,
    paddingDays,
    weeks,
    lessons: (lessons || []) as SerializedLesson[],
    getLessonsForDay: getLessonsForDayMemo,
    isLoading,
    error,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
  };
};

export type UseMonthlyLessonsReturn = ReturnType<typeof useMonthlyLessons>;
