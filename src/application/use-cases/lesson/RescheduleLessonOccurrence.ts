import { LessonException } from '@/domain/models/LessonException';
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
      throw new Error('Lesson not found');
    }

    // Validate lesson is recurring
    if (!lesson.recurringPattern) {
      throw new Error('Cannot reschedule occurrence of non-recurring lesson');
    }

    // Check if exception already exists
    const existingException = await this.exceptionRepository.findByLessonAndDate(
      lessonId,
      originalDate
    );

    if (existingException) {
      throw new Error('Exception already exists for this occurrence');
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
