import { Lesson } from '@/domain/models/Lesson';
import { RecurringFrequency } from '@/domain/models/RecurringPattern';

export interface RecurringPatternInput {
  frequency: RecurringFrequency;
  interval: number;
  daysOfWeek?: number[];
  endDate?: Date;
  occurrences?: number;
}

export type CreateLessonRequestDTO = Pick<
  Lesson,
  'description' | 'title' | 'startDate' | 'endDate'
> & {
  teacherIds: string[];
  pupilIds: string[];
  recurringPattern?: RecurringPatternInput;
};
