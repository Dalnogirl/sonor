import { z } from 'zod';

/**
 * Lesson form validation schema
 *
 * Applies:
 * - Single Responsibility: schema only defines validation rules
 * - Information Expert: knows what constitutes valid lesson form data
 * - Reusability: can be shared across components or with tRPC
 * - Type safety: TypeScript types inferred from schema
 */
export const createLessonSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    pupilIds: z.array(z.string()).min(1, 'At least one pupil is required'),
    teacherIds: z.array(z.string()).min(1, 'At least one teacher is required'),
    day: z.date({ required_error: 'Day is required' }),
    startTime: z.string().min(1, 'Start time is required'),
    endTime: z.string().min(1, 'End time is required'),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: 'End time must be after start time',
    path: ['endTime'],
  });

export type CreateLessonFormValues = z.infer<typeof createLessonSchema>;
