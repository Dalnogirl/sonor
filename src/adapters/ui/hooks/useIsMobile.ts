import { useMediaQuery } from './useMediaQuery';

/**
 * useIsMobile - Convenient hook for mobile detection
 *
 * **Architectural Role:** Utility hook (adapter layer)
 * - Provides semantic mobile detection
 * - Encapsulates breakpoint definition
 * - Single source of truth for "mobile" definition
 *
 * **Applies:**
 * - Single Responsibility (SOLID): Only detects mobile
 * - Information Expert (GRASP): Knows mobile breakpoint
 * - Protected Variations (GRASP): Shields from breakpoint changes
 *
 * **Breakpoint:** 768px (typical mobile/tablet boundary)
 * - Mobile: < 768px
 * - Desktop: >= 768px
 *
 * @returns boolean indicating if screen is mobile-sized
 *
 * @example
 * const isMobile = useIsMobile();
 * return isMobile ? <MobileLayout /> : <DesktopLayout />;
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}

/**
 * useIsTablet - Detects tablet-sized screens
 *
 * @returns boolean indicating if screen is tablet-sized
 */
export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
}

/**
 * useIsDesktop - Detects desktop-sized screens
 *
 * @returns boolean indicating if screen is desktop-sized
 */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}
