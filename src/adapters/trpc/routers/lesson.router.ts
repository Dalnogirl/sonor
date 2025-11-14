import { z } from 'zod';
import { router } from '../init';
import { protectedProcedure } from '../procedures/protected';
import { createLessonRequestSchema } from '@/application/dto/lesson/CreateLessonRequestDTO.schema';

export const lessonRouter = router({
  /**
   * Create a new lesson
   * Protected endpoint - requires authentication
   *
   * Uses createLessonRequestSchema to ensure tRPC input matches CreateLessonRequestDTO
   */
  create: protectedProcedure
    .input(createLessonRequestSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.useCases.lesson.createLesson.execute(input);
    }),

  getMyTeachingLessonsForPeriod: protectedProcedure
    .input(
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
