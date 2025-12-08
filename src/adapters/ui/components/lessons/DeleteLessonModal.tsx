'use client';

import { Modal, Stack, Text, Group, Button } from '@mantine/core';

type DeleteLessonModalProps = {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  error: { message: string } | null;
  lessonTitle: string;
};

export function DeleteLessonModal({
  opened,
  onClose,
  onConfirm,
  isPending,
  error,
  lessonTitle,
}: DeleteLessonModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="Delete Lesson" centered>
      <Stack>
        <Text>Are you sure you want to delete &quot;{lessonTitle}&quot;?</Text>
        <Text size="sm" c="dimmed">
          This action cannot be undone.
        </Text>
        {error && (
          <Text c="red" size="sm">
            {error.message}
          </Text>
        )}
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button color="red" onClick={onConfirm} loading={isPending}>
            Delete
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
