'use client';

import { useEffect } from 'react';
import { Button, Group, Text, Box, Stack, Card, Loader, Center } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { Link } from '@/i18n/navigation';
import {
  useDailyLessons,
  type SerializedLesson,
  calculateDuration,
  buildLessonDetailUrl,
} from '@/adapters/ui/features/lessons';
import { formatFullDate, formatTimeRange } from '@/adapters/ui/utils/date-utils';
import { useTranslations } from 'next-intl';

interface DailyLessonsViewProps {
  initialDate?: Date | null;
  onDateChange?: (date: Date) => void;
  onCanCreateChange?: (canCreate: boolean) => void;
}

export const DailyLessonsView = ({ initialDate, onDateChange, onCanCreateChange }: DailyLessonsViewProps) => {
  const {
    currentDay,
    lessons,
    canCreate,
    isLoading,
    isToday,
    goToPreviousDay,
    goToNextDay,
    goToToday,
  } = useDailyLessons({ initialDate, onDateChange });
  const t = useTranslations();

  useEffect(() => {
    onCanCreateChange?.(canCreate);
  }, [canCreate, onCanCreateChange]);

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Group>
          <Button
            variant="subtle"
            leftSection={<IconChevronLeft size={18} />}
            onClick={goToPreviousDay}
          >
            {t('common.actions.previous')}
          </Button>
          <Button variant="outline" onClick={goToToday}>
            {t('common.actions.today')}
          </Button>
          <Button
            variant="subtle"
            rightSection={<IconChevronRight size={18} />}
            onClick={goToNextDay}
          >
            {t('common.actions.next')}
          </Button>
        </Group>
        <Box>
          <Text fw={600} size="lg">
            {formatFullDate(currentDay)}
          </Text>
          {isToday && (
            <Text size="xs" c="blue" ta="right">
              {t('common.actions.today')}
            </Text>
          )}
        </Box>
      </Group>

      <Box style={{ minHeight: '400px' }}>
        {isLoading ? (
          <Center h="100%">
            <Loader />
          </Center>
        ) : lessons.length === 0 ? (
          <Card withBorder>
            <Center h={200}>
              <Stack gap="xs" align="center">
                <Text size="lg" c="dimmed">
                  {t('lessons.daily.noLessons')}
                </Text>
                <Text size="sm" c="dimmed">
                  {isToday ? t('lessons.daily.forToday') : t('lessons.daily.forThisDay')}
                </Text>
              </Stack>
            </Center>
          </Card>
        ) : (
          <Stack gap="md">
            {lessons.map((lesson) => (
              <DetailedLessonCard key={lesson.id} lesson={lesson} />
            ))}
          </Stack>
        )}
      </Box>
    </Stack>
  );
};

interface DetailedLessonCardProps {
  lesson: SerializedLesson;
}

const DetailedLessonCard = ({ lesson }: DetailedLessonCardProps) => {
  const t = useTranslations('lessons.daily');

  return (
    <Link href={buildLessonDetailUrl(lesson.id, lesson.startDate)} style={{ textDecoration: 'none' }}>
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
                {t('teachers', { count: lesson.teacherIds.length })}
              </Text>
              <Text size="sm" c="dimmed">
                •
              </Text>
              <Text size="sm" c="dimmed">
                {t('pupils', { count: lesson.pupilIds.length })}
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
