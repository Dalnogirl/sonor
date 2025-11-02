import { z } from 'zod';
import { router } from '@/adapters/trpc/init';
import { publicProcedure } from '@/adapters/trpc/procedures/public';
import { protectedProcedure } from '@/adapters/trpc/procedures/protected';

export const authRouter = router({
  /**
   * Register a new user
   * Public endpoint - anyone can register
   *
   * Validation:
   * - Format validation: Zod schema (adapter layer)
   * - Business validation: Use case (application layer)
   */
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email format'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Input IS the DTO - no mapping needed!
      // Use case returns safe UserResponseDTO
      return ctx.useCases.auth.register.execute(input);
    }),

  /**
   * Get current session
   * Public endpoint - returns null if not logged in
   */
  getSession: publicProcedure.query(async ({ ctx }) => {
    return ctx.session;
  }),

  /**
   * Get current user (protected)
   * Requires authentication
   */
  me: protectedProcedure.query(async ({ ctx }) => {
    // Find user by ID from session
    const user = await ctx.repositories.userRepository.findById(
      ctx.session.user.id
    );

    if (!user) {
      throw new Error('User not found');
    }

    // Map domain entity to response DTO
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }),
});
