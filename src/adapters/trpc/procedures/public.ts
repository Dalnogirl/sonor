import { t } from '@/adapters/trpc/init';

/**
 * Public procedure - no authentication required
 * Available to everyone
 */
export const publicProcedure = t.procedure;
