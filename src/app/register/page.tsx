'use client';

import { trpc } from '@/lib/trpc';
import { useState } from 'react';
import {
  Container,
  Title,
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Stack,
  Alert,
  List,
  Group,
} from '@mantine/core';
import { IconCheck, IconX, IconClock, IconFlask } from '@tabler/icons-react';

type MessageType = 'success' | 'error' | 'loading' | null;

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<MessageType>(null);

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      setMessage(`Success! User created: ${data.email} (ID: ${data.id})`);
      setMessageType('success');
      setName('');
      setEmail('');
      setPassword('');
    },
    onError: (error) => {
      setMessage(`Error: ${error.message}`);
      setMessageType('error');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Creating user...');
    setMessageType('loading');
    registerMutation.mutate({ name, email, password });
  };

  return (
    <Container size="sm" py="xl">
      <Stack gap="lg">
        <Group>
          <Title order={1}>📝 Register New User</Title>
        </Group>

        <Paper shadow="md" p="xl" radius="md" withBorder>
          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput
                label="Name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
                required
                size="md"
              />

              <TextInput
                label="Email"
                placeholder="john@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                required
                size="md"
              />

              <PasswordInput
                label="Password"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                required
                minLength={8}
                size="md"
              />

              <Button
                type="submit"
                fullWidth
                size="md"
                loading={registerMutation.isPending}
                mt="sm"
              >
                {registerMutation.isPending ? 'Creating...' : 'Register'}
              </Button>
            </Stack>
          </form>
        </Paper>

        {message && messageType && (
          <Alert
            icon={
              messageType === 'success' ? (
                <IconCheck size={16} />
              ) : messageType === 'error' ? (
                <IconX size={16} />
              ) : (
                <IconClock size={16} />
              )
            }
            title={
              messageType === 'success'
                ? 'Success'
                : messageType === 'error'
                ? 'Error'
                : 'Processing'
            }
            color={
              messageType === 'success'
                ? 'green'
                : messageType === 'error'
                ? 'red'
                : 'blue'
            }
          >
            {message}
          </Alert>
        )}

        <Paper shadow="sm" p="lg" radius="md" withBorder bg="gray.0">
          <Stack gap="sm">
            <Group gap="xs">
              <IconFlask size={20} />
              <Title order={3} size="h4">
                Test Cases
              </Title>
            </Group>
            <List size="sm">
              <List.Item>Try registering with valid data</List.Item>
              <List.Item>Try the same email twice (should fail)</List.Item>
              <List.Item>Try password &lt; 8 chars (should fail)</List.Item>
              <List.Item>Try invalid email format (should fail)</List.Item>
            </List>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
