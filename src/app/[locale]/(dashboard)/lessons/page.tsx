import { redirect } from '@/i18n/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { LessonsPageClient } from '@/adapters/ui/components/lessons/LessonsPageClient';
import { setRequestLocale } from 'next-intl/server';

export default async function LessonsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return redirect({ href: '/login', locale });
  }

  return <LessonsPageClient />;
}
