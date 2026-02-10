import { z } from 'zod';
import { router } from '@/adapters/trpc/init';
import { publicProcedure } from '@/adapters/trpc/procedures/public';
import { protectedProcedure } from '@/adapters/trpc/procedures/protected';
import { mapDomainError } from '../utils/mapDomainError';

export const authRouter = router({
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email format'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.useCases.auth.register.execute(input);
      } catch (error) {
        throw mapDomainError(error);
      }
    }),

  getSession: publicProcedure.query(async ({ ctx }) => {
    return ctx.session;
  }),

  me: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.useCases.auth.getCurrentUser.execute(
        ctx.session.user.id
      );
    } catch (error) {
      throw mapDomainError(error);
    }
  }),
});
