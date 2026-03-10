import {
  Container,
  Paper,
  Title,
  Text,
  Group,
  Avatar,
  Stack,
} from '@mantine/core';
import { redirect } from '@/i18n/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getInitials } from '@/adapters/ui/utils/string-utils';
import { setRequestLocale, getTranslations } from 'next-intl/server';

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('profile');

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return redirect({ href: '/login', locale });
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
              {t('userId')}
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
