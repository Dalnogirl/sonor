'use client';

import {
  ActionIcon,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

/**
 * ThemeToggle Component
 *
 * Adapter layer component that provides theme switching functionality.
 * Uses Mantine's built-in color scheme management.
 *
 * Architectural Notes:
 * - This is a pure UI adapter component
 * - No business logic involved
 * - Leverages Mantine's useComputedColorScheme and useMantineColorScheme hooks
 * - Follows SRP: single responsibility is theme toggling
 * - Uses mounted state to prevent hydration mismatch (defensive programming)
 */
export function ThemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', {
    getInitialValueInEffect: true,
  });
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark');
  };

  // Don't render icon until after hydration to avoid SSR/client mismatch
  if (!mounted) {
    return (
      <ActionIcon
        variant="default"
        size="lg"
        aria-label="Toggle color scheme"
      />
    );
  }

  return (
    <ActionIcon
      onClick={toggleTheme}
      variant="default"
      size="lg"
      aria-label="Toggle color scheme"
    >
      {computedColorScheme === 'dark' ? (
        <IconSun size={20} stroke={1.5} />
      ) : (
        <IconMoon size={20} stroke={1.5} />
      )}
    </ActionIcon>
  );
}
