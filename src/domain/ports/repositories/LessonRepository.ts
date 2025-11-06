import { Lesson } from '@/domain/models/Lesson';

/**
 * LessonRepository
 *
 * **Design Decision: IDs-Only Approach**
 * All methods work with Lesson entities that contain user IDs (not full User objects).
 * This keeps repositories simple and avoids cross-aggregate dependencies.
 *
 * When you need full user data, hydrate in the use case:
 * ```typescript
 * const lessons = await lessonRepo.findByTeacher(teacherId, ...);
 * const allUserIds = lessons.flatMap(l => [...l.teacherIds, ...l.pupilIds]);
 * const users = await userRepo.findByIds(allUserIds);
 * // Compose in use case layer
 * ```
 */
export interface LessonRepository {
  /**
   * Finds lessons where the given user is a teacher within a date range.
   * Returns Lesson entities with user IDs only.
   */
  findMyTeachingLessonsForPeriod(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Lesson[]>;

  /**
   * Creates a new lesson.
   * The lesson should contain validated user IDs (use case validates users exist).
   */
  create(lesson: Lesson): Promise<Lesson>;

  /**
   * Finds a lesson by ID.
   */
  findById(id: string): Promise<Lesson | null>;
}
