import { z } from 'zod';
import { RecurringFrequency } from '@/domain/models/RecurringPattern';

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
    description: z.string().optional(),
    pupilIds: z.array(z.string()).min(1, 'At least one pupil is required'),
    teacherIds: z.array(z.string()).min(1, 'At least one teacher is required'),
    day: z.coerce.date({ required_error: 'Day is required' }),
    startTime: z.string().min(1, 'Start time is required'),
    endTime: z.string().min(1, 'End time is required'),
    // Recurring pattern fields
    isRecurring: z.boolean().default(false),
    frequency: z.nativeEnum(RecurringFrequency).optional(),
    interval: z.coerce.number().min(1, 'Interval must be at least 1').optional(),
    daysOfWeek: z.array(z.number().min(0).max(6)).default([]),
    endType: z.enum(['never', 'date', 'occurrences']).default('never'),
    endDate: z.coerce.date().nullable().optional(),
    occurrences: z.coerce.number().min(1, 'Occurrences must be at least 1').nullable().optional(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: 'End time must be after start time',
    path: ['endTime'],
  })
  .refine(
    (data) => {
      if (!data.isRecurring) return true;
      return data.frequency !== undefined && data.interval !== undefined;
    },
    {
      message: 'Frequency and interval are required for recurring lessons',
      path: ['frequency'],
    }
  )
  .refine(
    (data) => {
      if (!data.isRecurring) return true;
      if (data.frequency !== RecurringFrequency.WEEKLY) return true;
      return data.daysOfWeek.length > 0;
    },
    {
      message: 'At least one day must be selected for weekly recurrence',
      path: ['daysOfWeek'],
    }
  )
  .refine(
    (data) => {
      if (!data.isRecurring) return true;
      if (data.endType !== 'date') return true;
      return data.endDate !== null && data.endDate !== undefined;
    },
    {
      message: 'End date is required when end type is date',
      path: ['endDate'],
    }
  )
  .refine(
    (data) => {
      if (!data.isRecurring) return true;
      if (data.endType !== 'occurrences') return true;
      return data.occurrences !== null && data.occurrences !== undefined;
    },
    {
      message: 'Number of occurrences is required when end type is occurrences',
      path: ['occurrences'],
    }
  );

export type CreateLessonFormValues = z.infer<typeof createLessonSchema>;
