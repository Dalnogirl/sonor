import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { ColorSchemeScript } from '@mantine/core';
import { AppLayout } from '@/adapters/ui/components/shared/AppLayout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { JetBrains_Mono } from 'next/font/google';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: 'Sonor - Music School Management',
  description: 'Fullstack music school management application',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body className={jetbrainsMono.variable}>
        <Providers session={session}>
          <AppLayout>{children}</AppLayout>
        </Providers>
      </body>
    </html>
  );
}
