import { Container, Center, Loader } from '@mantine/core';

export default function Loading() {
  return (
    <Container size="md" py="xl">
      <Center h={400}>
        <Loader />
      </Center>
    </Container>
  );
}
