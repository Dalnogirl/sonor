'use client';

import { Button, Container, Stack, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import React from 'react';
import { CreateLessonModal } from '@/adapters/ui/components/lessons/CreateLessonModal';
import { WeeklyLessonsView } from '@/adapters/ui/components/lessons/WeeklyLessonsView';

const LessonsPage = () => {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title order={1}>Lessons</Title>
          <Button onClick={open}>Create Lesson</Button>
        </div>

        <WeeklyLessonsView />
      </Stack>

      <CreateLessonModal opened={opened} onClose={close} />
    </Container>
  );
};
export default LessonsPage;
