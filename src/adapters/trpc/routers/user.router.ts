import { publicProcedure, router } from '../init';
import { z } from 'zod';

export const userRouter = router({
  list: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).optional(),
        pageSize: z.number().min(1).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const users = await ctx.useCases.user.listUsersUseCase.execute(input);
      return users;
    }),
});
