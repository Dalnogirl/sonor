import { z } from 'zod';
import { SkipLessonOccurrenceRequestDTO } from './SkipLessonOccurrenceRequestDTO';

/**
 * Zod schema for SkipLessonOccurrenceRequestDTO
 *
 * Validates skip operation input:
 * - lessonId must be valid UUID
 * - occurrenceDate must be valid date
 */
export const skipLessonOccurrenceRequestSchema = z.object({
  lessonId: z.string().uuid('Invalid lesson ID format'),
  occurrenceDate: z.coerce.date(),
}) satisfies z.ZodType<SkipLessonOccurrenceRequestDTO>;
