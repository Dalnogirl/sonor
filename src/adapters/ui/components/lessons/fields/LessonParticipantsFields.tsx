import { MultiSelect } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { CreateLessonFormValues } from '@/adapters/ui/validation/lesson-form.schema';
import { useUserOptions } from '@/adapters/ui/hooks/useUserOptions';

/**
 * LessonParticipantsFields
 *
 * Renders participant selection fields (pupils, teachers)
 *
 * **Applies:**
 * - Single Responsibility: Only renders participant fields
 * - Information Expert: Knows how to fetch & display user options
 * - Indirection: Uses useUserOptions hook to shield from data fetching details
 */
interface LessonParticipantsFieldsProps {
  form: UseFormReturnType<CreateLessonFormValues>;
}

export const LessonParticipantsFields = ({
  form,
}: LessonParticipantsFieldsProps) => {
  const { options: userOptions, isLoading: usersLoading } = useUserOptions();

  return (
    <>
      <MultiSelect
        label="Pupils"
        placeholder="Select pupils"
        data={userOptions}
        searchable
        disabled={usersLoading}
        withAsterisk
        {...form.getInputProps('pupilIds')}
      />

      <MultiSelect
        label="Teachers"
        placeholder="Select teachers"
        data={userOptions}
        searchable
        disabled={usersLoading}
        withAsterisk
        {...form.getInputProps('teacherIds')}
      />
    </>
  );
};
