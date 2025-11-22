import { GetMyTeachingLessonsForPeriodRequestDTO } from '@/application/dto/lesson/GetMyTeachingLessonsForPeriodRequestDTO';
import { Lesson } from '@/domain/models/Lesson';
import { LessonRepository } from '@/domain/ports/repositories/LessonRepository';

export class GetMyTeachingLessonsForPeriod {
  constructor(private repository: LessonRepository) {}
  async execute(
    lessonDTO: GetMyTeachingLessonsForPeriodRequestDTO & { userId: string }
  ): Promise<Lesson[]> {
    console.log('Getting lessons for DTO:', lessonDTO);
    const lessons = await this.repository.findMyTeachingLessonsForPeriod(
      lessonDTO.userId,
      lessonDTO.startDate,
      lessonDTO.endDate
    );
    return lessons;
  }
}
