import { Lesson } from '@/domain/models/Lesson';
import { UserSummaryDTO } from '../user/UserSummaryDTO';

export type LessonWithUsersResponseDTO = Pick<
  Lesson,
  'id' | 'title' | 'description' | 'startDate' | 'endDate' | 'recurringPattern'
> & {
  teachers: UserSummaryDTO[];
  pupils: UserSummaryDTO[];
};
