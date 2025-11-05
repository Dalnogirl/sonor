import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { ColorSchemeScript } from '@mantine/core';
import { Navbar } from '@/adapters/ui/components/shared/Navbar';
import { Footer } from '@/adapters/ui/components/shared/Footer';

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
      <body
        style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
      >
        <Providers>
          <Navbar />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
