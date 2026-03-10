import {
  Checkbox,
  Select,
  NumberInput,
  MultiSelect,
  Box,
  Text,
  Radio,
  Stack,
  Divider,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { UseFormReturnType } from '@mantine/form';
import { CreateLessonFormValues } from '@/adapters/ui/validation/lesson-form.schema';
import { RecurringFrequency, DayOfWeek } from '@/domain/models/RecurringPattern';
import { useTranslations } from 'next-intl';

interface RecurringPatternFieldsProps {
  form: UseFormReturnType<CreateLessonFormValues>;
}

export const RecurringPatternFields = ({
  form,
}: RecurringPatternFieldsProps) => {
  const t = useTranslations('lessons.fields');
  const td = useTranslations('lessons.dayNames');

  return (
    <>
      <Divider my="md" />

      <Checkbox
        label={t('recurring')}
        {...form.getInputProps('isRecurring', { type: 'checkbox' })}
      />

      {form.values.isRecurring && (
        <Box>
          <Stack gap="md">
            <Select
              label={t('frequency')}
              placeholder={t('frequencyPlaceholder')}
              data={[
                { value: RecurringFrequency.DAILY, label: t('frequencyDaily') },
                { value: RecurringFrequency.WEEKLY, label: t('frequencyWeekly') },
                { value: RecurringFrequency.MONTHLY, label: t('frequencyMonthly') },
              ]}
              withAsterisk
              {...form.getInputProps('frequency')}
            />

            <NumberInput
              label={t('repeatEvery')}
              placeholder={t('repeatPlaceholder')}
              min={1}
              withAsterisk
              {...form.getInputProps('interval')}
            />

            {form.values.frequency === RecurringFrequency.WEEKLY && (
              <MultiSelect
                label={t('daysOfWeek')}
                placeholder={t('daysOfWeekPlaceholder')}
                data={[
                  { value: String(DayOfWeek.SUNDAY), label: td('sunday') },
                  { value: String(DayOfWeek.MONDAY), label: td('monday') },
                  { value: String(DayOfWeek.TUESDAY), label: td('tuesday') },
                  { value: String(DayOfWeek.WEDNESDAY), label: td('wednesday') },
                  { value: String(DayOfWeek.THURSDAY), label: td('thursday') },
                  { value: String(DayOfWeek.FRIDAY), label: td('friday') },
                  { value: String(DayOfWeek.SATURDAY), label: td('saturday') },
                ]}
                withAsterisk
                {...form.getInputProps('daysOfWeek')}
                value={form.values.daysOfWeek.map(String)}
                onChange={(values) =>
                  form.setFieldValue(
                    'daysOfWeek',
                    values.map(Number)
                  )
                }
              />
            )}

            <Box>
              <Text size="sm" fw={500} mb="xs">
                {t('ends')}
              </Text>
              <Radio.Group {...form.getInputProps('endType')}>
                <Stack gap="xs">
                  <Radio value="never" label={t('endsNever')} />
                  <Radio value="date" label={t('endsOnDate')} />
                  <Radio value="occurrences" label={t('endsAfterOccurrences')} />
                </Stack>
              </Radio.Group>
            </Box>

            {form.values.endType === 'date' && (
              <DatePickerInput
                label={t('endDate')}
                placeholder={t('endDatePlaceholder')}
                minDate={form.values.day || new Date()}
                withAsterisk
                {...form.getInputProps('endDate')}
              />
            )}

            {form.values.endType === 'occurrences' && (
              <NumberInput
                label={t('occurrences')}
                placeholder={t('occurrencesPlaceholder')}
                min={1}
                withAsterisk
                {...form.getInputProps('occurrences')}
              />
            )}
          </Stack>
        </Box>
      )}
    </>
  );
};
