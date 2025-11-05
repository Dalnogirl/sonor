'use client';

import { useUsers } from '@/adapters/ui/hooks/useUsers';
import { Table, Loader, Alert, Text, Paper, Stack } from '@mantine/core';
import { IconAlertCircle, IconUser } from '@tabler/icons-react';

export function UserList() {
  const { data: users, isLoading, error } = useUsers();

  if (isLoading) {
    return (
      <Stack align="center" py="xl">
        <Loader size="lg" />
        <Text c="dimmed">Loading users...</Text>
      </Stack>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
        Error loading users: {error.message}
      </Alert>
    );
  }

  if (!users || users.length === 0) {
    return (
      <Alert icon={<IconUser size={16} />} title="No users" color="blue">
        No users found in the system
      </Alert>
    );
  }

  return (
    <Paper shadow="sm" radius="md" withBorder>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Email</Table.Th>
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
  );
}
