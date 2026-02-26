import { RecurringFrequency } from '@/domain/models/RecurringPattern';
import z from 'zod';

export const recurringPatternInputSchema = z.object({
  frequency: z.nativeEnum(RecurringFrequency),
  interval: z.number().int().min(1, 'Interval must be at least 1'),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
  endDate: z.coerce.date().optional(),
  occurrences: z
    .number()
    .int()
    .min(1, 'Occurrences must be at least 1')
    .optional(),
});

export type RecurringPatternInput = z.infer<typeof recurringPatternInputSchema>;
