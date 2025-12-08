import { createSSRHelpers } from '@/adapters/trpc/server';
import { UserList } from '@/adapters/ui/components/users/UserList';
import { Container, Title, Stack } from '@mantine/core';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

export default async function UsersPage() {
  const helpers = await createSSRHelpers();

  await helpers.user.list.prefetch({ page: 1, pageSize: 10 });
  return (
    <HydrationBoundary state={dehydrate(helpers.queryClient)}>
      <Container size="lg" py="xl">
        <Stack gap="lg">
          <Title order={1}>User Management</Title>
          <UserList />
        </Stack>
      </Container>
    </HydrationBoundary>
  );
}
