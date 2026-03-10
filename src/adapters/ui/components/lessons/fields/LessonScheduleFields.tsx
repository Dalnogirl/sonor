import { Group, Flex } from '@mantine/core';
import { DatePickerInput, TimePicker } from '@mantine/dates';
import { UseFormReturnType } from '@mantine/form';
import { CreateLessonFormValues } from '@/adapters/ui/validation/lesson-form.schema';
import { useTranslations } from 'next-intl';

interface LessonScheduleFieldsProps {
  form: UseFormReturnType<CreateLessonFormValues>;
}

export const LessonScheduleFields = ({ form }: LessonScheduleFieldsProps) => {
  const t = useTranslations('lessons.fields');

  return (
    <>
      <Group grow>
        <DatePickerInput
          label={t('day')}
          placeholder={t('dayPlaceholder')}
          withAsterisk
          {...form.getInputProps('day')}
        />
      </Group>
      <Flex justify="space-between">
        <TimePicker
          label={t('startTime')}
          withAsterisk
          {...form.getInputProps('startTime')}
        />
        <TimePicker
          label={t('endTime')}
          withAsterisk
          {...form.getInputProps('endTime')}
        />
      </Flex>
    </>
  );
};
