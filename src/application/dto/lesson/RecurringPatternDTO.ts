import { RecurringFrequency, DayOfWeek } from '@/domain/models/RecurringPattern';

export type RecurringPatternDTO = {
  frequency: RecurringFrequency;
  interval: number;
  daysOfWeek: DayOfWeek[];
  endDate: string | null;
  occurrences: number | null;
};
