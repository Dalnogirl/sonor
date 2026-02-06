/**
 * Environment Configuration using t3-env
 * 
 * This follows the Single Responsibility Principle (SRP) - 
 * one place to define and validate all environment variables.
 */

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    // NEXTAUTH_SECRET: z.string().min(1),
    // NEXTAUTH_URL: z.preprocess(
    //   (str) => process.env.VERCEL_URL ?? str,
    //   z.string().url()
    // ),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
