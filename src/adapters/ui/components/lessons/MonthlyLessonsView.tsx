'use client';

import {
  Button,
  Group,
  Text,
  Box,
  Stack,
  Card,
  Loader,
  Center,
} from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import Link from 'next/link';
import { useMonthlyLessons } from '@/adapters/ui/hooks/useMonthlyLessons';
import { useIsMobile } from '@/adapters/ui/hooks/useIsMobile';
import {
  isSameDay,
  formatMonthYear,
  formatTimeRange,
  formatFullDate,
  getISODayOfWeek,
  getWeekStart,
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
 * MonthlyLessonsView Component
 *
 * Displays lessons in a monthly calendar grid view
 *
 * **Architectural Role:** Presentation component (adapter layer)
 * - Pure UI rendering - no business logic
 * - Delegates state management to useMonthlyLessons hook
 * - Transforms serialized data into calendar UI
 * - Controlled component (accepts external state)
 * - CSS-based responsive design (no hydration issues)
 *
 * **Applies:**
 * - Single Responsibility (SOLID): Only renders UI
 * - Information Expert (GRASP): Knows how to render calendar grid
 * - Low Coupling: Depends on hook interface, not implementation
 * - Separation of Concerns: UI separated from state logic
 * - Protected Variations (GRASP): CSS handles breakpoints, not JS
 *
 * **Pattern:** Container/Presenter + Controlled Component
 * - Hook = container (state logic)
 * - Component = presenter (UI rendering)
 * - Parent controls date via props
 * - Mirrors WeeklyLessonsView for consistency
 * - Mantine's hiddenFrom/visibleFrom for responsive layouts
 */

interface MonthlyLessonsViewProps {
  initialDate?: Date | null;
  onDateChange?: (date: Date) => void;
}

export const MonthlyLessonsView = ({
  initialDate,
  onDateChange,
}: MonthlyLessonsViewProps) => {
  const {
    currentMonthStart,
    monthDays,
    lessons,
    isLoading,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
  } = useMonthlyLessons({ initialDate, onDateChange });

  const isMobile = useIsMobile();

  // Calculate padding days for calendar grid alignment (desktop only)
  const firstDayOfWeek = getISODayOfWeek(monthDays[0]);
  const paddingDays = Array.from({ length: firstDayOfWeek }, () => null);

  return (
    <Stack gap="md">
      {/* Month Navigation */}
      <Group justify="space-between">
        <Group>
          <Button
            variant="subtle"
            leftSection={<IconChevronLeft size={18} />}
            onClick={goToPreviousMonth}
            size={isMobile ? 'xs' : 'sm'}
          >
            <Box component="span" hiddenFrom="sm">
              Prev
            </Box>
            <Box component="span" visibleFrom="sm">
              Previous
            </Box>
          </Button>
          <Button
            variant="outline"
            onClick={goToToday}
            size={isMobile ? 'xs' : 'sm'}
          >
            Today
          </Button>
          <Button
            variant="subtle"
            rightSection={<IconChevronRight size={18} />}
            onClick={goToNextMonth}
            size={isMobile ? 'xs' : 'sm'}
          >
            Next
          </Button>
        </Group>
        <Text fw={600} size={isMobile ? 'sm' : 'lg'}>
          {formatMonthYear(currentMonthStart)}
        </Text>
      </Group>

      {/* Calendar Grid - Desktop vs Mobile Layout */}
      <Box style={{ minHeight: '300px' }}>
        {isLoading ? (
          <Center h="100%">
            <Loader />
          </Center>
        ) : (
          <>
            <Box hiddenFrom="sm">
              <MonthlyMobileLayout monthDays={monthDays} lessons={lessons} />
            </Box>
            <Box visibleFrom="sm" style={{ minHeight: '670px' }}>
              <MonthlyDesktopLayout
                monthDays={monthDays}
                lessons={lessons}
                paddingDays={paddingDays}
              />
            </Box>
          </>
        )}
      </Box>
    </Stack>
  );
};

/**
 * MonthlyDesktopLayout - 7-column calendar grid for desktop
 */
interface MonthlyDesktopLayoutProps {
  monthDays: Date[];
  lessons: SerializedLesson[];
  paddingDays: null[];
}

const MonthlyDesktopLayout = ({
  monthDays,
  lessons,
  paddingDays,
}: MonthlyDesktopLayoutProps) => {
  return (
    <Box>
      {/* Weekday Headers */}
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '8px',
          marginBottom: '8px',
        }}
      >
        {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => (
          <Text key={day} size="xs" c="dimmed" ta="center" fw={600}>
            {day}
          </Text>
        ))}
      </Box>

      {/* Calendar Days */}
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '8px',
        }}
      >
        {/* Padding for first week */}
        {paddingDays.map((_, i) => (
          <Box key={`padding-${i}`} style={{ minHeight: '100px' }} />
        ))}

        {/* Actual days */}
        {monthDays.map((day) => (
          <DayCell
            key={day.toISOString()}
            day={day}
            lessons={getLessonsForDay(lessons, day)}
          />
        ))}
      </Box>
    </Box>
  );
};

