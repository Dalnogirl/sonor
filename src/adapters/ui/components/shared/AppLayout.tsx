'use client';

import {
  AppShell,
  Burger,
  Group,
  NavLink,
  Title,
  Button,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconMusic,
  IconSchool,
  IconUsers,
  IconUser,
  IconLogin,
  IconUserPlus,
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { UserInfo } from './UserInfo';
import { ThemeToggle } from './ThemeToggle';

const NAV_ITEMS = [
  { href: '/lessons' as const, label: 'My Lessons', icon: IconSchool },
  { href: '/users' as const, label: 'Users', icon: IconUsers },
  { href: '/profile' as const, label: 'Profile', icon: IconUser },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [opened, { toggle, close }] = useDisclosure();
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={
        isAuthenticated
          ? { width: 250, breakpoint: 'sm', collapsed: { mobile: !opened } }
          : undefined
      }
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            {isAuthenticated && (
              <Burger
                opened={opened}
                onClick={toggle}
                hiddenFrom="sm"
                size="sm"
              />
            )}
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Group gap="xs">
                <IconMusic size={28} />
                <Title order={3}>Sonor</Title>
              </Group>
            </Link>
          </Group>

          <Group gap="sm">
            <ThemeToggle />
            {isAuthenticated ? (
              <UserInfo />
            ) : (
              <>
                <Button
                  component={Link}
                  href="/login"
                  variant={pathname === '/login' ? 'filled' : 'subtle'}
                  leftSection={<IconLogin size={18} />}
                  size="sm"
                >
                  Login
                </Button>
                <Button
                  component={Link}
                  href="/register"
                  variant={pathname === '/register' ? 'filled' : 'subtle'}
                  leftSection={<IconUserPlus size={18} />}
                  size="sm"
                >
                  Register
                </Button>
              </>
            )}
          </Group>
        </Group>
      </AppShell.Header>

      {isAuthenticated && (
        <AppShell.Navbar p="md">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              component={Link}
              href={item.href}
              label={item.label}
              leftSection={<item.icon size={20} />}
              active={pathname.startsWith(item.href)}
              onClick={close}
            />
          ))}
        </AppShell.Navbar>
      )}

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
