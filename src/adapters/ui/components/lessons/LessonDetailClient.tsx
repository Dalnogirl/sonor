'use client';

import { Loader, Center, Card, Text } from '@mantine/core';
import { useLessonDetail } from '@/adapters/ui/features/lessons';
import { LessonDetailView } from './LessonDetailView';
import { DeleteLessonModal } from './DeleteLessonModal';
import { SkipOccurrenceModal } from './SkipOccurrenceModal';

export function LessonDetailClient() {
  const {
    lesson,
    isLoading,
    error,
    startDate,
    endDate,
    occurrenceDate,
    isRecurring,
    hasOccurrenceContext,
    deleteModal,
    skipModal,
  } = useLessonDetail();

  if (isLoading) {
    return (
      <Center h={400}>
        <Loader />
      </Center>
    );
  }

  if (error || !lesson || !startDate || !endDate) {
    return (
      <Card withBorder>
        <Text c="red" ta="center">
          {error?.message || 'Lesson not found'}
        </Text>
      </Card>
    );
  }

  return (
    <>
      <DeleteLessonModal
        opened={deleteModal.opened}
        onClose={deleteModal.close}
        onConfirm={deleteModal.onConfirm}
        isPending={deleteModal.isPending}
        error={deleteModal.error}
        lessonTitle={lesson.title}
      />

      <SkipOccurrenceModal
        opened={skipModal.opened}
        onClose={skipModal.close}
        onConfirm={skipModal.onConfirm}
        isPending={skipModal.isPending}
        error={skipModal.error}
        date={skipModal.date}
        onDateChange={skipModal.setDate}
      />

      <LessonDetailView
        lesson={lesson}
        startDate={startDate}
        endDate={endDate}
        occurrenceDate={occurrenceDate}
        isRecurring={isRecurring}
        hasOccurrenceContext={hasOccurrenceContext}
        onDeleteClick={deleteModal.open}
        onSkipClick={skipModal.open}
      />
    </>
  );
}
