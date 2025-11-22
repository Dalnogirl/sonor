import { useState, useMemo, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { getWeekStart, getWeekEnd, generateWeekDays } from '@/adapters/ui/utils/date-utils';

/**
 * useWeeklyLessons - Custom hook for weekly lesson view state management
 *
 * **Architectural Role:** State management hook (adapter layer)
 * - Encapsulates week navigation logic
 * - Manages tRPC data fetching
 * - Provides derived state (weekEnd, weekDays)
 * - Shields component from state complexity
 * - Syncs with parent state management (URL)
 *
 * **Applies:**
 * - Single Responsibility (SOLID): Only manages weekly view state
 * - Information Expert (GRASP): Knows how to navigate weeks
 * - Controller (GRASP): Coordinates week state and data fetching
 * - Low Coupling: Component depends on hook interface, not implementation
 * - Reusability: Other components can use same hook
 *
 * **Pattern:** Custom Hook (React pattern)
 * - Extracts stateful logic from components
 * - Enables logic reuse across components
 * - Testable independently from UI
 * - Controlled component pattern (accepts external state)
 */

interface UseWeeklyLessonsOptions {
  initialDate?: Date | null;
  onDateChange?: (date: Date) => void;
}

export const useWeeklyLessons = (options: UseWeeklyLessonsOptions = {}) => {
  const { initialDate, onDateChange } = options;

  // Week navigation state
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    getWeekStart(initialDate || new Date())
  );

  // Sync with external date changes (from URL)
  useEffect(() => {
    if (initialDate) {
      setCurrentWeekStart(getWeekStart(initialDate));
    }
  }, [initialDate]);

  // Derived state (memoized for performance)
  const weekEnd = useMemo(() => getWeekEnd(currentWeekStart), [currentWeekStart]);
  const weekDays = useMemo(() => generateWeekDays(currentWeekStart), [currentWeekStart]);

  // Fetch lessons for current week
  const { data: lessons, isLoading, error } = trpc.lesson.getMyTeachingLessonsForPeriod.useQuery({
    startDate: currentWeekStart,
    endDate: weekEnd,
  });

  // Navigation actions
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
    // State
    currentWeekStart,
    weekEnd,
    weekDays,

    // Data
    lessons: lessons || [],
    isLoading,
    error,

    // Actions
    goToPreviousWeek,
    goToNextWeek,
    goToToday,
  };
};

/**
 * Return type for useWeeklyLessons hook
 * Useful for TypeScript consumers
 */
export type UseWeeklyLessonsReturn = ReturnType<typeof useWeeklyLessons>;
