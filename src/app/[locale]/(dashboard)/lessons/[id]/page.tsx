import { Container, Loader } from '@mantine/core';
import { LessonDetailClient } from '@/adapters/ui/components/lessons/LessonDetailClient';
import { createSSRHelpers } from '@/adapters/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';

export default async function LessonDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  setRequestLocale(locale);

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
