'use client';

import { Button, Group, Text, Box, Stack, Card, Loader, Center } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useWeeklyLessons } from '@/adapters/ui/hooks/useWeeklyLessons';
import { isSameDay } from '@/adapters/ui/utils/date-utils';

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
 *
 * **Applies:**
 * - Single Responsibility (SOLID): Only renders UI
 * - Information Expert (GRASP): Knows how to render week grid layout
 * - Low Coupling: Depends on hook interface, not implementation
 * - Separation of Concerns: UI separated from state logic
 *
 * **Pattern:** Container/Presenter
 * - Hook = container (state logic)
 * - Component = presenter (UI rendering)
 */

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface WeeklyLessonsViewProps {
  // Could add filters later: teacherId, pupilId, etc.
}

export const WeeklyLessonsView = ({}: WeeklyLessonsViewProps) => {
  const {
    currentWeekStart,
    weekEnd,
    weekDays,
    lessons,
    isLoading,
    goToPreviousWeek,
    goToNextWeek,
    goToToday,
  } = useWeeklyLessons();

  return (
    <Stack gap="md">
      {/* Week Navigation */}
      <Group justify="space-between">
        <Group>
          <Button
            variant="subtle"
            leftSection={<IconChevronLeft size={18} />}
            onClick={goToPreviousWeek}
          >
            Previous
          </Button>
          <Button variant="outline" onClick={goToToday}>
            Today
          </Button>
          <Button
            variant="subtle"
            rightSection={<IconChevronRight size={18} />}
            onClick={goToNextWeek}
          >
            Next
          </Button>
        </Group>
        <Text fw={600} size="lg">
          {formatWeekRange(currentWeekStart, weekEnd)}
        </Text>
      </Group>

      {/* Week Grid */}
      {isLoading ? (
        <Center h={400}>
          <Loader />
        </Center>
      ) : (
        <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
          {weekDays.map((day) => (
            <DayColumn
              key={day.toISOString()}
              day={day}
              lessons={getLessonsForDay(lessons, day)}
            />
          ))}
        </Box>
      )}
    </Stack>
  );
};

/**
 * DayColumn - Displays lessons for a single day
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
    <Card padding="xs" withBorder>
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
  );
};

// Helper functions

function getLessonsForDay(lessons: SerializedLesson[], day: Date): SerializedLesson[] {
  return lessons
    .filter((lesson) => isSameDay(new Date(lesson.startDate), day))
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
}

function formatDayName(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
}

function formatWeekRange(start: Date, end: Date): string {
  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${startStr} - ${endStr}`;
}

function formatTimeRange(start: Date, end: Date): string {
  const startTime = start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const endTime = end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return `${startTime} - ${endTime}`;
}
