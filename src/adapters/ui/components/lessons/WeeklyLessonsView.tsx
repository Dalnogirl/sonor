'use client';

import { useEffect } from 'react';
import { Button, Group, Text, Box, Stack, Card, Loader, Center } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { Link } from '@/i18n/navigation';
import {
  useWeeklyLessons,
  type SerializedLesson,
  buildLessonDetailUrl,
} from '@/adapters/ui/features/lessons';
import { useIsMobile } from '@/adapters/ui/hooks/useIsMobile';
import {
  isSameDay,
  formatDayName,
  formatWeekRange,
  formatTimeRange,
  formatFullDate,
} from '@/adapters/ui/utils/date-utils';
import { useTranslations } from 'next-intl';

interface WeeklyLessonsViewProps {
  initialDate?: Date | null;
  onDateChange?: (date: Date) => void;
  onCanCreateChange?: (canCreate: boolean) => void;
}

export const WeeklyLessonsView = ({ initialDate, onDateChange, onCanCreateChange }: WeeklyLessonsViewProps) => {
  const {
    currentWeekStart,
    weekEnd,
    weekDays,
    canCreate,
    getLessonsForDay,
    isLoading,
    goToPreviousWeek,
    goToNextWeek,
    goToToday,
  } = useWeeklyLessons({ initialDate, onDateChange });
  const t = useTranslations('common');

  useEffect(() => {
    onCanCreateChange?.(canCreate);
  }, [canCreate, onCanCreateChange]);

  const isMobile = useIsMobile();

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Group>
          <Button
            variant="subtle"
            leftSection={<IconChevronLeft size={18} />}
            onClick={goToPreviousWeek}
            size={isMobile ? 'xs' : 'sm'}
          >
            <Box component="span" hiddenFrom="sm">
              {t('actions.prev')}
            </Box>
            <Box component="span" visibleFrom="sm">
              {t('actions.previous')}
            </Box>
          </Button>
          <Button variant="outline" onClick={goToToday} size={isMobile ? 'xs' : 'sm'}>
            {t('actions.today')}
          </Button>
          <Button
            variant="subtle"
            rightSection={<IconChevronRight size={18} />}
            onClick={goToNextWeek}
            size={isMobile ? 'xs' : 'sm'}
          >
            {t('actions.next')}
          </Button>
        </Group>
        <Text fw={600} size={isMobile ? 'sm' : 'lg'}>
          {formatWeekRange(currentWeekStart, weekEnd)}
        </Text>
      </Group>

      <Box style={{ minHeight: '400px' }}>
        {isLoading ? (
          <Center h="100%">
            <Loader />
          </Center>
        ) : (
          <>
            <Box hiddenFrom="sm">
              <WeeklyMobileLayout weekDays={weekDays} getLessonsForDay={getLessonsForDay} />
            </Box>
            <Box visibleFrom="sm">
              <WeeklyDesktopLayout weekDays={weekDays} getLessonsForDay={getLessonsForDay} />
            </Box>
          </>
        )}
      </Box>
    </Stack>
  );
};

interface WeeklyDesktopLayoutProps {
  weekDays: Date[];
  getLessonsForDay: (day: Date) => SerializedLesson[];
}

const WeeklyDesktopLayout = ({ weekDays, getLessonsForDay }: WeeklyDesktopLayoutProps) => {
  return (
    <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
      {weekDays.map((day) => (
        <DayColumn key={day.toISOString()} day={day} lessons={getLessonsForDay(day)} />
      ))}
    </Box>
  );
};

interface WeeklyMobileLayoutProps {
  weekDays: Date[];
  getLessonsForDay: (day: Date) => SerializedLesson[];
}

const WeeklyMobileLayout = ({ weekDays, getLessonsForDay }: WeeklyMobileLayoutProps) => {
  const t = useTranslations();

  return (
    <Stack gap="md">
      {weekDays.map((day) => {
        const dayLessons = getLessonsForDay(day);
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
                    {t('common.status.today')}
                  </Text>
                )}
              </Group>

              {dayLessons.length === 0 ? (
                <Text size="sm" c="dimmed" ta="center" py="xs">
                  {t('lessons.weekly.noLessons')}
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

interface MobileLessonCardProps {
  lesson: SerializedLesson;
}

const MobileLessonCard = ({ lesson }: MobileLessonCardProps) => {
  return (
    <Link href={buildLessonDetailUrl(lesson.id, lesson.startDate)} style={{ textDecoration: 'none' }}>
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

interface DayColumnProps {
  day: Date;
  lessons: SerializedLesson[];
}

const DayColumn = ({ day, lessons }: DayColumnProps) => {
  const isToday = isSameDay(day, new Date());
  const t = useTranslations('lessons.weekly');

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
            {t('noLessons')}
          </Text>
        ) : (
          lessons.map((lesson) => <LessonCard key={lesson.id} lesson={lesson} />)
        )}
      </Stack>
    </Stack>
  );
};

interface LessonCardProps {
  lesson: SerializedLesson;
}

const LessonCard = ({ lesson }: LessonCardProps) => {
  return (
    <Link href={buildLessonDetailUrl(lesson.id, lesson.startDate)} style={{ textDecoration: 'none' }}>
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
