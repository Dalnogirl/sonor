import { RecurringPattern } from './RecurringPattern';
import { InvalidLessonExceptionError } from '@/domain/errors/LessonErrors';

export interface LessonProps {
  id: string;
  title: string;
  teacherIds: string[];
  pupilIds: string[];
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  description?: string;
  recurringPattern?: RecurringPattern;
  deletedAt?: Date;
}

/**
 * Lesson Domain Entity
 *
 * **Design Decision: IDs for User References**
 * Stores user IDs (teacherIds, pupilIds) rather than full User entities.
 * Hydrate in use case layer when full user data needed.
 */
export class Lesson {
  public readonly id: string;
  public title: string;
  public readonly createdAt: Date;
  public updatedAt: Date;
  public startDate: Date;
  public endDate: Date;
  public description?: string;
  public recurringPattern?: RecurringPattern;
  public deletedAt?: Date;

  private _teacherIds: string[];
  private _pupilIds: string[];

  private static validateInvariants(
    props: Pick<LessonProps, 'teacherIds' | 'startDate' | 'endDate'>
  ): void {
    if (props.teacherIds.length === 0) {
      throw new InvalidLessonExceptionError(
        'Lesson must have at least one teacher'
      );
    }
    if (props.startDate >= props.endDate) {
      throw new InvalidLessonExceptionError(
        'Lesson endDate must be after startDate'
      );
    }
  }

  constructor(props: LessonProps) {
    Lesson.validateInvariants(props);

    this.id = props.id;
    this.title = props.title;
    this._teacherIds = [...props.teacherIds];
    this._pupilIds = [...props.pupilIds];
    this.startDate = props.startDate;
    this.endDate = props.endDate;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.description = props.description;
    this.recurringPattern = props.recurringPattern;
    this.deletedAt = props.deletedAt;
  }

  get teacherIds(): readonly string[] {
    return this._teacherIds;
  }

  get pupilIds(): readonly string[] {
    return this._pupilIds;
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
    return new Lesson({
      id: crypto.randomUUID(),
      title,
      teacherIds,
      pupilIds,
      startDate,
      endDate,
      createdAt: now,
      updatedAt: now,
      description,
      recurringPattern,
    });
  }

  hasTeacher(teacherId: string): boolean {
    return this._teacherIds.includes(teacherId);
  }

  hasPupil(pupilId: string): boolean {
    return this._pupilIds.includes(pupilId);
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

  get isDeleted(): boolean {
    return !!this.deletedAt;
  }

  delete(): void {
    if (this.deletedAt) {
      throw new InvalidLessonExceptionError('Lesson is already deleted');
    }
    this.deletedAt = new Date();
    this.updatedAt = new Date();
  }

  edit(
    data: Pick<
      LessonProps,
      | 'title'
      | 'teacherIds'
      | 'pupilIds'
      | 'startDate'
      | 'endDate'
      | 'description'
      | 'recurringPattern'
    >
  ): { recurringPatternChanged: boolean } {
    if (this.isDeleted) {
      throw new InvalidLessonExceptionError('Cannot edit a deleted lesson');
    }

    Lesson.validateInvariants(data);

    const recurringPatternChanged = this.hasRecurringPatternChanged(
      data.recurringPattern
    );

    this.title = data.title;
    this._teacherIds = [...data.teacherIds];
    this._pupilIds = [...data.pupilIds];
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.description = data.description;
    this.recurringPattern = data.recurringPattern;
    this.updatedAt = new Date();

    return { recurringPatternChanged };
  }

  private hasRecurringPatternChanged(
    newPattern?: RecurringPattern
  ): boolean {
    if (!this.recurringPattern && !newPattern) return false;
    if (!this.recurringPattern || !newPattern) return true;
    return !this.recurringPattern.equals(newPattern);
  }

  restore(): void {
    if (!this.deletedAt) {
      throw new InvalidLessonExceptionError('Lesson is not deleted');
    }
    this.deletedAt = undefined;
    this.updatedAt = new Date();
  }
}
