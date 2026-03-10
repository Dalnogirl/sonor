import { Container, Title, Text } from '@mantine/core';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('common');

  return (
    <Container size="lg" py="xl">
      <Title order={1}>{t('app.title')}</Title>
      <Text size="lg" c="dimmed">
        {t('app.subtitle')}
      </Text>
    </Container>
  );
}
