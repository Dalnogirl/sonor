import { z } from 'zod';
import { recurringPatternInputSchema } from './ReccurringPatternInput.schema';

export const editLessonRequestSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  teacherIds: z.array(z.string()).min(1, 'At least one teacher required'),
  pupilIds: z.array(z.string()).min(1, 'At least one pupil required'),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  recurringPattern: recurringPatternInputSchema.optional(),
});

export type EditLessonRequestDTO = z.infer<typeof editLessonRequestSchema>;
