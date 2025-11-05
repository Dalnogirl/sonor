import { UserList } from '@/adapters/ui/components/users/UserList';
import { Container, Title, Stack } from '@mantine/core';

export default function UsersPage() {
  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Title order={1}>User Management</Title>
        <UserList />
      </Stack>
    </Container>
  );
}
