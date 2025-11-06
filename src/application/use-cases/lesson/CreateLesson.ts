import { CreateLessonRequestDTO } from '@/application/dto/lesson/CreateLessonRequestDTO';
import { Lesson } from '@/domain/models/Lesson';
import { LessonRepository } from '@/domain/ports/repositories/LessonRepository';
import { UserRepository } from '@/domain/ports/repositories/UserRepository';

export class CreateLesson {
  constructor(
    private lessonRepository: LessonRepository,
    private userRepository: UserRepository
  ) {}

  async execute(lessonData: CreateLessonRequestDTO): Promise<Lesson> {
    const teachersPromise = this.userRepository.findByIds(
      lessonData.teacherIds
    );
    const pupilsPromise = this.userRepository.findByIds(lessonData.pupilIds);
    const [teachers, pupils] = await Promise.all([
      teachersPromise,
      pupilsPromise,
    ]);
    const lesson = Lesson.createWithDefaults(
      lessonData.title,
      teachers,
      pupils,
      lessonData.startDate,
      lessonData.endDate,
      lessonData.description,
      lessonData.recurringPattern
    );
    return this.lessonRepository.create(lesson);
  }
}
