import { useRouter, useSearchParams } from 'next/navigation';

/**
 * useLessonsViewState - URL-based view state management
 *
 * **Applies:**
 * - Single Responsibility: Only manages URL-based view state
 * - Protected Variations (GRASP): Shields components from URL format changes
 * - Information Expert: Knows how to parse/serialize URL state
 */

export type ViewMode = 'daily' | 'weekly' | 'monthly';

interface LessonsViewState {
  viewMode: ViewMode;
  currentDate: Date | null;
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

  const viewParam = searchParams.get('view');
  const viewMode: ViewMode =
    viewParam === 'daily' || viewParam === 'weekly' || viewParam === 'monthly'
      ? viewParam
      : 'weekly';

  const dateParam = searchParams.get('date');
  const currentDate = dateParam ? parseDateParam(dateParam) : null;

  const updateURL = (newState: Partial<LessonsViewState>) => {
    const params = new URLSearchParams();
    const mode = newState.viewMode ?? viewMode;
    params.set('view', mode);

    const date = newState.currentDate !== undefined ? newState.currentDate : currentDate;
    if (date) {
      params.set('date', formatDateParam(date));
    }

    router.push(`/lessons?${params.toString()}`);
  };

  const setViewMode = (mode: ViewMode) => updateURL({ viewMode: mode });
  const setCurrentDate = (date: Date) => updateURL({ currentDate: date });

  const resetToToday = () => {
    const params = new URLSearchParams();
    params.set('view', viewMode);
    router.push(`/lessons?${params.toString()}`);
  };

  return { viewMode, currentDate, setViewMode, setCurrentDate, resetToToday };
};

function parseDateParam(param: string): Date | null {
  try {
    const date = new Date(param);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

function formatDateParam(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
