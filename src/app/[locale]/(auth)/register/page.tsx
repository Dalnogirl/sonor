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
  Group,
} from '@mantine/core';
import { IconCheck, IconX, IconClock } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

type MessageType = 'success' | 'error' | 'loading' | null;

export default function RegisterPage() {
  const t = useTranslations('auth.register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<MessageType>(null);

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      setMessage(t('success', { email: data.email, id: data.id }));
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
    setMessage(t('creating'));
    setMessageType('loading');
    registerMutation.mutate({ name, email, password });
  };

  return (
    <Container size="sm" py="xl">
      <Stack gap="lg">
        <Group>
          <Title order={1}>{t('title')}</Title>
        </Group>

        <Paper shadow="md" p="xl" radius="md" withBorder>
          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput
                label={t('name')}
                placeholder={t('namePlaceholder')}
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
                required
                size="md"
              />

              <TextInput
                label={t('email')}
                placeholder={t('emailPlaceholder')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                required
                size="md"
              />

              <PasswordInput
                label={t('password')}
                placeholder={t('passwordPlaceholder')}
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
                {registerMutation.isPending ? t('submitting') : t('submit')}
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
                ? t('alertSuccess')
                : messageType === 'error'
                ? t('alertError')
                : t('alertProcessing')
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
      </Stack>
    </Container>
  );
}
