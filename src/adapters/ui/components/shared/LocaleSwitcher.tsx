'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { SegmentedControl } from '@mantine/core';
import { locales } from '@/i18n/config';

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <SegmentedControl
      value={locale}
      onChange={(value) => router.replace(pathname, { locale: value })}
      data={locales.map((l) => ({ value: l, label: l.toUpperCase() }))}
      size="xs"
    />
  );
}
