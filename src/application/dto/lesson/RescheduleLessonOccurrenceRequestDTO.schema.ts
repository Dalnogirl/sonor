import { z } from 'zod';
import { RescheduleLessonOccurrenceRequestDTO } from './RescheduleLessonOccurrenceRequestDTO';

/**
 * Zod schema for RescheduleLessonOccurrenceRequestDTO
 *
 * Validates reschedule operation input:
 * - lessonId must be valid UUID
 * - originalDate and newDate must be valid dates
 * - Business rule validation (newDate != originalDate) happens in domain
 */
export const rescheduleLessonOccurrenceRequestSchema = z.object({
  lessonId: z.string().uuid('Invalid lesson ID format'),
  originalDate: z.coerce.date(),
  newDate: z.coerce.date(),
}) satisfies z.ZodType<RescheduleLessonOccurrenceRequestDTO>;
