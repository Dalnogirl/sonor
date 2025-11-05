import { Container, Title, Text } from '@mantine/core';

export default function HomePage() {
  return (
    <Container size="lg" py="xl">
      <Title order={1}>🎵 Sonor</Title>
      <Text size="lg" c="dimmed">
        Welcome to your music school management application!
      </Text>
    </Container>
  );
}
