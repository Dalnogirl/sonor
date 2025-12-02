import { TRPCError } from '@trpc/server';
import { router } from '../init';
import { protectedProcedure } from '../procedures/protected';
import { createLessonRequestSchema } from '@/application/dto/lesson/CreateLessonRequestDTO.schema';
import { getLessonRequestSchema } from '@/application/dto/lesson/GetLessonRequestDTO.schema';
import { getMyTeachingLessonsForPeriodRequestSchema } from '@/application/dto/lesson/GetMyTeachingLessonsForPeriodRequestDTO.schema';
import { skipLessonOccurrenceRequestSchema } from '@/application/dto/lesson/SkipLessonOccurrenceRequestDTO.schema';
import { rescheduleLessonOccurrenceRequestSchema } from '@/application/dto/lesson/RescheduleLessonOccurrenceRequestDTO.schema';
import { LessonNotFoundError } from '@/domain/errors/LessonErrors';
import { UnauthorizedError } from '@/domain/errors/AuthorizationErrors';

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

  delete: protectedProcedure
    .input(getLessonRequestSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.useCases.lesson.deleteLesson.execute(
          input.lessonId,
          ctx.session.user.id
        );
        return { success: true };
      } catch (error: unknown) {
        if (error instanceof LessonNotFoundError) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: error.message,
          });
        }
        if (error instanceof UnauthorizedError) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: error.message,
          });
        }
        throw error;
      }
    }),

  /**
   * Skip a specific occurrence of a recurring lesson
   * Protected endpoint - requires authentication
   *
   * Maps domain errors to tRPC errors following Protected Variations pattern
   */
  skipOccurrence: protectedProcedure
    .input(skipLessonOccurrenceRequestSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.useCases.lesson.skipOccurrence.execute(
          input.lessonId,
          input.occurrenceDate
        );
        return { success: true };
      } catch (error: unknown) {
        if (error instanceof Error) {
          if (error.message === 'Lesson not found') {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: error.message,
            });
          }
          if (
            error.message === 'Cannot skip occurrence of non-recurring lesson'
          ) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: error.message,
            });
          }
          if (error.message === 'Exception already exists for this occurrence') {
            throw new TRPCError({
              code: 'CONFLICT',
              message: error.message,
            });
          }
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to skip lesson occurrence',
        });
      }
    }),

  /**
   * Reschedule a specific occurrence of a recurring lesson
   * Protected endpoint - requires authentication
   *
   * Maps domain errors to tRPC errors following Protected Variations pattern
   */
  rescheduleOccurrence: protectedProcedure
    .input(rescheduleLessonOccurrenceRequestSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.useCases.lesson.rescheduleOccurrence.execute(
          input.lessonId,
          input.originalDate,
          input.newDate
        );
        return { success: true };
      } catch (error: unknown) {
        if (error instanceof Error) {
          if (error.message === 'Lesson not found') {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: error.message,
            });
          }
          if (
            error.message ===
            'Cannot reschedule occurrence of non-recurring lesson'
          ) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: error.message,
            });
          }
          if (error.message === 'Exception already exists for this occurrence') {
            throw new TRPCError({
              code: 'CONFLICT',
              message: error.message,
            });
          }
          if (error.message === 'Cannot reschedule to same date') {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: error.message,
            });
          }
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to reschedule lesson occurrence',
        });
      }
    }),
});
