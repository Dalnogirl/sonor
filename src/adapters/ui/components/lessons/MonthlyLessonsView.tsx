'use client';

import { useEffect } from 'react';
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
import { Link } from '@/i18n/navigation';
import {
  useMonthlyLessons,
  type SerializedLesson,
  buildLessonDetailUrl,
} from '@/adapters/ui/features/lessons';
import { useIsMobile } from '@/adapters/ui/hooks/useIsMobile';
import {
  isSameDay,
  formatMonthYear,
  formatTimeRange,
  formatFullDate,
} from '@/adapters/ui/utils/date-utils';
import { useTranslations } from 'next-intl';

interface MonthlyLessonsViewProps {
  initialDate?: Date | null;
  onDateChange?: (date: Date) => void;
  onCanCreateChange?: (canCreate: boolean) => void;
}

export const MonthlyLessonsView = ({
  initialDate,
  onDateChange,
  onCanCreateChange,
}: MonthlyLessonsViewProps) => {
  const {
    currentMonthStart,
    monthDays,
    paddingDays,
    weeks,
    canCreate,
    getLessonsForDay,
    isLoading,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
  } = useMonthlyLessons({ initialDate, onDateChange });
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
            onClick={goToPreviousMonth}
            size={isMobile ? 'xs' : 'sm'}
          >
            <Box component="span" hiddenFrom="sm">
              {t('actions.prev')}
            </Box>
            <Box component="span" visibleFrom="sm">
              {t('actions.previous')}
            </Box>
          </Button>
          <Button
            variant="outline"
            onClick={goToToday}
            size={isMobile ? 'xs' : 'sm'}
          >
            {t('actions.today')}
          </Button>
          <Button
            variant="subtle"
            rightSection={<IconChevronRight size={18} />}
            onClick={goToNextMonth}
            size={isMobile ? 'xs' : 'sm'}
          >
            {t('actions.next')}
          </Button>
        </Group>
        <Text fw={600} size={isMobile ? 'sm' : 'lg'}>
          {formatMonthYear(currentMonthStart)}
        </Text>
      </Group>

      <Box style={{ minHeight: '300px' }}>
        {isLoading ? (
          <Center h="100%">
            <Loader />
          </Center>
        ) : (
          <>
            <Box hiddenFrom="sm">
              <MonthlyMobileLayout weeks={weeks} getLessonsForDay={getLessonsForDay} />
            </Box>
            <Box visibleFrom="sm" style={{ minHeight: '670px' }}>
              <MonthlyDesktopLayout
                monthDays={monthDays}
                getLessonsForDay={getLessonsForDay}
                paddingDays={paddingDays}
              />
            </Box>
          </>
        )}
      </Box>
    </Stack>
  );
};

interface MonthlyDesktopLayoutProps {
  monthDays: Date[];
  getLessonsForDay: (day: Date) => SerializedLesson[];
  paddingDays: null[];
}

const MonthlyDesktopLayout = ({
  monthDays,
  getLessonsForDay,
  paddingDays,
}: MonthlyDesktopLayoutProps) => {
  const t = useTranslations('lessons.monthly');
  const weekdayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

  return (
    <Box>
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '8px',
          marginBottom: '8px',
        }}
      >
        {weekdayKeys.map((key) => (
          <Text key={key} size="xs" c="dimmed" ta="center" fw={600}>
            {t(`weekdays.${key}`)}
          </Text>
        ))}
      </Box>

      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '8px',
        }}
      >
        {paddingDays.map((_, i) => (
          <Box key={`padding-${i}`} style={{ minHeight: '100px' }} />
        ))}

        {monthDays.map((day) => (
          <DayCell
            key={day.toISOString()}
            day={day}
            lessons={getLessonsForDay(day)}
          />
        ))}
      </Box>
    </Box>
  );
};

interface MonthlyMobileLayoutProps {
  weeks: Date[][];
  getLessonsForDay: (day: Date) => SerializedLesson[];
}

const MonthlyMobileLayout = ({
  weeks,
  getLessonsForDay,
}: MonthlyMobileLayoutProps) => {
  const t = useTranslations();

  return (
    <Stack gap="lg">
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex}>
          <Text size="sm" fw={600} c="dimmed" mb="xs">
            {t('lessons.monthly.week', { number: weekIndex + 1 })}
          </Text>
          <Stack gap="xs">
            {week.map((day) => {
              const dayLessons = getLessonsForDay(day);
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
                          {t('common.status.today')}
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
                                {t('lessons.monthly.moreCount', { count: dayLessons.length - 2 })}
                              </Text>
                            )}
                          </Stack>
                        )}
                      </Group>
                    ) : (
                      <Text size="xs" c="dimmed">
                        {t('lessons.monthly.noLessons')}
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

interface DayCellProps {
  day: Date;
  lessons: SerializedLesson[];
}

const DayCell = ({ day, lessons }: DayCellProps) => {
  const isToday = isSameDay(day, new Date());
  const t = useTranslations('lessons.monthly');

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
              {t('noLessons')}
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

interface CompactLessonCardProps {
  lesson: SerializedLesson;
}

const CompactLessonCard = ({ lesson }: CompactLessonCardProps) => {
  return (
    <Link href={buildLessonDetailUrl(lesson.id, lesson.startDate)} style={{ textDecoration: 'none' }}>
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
