'use client';

import { Modal, Button, Stack } from '@mantine/core';
import React from 'react';
import { useEditLessonForm } from '@/adapters/ui/features/lessons';
import { LessonBasicFields } from './fields/LessonBasicFields';
import { LessonParticipantsFields } from './fields/LessonParticipantsFields';
import { LessonScheduleFields } from './fields/LessonScheduleFields';
import { RecurringPatternFields } from './fields/RecurringPatternFields';
import { LessonWithUsersResponseDTO } from '@/application/dto/lesson/LessonWithUsersResponseDTO';
import { useTranslations } from 'next-intl';

interface EditLessonModalProps {
  opened: boolean;
  onClose: () => void;
  lesson: LessonWithUsersResponseDTO;
}

export const EditLessonModal = ({
  opened,
  onClose,
  lesson,
}: EditLessonModalProps) => {
  const { form, isSubmitting, handleSubmit } = useEditLessonForm(
    lesson,
    onClose
  );
  const t = useTranslations('lessons.edit');

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('title')}
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
            {t('submit')}
          </Button>
        </Stack>
      </form>
    </Modal>
  );
};
