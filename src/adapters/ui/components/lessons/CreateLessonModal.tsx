'use client';

import { Modal, Button, Stack } from '@mantine/core';
import React from 'react';
import { useCreateLessonForm } from '@/adapters/ui/features/lessons';
import { LessonBasicFields } from './fields/LessonBasicFields';
import { LessonParticipantsFields } from './fields/LessonParticipantsFields';
import { LessonScheduleFields } from './fields/LessonScheduleFields';
import { RecurringPatternFields } from './fields/RecurringPatternFields';
import { useTranslations } from 'next-intl';

interface CreateLessonModalProps {
  opened: boolean;
  onClose: () => void;
}

export const CreateLessonModal = ({
  opened,
  onClose,
}: CreateLessonModalProps) => {
  const { form, isSubmitting, handleSubmit } = useCreateLessonForm(onClose);
  const t = useTranslations('lessons.create');

  return (
    <Modal
      opened={opened}
      onClose={() => {
        form.reset();
        onClose();
      }}
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
