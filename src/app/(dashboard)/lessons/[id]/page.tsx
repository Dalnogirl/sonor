import { Container, Loader } from '@mantine/core';
import { LessonDetailClient } from '@/adapters/ui/components/lessons/LessonDetailClient';
import { createSSRHelpers } from '@/adapters/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';

export default async function LessonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const helpers = await createSSRHelpers();
  await helpers.lesson.getLessonById.prefetch({ lessonId: id });
  return (
    <Container size="md" py="xl">
    <HydrationBoundary state={dehydrate(helpers.queryClient)}>
      <Suspense fallback={<Loader size="lg" />}>

      <LessonDetailClient />
      </Suspense>
    </HydrationBoundary>
    </Container>
  );
}
