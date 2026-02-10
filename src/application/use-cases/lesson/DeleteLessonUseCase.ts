import { UnauthorizedError } from '@/domain/errors/AuthorizationErrors';
import { LessonNotFoundError } from '@/domain/errors/LessonErrors';
import { LessonRepository } from '@/domain/ports/repositories/LessonRepository';
import { Logger } from '@/domain/ports/services/Logger';

export class DeleteLessonUseCase {
  constructor(
    private lessonRepository: LessonRepository,
    private logger: Logger
  ) {}

  async execute(lessonId: string, userId: string): Promise<void> {
    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) {
      throw new LessonNotFoundError(lessonId);
    }

    if (!lesson.hasTeacher(userId)) {
      throw new UnauthorizedError('Only teachers can delete their lessons');
    }

    lesson.delete();
    await this.lessonRepository.save(lesson);
    this.logger.info(`Lesson ${lessonId} soft-deleted by user ${userId}`);
  }
}
