'use client';

import { useUsers } from '@/adapters/ui/hooks/useUsers';
import {
  Table,
  Loader,
  Alert,
  Text,
  Paper,
  Stack,
  Pagination,
  Group,
} from '@mantine/core';
import { IconAlertCircle, IconUser } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function UserList() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const t = useTranslations('users.list');

  const { data: users, isLoading, error } = useUsers({ page, pageSize });

  if (isLoading) {
    return (
      <Stack align="center" py="xl">
        <Loader size="lg" />
        <Text c="dimmed">{t('loading')}</Text>
      </Stack>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title={t('errorTitle')} color="red">
        {t('errorMessage', { message: error.message })}
      </Alert>
    );
  }

  if (!users || users.length === 0) {
    return (
      <Alert icon={<IconUser size={16} />} title={t('noUsersTitle')} color="blue">
        {t('noUsersMessage')}
      </Alert>
    );
  }

  const estimatedTotalPages = users.length < pageSize ? page : page + 1;

  return (
    <Stack gap="md">
      <Paper shadow="sm" radius="md" withBorder>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('nameColumn')}</Table.Th>
              <Table.Th>{t('emailColumn')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {users.map((user) => (
              <Table.Tr key={user.id}>
                <Table.Td>
                  <Text fw={500}>{user.name}</Text>
                </Table.Td>
                <Table.Td>
                  <Text c="dimmed">{user.email}</Text>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      <Group justify="space-between">
        <Text size="sm" c="dimmed">
          {t('pageInfo', { page, count: users.length })}
        </Text>
        <Pagination
          value={page}
          onChange={setPage}
          total={estimatedTotalPages}
          disabled={isLoading}
        />
      </Group>
    </Stack>
  );
}
