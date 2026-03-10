import { useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { useDisclosure } from '@mantine/hooks';
import { trpc } from '@/lib/trpc';
import { parseOccurrenceDate } from '../services/lessonViewService';

/**
 * useLessonDetail - Lesson detail page state management
 *
 * **Applies:**
 * - Single Responsibility: Only manages lesson detail state
 * - Controller (GRASP): Coordinates queries, mutations, and modal state
 * - Separation of Concerns: Extracts all logic from component
 */
export const useLessonDetail = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const lessonId = params?.id as string;
  const occurrenceDate = parseOccurrenceDate(searchParams.get('date'));

  // Modal states
  const [editModalOpened, editModalHandlers] = useDisclosure(false);
  const [deleteModalOpened, deleteModalHandlers] = useDisclosure(false);
  const [skipModalOpened, skipModalHandlers] = useDisclosure(false);
  const [skipDate, setSkipDate] = useState<Date | null>(occurrenceDate);

  // Queries
  const [lesson, { isLoading, error }] =
    trpc.lesson.getLessonById.useSuspenseQuery({ lessonId });

  // Mutations
  const deleteMutation = trpc.lesson.delete.useMutation({
    onSuccess: () => router.push('/lessons'),
  });

  const skipMutation = trpc.lesson.skipOccurrence.useMutation({
    onSuccess: () => {
      skipModalHandlers.close();
      setSkipDate(null);
    },
  });

  // Handlers
  const handleDelete = () => deleteMutation.mutate({ lessonId });

  const handleSkip = () => {
    if (!skipDate) return;
    skipMutation.mutate({ lessonId, occurrenceDate: skipDate });
  };

  const handleSkipModalClose = () => {
    skipModalHandlers.close();
    setSkipDate(null);
    skipMutation.reset();
  };

  // Derived data
  const startDate = lesson ? new Date(lesson.startDate) : null;
  const endDate = lesson ? new Date(lesson.endDate) : null;
  const isRecurring = !!lesson?.recurringPattern;
  const hasOccurrenceContext = isRecurring && !!occurrenceDate;
  const permissions = lesson?.permissions ?? {
    canEdit: false,
    canDelete: false,
    canSkip: false,
  };

  return {
    // Core data
    lessonId,
    lesson,
    isLoading,
    error,

    // Derived
    startDate,
    endDate,
    occurrenceDate,
    isRecurring,
    hasOccurrenceContext,
    permissions,

    // Edit modal
    editModal: {
      opened: editModalOpened,
      open: editModalHandlers.open,
      close: editModalHandlers.close,
    },

    // Delete modal
    deleteModal: {
      opened: deleteModalOpened,
      open: deleteModalHandlers.open,
      close: deleteModalHandlers.close,
      isPending: deleteMutation.isPending,
      error: deleteMutation.error,
      onConfirm: handleDelete,
    },

    // Skip modal
    skipModal: {
      opened: skipModalOpened,
      open: skipModalHandlers.open,
      close: handleSkipModalClose,
      isPending: skipMutation.isPending,
      error: skipMutation.error,
      date: skipDate,
      setDate: setSkipDate,
      onConfirm: handleSkip,
    },
  };
};

export type UseLessonDetailReturn = ReturnType<typeof useLessonDetail>;
