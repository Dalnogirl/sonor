import { publicProcedure, router } from '../init';

export const userRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    const users = await ctx.useCases.user.listUsersUseCase.execute();
    return users;
  }),
});
