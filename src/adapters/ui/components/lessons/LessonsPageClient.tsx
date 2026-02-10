'use client';

import {
  Button,
  Container,
  Stack,
  Title,
  SegmentedControl,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import React from 'react';
import { CreateLessonModal } from '@/adapters/ui/components/lessons/CreateLessonModal';
import { DailyLessonsView } from '@/adapters/ui/components/lessons/DailyLessonsView';
import { WeeklyLessonsView } from '@/adapters/ui/components/lessons/WeeklyLessonsView';
import { MonthlyLessonsView } from '@/adapters/ui/components/lessons/MonthlyLessonsView';
import { useLessonsViewState } from '@/adapters/ui/features/lessons';

export const LessonsPageClient = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const { viewMode, currentDate, setViewMode, setCurrentDate } =
    useLessonsViewState();

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
          <Title order={1}>Lessons</Title>
          <Button onClick={open}>Create Lesson</Button>
        </div>

        <SegmentedControl
          value={viewMode}
          onChange={(value) =>
            setViewMode(value as 'daily' | 'weekly' | 'monthly')
          }
          data={[
            { label: 'Daily', value: 'daily' },
            { label: 'Weekly', value: 'weekly' },
            { label: 'Monthly', value: 'monthly' },
          ]}
        />

        {viewMode === 'daily' ? (
          <DailyLessonsView
            initialDate={currentDate}
            onDateChange={setCurrentDate}
          />
        ) : viewMode === 'weekly' ? (
          <WeeklyLessonsView
            initialDate={currentDate}
            onDateChange={setCurrentDate}
          />
        ) : (
          <MonthlyLessonsView
            initialDate={currentDate}
            onDateChange={setCurrentDate}
          />
        )}
      </Stack>

      <CreateLessonModal opened={opened} onClose={close} />
    </Container>
  );
};
