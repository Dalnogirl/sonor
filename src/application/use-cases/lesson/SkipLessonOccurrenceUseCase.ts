import { LessonException } from '@/domain/models/LessonException';
import {
  LessonNotFoundError,
  LessonNotRecurringError,
  LessonExceptionAlreadyExistsError,
} from '@/domain/errors/LessonErrors';
import { UserNotFoundError } from '@/domain/errors/UserErrors';
import { LessonRepository } from '@/domain/ports/repositories/LessonRepository';
import { LessonExceptionRepository } from '@/domain/ports/repositories/LessonExceptionRepository';
import { UserRepository } from '@/domain/ports/repositories/UserRepository';
import { LessonAuthorizationService } from '@/domain/services/LessonAuthorizationService';

export class SkipLessonOccurrenceUseCase {
  constructor(
    private lessonRepository: LessonRepository,
    private exceptionRepository: LessonExceptionRepository,
    private userRepository: UserRepository,
    private authService: LessonAuthorizationService
  ) {}

  async execute(lessonId: string, occurrenceDate: Date, userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UserNotFoundError(userId);

    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) throw new LessonNotFoundError(lessonId);

    this.authService.assertCanSkip(user, lesson);

    if (!lesson.recurringPattern) {
      throw new LessonNotRecurringError(lessonId);
    }

    const existingException = await this.exceptionRepository.findByLessonAndDate(
      lessonId,
      occurrenceDate
    );

    if (existingException) {
      throw new LessonExceptionAlreadyExistsError(lessonId, occurrenceDate);
    }

    const exception = LessonException.skip(lessonId, occurrenceDate);
    await this.exceptionRepository.create(exception);
  }
}
