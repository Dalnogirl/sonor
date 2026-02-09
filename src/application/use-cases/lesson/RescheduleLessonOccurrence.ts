import { LessonException } from '@/domain/models/LessonException';
import {
  LessonNotFoundError,
  LessonNotRecurringError,
  LessonExceptionAlreadyExistsError,
} from '@/domain/errors/LessonErrors';
import { LessonRepository } from '@/domain/ports/repositories/LessonRepository';
import { LessonExceptionRepository } from '@/domain/ports/repositories/LessonExceptionRepository';

/**
 * RescheduleLessonOccurrence Use Case
 *
 * Moves specific occurrence of recurring lesson to new date.
 * Validates lesson exists, has recurring pattern, and new date is valid.
 *
 * **Design Principles:**
 * - Single Responsibility: Only handles reschedule operation
 * - Controller (GRASP): Orchestrates validation + persistence
 * - Information Expert: Domain entity validates invariants
 */
export class RescheduleLessonOccurrence {
  constructor(
    private lessonRepository: LessonRepository,
    private exceptionRepository: LessonExceptionRepository
  ) {}

  async execute(
    lessonId: string,
    originalDate: Date,
    newDate: Date
  ): Promise<void> {
    // Validate lesson exists
    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) {
      throw new LessonNotFoundError(lessonId);
    }

    if (!lesson.recurringPattern) {
      throw new LessonNotRecurringError(lessonId);
    }

    const existingException =
      await this.exceptionRepository.findByLessonAndDate(
        lessonId,
        originalDate
      );

    if (existingException) {
      throw new LessonExceptionAlreadyExistsError(lessonId, originalDate);
    }

    // Create reschedule exception (domain factory validates newDate != originalDate)
    const exception = LessonException.reschedule(
      lessonId,
      originalDate,
      newDate
    );

    // Persist
    await this.exceptionRepository.create(exception);
  }
}
