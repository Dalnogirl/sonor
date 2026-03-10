import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale;
  }

  const common = (await import(`./messages/${locale}/common.json`)).default;
  const auth = (await import(`./messages/${locale}/auth.json`)).default;
  const lessons = (await import(`./messages/${locale}/lessons.json`)).default;
  const users = (await import(`./messages/${locale}/users.json`)).default;
  const profile = (await import(`./messages/${locale}/profile.json`)).default;
  const errors = (await import(`./messages/${locale}/errors.json`)).default;

  return {
    locale,
    messages: { common, auth, lessons, users, profile, errors },
  };
});
