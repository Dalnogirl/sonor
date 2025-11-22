import { useState, useMemo, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { getMonthStart, getMonthEnd, generateMonthDays } from '@/adapters/ui/utils/date-utils';

/**
 * useMonthlyLessons - Custom hook for monthly lesson view state management
 *
 * **Architectural Role:** State management hook (adapter layer)
 * - Encapsulates month navigation logic
 * - Manages tRPC data fetching
 * - Provides derived state (monthEnd, monthDays)
 * - Shields component from state complexity
 * - Syncs with parent state management (URL)
 *
 * **Applies:**
 * - Single Responsibility (SOLID): Only manages monthly view state
 * - Information Expert (GRASP): Knows how to navigate months
 * - Controller (GRASP): Coordinates month state and data fetching
 * - Low Coupling: Component depends on hook interface, not implementation
 * - Reusability: Other components can use same hook
 *
 * **Pattern:** Custom Hook (React pattern)
 * - Extracts stateful logic from components
 * - Enables logic reuse across components
 * - Testable independently from UI
 * - Parallel to useWeeklyLessons (consistent interface design)
 * - Controlled component pattern (accepts external state)
 */

interface UseMonthlyLessonsOptions {
  initialDate?: Date | null;
  onDateChange?: (date: Date) => void;
}

export const useMonthlyLessons = (options: UseMonthlyLessonsOptions = {}) => {
  const { initialDate, onDateChange } = options;

  // Month navigation state
  const [currentMonthStart, setCurrentMonthStart] = useState(() =>
    getMonthStart(initialDate || new Date())
  );

  // Sync with external date changes (from URL)
  useEffect(() => {
    if (initialDate) {
      setCurrentMonthStart(getMonthStart(initialDate));
    }
  }, [initialDate]);

  // Derived state (memoized for performance)
  const monthEnd = useMemo(() => getMonthEnd(currentMonthStart), [currentMonthStart]);
  const monthDays = useMemo(() => generateMonthDays(currentMonthStart), [currentMonthStart]);

  // Fetch lessons for current month
  const { data: lessons, isLoading, error } = trpc.lesson.getMyTeachingLessonsForPeriod.useQuery({
    startDate: currentMonthStart,
    endDate: monthEnd,
  });

  // Navigation actions
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
    // State
    currentMonthStart,
    monthEnd,
    monthDays,

    // Data
    lessons: lessons || [],
    isLoading,
    error,

    // Actions
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
  };
};

/**
 * Return type for useMonthlyLessons hook
 * Useful for TypeScript consumers
 */
export type UseMonthlyLessonsReturn = ReturnType<typeof useMonthlyLessons>;
