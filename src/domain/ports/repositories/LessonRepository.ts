import { Lesson } from '@/domain/models/Lesson';

export interface LessonRepository {
  findMyTeachingLessonsForPeriod(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Lesson[]>;

  createLesson(lessonData: Lesson): Promise<Lesson>;
}
