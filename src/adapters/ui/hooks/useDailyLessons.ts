import { useState, useMemo, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { startOfDay, endOfDay } from '@/adapters/ui/utils/date-utils';

/**
 * useDailyLessons - Custom hook for daily lesson view state management
 *
 * **Architectural Role:** State management hook (adapter layer)
 * - Encapsulates day navigation logic
 * - Manages tRPC data fetching for single day
 * - Shields component from state complexity
 * - Syncs with parent state management (URL)
 *
 * **Applies:**
 * - Single Responsibility (SOLID): Only manages daily view state
 * - Information Expert (GRASP): Knows how to navigate days
 * - Controller (GRASP): Coordinates day state and data fetching
 * - Low Coupling: Component depends on hook interface, not implementation
 * - Reusability: Other components can use same hook
 *
 * **Pattern:** Custom Hook (React pattern)
 * - Extracts stateful logic from components
 * - Enables logic reuse across components
 * - Testable independently from UI
 * - Parallel to useWeeklyLessons/useMonthlyLessons (consistent interface)
 * - Controlled component pattern (accepts external state)
 */

interface UseDailyLessonsOptions {
  initialDate?: Date | null;
  onDateChange?: (date: Date) => void;
}

export const useDailyLessons = (options: UseDailyLessonsOptions = {}) => {
  const { initialDate, onDateChange } = options;

  // Day navigation state (normalized to start of day)
  const [currentDay, setCurrentDay] = useState(() => startOfDay(initialDate || new Date()));

  // Sync with external date changes (from URL)
  useEffect(() => {
    if (initialDate) {
      setCurrentDay(startOfDay(initialDate));
    }
  }, [initialDate]);

  // Derived state (memoized for performance)
  const dayEnd = useMemo(() => endOfDay(currentDay), [currentDay]);

  // Fetch lessons for current day
  const { data: lessons, isLoading, error } = trpc.lesson.getMyTeachingLessonsForPeriod.useQuery({
    startDate: currentDay,
    endDate: dayEnd,
  });

  // Navigation actions
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
    // State
    currentDay,
    dayEnd,

    // Data
    lessons: lessons || [],
    isLoading,
    error,

    // Actions
    goToPreviousDay,
    goToNextDay,
    goToToday,
  };
};

/**
 * Return type for useDailyLessons hook
 * Useful for TypeScript consumers
 */
export type UseDailyLessonsReturn = ReturnType<typeof useDailyLessons>;
