import { LessonException } from '@/domain/models/LessonException';
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
export class SkipLessonOccurrence {
  constructor(
    private lessonRepository: LessonRepository,
    private exceptionRepository: LessonExceptionRepository
  ) {}

  async execute(lessonId: string, occurrenceDate: Date): Promise<void> {
    // Validate lesson exists
    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    // Validate lesson is recurring
    if (!lesson.recurringPattern) {
      throw new Error('Cannot skip occurrence of non-recurring lesson');
    }

    // Check if exception already exists
    const existingException = await this.exceptionRepository.findByLessonAndDate(
      lessonId,
      occurrenceDate
    );

    if (existingException) {
      throw new Error('Exception already exists for this occurrence');
    }

    // Create skip exception (domain factory method)
    const exception = LessonException.skip(lessonId, occurrenceDate);

    // Persist
    await this.exceptionRepository.create(exception);
  }
}
