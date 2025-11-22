'use client';

import { Button, Group, Text, Box, Stack, Card, Loader, Center } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import Link from 'next/link';
import { useWeeklyLessons } from '@/adapters/ui/hooks/useWeeklyLessons';
import { useIsMobile } from '@/adapters/ui/hooks/useIsMobile';
import {
  isSameDay,
  formatDayName,
  formatWeekRange,
  formatTimeRange,
  formatFullDate,
} from '@/adapters/ui/utils/date-utils';

/**
 * SerializedLesson - Type representing lesson data after tRPC serialization
 * Dates are serialized to ISO strings over the wire
 */
type SerializedLesson = {
  id: string;
  title: string;
  description?: string;
  teacherIds: string[];
  pupilIds: string[];
  startDate: string; // ISO string
  endDate: string; // ISO string
  createdAt: string;
  updatedAt: string;
};

/**
 * WeeklyLessonsView Component
 *
 * Displays lessons in a weekly calendar grid view
 *
 * **Architectural Role:** Presentation component (adapter layer)
 * - Pure UI rendering - no business logic
 * - Delegates state management to useWeeklyLessons hook
 * - Transforms serialized data into UI elements
 * - Controlled component (accepts external state)
 * - CSS-based responsive design (no hydration issues)
 *
 * **Applies:**
 * - Single Responsibility (SOLID): Only renders UI
 * - Information Expert (GRASP): Knows how to render week grid layout
 * - Low Coupling: Depends on hook interface, not implementation
 * - Separation of Concerns: UI separated from state logic
 * - Protected Variations (GRASP): CSS handles breakpoints, not JS
 *
 * **Pattern:** Container/Presenter + Controlled Component
 * - Hook = container (state logic)
 * - Component = presenter (UI rendering)
 * - Parent controls date via props
 * - Mantine's hiddenFrom/visibleFrom for responsive layouts
 */

interface WeeklyLessonsViewProps {
  initialDate?: Date | null;
  onDateChange?: (date: Date) => void;
}

export const WeeklyLessonsView = ({ initialDate, onDateChange }: WeeklyLessonsViewProps) => {
  const {
    currentWeekStart,
    weekEnd,
    weekDays,
    lessons,
    isLoading,
    goToPreviousWeek,
    goToNextWeek,
    goToToday,
  } = useWeeklyLessons({ initialDate, onDateChange });

  const isMobile = useIsMobile();

  return (
    <Stack gap="md">
      {/* Week Navigation */}
      <Group justify="space-between">
        <Group>
          <Button
            variant="subtle"
            leftSection={<IconChevronLeft size={18} />}
            onClick={goToPreviousWeek}
            size={isMobile ? 'xs' : 'sm'}
          >
            <Box component="span" hiddenFrom="sm">
              Prev
            </Box>
            <Box component="span" visibleFrom="sm">
              Previous
            </Box>
          </Button>
          <Button variant="outline" onClick={goToToday} size={isMobile ? 'xs' : 'sm'}>
            Today
          </Button>
          <Button
            variant="subtle"
            rightSection={<IconChevronRight size={18} />}
            onClick={goToNextWeek}
            size={isMobile ? 'xs' : 'sm'}
          >
            Next
          </Button>
        </Group>
        <Text fw={600} size={isMobile ? 'sm' : 'lg'}>
          {formatWeekRange(currentWeekStart, weekEnd)}
        </Text>
      </Group>

      {/* Week Grid - Desktop vs Mobile Layout */}
      <Box style={{ minHeight: '400px' }}>
        {isLoading ? (
          <Center h="100%">
            <Loader />
          </Center>
        ) : (
          <>
            <Box hiddenFrom="sm">
              <WeeklyMobileLayout weekDays={weekDays} lessons={lessons} />
            </Box>
            <Box visibleFrom="sm">
              <WeeklyDesktopLayout weekDays={weekDays} lessons={lessons} />
            </Box>
          </>
        )}
      </Box>
    </Stack>
  );
};

/**
 * WeeklyDesktopLayout - 7-column grid layout for desktop
 */
interface WeeklyDesktopLayoutProps {
  weekDays: Date[];
  lessons: SerializedLesson[];
}

const WeeklyDesktopLayout = ({ weekDays, lessons }: WeeklyDesktopLayoutProps) => {
  return (
    <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
      {weekDays.map((day) => (
        <DayColumn key={day.toISOString()} day={day} lessons={getLessonsForDay(lessons, day)} />
      ))}
    </Box>
  );
};

/**
 * WeeklyMobileLayout - Vertical stack layout for mobile
 * Each day displayed as full-width card
 */
