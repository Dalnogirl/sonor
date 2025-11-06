import { Lesson } from '@/domain/models/Lesson';

export type CreateLessonRequestDTO = Pick<
  Lesson,
  'description' | 'title' | 'startDate' | 'endDate' | 'recurringPattern'
> & {
  teacherIds: string[];
  pupilIds: string[];
};
