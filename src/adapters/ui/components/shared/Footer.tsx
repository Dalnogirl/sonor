'use client';

import { Container, Group, Text, Stack, Anchor } from '@mantine/core';
import { IconMail, IconPhone, IconMapPin } from '@tabler/icons-react';

/**
 * Footer Component
 *
 * Adapter layer component that displays contact information and branding.
 * Pure presentational component with no business logic.
 *
 * Architectural Notes:
 * - This is a pure UI adapter component
 * - No business logic involved
 * - Follows SRP: single responsibility is displaying footer content
 */
export function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--mantine-color-default-border)',
        marginTop: 'auto',
        paddingTop: '2rem',
        paddingBottom: '2rem',
      }}
    >
      <Container size="lg">
        <Group justify="space-between" align="flex-start">
          <Stack gap="xs">
            <Text fw={700} size="lg">
              Sonor Music School
            </Text>
            <Text size="sm" c="dimmed">
              Excellence in Musical Education
            </Text>
          </Stack>

          <Stack gap="xs">
            <Text fw={600} size="sm">
              Contact Us
            </Text>
            <Group gap="xs">
              <IconMail size={16} />
              <Anchor href="mailto:info@sonor-music.com" size="sm" c="dimmed">
                info@sonor-music.com
              </Anchor>
            </Group>
            <Group gap="xs">
              <IconPhone size={16} />
              <Text size="sm" c="dimmed">
                +1 (555) 123-4567
              </Text>
            </Group>
            <Group gap="xs">
              <IconMapPin size={16} />
              <Text size="sm" c="dimmed">
                123 Melody Lane, Music City
              </Text>
            </Group>
          </Stack>
        </Group>

        <Text size="xs" c="dimmed" ta="center" mt="xl">
          © {new Date().getFullYear()} Sonor Music School. All rights reserved.
        </Text>
      </Container>
    </footer>
  );
}