interface WeeklyMobileLayoutProps {
  weekDays: Date[];
  lessons: SerializedLesson[];
}

const WeeklyMobileLayout = ({ weekDays, lessons }: WeeklyMobileLayoutProps) => {
  return (
    <Stack gap="md">
      {weekDays.map((day) => {
        const dayLessons = getLessonsForDay(lessons, day);
        const isToday = isSameDay(day, new Date());

        return (
          <Card
            key={day.toISOString()}
            padding="md"
            withBorder
            style={{
              backgroundColor: isToday ? 'var(--mantine-color-blue-light)' : undefined,
            }}
          >
            <Stack gap="sm">
              {/* Day Header */}
              <Group justify="space-between">
                <div>
                  <Text size="lg" fw={600}>
                    {formatDayName(day)}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {formatFullDate(day)}
                  </Text>
                </div>
                {isToday && (
                  <Text size="xs" c="blue" fw={600}>
                    TODAY
                  </Text>
                )}
              </Group>

              {/* Lessons */}
              {dayLessons.length === 0 ? (
                <Text size="sm" c="dimmed" ta="center" py="xs">
                  No lessons
                </Text>
              ) : (
                <Stack gap="xs">
                  {dayLessons.map((lesson) => (
                    <MobileLessonCard key={lesson.id} lesson={lesson} />
                  ))}
                </Stack>
              )}
            </Stack>
          </Card>
        );
      })}
    </Stack>
  );
};

/**
 * MobileLessonCard - Optimized lesson card for mobile
 */
interface MobileLessonCardProps {
  lesson: SerializedLesson;
}

const MobileLessonCard = ({ lesson }: MobileLessonCardProps) => {
  return (
    <Link href={`/lessons/${lesson.id}`} style={{ textDecoration: 'none' }}>
      <Card padding="sm" withBorder style={{ cursor: 'pointer' }}>
        <Group justify="space-between" align="start">
          <Stack gap={4} style={{ flex: 1 }}>
            <Text size="sm" fw={600} lineClamp={1}>
              {lesson.title}
            </Text>
            {lesson.description && (
              <Text size="xs" c="dimmed" lineClamp={1}>
                {lesson.description}
              </Text>
            )}
          </Stack>
          <Text size="xs" c="blue" fw={600} style={{ whiteSpace: 'nowrap' }}>
            {formatTimeRange(new Date(lesson.startDate), new Date(lesson.endDate))}
          </Text>
        </Group>
      </Card>
    </Link>
  );
};

/**
 * DayColumn - Displays lessons for a single day (Desktop)
 */
interface DayColumnProps {
  day: Date;
  lessons: SerializedLesson[];
}

const DayColumn = ({ day, lessons }: DayColumnProps) => {
  const isToday = isSameDay(day, new Date());

  return (
    <Stack gap="xs">
      <Box
        style={{
          padding: '8px',
          textAlign: 'center',
          backgroundColor: isToday ? 'var(--mantine-color-blue-light)' : undefined,
          borderRadius: '4px',
        }}
      >
        <Text size="xs" c="dimmed">
          {formatDayName(day)}
        </Text>
        <Text fw={600}>{day.getDate()}</Text>
      </Box>

      <Stack gap="xs">
        {lessons.length === 0 ? (
          <Text size="xs" c="dimmed" ta="center" py="md">
            No lessons
          </Text>
        ) : (
          lessons.map((lesson) => <LessonCard key={lesson.id} lesson={lesson} />)
        )}
      </Stack>
    </Stack>
  );
};

/**
 * LessonCard - Displays single lesson
 */
interface LessonCardProps {
  lesson: SerializedLesson;
}

const LessonCard = ({ lesson }: LessonCardProps) => {
  return (
    <Link href={`/lessons/${lesson.id}`} style={{ textDecoration: 'none' }}>
      <Card padding="xs" withBorder style={{ cursor: 'pointer' }}>
        <Stack gap={4}>
          <Text size="sm" fw={600} lineClamp={1}>
            {lesson.title}
          </Text>
          <Text size="xs" c="dimmed">
            {formatTimeRange(new Date(lesson.startDate), new Date(lesson.endDate))}
          </Text>
          {lesson.description && (
            <Text size="xs" c="dimmed" lineClamp={2}>
              {lesson.description}
            </Text>
          )}
        </Stack>
      </Card>
    </Link>
  );
};

// Helper functions

function getLessonsForDay(lessons: SerializedLesson[], day: Date): SerializedLesson[] {
  return lessons
    .filter((lesson) => isSameDay(new Date(lesson.startDate), day))
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
}
