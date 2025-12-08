'use client';

import { Modal, Stack, Text, Group, Button } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';

type SkipOccurrenceModalProps = {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  error: { message: string } | null;
  date: Date | null;
  onDateChange: (date: Date | null) => void;
};

export function SkipOccurrenceModal({
  opened,
  onClose,
  onConfirm,
  isPending,
  error,
  date,
  onDateChange,
}: SkipOccurrenceModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="Skip Occurrence" centered>
      <Stack>
        <Text>Select the date of the occurrence you want to skip.</Text>
        <DatePickerInput
          label="Occurrence Date"
          placeholder="Select date"
          value={date}
          onChange={(value) => onDateChange(value as Date | null)}
        />
        {error && (
          <Text c="red" size="sm">
            {error.message}
          </Text>
        )}
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm} loading={isPending} disabled={!date}>
            Skip
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
