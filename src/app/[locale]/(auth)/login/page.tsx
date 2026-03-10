'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from '@/i18n/navigation';
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
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

type MessageType = 'success' | 'error' | null;

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations('auth.login');
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
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setMessage(t('invalidCredentials'));
        setMessageType('error');
        setIsLoading(false);
      } else if (result?.ok) {
        setMessage(t('success'));
        setMessageType('success');
        router.push('/users');
        router.refresh();
      }
    } catch {
      setMessage(t('unexpectedError'));
      setMessageType('error');
      setIsLoading(false);
    }
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
                label={t('email')}
                placeholder={t('emailPlaceholder')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                required
                size="md"
                disabled={isLoading}
              />

              <PasswordInput
                label={t('password')}
                placeholder={t('passwordPlaceholder')}
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
                {isLoading ? t('submitting') : t('submit')}
              </Button>

              <Text size="sm" ta="center" mt="md">
                {t('noAccount')}{' '}
                <Anchor component={Link} href="/register">
                  {t('registerLink')}
                </Anchor>
              </Text>
            </Stack>
          </form>
        </Paper>
      </Stack>
    </Container>
  );
}
