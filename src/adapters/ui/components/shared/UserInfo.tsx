'use client';

import { Group, Avatar, Text, Menu, UnstyledButton, rem } from '@mantine/core';
import { IconLogout, IconUser, IconChevronDown } from '@tabler/icons-react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function UserInfo() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return null;
  }

  if (!session?.user) {
    return null;
  }

  const { user } = session;

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  const handleProfile = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.push('/profile' as any);
  };

  // Get initials from name for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = user.name || user.email || 'User';

  return (
    <Menu shadow="md" width={200} position="bottom-end">
      <Menu.Target>
        <UnstyledButton
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            transition: 'background-color 0.2s',
          }}
          className="user-info-button"
        >
          <Group gap="sm">
            <Avatar color="blue" radius="xl" size="md">
              {getInitials(displayName)}
            </Avatar>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text size="sm" fw={500} style={{ lineHeight: 1 }}>
                {displayName}
              </Text>
              <Text
                size="xs"
                c="dimmed"
                style={{ lineHeight: 1, marginTop: 4 }}
              >
                {user.email}
              </Text>
            </div>
            <IconChevronDown size={16} style={{ opacity: 0.7 }} />
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          leftSection={<IconUser style={{ width: rem(16), height: rem(16) }} />}
          onClick={handleProfile}
        >
          Profile
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          color="red"
          leftSection={
            <IconLogout style={{ width: rem(16), height: rem(16) }} />
          }
          onClick={handleLogout}
        >
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
