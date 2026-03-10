import { LessonNotFoundError } from '@/domain/errors/LessonErrors';
import { UserNotFoundError } from '@/domain/errors/UserErrors';
import { LessonRepository } from '@/domain/ports/repositories/LessonRepository';
import { UserRepository } from '@/domain/ports/repositories/UserRepository';
import { Logger } from '@/domain/ports/services/Logger';
import { LessonAuthorizationService } from '@/domain/services/LessonAuthorizationService';

export class DeleteLessonUseCase {
  constructor(
    private lessonRepository: LessonRepository,
    private logger: Logger,
    private userRepository: UserRepository,
    private authService: LessonAuthorizationService
  ) {}

  async execute(lessonId: string, userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UserNotFoundError(userId);

    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) throw new LessonNotFoundError(lessonId);

    this.authService.assertCanDelete(user, lesson);

    lesson.delete();
    await this.lessonRepository.save(lesson);
    this.logger.info(`Lesson ${lessonId} soft-deleted by user ${userId}`);
  }
}
