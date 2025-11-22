import { TextInput, Textarea } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { CreateLessonFormValues } from '@/adapters/ui/validation/lesson-form.schema';

/**
 * LessonBasicFields
 *
 * Renders basic lesson information fields (title, description)
 *
 * **Applies:**
 * - Single Responsibility: Only renders basic fields
 * - Pure Fabrication: Created for UI organization
 * - Low Coupling: Only depends on form type
 */
interface LessonBasicFieldsProps {
  form: UseFormReturnType<CreateLessonFormValues>;
}

export const LessonBasicFields = ({ form }: LessonBasicFieldsProps) => {
  return (
    <>
      <TextInput
        label="Title"
        placeholder="Enter lesson title"
        withAsterisk
        {...form.getInputProps('title')}
      />

      <Textarea
        label="Description"
        placeholder="Enter lesson description"
        minRows={3}
        {...form.getInputProps('description')}
      />
    </>
  );
};
