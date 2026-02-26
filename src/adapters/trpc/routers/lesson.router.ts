import { router } from '../init';
import { protectedProcedure } from '../procedures/protected';
import { mapDomainError } from '../utils/mapDomainError';
import { createLessonRequestSchema } from '@/application/dto/lesson/CreateLessonRequestDTO.schema';
import { getLessonRequestSchema } from '@/application/dto/lesson/GetLessonRequestDTO.schema';
import { getMyTeachingLessonsForPeriodRequestSchema } from '@/application/dto/lesson/GetMyTeachingLessonsForPeriodRequestDTO.schema';
import { skipLessonOccurrenceRequestSchema } from '@/application/dto/lesson/SkipLessonOccurrenceRequestDTO.schema';

export const lessonRouter = router({
  create: protectedProcedure
    .input(createLessonRequestSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.useCases.lesson.createLesson.execute(input);
      } catch (error) {
        throw mapDomainError(error);
      }
    }),

  getMyTeachingLessonsForPeriod: protectedProcedure
    .input(getMyTeachingLessonsForPeriodRequestSchema)
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.useCases.lesson.getMyTeachingLessonsForPeriod.execute({
          userId: ctx.session.user.id,
          startDate: input.startDate,
          endDate: input.endDate,
        });
      } catch (error) {
        throw mapDomainError(error);
      }
    }),

  getLessonById: protectedProcedure
    .input(getLessonRequestSchema)
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.useCases.lesson.getLesson.execute(input);
      } catch (error) {
        throw mapDomainError(error);
      }
    }),

  delete: protectedProcedure
    .input(getLessonRequestSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.useCases.lesson.deleteLesson.execute(
          input.lessonId,
          ctx.session.user.id
        );
        return { success: true };
      } catch (error) {
        throw mapDomainError(error);
      }
    }),

  skipOccurrence: protectedProcedure
    .input(skipLessonOccurrenceRequestSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.useCases.lesson.skipOccurrence.execute(
          input.lessonId,
          input.occurrenceDate
        );
        return { success: true };
      } catch (error) {
        throw mapDomainError(error);
      }
    }),

});
