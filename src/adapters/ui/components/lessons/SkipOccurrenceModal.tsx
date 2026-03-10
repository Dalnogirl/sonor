'use client';

import { Modal, Stack, Text, Group, Button } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('lessons.skip');
  const tc = useTranslations('common');

  return (
    <Modal opened={opened} onClose={onClose} title={t('title')} centered>
      <Stack>
        <Text>{t('description')}</Text>
        <DatePickerInput
          label={t('dateLabel')}
          placeholder={t('datePlaceholder')}
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
            {tc('actions.cancel')}
          </Button>
          <Button onClick={onConfirm} loading={isPending} disabled={!date}>
            {t('submit')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