/**
 * MonthlyMobileLayout - List grouped by week for mobile
 * Shows days vertically with lesson counts
 */
interface MonthlyMobileLayoutProps {
  monthDays: Date[];
  lessons: SerializedLesson[];
}

const MonthlyMobileLayout = ({
  monthDays,
  lessons,
}: MonthlyMobileLayoutProps) => {
  // Group days by week
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  let lastWeekStart: Date | null = null;

  monthDays.forEach((day) => {
    const weekStart = getWeekStart(day);
    const weekKey = weekStart.toISOString();

    if (lastWeekStart?.toISOString() !== weekKey) {
      if (currentWeek.length > 0) {
        weeks.push(currentWeek);
      }
      currentWeek = [];
      lastWeekStart = weekStart;
    }

    currentWeek.push(day);
  });

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return (
    <Stack gap="lg">
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex}>
          <Text size="sm" fw={600} c="dimmed" mb="xs">
            Week {weekIndex + 1}
          </Text>
          <Stack gap="xs">
            {week.map((day) => {
              const dayLessons = getLessonsForDay(lessons, day);
              const isToday = isSameDay(day, new Date());

              return (
                <Card
                  key={day.toISOString()}
                  padding="sm"
                  withBorder
                  style={{
                    backgroundColor: isToday
                      ? 'var(--mantine-color-blue-light)'
                      : undefined,
                  }}
                >
                  <Group justify="space-between" align="center">
                    <div>
                      <Text size="sm" fw={600}>
                        {formatFullDate(day)}
                      </Text>
                      {isToday && (
                        <Text size="xs" c="blue" fw={600}>
                          TODAY
                        </Text>
                      )}
                    </div>
                    {dayLessons.length > 0 ? (
                      <Group gap="xs">
                        <Text size="xs" c="dimmed">
                          {dayLessons.length} lesson
                          {dayLessons.length > 1 ? 's' : ''}
                        </Text>
                        {dayLessons.length > 0 && (
                          <Stack gap={2}>
                            {dayLessons.slice(0, 2).map((lesson) => (
                              <Text key={lesson.id} size="xs" lineClamp={1}>
                                {formatTimeRange(
                                  new Date(lesson.startDate),
                                  new Date(lesson.endDate)
                                )}{' '}
                                - {lesson.title}
                              </Text>
                            ))}
                            {dayLessons.length > 2 && (
                              <Text size="xs" c="dimmed">
                                +{dayLessons.length - 2} more
                              </Text>
                            )}
                          </Stack>
                        )}
                      </Group>
                    ) : (
                      <Text size="xs" c="dimmed">
                        No lessons
                      </Text>
                    )}
                  </Group>
                </Card>
              );
            })}
          </Stack>
        </div>
      ))}
    </Stack>
  );
};

/**
 * DayCell - Displays single day in calendar with lessons (Desktop)
 */
interface DayCellProps {
  day: Date;
  lessons: SerializedLesson[];
}

const DayCell = ({ day, lessons }: DayCellProps) => {
  const isToday = isSameDay(day, new Date());

  return (
    <Card
      padding="xs"
      withBorder
      style={{
        minHeight: '100px',
        backgroundColor: isToday
          ? 'var(--mantine-color-blue-light)'
          : undefined,
      }}
    >
      <Stack gap="xs">
        <Text size="sm" fw={isToday ? 700 : 500} ta="center">
          {day.getDate()}
        </Text>

        <Stack gap={4}>
          {lessons.length === 0 ? (
            <Text size="xs" c="dimmed" ta="center">
              No lessons
            </Text>
          ) : (
            lessons.map((lesson) => (
              <CompactLessonCard key={lesson.id} lesson={lesson} />
            ))
          )}
        </Stack>
      </Stack>
    </Card>
  );
};

/**
 * CompactLessonCard - Compact lesson display for calendar cells
 */
interface CompactLessonCardProps {
  lesson: SerializedLesson;
}

const CompactLessonCard = ({ lesson }: CompactLessonCardProps) => {
  return (
    <Link href={`/lessons/${lesson.id}`} style={{ textDecoration: 'none' }}>
      <Card padding={4} withBorder style={{ cursor: 'pointer' }}>
        <Stack gap={2}>
          <Text size="xs" fw={600} lineClamp={1}>
            {lesson.title}
          </Text>

          <Text size="xs" c="dimmed">
            {formatTimeRange(
              new Date(lesson.startDate),
              new Date(lesson.endDate)
            )}
          </Text>
        </Stack>
      </Card>
    </Link>
  );
};

// Helper functions

function getLessonsForDay(
  lessons: SerializedLesson[],
  day: Date
): SerializedLesson[] {
  return lessons
    .filter((lesson) => isSameDay(new Date(lesson.startDate), day))
    .sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
}
