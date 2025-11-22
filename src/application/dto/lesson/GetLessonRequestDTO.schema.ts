import { z } from 'zod';
import { GetLessonRequestDTO } from './GetLessonRequestDTO';

/**
 * Zod schema for GetLessonRequestDTO
 *
 * **Purpose:** Runtime validation for lesson ID lookup
 *
 * **Pattern:** Schema-DTO alignment via satisfies
 * - Schema validates UUID format at runtime
 * - TypeScript ensures schema matches DTO structure
 * - Single source of truth: DTO defines contract
 *
 * **Applies:**
 * - Protected Variations: Schema changes don't affect domain
 * - Type Safety: Compile-time verification
 */
export const getLessonRequestSchema = z.object({
  lessonId: z.string().uuid('Invalid lesson ID format'),
}) satisfies z.ZodType<GetLessonRequestDTO>;
