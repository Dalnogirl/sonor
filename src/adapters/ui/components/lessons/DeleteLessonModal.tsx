'use client';

import { Modal, Stack, Text, Group, Button } from '@mantine/core';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('lessons.delete');
  const tc = useTranslations('common');

  return (
    <Modal opened={opened} onClose={onClose} title={t('title')} centered>
      <Stack>
        <Text>{t('confirm', { title: lessonTitle })}</Text>
        <Text size="sm" c="dimmed">
          {t('warning')}
        </Text>
        {error && (
          <Text c="red" size="sm">
            {error.message}
          </Text>
        )}
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose}>
            {tc('actions.cancel')}
          </Button>
          <Button color="red" onClick={onConfirm} loading={isPending}>
            {tc('actions.delete')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
