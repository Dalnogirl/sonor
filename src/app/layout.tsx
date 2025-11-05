import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { ColorSchemeScript } from '@mantine/core';
import { Navbar } from '@/adapters/ui/components/shared/Navbar';

export const metadata: Metadata = {
  title: 'Sonor - Music School Management',
  description: 'Fullstack music school management application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
