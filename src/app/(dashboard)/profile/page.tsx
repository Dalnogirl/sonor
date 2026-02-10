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
import { authOptions } from '@/lib/auth';
import { getInitials } from '@/adapters/ui/utils/string-utils';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const { user } = session;
  const displayName = user.name || user.email || 'User';

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
