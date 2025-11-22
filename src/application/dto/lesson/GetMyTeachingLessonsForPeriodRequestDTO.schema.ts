import { z } from 'zod';
import { GetMyTeachingLessonsForPeriodRequestDTO } from './GetMyTeachingLessonsForPeriodRequestDTO';

/**
 * Zod schema for GetMyTeachingLessonsForPeriodRequestDTO
 *
 * **Purpose:** Runtime validation for date range queries
 *
 * **Pattern:** Schema-DTO alignment via satisfies
 * - Schema coerces ISO strings to Date objects
 * - TypeScript ensures schema matches DTO structure
 * - Single source of truth: DTO defines contract
 *
 * **Applies:**
 * - Protected Variations: Schema changes don't affect domain
 * - Type Safety: Compile-time verification
 */
export const getMyTeachingLessonsForPeriodRequestSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
}) satisfies z.ZodType<GetMyTeachingLessonsForPeriodRequestDTO>;
