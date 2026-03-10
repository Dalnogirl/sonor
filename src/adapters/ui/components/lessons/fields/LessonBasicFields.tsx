import { TextInput, Textarea } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { CreateLessonFormValues } from '@/adapters/ui/validation/lesson-form.schema';
import { useTranslations } from 'next-intl';

interface LessonBasicFieldsProps {
  form: UseFormReturnType<CreateLessonFormValues>;
}

export const LessonBasicFields = ({ form }: LessonBasicFieldsProps) => {
  const t = useTranslations('lessons.fields');

  return (
    <>
      <TextInput
        label={t('title')}
        placeholder={t('titlePlaceholder')}
        withAsterisk
        {...form.getInputProps('title')}
      />

      <Textarea
        label={t('description')}
        placeholder={t('descriptionPlaceholder')}
        minRows={3}
        {...form.getInputProps('description')}
      />
    </>
  );
};
