import { createSSRHelpers } from '@/adapters/trpc/server';
import { UserList } from '@/adapters/ui/components/users/UserList';
import { Container, Title, Stack } from '@mantine/core';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';

export default async function UsersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('users');

  const helpers = await createSSRHelpers();
  await helpers.user.list.prefetch({ page: 1, pageSize: 10 });

  return (
    <HydrationBoundary state={dehydrate(helpers.queryClient)}>
      <Container size="lg" py="xl">
        <Stack gap="lg">
          <Title order={1}>{t('page.title')}</Title>
          <UserList />
        </Stack>
      </Container>
    </HydrationBoundary>
  );
}
