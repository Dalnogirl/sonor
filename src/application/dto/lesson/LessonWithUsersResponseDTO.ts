import { Lesson } from '@/domain/models/Lesson';
import { UserSummaryDTO } from '../user/UserSummaryDTO';
import { RecurringPatternDTO } from './RecurringPatternDTO';

export type LessonWithUsersResponseDTO = Pick<
  Lesson,
  'id' | 'title' | 'description'
> & {
  teachers: UserSummaryDTO[];
  pupils: UserSummaryDTO[];
  startDate: string;
  endDate: string;
  recurringPattern?: RecurringPatternDTO;
};
