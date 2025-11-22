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

/**
 * RecurringPatternFields
 *
 * Renders recurring pattern configuration fields
 *
 * **Applies:**
 * - Single Responsibility: Only renders recurring pattern fields
 * - Information Expert: Knows how to display recurring pattern options
 * - Protected Variations: Shields parent from recurring pattern complexity
 * - High Cohesion: Groups all recurring-related inputs
 */
interface RecurringPatternFieldsProps {
  form: UseFormReturnType<CreateLessonFormValues>;
}

export const RecurringPatternFields = ({
  form,
}: RecurringPatternFieldsProps) => {
  return (
    <>
      <Divider my="md" />

      <Checkbox
        label="Recurring Lesson"
        {...form.getInputProps('isRecurring', { type: 'checkbox' })}
      />

      {form.values.isRecurring && (
        <Box>
          <Stack gap="md">
            <Select
              label="Frequency"
              placeholder="Select frequency"
              data={[
                { value: RecurringFrequency.DAILY, label: 'Daily' },
                { value: RecurringFrequency.WEEKLY, label: 'Weekly' },
                { value: RecurringFrequency.MONTHLY, label: 'Monthly' },
              ]}
              withAsterisk
              {...form.getInputProps('frequency')}
            />

            <NumberInput
              label="Repeat every"
              placeholder="Enter interval"
              min={1}
              withAsterisk
              {...form.getInputProps('interval')}
            />

            {form.values.frequency === RecurringFrequency.WEEKLY && (
              <MultiSelect
                label="Days of Week"
                placeholder="Select days"
                data={[
                  { value: String(DayOfWeek.SUNDAY), label: 'Sunday' },
                  { value: String(DayOfWeek.MONDAY), label: 'Monday' },
                  { value: String(DayOfWeek.TUESDAY), label: 'Tuesday' },
                  { value: String(DayOfWeek.WEDNESDAY), label: 'Wednesday' },
                  { value: String(DayOfWeek.THURSDAY), label: 'Thursday' },
                  { value: String(DayOfWeek.FRIDAY), label: 'Friday' },
                  { value: String(DayOfWeek.SATURDAY), label: 'Saturday' },
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
                Ends
              </Text>
              <Radio.Group {...form.getInputProps('endType')}>
                <Stack gap="xs">
                  <Radio value="never" label="Never" />
                  <Radio value="date" label="On date" />
                  <Radio value="occurrences" label="After occurrences" />
                </Stack>
              </Radio.Group>
            </Box>

            {form.values.endType === 'date' && (
              <DatePickerInput
                label="End Date"
                placeholder="Pick end date"
                minDate={form.values.day || new Date()}
                withAsterisk
                {...form.getInputProps('endDate')}
              />
            )}

            {form.values.endType === 'occurrences' && (
              <NumberInput
                label="Number of Occurrences"
                placeholder="Enter number"
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
