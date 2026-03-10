import { MultiSelect } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { CreateLessonFormValues } from '@/adapters/ui/validation/lesson-form.schema';
import { useUserOptions } from '@/adapters/ui/hooks/useUserOptions';
import { useTranslations } from 'next-intl';

interface LessonParticipantsFieldsProps {
  form: UseFormReturnType<CreateLessonFormValues>;
}

export const LessonParticipantsFields = ({
  form,
}: LessonParticipantsFieldsProps) => {
  const { options: userOptions, isLoading: usersLoading } = useUserOptions();
  const t = useTranslations('lessons.fields');

  return (
    <>
      <MultiSelect
        label={t('pupils')}
        placeholder={t('pupilsPlaceholder')}
        data={userOptions}
        searchable
        disabled={usersLoading}
        withAsterisk
        {...form.getInputProps('pupilIds')}
      />

      <MultiSelect
        label={t('teachers')}
        placeholder={t('teachersPlaceholder')}
        data={userOptions}
        searchable
        disabled={usersLoading}
        withAsterisk
        {...form.getInputProps('teacherIds')}
      />
    </>
  );
};
