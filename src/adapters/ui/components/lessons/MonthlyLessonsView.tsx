'use client';

import { Button, Group, Text, Box, Stack, Card, Loader, Center } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import Link from 'next/link';
import { useMonthlyLessons } from '@/adapters/ui/hooks/useMonthlyLessons';
import {
  isSameDay,
  formatMonthYear,
  formatTimeRange,
  getISODayOfWeek,
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
 *
 * **Applies:**
 * - Single Responsibility (SOLID): Only renders UI
 * - Information Expert (GRASP): Knows how to render calendar grid
 * - Low Coupling: Depends on hook interface, not implementation
 * - Separation of Concerns: UI separated from state logic
 *
 * **Pattern:** Container/Presenter + Controlled Component
 * - Hook = container (state logic)
 * - Component = presenter (UI rendering)
 * - Parent controls date via props
 * - Mirrors WeeklyLessonsView for consistency
 */

interface MonthlyLessonsViewProps {
  initialDate?: Date | null;
  onDateChange?: (date: Date) => void;
}

export const MonthlyLessonsView = ({ initialDate, onDateChange }: MonthlyLessonsViewProps) => {
  const {
    currentMonthStart,
    monthDays,
    lessons,
    isLoading,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
  } = useMonthlyLessons({ initialDate, onDateChange });

  // Calculate padding days for calendar grid alignment
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
          >
            Previous
          </Button>
          <Button variant="outline" onClick={goToToday}>
            Today
          </Button>
          <Button
            variant="subtle"
            rightSection={<IconChevronRight size={18} />}
            onClick={goToNextMonth}
          >
            Next
          </Button>
        </Group>
        <Text fw={600} size="lg">
          {formatMonthYear(currentMonthStart)}
        </Text>
      </Group>

      {/* Calendar Grid */}
      <Box style={{ minHeight: '670px' }}>
        {isLoading ? (
          <Center h="100%">
            <Loader />
          </Center>
        ) : (
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
        )}
      </Box>
    </Stack>
  );
};

/**
 * DayCell - Displays single day in calendar with lessons
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
        backgroundColor: isToday ? 'var(--mantine-color-blue-light)' : undefined,
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
            lessons.map((lesson) => <CompactLessonCard key={lesson.id} lesson={lesson} />)
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
            {formatTimeRange(new Date(lesson.startDate), new Date(lesson.endDate))}
          </Text>
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
