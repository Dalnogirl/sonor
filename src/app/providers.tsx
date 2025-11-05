'use client';

import { trpc } from '@/lib/trpc';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import { MantineProvider } from '@mantine/core';
import { SessionProvider } from 'next-auth/react';

export const Providers = ({ children }: { children: React.ReactNode }) => {
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
    <SessionProvider>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <CustomMantineProvider>{children}</CustomMantineProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </SessionProvider>
  );
};

function CustomMantineProvider({ children }: { children: React.ReactNode }) {
  const accentColor = 'pink';
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
      {children}
    </MantineProvider>
  );
}
