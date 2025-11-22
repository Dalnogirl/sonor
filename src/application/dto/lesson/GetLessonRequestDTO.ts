import { Lesson } from '@/domain/models/Lesson';

export type GetLessonRequestDTO = {
  lessonId: Lesson['id'];
};
