'use client';

import { useCallback, useState } from 'react';
import {
  Button,
  Container,
  Stack,
  Title,
  SegmentedControl,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { CreateLessonModal } from '@/adapters/ui/components/lessons/CreateLessonModal';
import { DailyLessonsView } from '@/adapters/ui/components/lessons/DailyLessonsView';
import { WeeklyLessonsView } from '@/adapters/ui/components/lessons/WeeklyLessonsView';
import { MonthlyLessonsView } from '@/adapters/ui/components/lessons/MonthlyLessonsView';
import { useLessonsViewState } from '@/adapters/ui/features/lessons';
import { useTranslations } from 'next-intl';

export const LessonsPageClient = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const [canCreate, setCanCreate] = useState(false);
  const handleCanCreateChange = useCallback((value: boolean) => setCanCreate(value), []);
  const { viewMode, currentDate, setViewMode, setCurrentDate } =
    useLessonsViewState();
  const t = useTranslations('lessons');

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Title order={1}>{t('page.title')}</Title>
          {canCreate && <Button onClick={open}>{t('page.createLesson')}</Button>}
        </div>

        <SegmentedControl
          value={viewMode}
          onChange={(value) =>
            setViewMode(value as 'daily' | 'weekly' | 'monthly')
          }
          data={[
            { label: t('views.daily'), value: 'daily' },
            { label: t('views.weekly'), value: 'weekly' },
            { label: t('views.monthly'), value: 'monthly' },
          ]}
        />

        {viewMode === 'daily' ? (
          <DailyLessonsView
            initialDate={currentDate}
            onDateChange={setCurrentDate}
            onCanCreateChange={handleCanCreateChange}
          />
        ) : viewMode === 'weekly' ? (
          <WeeklyLessonsView
            initialDate={currentDate}
            onDateChange={setCurrentDate}
            onCanCreateChange={handleCanCreateChange}
          />
        ) : (
          <MonthlyLessonsView
            initialDate={currentDate}
            onDateChange={setCurrentDate}
            onCanCreateChange={handleCanCreateChange}
          />
        )}
      </Stack>

      <CreateLessonModal opened={opened} onClose={close} />
    </Container>
  );
};
