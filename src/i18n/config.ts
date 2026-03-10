export const locales = ['en', 'ru', 'pl'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';
