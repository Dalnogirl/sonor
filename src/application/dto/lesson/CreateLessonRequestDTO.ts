import { z } from 'zod';
import { createLessonRequestSchema } from './CreateLessonRequestDTO.schema';

export type CreateLessonRequestDTO = z.infer<typeof createLessonRequestSchema>;
