import { z } from 'zod';
import { RecurringFrequency } from '@/domain/models/RecurringPattern';
import { CreateLessonRequestDTO } from './CreateLessonRequestDTO';

const recurringPatternInputSchema = z.object({
  frequency: z.nativeEnum(RecurringFrequency),
  interval: z.number().int().min(1, 'Interval must be at least 1'),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
  endDate: z.coerce.date().optional(),
  occurrences: z.number().int().min(1, 'Occurrences must be at least 1').optional(),
});

export const createLessonRequestSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  teacherIds: z.array(z.string()).min(1, 'At least one teacher required'),
  pupilIds: z.array(z.string()).min(1, 'At least one pupil required'),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  recurringPattern: recurringPatternInputSchema.optional(),
}) satisfies z.ZodType<CreateLessonRequestDTO>;

/**
 * Type assertion: Ensures inferred schema type matches DTO
 * If DTO changes, TypeScript will error here
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _AssertSchemaMatchesDTO = z.infer<typeof createLessonRequestSchema> extends CreateLessonRequestDTO
  ? CreateLessonRequestDTO extends z.infer<typeof createLessonRequestSchema>
    ? true
    : never
  : never;
