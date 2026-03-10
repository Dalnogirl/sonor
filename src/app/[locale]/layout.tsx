import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Providers } from '../providers';
import { ColorSchemeScript } from '@mantine/core';
import { AppLayout } from '@/adapters/ui/components/shared/AppLayout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { JetBrains_Mono } from 'next/font/google';
import '../globals.css';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: 'Sonor - Music School Management',
  description: 'Fullstack music school management application',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const session = await getServerSession(authOptions);

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body className={jetbrainsMono.variable}>
        <NextIntlClientProvider messages={messages}>
          <Providers session={session}>
            <AppLayout>{children}</AppLayout>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
