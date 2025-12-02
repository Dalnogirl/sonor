'use client';

import { Container, Stack, Title, Text, Loader, Center, Card, Group, Badge, Button, Modal } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useLessonDetail } from '@/adapters/ui/features/lessons';
import {
  formatFullDate,
  formatTimeRange,
  formatDateTime,
} from '@/adapters/ui/utils/date-utils';

/**
 * LessonDetailPage Component
 *
 * **Architectural Role:** UI Adapter (presentation layer)
 * - Pure presentation - delegates all logic to useLessonDetail hook
 *
 * **Applies:**
 * - Single Responsibility: Only renders lesson details
 * - Low Coupling: Depends on hook interface, not implementation
 * - Separation of Concerns: UI separated from business logic
 */
const LessonDetailPage = () => {
  const {
    lesson,
    isLoading,
    error,
    startDate,
    endDate,
    occurrenceDate,
    isRecurring,
    hasOccurrenceContext,
    deleteModal,
    skipModal,
  } = useLessonDetail();

  if (isLoading) {
    return (
      <Container size="md" py="xl">
        <Center h={400}>
          <Loader />
        </Center>
      </Container>
    );
  }

  if (error || !lesson || !startDate || !endDate) {
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

  return (
    <Container size="md" py="xl">
      <Modal
        opened={deleteModal.opened}
        onClose={deleteModal.close}
        title="Delete Lesson"
        centered
      >
        <Stack>
          <Text>Are you sure you want to delete &quot;{lesson.title}&quot;?</Text>
          <Text size="sm" c="dimmed">This action cannot be undone.</Text>
          {deleteModal.error && (
            <Text c="red" size="sm">{deleteModal.error.message}</Text>
          )}
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={deleteModal.close}>
              Cancel
            </Button>
            <Button
              color="red"
              onClick={deleteModal.onConfirm}
              loading={deleteModal.isPending}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={skipModal.opened}
        onClose={skipModal.close}
        title="Skip Occurrence"
        centered
      >
        <Stack>
          <Text>Select the date of the occurrence you want to skip.</Text>
          <DatePickerInput
            label="Occurrence Date"
            placeholder="Select date"
            value={skipModal.date}
            onChange={(value) => skipModal.setDate(value as Date | null)}
          />
          {skipModal.error && (
            <Text c="red" size="sm">{skipModal.error.message}</Text>
          )}
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={skipModal.close}>
              Cancel
            </Button>
            <Button
              onClick={skipModal.onConfirm}
              loading={skipModal.isPending}
              disabled={!skipModal.date}
            >
              Skip
            </Button>
          </Group>
        </Stack>
      </Modal>

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
              <Button color="orange" variant="outline" onClick={skipModal.open}>
                Skip Occurrence
              </Button>
            )}
            <Button color="red" variant="outline" onClick={deleteModal.open}>
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
                  <Text size="xs" c="dimmed">Date</Text>
                  <Text>{formatFullDate(occurrenceDate!)}</Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed">Time</Text>
                  <Text>{formatTimeRange(startDate, endDate)}</Text>
                </div>
              </Group>
            ) : (
              <Group>
                <div>
                  <Text size="xs" c="dimmed">Start</Text>
                  <Text>{formatDateTime(startDate)}</Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed">End</Text>
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
