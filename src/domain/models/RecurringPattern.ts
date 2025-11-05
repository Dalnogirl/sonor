export enum RecurringFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

export enum DayOfWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

export class RecurringPattern {
  public readonly frequency: RecurringFrequency;
  public readonly interval: number;
  public readonly daysOfWeek: DayOfWeek[];
  public readonly endDate: Date | null;
  public readonly occurrences: number | null;

  constructor(
    frequency: RecurringFrequency,
    interval: number,
    daysOfWeek: DayOfWeek[] = [],
    endDate: Date | null = null,
    occurrences: number | null = null
  ) {
    this.validateInvariants(
      frequency,
      interval,
      daysOfWeek,
      endDate,
      occurrences
    );

    this.frequency = frequency;
    this.interval = interval;
    this.daysOfWeek = daysOfWeek;
    this.endDate = endDate;
    this.occurrences = occurrences;
  }

  private validateInvariants(
    frequency: RecurringFrequency,
    interval: number,
    daysOfWeek: DayOfWeek[],
    endDate: Date | null,
    occurrences: number | null
  ): void {
    if (interval < 1) {
      throw new Error('Interval must be at least 1');
    }

    if (occurrences !== null && occurrences < 1) {
      throw new Error('Occurrences must be at least 1');
    }

    if (endDate !== null && occurrences !== null) {
      throw new Error('Cannot specify both endDate and occurrences');
    }

    if (frequency === RecurringFrequency.WEEKLY && daysOfWeek.length === 0) {
      throw new Error(
        'Weekly recurrence must specify at least one day of week'
      );
    }

    if (frequency !== RecurringFrequency.WEEKLY && daysOfWeek.length > 0) {
      throw new Error(
        'Days of week can only be specified for weekly recurrence'
      );
    }

    const uniqueDays = new Set(daysOfWeek);
    if (uniqueDays.size !== daysOfWeek.length) {
      throw new Error('Duplicate days of week are not allowed');
    }
  }

  static daily(
    interval: number = 1,
    endDate?: Date,
    occurrences?: number
  ): RecurringPattern {
    return new RecurringPattern(
      RecurringFrequency.DAILY,
      interval,
      [],
      endDate ?? null,
      occurrences ?? null
    );
  }

  static weekly(
    daysOfWeek: DayOfWeek[],
    interval: number = 1,
    endDate?: Date,
    occurrences?: number
  ): RecurringPattern {
    return new RecurringPattern(
      RecurringFrequency.WEEKLY,
      interval,
      daysOfWeek,
      endDate ?? null,
      occurrences ?? null
    );
  }

  static monthly(
    interval: number = 1,
    endDate?: Date,
    occurrences?: number
  ): RecurringPattern {
    return new RecurringPattern(
      RecurringFrequency.MONTHLY,
      interval,
      [],
      endDate ?? null,
      occurrences ?? null
    );
  }

  equals(other: RecurringPattern): boolean {
    if (this.frequency !== other.frequency) return false;
    if (this.interval !== other.interval) return false;
    if (this.daysOfWeek.length !== other.daysOfWeek.length) return false;

    const thisDays = [...this.daysOfWeek].sort();
    const otherDays = [...other.daysOfWeek].sort();
    if (!thisDays.every((day, i) => day === otherDays[i])) return false;

    if (this.endDate?.getTime() !== other.endDate?.getTime()) return false;
    if (this.occurrences !== other.occurrences) return false;

    return true;
  }
}
