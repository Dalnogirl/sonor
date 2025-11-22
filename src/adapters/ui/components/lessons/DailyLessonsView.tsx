'use client';

import { Button, Group, Text, Box, Stack, Card, Loader, Center } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import Link from 'next/link';
import { useDailyLessons } from '@/adapters/ui/hooks/useDailyLessons';
import {
  isSameDay,
  formatFullDate,
  formatTimeRange,
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
 * DailyLessonsView Component
 *
 * Displays lessons for a single day in detailed list view
 *
 * **Architectural Role:** Presentation component (adapter layer)
 * - Pure UI rendering - no business logic
 * - Delegates state management to useDailyLessons hook
 * - Transforms serialized data into detailed list UI
 * - Controlled component (accepts external state)
 *
 * **Applies:**
 * - Single Responsibility (SOLID): Only renders UI
 * - Information Expert (GRASP): Knows how to render daily lesson list
 * - Low Coupling: Depends on hook interface, not implementation
 * - Separation of Concerns: UI separated from state logic
 *
 * **Pattern:** Container/Presenter + Controlled Component
 * - Hook = container (state logic)
 * - Component = presenter (UI rendering)
 * - Parent controls date via props
 * - Consistent with Weekly/Monthly views
 */

interface DailyLessonsViewProps {
  initialDate?: Date | null;
  onDateChange?: (date: Date) => void;
}

export const DailyLessonsView = ({ initialDate, onDateChange }: DailyLessonsViewProps) => {
  const {
    currentDay,
    lessons,
    isLoading,
    goToPreviousDay,
    goToNextDay,
    goToToday,
  } = useDailyLessons({ initialDate, onDateChange });

  const isToday = isSameDay(currentDay, new Date());
  const sortedLessons = [...lessons].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  return (
    <Stack gap="md">
      {/* Day Navigation */}
      <Group justify="space-between">
        <Group>
          <Button
            variant="subtle"
            leftSection={<IconChevronLeft size={18} />}
            onClick={goToPreviousDay}
          >
            Previous
          </Button>
          <Button variant="outline" onClick={goToToday}>
            Today
          </Button>
          <Button
            variant="subtle"
            rightSection={<IconChevronRight size={18} />}
            onClick={goToNextDay}
          >
            Next
          </Button>
        </Group>
        <Box>
          <Text fw={600} size="lg">
            {formatFullDate(currentDay)}
          </Text>
          {isToday && (
            <Text size="xs" c="blue" ta="right">
              Today
            </Text>
          )}
        </Box>
      </Group>

      {/* Lessons List */}
      <Box style={{ minHeight: '400px' }}>
        {isLoading ? (
          <Center h="100%">
            <Loader />
          </Center>
        ) : sortedLessons.length === 0 ? (
          <Card withBorder>
            <Center h={200}>
              <Stack gap="xs" align="center">
                <Text size="lg" c="dimmed">
                  No lessons scheduled
                </Text>
                <Text size="sm" c="dimmed">
                  {isToday ? 'for today' : 'for this day'}
                </Text>
              </Stack>
            </Center>
          </Card>
        ) : (
          <Stack gap="md">
            {sortedLessons.map((lesson) => (
              <DetailedLessonCard key={lesson.id} lesson={lesson} />
            ))}
          </Stack>
        )}
      </Box>
    </Stack>
  );
};

/**
 * DetailedLessonCard - Detailed lesson card for daily view
 * Shows more information than weekly/monthly compact views
 */
interface DetailedLessonCardProps {
  lesson: SerializedLesson;
}

const DetailedLessonCard = ({ lesson }: DetailedLessonCardProps) => {
  return (
    <Link href={`/lessons/${lesson.id}`} style={{ textDecoration: 'none' }}>
      <Card padding="md" withBorder style={{ cursor: 'pointer' }}>
        <Group justify="space-between" align="start">
          <Stack gap="xs" style={{ flex: 1 }}>
            <Text size="lg" fw={600}>
              {lesson.title}
            </Text>

            {lesson.description && (
              <Text size="sm" c="dimmed" lineClamp={2}>
                {lesson.description}
              </Text>
            )}

            <Group gap="xs">
              <Text size="sm" c="dimmed">
                📚 {lesson.teacherIds.length} teacher(s)
              </Text>
              <Text size="sm" c="dimmed">
                •
              </Text>
              <Text size="sm" c="dimmed">
                👥 {lesson.pupilIds.length} pupil(s)
              </Text>
            </Group>
          </Stack>

          <Box style={{ minWidth: '120px', textAlign: 'right' }}>
            <Text size="sm" fw={600} c="blue">
              {formatTimeRange(new Date(lesson.startDate), new Date(lesson.endDate))}
            </Text>
            <Text size="xs" c="dimmed">
              {calculateDuration(new Date(lesson.startDate), new Date(lesson.endDate))}
            </Text>
          </Box>
        </Group>
      </Card>
    </Link>
  );
};

// Helper functions

function calculateDuration(start: Date, end: Date): string {
  const durationMs = end.getTime() - start.getTime();
  const minutes = Math.floor(durationMs / 1000 / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  return `${hours} hr ${remainingMinutes} min`;
}
