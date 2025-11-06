import { Lesson } from '@/domain/models/Lesson';

export type LessonResponseDTO = Pick<
  Lesson,
  | 'id'
  | 'title'
  | 'description'
  | 'startDate'
  | 'endDate'
  | 'recurringPattern'
  | 'teachers'
  | 'pupils'
>;
