import { LessonException } from '@/domain/models/LessonException';

/**
 * LessonExceptionRepository Port
 *
 * Manages exceptions to recurring lesson patterns.
 * Follows sparse storage pattern - only stores deviations.
 *
 * **Design Principles:**
 * - Interface Segregation: Focused interface for exception operations
 * - Dependency Inversion: Domain depends on abstraction, infrastructure implements
 */
export interface LessonExceptionRepository {
  /**
   * Find all exceptions for a specific lesson
   */
  findByLessonId(lessonId: string): Promise<LessonException[]>;

  /**
   * Find exception for specific lesson occurrence
   */
  findByLessonAndDate(
    lessonId: string,
    originalDate: Date
  ): Promise<LessonException | null>;

  /**
   * Find all exceptions within a date range (across all lessons)
   * Useful for calendar views
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<LessonException[]>;

  /**
   * Find exceptions for specific lessons within a date range
   * Optimized for bulk operations (prevents N+1 queries)
   */
  findByLessonIdsAndDateRange(
    lessonIds: string[],
    startDate: Date,
    endDate: Date
  ): Promise<LessonException[]>;

  /**
   * Create a new exception
   * Use case validates no duplicate exists
   */
  create(exception: LessonException): Promise<LessonException>;

  /**
   * Delete an exception (restore original occurrence)
   */
  delete(id: string): Promise<void>;

  /**
   * Delete all exceptions for a lesson (used when recurring pattern changes)
   */
  deleteByLessonId(lessonId: string): Promise<void>;

  /**
   * Check if exception exists for specific occurrence
   */
  exists(lessonId: string, originalDate: Date): Promise<boolean>;
}
