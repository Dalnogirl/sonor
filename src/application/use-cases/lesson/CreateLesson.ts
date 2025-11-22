import { CreateLessonRequestDTO } from '@/application/dto/lesson/CreateLessonRequestDTO';
import { Lesson } from '@/domain/models/Lesson';
import { LessonRepository } from '@/domain/ports/repositories/LessonRepository';

/**
 * CreateLesson Use Case
 *
 * **Simplified with IDs-Only Approach**
 * - No need for UserRepository - we work directly with IDs
 * - No user hydration - just pass IDs through
 * - Much simpler and more performant!
 * - If you need to return user details in response, hydrate in presentation layer
 */
export class CreateLesson {
  constructor(private lessonRepository: LessonRepository) {}

  async execute(lessonData: CreateLessonRequestDTO): Promise<Lesson> {
    const lesson = Lesson.create(
      lessonData.title,
      lessonData.teacherIds,
      lessonData.pupilIds,
      lessonData.startDate,
      lessonData.endDate,
      lessonData.description,
      lessonData.recurringPattern
    );

    await this.lessonRepository.create(lesson);

    return lesson;
  }
}
