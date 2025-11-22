import { useEffect, useState } from 'react';

/**
 * useMediaQuery - Custom hook for responsive design
 *
 * **Architectural Role:** Utility hook (adapter layer)
 * - Encapsulates media query logic
 * - Provides reactive screen size detection
 * - Shields components from window/browser APIs
 *
 * **Applies:**
 * - Single Responsibility (SOLID): Only handles media queries
 * - Information Expert (GRASP): Knows how to detect screen size
 * - Protected Variations (GRASP): Shields from browser API changes
 * - Reusability: Can be used across any component
 *
 * **Pattern:** Custom Hook for Browser API
 * - Abstracts browser API complexity
 * - Provides React-friendly interface
 * - Handles SSR safely (returns false initially)
 *
 * @param query - CSS media query string (e.g., '(max-width: 768px)')
 * @returns boolean indicating if media query matches
 *
 * @example
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
 */
export function useMediaQuery(query: string): boolean {
  // SSR-safe: Start with false on server, hydrate on client
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Listen for changes
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Modern browsers
    mediaQuery.addEventListener('change', handler);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [query]);

  return matches;
}
