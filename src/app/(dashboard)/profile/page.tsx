import {
  Container,
  Paper,
  Title,
  Text,
  Group,
  Avatar,
  Stack,
} from '@mantine/core';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

export default async function ProfilePage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect('/login');
  }

  const { user } = session;
  const displayName = user.name || user.email || 'User';

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Container size="md">
      <Paper shadow="sm" p="xl" radius="md">
        <Stack gap="lg">
          <Group>
            <Avatar radius="xl" size="xl">
              {getInitials(displayName)}
            </Avatar>
            <div>
              <Title order={2}>{displayName}</Title>
              <Text c="dimmed" size="sm">
                {user.email}
              </Text>
            </div>
          </Group>

          <div>
            <Text size="sm" fw={500} mb="xs">
              User ID
            </Text>
            <Text size="sm" c="dimmed">
              {user.id}
            </Text>
          </div>
        </Stack>
      </Paper>
    </Container>
  );
}
