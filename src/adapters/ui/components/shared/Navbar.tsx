'use client';

import { Group, Button, Container, Title } from '@mantine/core';
import { IconMusic, IconUsers, IconUserPlus } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav style={{ borderBottom: '1px solid #dee2e6', marginBottom: '2rem' }}>
      <Container size="lg" py="md">
        <Group justify="space-between">
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Group gap="xs">
              <IconMusic size={28} />
              <Title order={3}>Sonor</Title>
            </Group>
          </Link>

          <Group gap="sm">
            <Button
              component={Link}
              href="/users"
              variant={pathname === '/users' ? 'filled' : 'subtle'}
              leftSection={<IconUsers size={18} />}
            >
              Users
            </Button>
            <Button
              component={Link}
              href="/register"
              variant={pathname === '/register' ? 'filled' : 'subtle'}
              leftSection={<IconUserPlus size={18} />}
            >
              Register
            </Button>
          </Group>
        </Group>
      </Container>
    </nav>
  );
}
