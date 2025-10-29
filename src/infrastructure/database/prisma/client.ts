/**
 * Prisma Client Singleton
 * 
 * This implements the Singleton Pattern to ensure only one Prisma Client
 * instance exists throughout the application lifecycle.
 * 
 * Important for:
 * - Preventing connection pool exhaustion
 * - Ensuring consistent database state
 * - Development hot-reload compatibility
 */

import { PrismaClient } from '@prisma/client';
import { env } from '@/config/env';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
