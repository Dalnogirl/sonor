import { TRPCError } from '@trpc/server';
import { t } from '@/adapters/trpc/init';

/**
 * Protected procedure - requires authentication
 * Throws UNAUTHORIZED if user is not logged in
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  // Check if session exists and has a user
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }

  // Continue with authenticated context
  return next({
    ctx: {
      ...ctx,
      // Override session to be non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});
