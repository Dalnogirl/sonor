/**
 * Application Constants
 * 
 * Centralized constants following DRY (Don't Repeat Yourself) principle.
 */

export const APP_CONFIG = {
  name: "Sonor Next",
  description: "Fullstack music school management application",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

export const POST_CONFIG = {
  MIN_TITLE_LENGTH: 1,
  MAX_TITLE_LENGTH: 200,
  MIN_CONTENT_LENGTH: 100,
} as const;
