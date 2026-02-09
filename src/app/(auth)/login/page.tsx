'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Title,
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Stack,
  Alert,
  Group,
  Text,
  Anchor,
} from '@mantine/core';
import { IconLogin, IconX, IconCheck } from '@tabler/icons-react';
import Link from 'next/link';

type MessageType = 'success' | 'error' | null;

/**
 * Login Page - UI Adapter (Hexagonal Architecture)
 *
 * This component adapts user input to NextAuth, which internally
 * uses LoginUseCase through CredentialsProvider in auth.ts
 *
 * Responsibilities:
 * - UI presentation and form handling
 * - Input validation (client-side)
 * - Calls NextAuth signIn (adapter to authentication system)
 *
 * Business Logic Location:
 * - LoginUseCase: application/use-cases/auth/LoginUseCase.ts
 * - Wired in: lib/auth.ts via NextAuth CredentialsProvider
 */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<MessageType>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setMessageType(null);

    try {
      // NextAuth signIn - calls CredentialsProvider which uses LoginUseCase
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false, // Handle redirect manually for better UX
      });

      if (result?.error) {
        setMessage('Invalid email or password');

        setMessageType('error');
        setIsLoading(false);
      } else if (result?.ok) {
        setMessage('Login successful! Redirecting...');
        setMessageType('success');
        // Redirect to dashboard after successful login
        router.push('/users');
        router.refresh(); // Refresh to update session
      }
    } catch {
      setMessage('An unexpected error occurred. Please try again.');
      setMessageType('error');
      setIsLoading(false);
    }
  };

  return (
    <Container size="sm" py="xl">
      <Stack gap="lg">
        <Group>
          <Title order={1}>🔐 Login</Title>
        </Group>

        <Paper shadow="md" p="xl" radius="md" withBorder>
          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput
                label="Email"
                placeholder="john@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                required
                size="md"
                disabled={isLoading}
              />

              <PasswordInput
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                required
                size="md"
                disabled={isLoading}
              />

              {message && (
                <Alert
                  color={messageType === 'error' ? 'red' : 'green'}
                  icon={
                    messageType === 'error' ? (
                      <IconX size={16} />
                    ) : (
                      <IconCheck size={16} />
                    )
                  }
                >
                  {message}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                size="md"
                loading={isLoading}
                leftSection={<IconLogin size={18} />}
                mt="sm"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>

              <Text size="sm" ta="center" mt="md">
                Don&apos;t have an account?{' '}
                <Anchor component={Link} href="/register">
                  Register here
                </Anchor>
              </Text>
            </Stack>
          </form>
        </Paper>
      </Stack>
    </Container>
  );
}
