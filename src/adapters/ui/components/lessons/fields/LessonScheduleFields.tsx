import { Group, Flex } from '@mantine/core';
import { DatePickerInput, TimePicker } from '@mantine/dates';
import { UseFormReturnType } from '@mantine/form';
import { CreateLessonFormValues } from '@/adapters/ui/validation/lesson-form.schema';

/**
 * LessonScheduleFields
 *
 * Renders scheduling fields (day, start time, end time)
 *
 * **Applies:**
 * - Single Responsibility: Only renders schedule fields
 * - Information Expert: Knows how to display date/time inputs
 * - High Cohesion: Groups related scheduling inputs
 */
interface LessonScheduleFieldsProps {
  form: UseFormReturnType<CreateLessonFormValues>;
}

export const LessonScheduleFields = ({ form }: LessonScheduleFieldsProps) => {
  return (
    <>
      <Group grow>
        <DatePickerInput
          label="Day"
          placeholder="Pick day"
          withAsterisk
          {...form.getInputProps('day')}
        />
      </Group>
      <Flex justify="space-between">
        <TimePicker
          label="Start"
          withAsterisk
          {...form.getInputProps('startTime')}
        />
        <TimePicker
          label="End"
          withAsterisk
          {...form.getInputProps('endTime')}
        />
      </Flex>
    </>
  );
};
