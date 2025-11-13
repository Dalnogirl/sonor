'use client';

import {
  Modal,
  TextInput,
  Button,
  Stack,
  Textarea,
  MultiSelect,
  Group,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import React from 'react';

interface CreateLessonFormValues {
  title: string;
  description: string;
  pupilIds: string[];
  teacherIds: string[];
  startDate: Date | null;
  endDate: Date | null;
}

interface CreateLessonModalProps {
  opened: boolean;
  onClose: () => void;
}

export const CreateLessonModal = ({
  opened,
  onClose,
}: CreateLessonModalProps) => {
  const form = useForm<CreateLessonFormValues>({
    initialValues: {
      title: '',
      description: '',
      pupilIds: [],
      teacherIds: [],
      startDate: null,
      endDate: null,
    },
    validate: {
      title: (value) =>
        value.trim().length === 0 ? 'Title is required' : null,
      startDate: (value) => (value === null ? 'Start date is required' : null),
      endDate: (value, values) => {
        if (value === null) return 'End date is required';
        if (values.startDate && value < values.startDate) {
          return 'End date must be after start date';
        }
        return null;
      },
    },
  });

  const handleSubmit = (values: CreateLessonFormValues) => {
    // TODO: Implement lesson creation logic with use case
    console.log('Creating lesson with values:', values);
    form.reset();
    onClose();
  };

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
            required
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
            data={[]}
            searchable
            {...form.getInputProps('pupilIds')}
          />

          <MultiSelect
            label="Teachers"
            placeholder="Select teachers"
            data={[]}
            searchable
            {...form.getInputProps('teacherIds')}
          />

          <Group grow>
            <DatePickerInput
              label="Day"
              placeholder="Pick day"
              required
              {...form.getInputProps('day')}
            />
          </Group>

          <Button type="submit" fullWidth mt="md">
            Create Lesson
          </Button>
        </Stack>
      </form>
    </Modal>
  );
};
