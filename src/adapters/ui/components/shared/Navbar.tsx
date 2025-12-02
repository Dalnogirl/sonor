'use client';

import { Group, Button, Container, Title } from '@mantine/core';
import {
  IconMusic,
  IconUsers,
  IconUserPlus,
  IconLogin,
  IconSchool,
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { UserInfo } from './UserInfo';
import { ThemeToggle } from './ThemeToggle';

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

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
            {session?.user && (
              <Button
                component={Link}
                href="/lessons"
                variant={pathname === '/lessons' ? 'filled' : 'subtle'}
                leftSection={<IconSchool size={18} />}
              >
                My Lessons
              </Button>
            )}
            {session?.user ? (
              <UserInfo />
            ) : (
              <>
                <Button
                  component={Link}
                  href="/login"
                  variant={pathname === '/login' ? 'filled' : 'subtle'}
                  leftSection={<IconLogin size={18} />}
                >
                  Login
                </Button>
                <Button
                  component={Link}
                  href="/register"
                  variant={pathname === '/register' ? 'filled' : 'subtle'}
                  leftSection={<IconUserPlus size={18} />}
                >
                  Register
                </Button>
              </>
            )}

            <ThemeToggle />
          </Group>
        </Group>
      </Container>
    </nav>
  );
}
