import { useRouter, useSearchParams } from 'next/navigation';

/**
 * useLessonsViewState - Manages lessons view state in URL
 *
 * **Architectural Role:** State management hook (adapter layer)
 * - Encapsulates URL state management logic
 * - Reads/writes view mode and timeframe from/to URL
 * - Shields components from URL manipulation complexity
 *
 * **Applies:**
 * - Single Responsibility (SOLID): Only manages URL-based view state
 * - Information Expert (GRASP): Knows how to parse/serialize URL state
 * - Protected Variations (GRASP): Shields components from URL format changes
 * - Separation of Concerns: URL logic separated from UI rendering
 *
 * **Pattern:** Custom Hook for State Management
 * - Extracts stateful logic from components
 * - Provides clean interface for view state
 * - Testable independently from UI
 *
 * **URL Format:**
 * - `/lessons?view=weekly&date=2024-01-15` (week containing date)
 * - `/lessons?view=monthly&date=2024-01-01` (month containing date)
 */

export type ViewMode = 'weekly' | 'monthly';

interface LessonsViewState {
  viewMode: ViewMode;
  currentDate: Date | null; // null = use today
}

interface UseLessonsViewStateReturn {
  viewMode: ViewMode;
  currentDate: Date | null;
  setViewMode: (mode: ViewMode) => void;
  setCurrentDate: (date: Date) => void;
  resetToToday: () => void;
}

export const useLessonsViewState = (): UseLessonsViewStateReturn => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse view mode from URL (default: 'weekly')
  const viewParam = searchParams.get('view');
  const viewMode: ViewMode =
    viewParam === 'monthly' || viewParam === 'weekly' ? viewParam : 'weekly';

  // Parse date from URL (null = use today)
  const dateParam = searchParams.get('date');
  const currentDate = dateParam ? parseDateParam(dateParam) : null;

  // Update URL with new state
  const updateURL = (newState: Partial<LessonsViewState>) => {
    const params = new URLSearchParams();

    // Set view mode
    const mode = newState.viewMode ?? viewMode;
    params.set('view', mode);

    // Set date (if not today)
    const date = newState.currentDate !== undefined ? newState.currentDate : currentDate;
    if (date) {
      params.set('date', formatDateParam(date));
    }

    router.push(`/lessons?${params.toString()}`);
  };

  // Actions
  const setViewMode = (mode: ViewMode) => {
    updateURL({ viewMode: mode });
  };

  const setCurrentDate = (date: Date) => {
    updateURL({ currentDate: date });
  };

  const resetToToday = () => {
    const params = new URLSearchParams();
    params.set('view', viewMode);
    // Don't set date param = use today
    router.push(`/lessons?${params.toString()}`);
  };

  return {
    viewMode,
    currentDate,
    setViewMode,
    setCurrentDate,
    resetToToday,
  };
};

// Helper functions

/**
 * Parse date from URL param (YYYY-MM-DD format)
 * Returns null if invalid
 */
function parseDateParam(param: string): Date | null {
  try {
    const date = new Date(param);
    // Check if valid date
    if (isNaN(date.getTime())) {
      return null;
    }
    return date;
  } catch {
    return null;
  }
}

/**
 * Format date for URL param (YYYY-MM-DD format)
 */
function formatDateParam(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
