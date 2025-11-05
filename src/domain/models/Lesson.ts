import { RecurringPattern } from './RecurringPattern';
import { User } from './User';

export class Lesson {
  public id: string;
  public title: string;
  public teachers: User[];
  public createdAt: Date;
  public updatedAt: Date;
  public pupils: User[];
  public startDate: Date;
  public endDate: Date;
  public description?: string;
  public recurringPattern?: RecurringPattern;
  constructor(
    id: string,
    title: string,
    teachers: User[],
    createdAt: Date,
    updatedAt: Date,
    pupils: User[],
    startDate: Date,
    endDate: Date,
    description?: string,
    recurringPattern?: RecurringPattern 
  ) {
    this.id = id;
    this.title = title;
    this.teachers = teachers;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.pupils = pupils;
    this.startDate = startDate;
    this.endDate = endDate;
    this.description = description;
    this.recurringPattern = recurringPattern;
  }

  static createWithDefaults(
    id: string,
    title: string,
    teachers: User[],
    startDate: Date,
    endDate: Date,
    description?: string,
    recurringPattern?: RecurringPattern
  ): Lesson {
    const now = new Date();
    return new Lesson(
      id,
      title,
      teachers,
      now,
      now,
      [],
      startDate,
      endDate,
      description,
      recurringPattern
    );
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
