'use client';

import { trpc } from '@/lib/trpc';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { SessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';
import '@mantine/notifications/styles.css';

export const Providers = ({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) => {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: 'http://localhost:3000/api/trpc',
        }),
      ],
    })
  );
  return (
    <SessionProvider session={session}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <CustomMantineProvider>{children}</CustomMantineProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </SessionProvider>
  );
};

function CustomMantineProvider({ children }: { children: React.ReactNode }) {
  const accentColor = 'orange';
  return (
    <MantineProvider
      defaultColorScheme="auto"
      theme={{
        primaryColor: accentColor, // Main accent color - affects buttons, links, etc.
        // You can use: blue, cyan, teal, green, lime, yellow, orange, red, pink, grape, violet, indigo

        // Optional: customize other theme aspects
        // fontFamily: 'Your Font, sans-serif',
        // headings: { fontFamily: 'Your Heading Font, serif' },
        components: {
          Avatar: {
            defaultProps: {
              color: accentColor,
            },
          },
        },
      }}
    >
      <Notifications />
      {children}
    </MantineProvider>
  );
}
