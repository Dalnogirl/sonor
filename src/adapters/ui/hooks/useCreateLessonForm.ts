import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { notifications } from '@mantine/notifications';
import {
  createLessonSchema,
  type CreateLessonFormValues,
} from '@/adapters/ui/validation/lesson-form.schema';
import { LessonFormMapper } from '@/adapters/ui/mappers/lesson-form.mapper';
import { trpc } from '@/lib/trpc';

/**
 * useCreateLessonForm
 *
 * Custom hook that encapsulates lesson creation form logic
 *
 * **Architectural Role:**
 * - Separates form state management from UI presentation
 * - Handles mutation lifecycle (loading, success, error)
 * - Coordinates form submission with backend
 *
 * **Applies:**
 * - Single Responsibility (SOLID): Only manages form state & submission
 * - Separation of Concerns: UI components don't handle mutations directly
 * - Information Expert (GRASP): Knows how to submit lesson data
 * - Reusability: Can be used in different UI contexts
 */
export const useCreateLessonForm = (onSuccess?: () => void) => {
  const form = useForm<CreateLessonFormValues>({
    initialValues: {
      title: '',
      description: '',
      pupilIds: [],
      teacherIds: [],
      day: null as unknown as Date,
      startTime: '',
      endTime: '',
      isRecurring: false,
      frequency: undefined,
      interval: 1,
      daysOfWeek: [],
      endType: 'never' as const,
      endDate: null,
      occurrences: null,
    },
    validate: zodResolver(createLessonSchema),
  });

  const utils = trpc.useUtils();
  const createMutation = trpc.lesson.create.useMutation({
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Lesson created successfully',
        color: 'green',
      });
      utils.lesson.getMyTeachingLessonsForPeriod.invalidate();
      form.reset();
      onSuccess?.();
    },
    onError: (error: { message?: string }) => {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to create lesson',
        color: 'red',
      });
    },
  });

  const handleSubmit = (values: CreateLessonFormValues) => {
    const dto = LessonFormMapper.toCreateDTO(values);
    createMutation.mutate(dto);
  };

  return {
    form,
    isSubmitting: createMutation.isPending,
    handleSubmit,
  };
};
