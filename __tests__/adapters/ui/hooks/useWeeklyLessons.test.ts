import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useWeeklyLessons } from '@/adapters/ui/features/lessons';
import { getWeekStart, getWeekEnd, generateWeekDays } from '@/adapters/ui/utils/date-utils';
import * as trpcModule from '@/lib/trpc';

/**
 * Tests for useWeeklyLessons hook
 *
 * **Coverage:**
 * - Initial state (week start/end, derived values)
 * - Navigation actions (previous/next/today)
 * - tRPC data fetching integration
 * - Memoization of derived values
 *
 * **Testing Pattern:** Hook testing with mocked dependencies
 * - Applies Information Expert: Hook knows week navigation logic
 * - Applies Single Responsibility: Tests one concern per test
 */

// Mock tRPC
const mockUseQuery = vi.fn();

vi.mock('@/lib/trpc', () => ({
  trpc: {
    lesson: {
      getMyTeachingLessonsForPeriod: {
        useQuery: (...args: any[]) => mockUseQuery(...args),
      },
    },
  },
}));

describe('useWeeklyLessons', () => {
  const mockLessons = [
    {
      id: '1',
      title: 'Piano Lesson',
      description: 'Basic piano',
      teacherIds: ['teacher-1'],
      pupilIds: ['pupil-1'],
      startDate: '2025-11-10T10:00:00Z',
      endDate: '2025-11-10T11:00:00Z',
      createdAt: '2025-11-01T00:00:00Z',
      updatedAt: '2025-11-01T00:00:00Z',
    },
    {
      id: '2',
      title: 'Guitar Lesson',
      description: 'Advanced guitar',
      teacherIds: ['teacher-2'],
      pupilIds: ['pupil-2'],
      startDate: '2025-11-11T14:00:00Z',
      endDate: '2025-11-11T15:30:00Z',
      createdAt: '2025-11-01T00:00:00Z',
      updatedAt: '2025-11-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock: successful query with data
    mockUseQuery.mockReturnValue({
      data: mockLessons,
      isLoading: false,
      error: null,
    });
  });

  describe('initial state', () => {
    it('should initialize with current week start', () => {
      const { result } = renderHook(() => useWeeklyLessons());

      const expectedWeekStart = getWeekStart(new Date());

      expect(result.current.currentWeekStart).toEqual(expectedWeekStart);
    });

    it('should compute weekEnd as 7 days after weekStart', () => {
      const { result } = renderHook(() => useWeeklyLessons());

      const expectedWeekEnd = getWeekEnd(result.current.currentWeekStart);

      expect(result.current.weekEnd).toEqual(expectedWeekEnd);
    });

    it('should generate array of 7 weekDays', () => {
      const { result } = renderHook(() => useWeeklyLessons());

      expect(result.current.weekDays).toHaveLength(7);

      const expectedWeekDays = generateWeekDays(result.current.currentWeekStart);
      expect(result.current.weekDays).toEqual(expectedWeekDays);
    });

    it('should call tRPC query with correct date range', () => {
      const { result } = renderHook(() => useWeeklyLessons());

      expect(mockUseQuery).toHaveBeenCalledWith({
        startDate: result.current.currentWeekStart,
        endDate: result.current.weekEnd,
      });
    });
  });

  describe('data fetching', () => {
    it('should return lessons from tRPC query', () => {
      const { result } = renderHook(() => useWeeklyLessons());

      expect(result.current.lessons).toEqual(mockLessons);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should return empty array when no data', () => {
      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useWeeklyLessons());

      expect(result.current.lessons).toEqual([]);
    });

    it('should expose loading state', () => {
      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      const { result } = renderHook(() => useWeeklyLessons());

      expect(result.current.isLoading).toBe(true);
    });

    it('should expose error state', () => {
      const mockError = new Error('Failed to fetch lessons');
      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: mockError,
      });

      const { result } = renderHook(() => useWeeklyLessons());

      expect(result.current.error).toBe(mockError);
    });
  });

  describe('navigation actions', () => {
    describe('goToPreviousWeek', () => {
      it('should move week start back by 7 days', () => {
        const { result } = renderHook(() => useWeeklyLessons());

        const initialWeekStart = new Date(result.current.currentWeekStart);

        act(() => {
          result.current.goToPreviousWeek();
        });

        const expectedPreviousWeek = new Date(initialWeekStart);
        expectedPreviousWeek.setDate(expectedPreviousWeek.getDate() - 7);

        expect(result.current.currentWeekStart).toEqual(expectedPreviousWeek);
      });

      it('should update derived values (weekEnd, weekDays)', () => {
        const { result } = renderHook(() => useWeeklyLessons());

        act(() => {
          result.current.goToPreviousWeek();
        });

        expect(result.current.weekEnd).toEqual(
          getWeekEnd(result.current.currentWeekStart)
        );
        expect(result.current.weekDays).toEqual(
          generateWeekDays(result.current.currentWeekStart)
        );
      });

      it('should trigger new tRPC query with updated dates', () => {
        const { result } = renderHook(() => useWeeklyLessons());

        const initialCallCount = mockUseQuery.mock.calls.length;

        act(() => {
          result.current.goToPreviousWeek();
        });

        // Query should be called again with new dates
        expect(mockUseQuery.mock.calls.length).toBeGreaterThan(initialCallCount);
      });
    });

    describe('goToNextWeek', () => {
      it('should move week start forward by 7 days', () => {
        const { result } = renderHook(() => useWeeklyLessons());

        const initialWeekStart = new Date(result.current.currentWeekStart);

        act(() => {
          result.current.goToNextWeek();
        });

        const expectedNextWeek = new Date(initialWeekStart);
        expectedNextWeek.setDate(expectedNextWeek.getDate() + 7);

        expect(result.current.currentWeekStart).toEqual(expectedNextWeek);
      });

      it('should update derived values (weekEnd, weekDays)', () => {
        const { result } = renderHook(() => useWeeklyLessons());

        act(() => {
          result.current.goToNextWeek();
        });

        expect(result.current.weekEnd).toEqual(
          getWeekEnd(result.current.currentWeekStart)
        );
        expect(result.current.weekDays).toEqual(
          generateWeekDays(result.current.currentWeekStart)
        );
      });
    });

    describe('goToToday', () => {
      it('should reset week start to current week', () => {
        const { result } = renderHook(() => useWeeklyLessons());

        act(() => {
          // Navigate away from current week
          result.current.goToNextWeek();
          result.current.goToNextWeek();

          // Go back to today
          result.current.goToToday();
        });

        const expectedWeekStart = getWeekStart(new Date());
        expect(result.current.currentWeekStart).toEqual(expectedWeekStart);
      });

      it('should work after navigating to previous weeks', () => {
        const { result } = renderHook(() => useWeeklyLessons());

        act(() => {
          result.current.goToPreviousWeek();
          result.current.goToPreviousWeek();
          result.current.goToToday();
        });

        const expectedWeekStart = getWeekStart(new Date());
        expect(result.current.currentWeekStart).toEqual(expectedWeekStart);
      });
    });
  });

  describe('memoization', () => {
    it('should memoize weekEnd when currentWeekStart does not change', () => {
      const { result, rerender } = renderHook(() => useWeeklyLessons());

      const initialWeekEnd = result.current.weekEnd;

      // Rerender without changing state
      rerender();

      // weekEnd should be same reference (memoized)
      expect(result.current.weekEnd).toBe(initialWeekEnd);
    });

    it('should memoize weekDays when currentWeekStart does not change', () => {
      const { result, rerender } = renderHook(() => useWeeklyLessons());

      const initialWeekDays = result.current.weekDays;

      // Rerender without changing state
      rerender();

      // weekDays should be same reference (memoized)
      expect(result.current.weekDays).toBe(initialWeekDays);
    });

    it('should recalculate weekEnd when currentWeekStart changes', () => {
      const { result } = renderHook(() => useWeeklyLessons());

      const initialWeekEnd = result.current.weekEnd;

      act(() => {
        result.current.goToNextWeek();
      });

      // weekEnd should be new reference (recalculated)
      expect(result.current.weekEnd).not.toBe(initialWeekEnd);
      // Verify it's actually different value
      expect(result.current.weekEnd.getTime()).not.toBe(initialWeekEnd.getTime());
    });

    it('should recalculate weekDays when currentWeekStart changes', () => {
      const { result } = renderHook(() => useWeeklyLessons());

      const initialWeekDays = result.current.weekDays;

      act(() => {
        result.current.goToNextWeek();
      });

      // weekDays should be new reference (recalculated)
      expect(result.current.weekDays).not.toBe(initialWeekDays);
      // Verify dates are different
      expect(result.current.weekDays[0].getTime()).not.toBe(initialWeekDays[0].getTime());
    });
  });

  describe('integration scenarios', () => {
    it('should handle navigation with loading state', () => {
      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      const { result } = renderHook(() => useWeeklyLessons());

      expect(result.current.isLoading).toBe(true);

      // Should still allow navigation during loading
      act(() => {
        result.current.goToNextWeek();
      });

      expect(result.current.currentWeekStart).toBeDefined();
    });

    it('should handle multiple rapid navigations', () => {
      const { result } = renderHook(() => useWeeklyLessons());

      const initialWeekStart = new Date(result.current.currentWeekStart);

      // Navigate forward twice
      act(() => {
        result.current.goToNextWeek();
      });

      act(() => {
        result.current.goToNextWeek();
      });

      const expectedWeekStart = new Date(initialWeekStart);
      expectedWeekStart.setDate(expectedWeekStart.getDate() + 14); // Two weeks forward

      expect(result.current.currentWeekStart).toEqual(expectedWeekStart);
    });

    it('should maintain correct date boundaries after navigation', () => {
      const { result } = renderHook(() => useWeeklyLessons());

      act(() => {
        result.current.goToNextWeek();
      });

      // Verify dates are at midnight
      expect(result.current.currentWeekStart.getHours()).toBe(0);
      expect(result.current.currentWeekStart.getMinutes()).toBe(0);
      expect(result.current.currentWeekStart.getSeconds()).toBe(0);
      expect(result.current.currentWeekStart.getMilliseconds()).toBe(0);

      expect(result.current.weekEnd.getHours()).toBe(0);
      expect(result.current.weekEnd.getMinutes()).toBe(0);
      expect(result.current.weekEnd.getSeconds()).toBe(0);
      expect(result.current.weekEnd.getMilliseconds()).toBe(0);
    });
  });

  describe('return type', () => {
    it('should return all expected properties', () => {
      const { result } = renderHook(() => useWeeklyLessons());

      expect(result.current).toHaveProperty('currentWeekStart');
      expect(result.current).toHaveProperty('weekEnd');
      expect(result.current).toHaveProperty('weekDays');
      expect(result.current).toHaveProperty('lessons');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('goToPreviousWeek');
      expect(result.current).toHaveProperty('goToNextWeek');
      expect(result.current).toHaveProperty('goToToday');
    });

    it('should return functions for navigation actions', () => {
      const { result } = renderHook(() => useWeeklyLessons());

      expect(typeof result.current.goToPreviousWeek).toBe('function');
      expect(typeof result.current.goToNextWeek).toBe('function');
      expect(typeof result.current.goToToday).toBe('function');
    });
  });
});
