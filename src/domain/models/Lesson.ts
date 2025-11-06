import { RecurringPattern } from './RecurringPattern';

/**
 * Lesson Domain Entity
 *
 * **Design Decision: IDs for User References**
 * This entity stores user IDs (teacherIds, pupilIds) rather than full User entities.
 *
 * **Rationale:**
 * 1. **Simplicity** - No complex hydration logic needed in repositories
 * 2. **Performance** - Avoid unnecessary joins when user details aren't needed
 * 3. **Flexibility** - Load user details only when required (in specific use cases)
 * 4. **Database Reality** - Foreign keys store IDs, not entire objects
 * 5. **Pragmatic DDD** - Most successful apps use this approach
 *
 * **When you need full user data:**
 * Hydrate in the use case layer:
 * ```typescript
 * const lesson = await lessonRepo.findById(id);
 * const teachers = await userRepo.findByIds(lesson.teacherIds);
 * return { lesson, teachers }; // Compose in use case
 * ```
 *
 * **Trade-off:**
 * - ✅ Simpler code, better performance
 * - ⚠️ Can't access user.name directly from lesson.teachers
 * - Solution: Load users explicitly when needed
 */
export class Lesson {
  public id: string;
  public title: string;
  public teacherIds: string[];
  public pupilIds: string[];
  public createdAt: Date;
  public updatedAt: Date;
  public startDate: Date;
  public endDate: Date;
  public description?: string;
  public recurringPattern?: RecurringPattern;

  constructor(
    id: string,
    title: string,
    teacherIds: string[],
    createdAt: Date,
    updatedAt: Date,
    pupilIds: string[],
    startDate: Date,
    endDate: Date,
    description?: string,
    recurringPattern?: RecurringPattern
  ) {
    // Validate business rules
    if (teacherIds.length === 0) {
      throw new Error('Lesson must have at least one teacher');
    }
    if (startDate >= endDate) {
      throw new Error('Lesson endDate must be after startDate');
    }

    this.id = id;
    this.title = title;
    this.teacherIds = teacherIds;
    this.pupilIds = pupilIds;
    this.startDate = startDate;
    this.endDate = endDate;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.description = description;
    this.recurringPattern = recurringPattern;
  }

  static create(
    title: string,
    teacherIds: string[],
    pupilIds: string[],
    startDate: Date,
    endDate: Date,
    description?: string,
    recurringPattern?: RecurringPattern
  ): Lesson {
    const now = new Date();
    return new Lesson(
      crypto.randomUUID(),
      title,
      teacherIds,
      now,
      now,
      pupilIds,
      startDate,
      endDate,
      description,
      recurringPattern
    );
  }

  hasTeacher(teacherId: string): boolean {
    return this.teacherIds.includes(teacherId);
  }

  hasPupil(pupilId: string): boolean {
    return this.pupilIds.includes(pupilId);
  }

  get isPast(): boolean {
    return this.endDate < new Date();
  }

  get isActive(): boolean {
    const now = new Date();
    return this.startDate <= now && now <= this.endDate;
  }

  get isUpcoming(): boolean {
    return this.startDate > new Date();
  }
}
