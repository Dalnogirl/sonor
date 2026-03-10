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
import { Link, usePathname } from '@/i18n/navigation';
import { useSession } from 'next-auth/react';
import { UserInfo } from './UserInfo';
import { ThemeToggle } from './ThemeToggle';
import { LocaleSwitcher } from './LocaleSwitcher';
import { useTranslations } from 'next-intl';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [opened, { toggle, close }] = useDisclosure();
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const t = useTranslations('common');

  const NAV_ITEMS = [
    { href: '/lessons' as const, label: t('nav.lessons'), icon: IconSchool },
    { href: '/users' as const, label: t('nav.users'), icon: IconUsers },
    { href: '/profile' as const, label: t('nav.profile'), icon: IconUser },
  ];

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
            <LocaleSwitcher />
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
                  {t('nav.login')}
                </Button>
                <Button
                  component={Link}
                  href="/register"
                  variant={pathname === '/register' ? 'filled' : 'subtle'}
                  leftSection={<IconUserPlus size={18} />}
                  size="sm"
                >
                  {t('nav.register')}
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
