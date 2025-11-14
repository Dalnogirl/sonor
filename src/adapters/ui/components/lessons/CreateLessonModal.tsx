'use client';

import {
  Modal,
  TextInput,
  Button,
  Stack,
  Textarea,
  MultiSelect,
  Group,
  Flex,
} from '@mantine/core';
import { DatePickerInput, TimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import React from 'react';
import { useUserOptions } from '@/adapters/ui/hooks/useUserOptions';
import {
  createLessonSchema,
  type CreateLessonFormValues,
} from '@/adapters/ui/validation/lesson-form.schema';
import { LessonFormMapper } from '@/adapters/ui/mappers/lesson-form.mapper';
import { trpc } from '@/lib/trpc';
import { notifications } from '@mantine/notifications';

interface CreateLessonModalProps {
  opened: boolean;
  onClose: () => void;
}

export const CreateLessonModal = ({
  opened,
  onClose,
}: CreateLessonModalProps) => {
  const { options: userOptions, isLoading: usersLoading } = useUserOptions();

  const form = useForm<CreateLessonFormValues>({
    initialValues: {
      title: '',
      description: '',
      pupilIds: [],
      teacherIds: [],
      day: null as unknown as Date,
      startTime: '',
      endTime: '',
    },
    validate: zodResolver(createLessonSchema),
  });

  console.log('values', JSON.stringify(form.values));

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
      onClose();
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
    // Map form data to DTO using adapter
    const dto = LessonFormMapper.toCreateDTO(values);
    createMutation.mutate(dto);
  };

  console.log('errors: ', JSON.stringify(form.errors));

  return (
    <Modal
      opened={opened}
      onClose={() => {
        form.reset();
        onClose();
      }}
      title="Create New Lesson"
      centered
      size="lg"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
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
            />{' '}
            <TimePicker
              label="End"
              withAsterisk
              {...form.getInputProps('endTime')}
            />
          </Flex>

          <Button
            type="submit"
            fullWidth
            mt="md"
            loading={createMutation.isPending}
          >
            Create Lesson
          </Button>
        </Stack>
      </form>
    </Modal>
  );
};
