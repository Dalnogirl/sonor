import { TRPCError } from '@trpc/server';
import { router } from '../init';
import { protectedProcedure } from '../procedures/protected';
import { createLessonRequestSchema } from '@/application/dto/lesson/CreateLessonRequestDTO.schema';
import { getLessonRequestSchema } from '@/application/dto/lesson/GetLessonRequestDTO.schema';
import { getMyTeachingLessonsForPeriodRequestSchema } from '@/application/dto/lesson/GetMyTeachingLessonsForPeriodRequestDTO.schema';
import { LessonNotFoundError } from '@/domain/errors/LessonErrors';

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
    .input(getMyTeachingLessonsForPeriodRequestSchema)
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
  getLessonById: protectedProcedure
    .input(getLessonRequestSchema)
    .query(async ({ ctx, input }) => {
      try {
        const lesson = await ctx.useCases.lesson.getLesson.execute(input);
        return lesson;
      } catch (error: unknown) {
        if (error instanceof LessonNotFoundError) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: error.message,
          });
        }
        throw error;
      }
    }),
});
