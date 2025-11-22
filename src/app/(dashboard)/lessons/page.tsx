'use client';

import { Button, Container, Stack, Title, SegmentedControl } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import React from 'react';
import { CreateLessonModal } from '@/adapters/ui/components/lessons/CreateLessonModal';
import { DailyLessonsView } from '@/adapters/ui/components/lessons/DailyLessonsView';
import { WeeklyLessonsView } from '@/adapters/ui/components/lessons/WeeklyLessonsView';
import { MonthlyLessonsView } from '@/adapters/ui/components/lessons/MonthlyLessonsView';
import { useLessonsViewState } from '@/adapters/ui/hooks/useLessonsViewState';

/**
 * LessonsPage - Main page for viewing and managing lessons
 *
 * **Architectural Role:** Page component (adapter/UI layer)
 * - Pure presentation - delegates state to hook
 * - Coordinates view mode selection (weekly/monthly)
 * - Delegates rendering to specialized view components
 *
 * **Applies:**
 * - Single Responsibility: Only renders UI, delegates state to hook
 * - Open/Closed (SOLID): Easy to add new view types without modifying existing code
 * - Polymorphism (GRASP): Different view components implement same interface
 * - Low Coupling: Depends on hook interface, not implementation
 * - Separation of Concerns: UI logic separate from state logic
 */

const LessonsPage = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const { viewMode, currentDate, setViewMode, setCurrentDate } = useLessonsViewState();

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title order={1}>Lessons</Title>
          <Button onClick={open}>Create Lesson</Button>
        </div>

        {/* View Mode Toggle */}
        <SegmentedControl
          value={viewMode}
          onChange={(value) => setViewMode(value as 'daily' | 'weekly' | 'monthly')}
          data={[
            { label: 'Daily', value: 'daily' },
            { label: 'Weekly', value: 'weekly' },
            { label: 'Monthly', value: 'monthly' },
          ]}
        />

        {/* Conditional View Rendering */}
        {viewMode === 'daily' ? (
          <DailyLessonsView initialDate={currentDate} onDateChange={setCurrentDate} />
        ) : viewMode === 'weekly' ? (
          <WeeklyLessonsView initialDate={currentDate} onDateChange={setCurrentDate} />
        ) : (
          <MonthlyLessonsView initialDate={currentDate} onDateChange={setCurrentDate} />
        )}
      </Stack>

      <CreateLessonModal opened={opened} onClose={close} />
    </Container>
  );
};
export default LessonsPage;
