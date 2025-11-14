import { router } from '../init';
import { authRouter } from './auth.router';
import { userRouter } from './user.router';
import { lessonRouter } from './lesson.router';

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  lesson: lessonRouter,
});

export type AppRouter = typeof appRouter;
