'use client';

import { Button, Container, Flex } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import React from 'react';
import { CreateLessonModal } from '@/adapters/ui/components/lessons/CreateLessonModal';

const LessonsPage = () => {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <Container size="lg" py="xl">
      <Flex direction="row" gap="md" justify="space-between" align="center">
        <h1>Lessons Page</h1>
        <Button onClick={open}>Create Lesson</Button>
      </Flex>

      <CreateLessonModal opened={opened} onClose={close} />
    </Container>
  );
};
export default LessonsPage;
