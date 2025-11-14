import { z } from 'zod';
import { CreateLessonRequestDTO } from './CreateLessonRequestDTO';

/**
 * Zod schema for CreateLessonRequestDTO
 *
 * **Purpose:** Ensures runtime validation matches compile-time DTO type
 *
 * **Pattern:** Schema-DTO alignment
 * - Schema defines validation rules
 * - TypeScript assertion ensures schema infers to DTO type
 * - Prevents schema drift from DTO definition
 *
 * **Applies:**
 * - Single Source of Truth: DTO defines contract, schema validates it
 * - Type Safety: Compile-time check that schema matches DTO
 * - Protected Variations: Changes to DTO force schema updates
 */
export const createLessonRequestSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  teacherIds: z.array(z.string()).min(1, 'At least one teacher required'),
  pupilIds: z.array(z.string()).min(1, 'At least one pupil required'),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  recurringPattern: z.any().optional(),
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
