'use client';

import {
  Container,
  Paper,
  Title,
  Text,
  Group,
  Avatar,
  Stack,
  Button,
} from '@mantine/core';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { IconArrowLeft } from '@tabler/icons-react';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return (
      <Container size="sm">
        <Text>Loading...</Text>
      </Container>
    );
  }

  if (!session?.user) {
    router.push('/login');
    return null;
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
    <Container size="sm">
      <Button
        variant="subtle"
        leftSection={<IconArrowLeft size={16} />}
        onClick={() => router.back()}
        mb="lg"
      >
        Back
      </Button>

      <Paper shadow="sm" p="xl" radius="md">
        <Stack gap="lg">
          <Group>
            <Avatar color="blue" radius="xl" size="xl">
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
