import {
  InvalidLessonExceptionError,
  SameDateRescheduleError,
} from '@/domain/errors/LessonErrors';

/**
 * LessonException Domain Entity
 *
 * Represents deviations from recurring lesson pattern.
 * Stores only exceptions, not all occurrences (sparse storage pattern).
 *
 * **Design Principles:**
 * - Single Responsibility: Handles single occurrence modifications
 * - Information Expert: Knows how to apply itself to occurrence
 * - Invariant Protection: Validates exception type requirements
 */

export enum ExceptionType {
  SKIP = 'SKIP',
  RESCHEDULE = 'RESCHEDULE',
  MODIFY = 'MODIFY',
}

/**
 * Modifications that can be applied to a single occurrence
 */
export interface LessonModifications {
  title?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  teacherIds?: string[];
  pupilIds?: string[];
}

export class LessonException {
  constructor(
    public readonly id: string,
    public readonly lessonId: string,
    public readonly originalDate: Date,
    public readonly type: ExceptionType,
    public readonly newDate: Date | null = null,
    public readonly modifications: LessonModifications | null = null,
    public readonly createdAt: Date = new Date()
  ) {
    this.validateInvariants();
  }

  private validateInvariants(): void {
    if (this.type === ExceptionType.RESCHEDULE && !this.newDate) {
      throw new InvalidLessonExceptionError('RESCHEDULE exception requires newDate');
    }

    if (this.type === ExceptionType.RESCHEDULE && this.newDate) {
      if (this.newDate.getTime() === this.originalDate.getTime()) {
        throw new SameDateRescheduleError();
      }
    }

    if (this.type === ExceptionType.MODIFY && !this.modifications) {
      throw new InvalidLessonExceptionError('MODIFY exception requires modifications');
    }

    if (this.type === ExceptionType.SKIP && (this.newDate || this.modifications)) {
      throw new InvalidLessonExceptionError('SKIP exception cannot have newDate or modifications');
    }
  }

  static skip(lessonId: string, originalDate: Date): LessonException {
    return new LessonException(
      crypto.randomUUID(),
      lessonId,
      originalDate,
      ExceptionType.SKIP
    );
  }

  static reschedule(
    lessonId: string,
    originalDate: Date,
    newDate: Date
  ): LessonException {
    return new LessonException(
      crypto.randomUUID(),
      lessonId,
      originalDate,
      ExceptionType.RESCHEDULE,
      newDate
    );
  }

  static modify(
    lessonId: string,
    originalDate: Date,
    modifications: LessonModifications
  ): LessonException {
    return new LessonException(
      crypto.randomUUID(),
      lessonId,
      originalDate,
      ExceptionType.MODIFY,
      null,
      modifications
    );
  }

  isSkipped(): boolean {
    return this.type === ExceptionType.SKIP;
  }

  isRescheduled(): boolean {
    return this.type === ExceptionType.RESCHEDULE;
  }

  isModified(): boolean {
    return this.type === ExceptionType.MODIFY;
  }

  /**
   * Check if this exception applies to a specific date
   */
  appliesTo(date: Date): boolean {
    return this.originalDate.getTime() === date.getTime();
  }
}
