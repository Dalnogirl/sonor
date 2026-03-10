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
import { useTranslations } from 'next-intl';

type Participant = {
  id: string;
  name: string | null;
  email: string;
};

type LessonPermissions = {
  canEdit: boolean;
  canDelete: boolean;
  canSkip: boolean;
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
  permissions: LessonPermissions;
  onEditClick: () => void;
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
  permissions,
  onEditClick,
  onDeleteClick,
  onSkipClick,
}: LessonDetailViewProps) {
  const t = useTranslations('lessons.detail');
  const tc = useTranslations('common');

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
                {t('recurring')}
              </Badge>
            )}
          </Group>
        </div>
        <Group>
          {permissions.canEdit && (
            <Button variant="outline" onClick={onEditClick}>
              {tc('actions.edit')}
            </Button>
          )}
          {isRecurring && permissions.canSkip && (
            <Button color="orange" variant="outline" onClick={onSkipClick}>
              {t('skipOccurrence')}
            </Button>
          )}
          {permissions.canDelete && (
            <Button color="red" variant="outline" onClick={onDeleteClick}>
              {tc('actions.delete')}
            </Button>
          )}
        </Group>
      </Group>

      {lesson.description && (
        <Card withBorder>
          <Stack gap="xs">
            <Text fw={600} size="sm">
              {t('description')}
            </Text>
            <Text>{lesson.description}</Text>
          </Stack>
        </Card>
      )}

      <Card withBorder>
        <Stack gap="xs">
          <Text fw={600} size="sm">
            {hasOccurrenceContext ? t('occurrenceSchedule') : t('schedule')}
          </Text>
          {hasOccurrenceContext ? (
            <Group>
              <div>
                <Text size="xs" c="dimmed">
                  {t('date')}
                </Text>
                <Text>{formatFullDate(occurrenceDate!)}</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed">
                  {t('time')}
                </Text>
                <Text>{formatTimeRange(startDate, endDate)}</Text>
              </div>
            </Group>
          ) : (
            <Group>
              <div>
                <Text size="xs" c="dimmed">
                  {t('start')}
                </Text>
                <Text>{formatDateTime(startDate)}</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed">
                  {t('end')}
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
            {t('participants')}
          </Text>
          <div>
            <Text size="xs" c="dimmed">
              {t('teachers')}
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
              <Text c="dimmed">{t('noTeachers')}</Text>
            )}
          </div>
          <div>
            <Text size="xs" c="dimmed">
              {t('pupils')}
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
              <Text c="dimmed">{t('noPupils')}</Text>
            )}
          </div>
        </Stack>
      </Card>
    </Stack>
  );
}
