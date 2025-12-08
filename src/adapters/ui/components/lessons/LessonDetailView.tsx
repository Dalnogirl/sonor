'use client';

import {
  Stack,
  Title,
  Text,
  Card,
  Group,
  Badge,
  Button,
} from '@mantine/core';
import {
  formatFullDate,
  formatTimeRange,
  formatDateTime,
} from '@/adapters/ui/utils/date-utils';

type Participant = {
  id: string;
  name: string | null;
  email: string;
};

type LessonDetailViewProps = {
  lesson: {
    title: string;
    description?: string | null;
    teachers: Participant[];
    pupils: Participant[];
  };
  startDate: Date;
  endDate: Date;
  occurrenceDate: Date | null;
  isRecurring: boolean;
  hasOccurrenceContext: boolean;
  onDeleteClick: () => void;
  onSkipClick: () => void;
};

export function LessonDetailView({
  lesson,
  startDate,
  endDate,
  occurrenceDate,
  isRecurring,
  hasOccurrenceContext,
  onDeleteClick,
  onSkipClick,
}: LessonDetailViewProps) {
  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={1}>{lesson.title}</Title>
          <Group mt="xs" gap="xs">
            <Badge variant="light" size="lg">
              {hasOccurrenceContext
                ? formatFullDate(occurrenceDate!)
                : formatFullDate(startDate)}
            </Badge>
            <Badge variant="light" size="lg">
              {formatTimeRange(startDate, endDate)}
            </Badge>
            {isRecurring && (
              <Badge variant="light" color="blue" size="lg">
                Recurring
              </Badge>
            )}
          </Group>
        </div>
        <Group>
          {isRecurring && (
            <Button color="orange" variant="outline" onClick={onSkipClick}>
              Skip Occurrence
            </Button>
          )}
          <Button color="red" variant="outline" onClick={onDeleteClick}>
            Delete
          </Button>
        </Group>
      </Group>

      {lesson.description && (
        <Card withBorder>
          <Stack gap="xs">
            <Text fw={600} size="sm">
              Description
            </Text>
            <Text>{lesson.description}</Text>
          </Stack>
        </Card>
      )}

      <Card withBorder>
        <Stack gap="xs">
          <Text fw={600} size="sm">
            {hasOccurrenceContext ? 'Occurrence Schedule' : 'Schedule'}
          </Text>
          {hasOccurrenceContext ? (
            <Group>
              <div>
                <Text size="xs" c="dimmed">
                  Date
                </Text>
                <Text>{formatFullDate(occurrenceDate!)}</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed">
                  Time
                </Text>
                <Text>{formatTimeRange(startDate, endDate)}</Text>
              </div>
            </Group>
          ) : (
            <Group>
              <div>
                <Text size="xs" c="dimmed">
                  Start
                </Text>
                <Text>{formatDateTime(startDate)}</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed">
                  End
                </Text>
                <Text>{formatDateTime(endDate)}</Text>
              </div>
            </Group>
          )}
        </Stack>
      </Card>

      <Card withBorder>
        <Stack gap="xs">
          <Text fw={600} size="sm">
            Participants
          </Text>
          <div>
            <Text size="xs" c="dimmed">
              Teachers
            </Text>
            {lesson.teachers.length > 0 ? (
              <Stack gap="xs">
                {lesson.teachers.map((teacher) => (
                  <Text key={teacher.id}>
                    {teacher.name} ({teacher.email})
                  </Text>
                ))}
              </Stack>
            ) : (
              <Text c="dimmed">No teachers assigned</Text>
            )}
          </div>
          <div>
            <Text size="xs" c="dimmed">
              Pupils
            </Text>
            {lesson.pupils.length > 0 ? (
              <Stack gap="xs">
                {lesson.pupils.map((pupil) => (
                  <Text key={pupil.id}>
                    {pupil.name} ({pupil.email})
                  </Text>
                ))}
              </Stack>
            ) : (
              <Text c="dimmed">No pupils assigned</Text>
            )}
          </div>
        </Stack>
      </Card>
    </Stack>
  );
}
