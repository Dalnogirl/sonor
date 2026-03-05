import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { notifications } from '@mantine/notifications';
import {
  createLessonSchema,
  type CreateLessonFormValues,
} from '@/adapters/ui/validation/lesson-form.schema';
import { LessonFormMapper } from '@/adapters/ui/mappers/lesson-form.mapper';
import { LessonWithUsersResponseDTO } from '@/application/dto/lesson/LessonWithUsersResponseDTO';
import { trpc } from '@/lib/trpc';

export const useEditLessonForm = (
  lesson: LessonWithUsersResponseDTO,
  onSuccess?: () => void
) => {
  const form = useForm<CreateLessonFormValues>({
    initialValues: LessonFormMapper.fromLessonToFormValues(lesson),
    validate: zodResolver(createLessonSchema),
  });

  const utils = trpc.useUtils();
  const editMutation = trpc.lesson.edit.useMutation({
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Lesson updated successfully',
        color: 'green',
      });
      utils.lesson.getLessonById.invalidate({ lessonId: lesson.id });
      utils.lesson.getMyTeachingLessonsForPeriod.invalidate();
      onSuccess?.();
    },
    onError: (error: { message?: string }) => {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to update lesson',
        color: 'red',
      });
    },
  });

  const handleSubmit = (values: CreateLessonFormValues) => {
    const dto = LessonFormMapper.toEditDTO(lesson.id, values);
    editMutation.mutate(dto);
  };

  return {
    form,
    isSubmitting: editMutation.isPending,
    handleSubmit,
  };
};
