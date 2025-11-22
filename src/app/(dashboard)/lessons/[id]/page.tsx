'use client';

import { Container, Stack, Title, Text, Loader, Center, Card, Group, Badge } from '@mantine/core';
import { useParams } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import {
  formatFullDate,
  formatTimeRange,
  formatDateTime,
} from '@/adapters/ui/utils/date-utils';

/**
 * LessonDetailPage Component
 *
 * **Architectural Role:** UI Adapter (presentation layer)
 * - Fetches lesson data via tRPC adapter
 * - Pure presentation - delegates data fetching to tRPC
 *
 * **Applies:**
 * - Single Responsibility (SOLID): Only renders lesson details
 * - Low Coupling: Depends on tRPC interface, not use cases
 * - Separation of Concerns: UI separated from business logic
 *
 * **Pattern:** Smart Component (fetches data + renders)
 */
const LessonDetailPage = () => {
  const params = useParams();
  const lessonId = params?.id as string;

  const { data: lesson, isLoading, error } = trpc.lesson.getLessonById.useQuery(
    { lessonId },
    { enabled: !!lessonId }
  );

  if (isLoading) {
    return (
      <Container size="md" py="xl">
        <Center h={400}>
          <Loader />
        </Center>
      </Container>
    );
  }

  if (error || !lesson) {
    return (
      <Container size="md" py="xl">
        <Card withBorder>
          <Text c="red" ta="center">
            {error?.message || 'Lesson not found'}
          </Text>
        </Card>
      </Container>
    );
  }

  const startDate = new Date(lesson.startDate);
  const endDate = new Date(lesson.endDate);

  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        <div>
          <Title order={1}>{lesson.title}</Title>
          <Group mt="xs" gap="xs">
            <Badge variant="light" size="lg">
              {formatFullDate(startDate)}
            </Badge>
            <Badge variant="light" size="lg">
              {formatTimeRange(startDate, endDate)}
            </Badge>
          </Group>
        </div>

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
              Schedule
            </Text>
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
                    <Text key={teacher.id}>{teacher.name} ({teacher.email})</Text>
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
                    <Text key={pupil.id}>{pupil.name} ({pupil.email})</Text>
                  ))}
                </Stack>
              ) : (
                <Text c="dimmed">No pupils assigned</Text>
              )}
            </div>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
};

export default LessonDetailPage;
