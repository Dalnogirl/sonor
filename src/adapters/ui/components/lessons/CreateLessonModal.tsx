'use client';

import { Modal, Button, Stack } from '@mantine/core';
import React from 'react';
import { useCreateLessonForm } from '@/adapters/ui/features/lessons';
import { LessonBasicFields } from './fields/LessonBasicFields';
import { LessonParticipantsFields } from './fields/LessonParticipantsFields';
import { LessonScheduleFields } from './fields/LessonScheduleFields';
import { RecurringPatternFields } from './fields/RecurringPatternFields';

/**
 * CreateLessonModal
 *
 * Modal for creating new lessons with recurring pattern support
 *
 * **Architectural Role:**
 * - Thin UI adapter that coordinates field components
 * - Delegates form logic to useCreateLessonForm hook
 * - Composes field components for maintainability
 *
 * **Applies:**
 * - Single Responsibility (SOLID): Only coordinates UI composition
 * - Open/Closed (SOLID): Add new field groups without modifying this component
 * - Separation of Concerns: UI composition vs. form logic
 * - Low Coupling: Depends on abstractions (hooks, components)
 * - High Cohesion: Groups related field components
 */
interface CreateLessonModalProps {
  opened: boolean;
  onClose: () => void;
}

export const CreateLessonModal = ({
  opened,
  onClose,
}: CreateLessonModalProps) => {
  const { form, isSubmitting, handleSubmit } = useCreateLessonForm(onClose);

  return (
    <Modal
      opened={opened}
      onClose={() => {
        form.reset();
        onClose();
      }}
      title="Create New Lesson"
      centered
      size="lg"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <LessonBasicFields form={form} />
          <LessonParticipantsFields form={form} />
          <LessonScheduleFields form={form} />
          <RecurringPatternFields form={form} />

          <Button type="submit" fullWidth mt="md" loading={isSubmitting}>
            Create Lesson
          </Button>
        </Stack>
      </form>
    </Modal>
  );
};
