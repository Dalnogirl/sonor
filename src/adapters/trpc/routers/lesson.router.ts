import { z } from 'zod';
import { router } from '../init';
import { protectedProcedure } from '../procedures/protected';

export const lessonRouter = router({
  getMyTeachingLessonsForPeriod: protectedProcedure
    .input(
      // Define input schema here, e.g., using zod
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { startDate, endDate } = input;
      const lessons =
        await ctx.useCases.lesson.getMyTeachingLessonsForPeriod.execute({
          userId: ctx.session.user.id,
          startDate,
          endDate,
        });
      return lessons;
    }),
});
