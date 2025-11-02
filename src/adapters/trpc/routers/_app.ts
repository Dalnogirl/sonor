import { router } from '../init';
import { authRouter } from './auth.router';
import { userRouter } from './user.router';

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
