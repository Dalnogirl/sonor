import { LessonException } from '@/domain/models/LessonException';
import {
  LessonNotFoundError,
  LessonNotRecurringError,
  LessonExceptionAlreadyExistsError,
} from '@/domain/errors/LessonErrors';
import { LessonRepository } from '@/domain/ports/repositories/LessonRepository';
import { LessonExceptionRepository } from '@/domain/ports/repositories/LessonExceptionRepository';

/**
 * SkipLessonOccurrence Use Case
 *
 * Marks specific occurrence of recurring lesson as skipped.
 * Validates lesson exists and has recurring pattern.
 *
 * **Design Principles:**
 * - Single Responsibility: Only handles skip operation
 * - Controller (GRASP): Orchestrates repositories + domain logic
 * - Information Expert: Domain entity creates exception
 */
export class SkipLessonOccurrenceUseCase {
  constructor(
    private lessonRepository: LessonRepository,
    private exceptionRepository: LessonExceptionRepository
  ) {}

  async execute(lessonId: string, occurrenceDate: Date): Promise<void> {
    // Validate lesson exists
    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) {
      throw new LessonNotFoundError(lessonId);
    }

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

    // Create skip exception (domain factory method)
    const exception = LessonException.skip(lessonId, occurrenceDate);

    // Persist
    await this.exceptionRepository.create(exception);
  }
}
