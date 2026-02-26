import { Lesson } from '../models/Lesson';
import { LessonException } from '../models/LessonException';
import { RecurrenceService } from './RecurrenceService';
import { DateService } from '../ports/services/DateService';
import { RecurringFrequency } from '../models/RecurringPattern';

export class OccurrenceGeneratorService {
  constructor(
    private recurrenceService: RecurrenceService,
    private dateService: DateService
  ) {}

  generateOccurrencesForPeriod(
    lesson: Lesson,
    exceptions: LessonException[],
    periodStart: Date,
    periodEnd: Date
  ): Lesson[] {
    if (!lesson.recurringPattern) {
      return this.isSingleLessonInPeriod(lesson, periodStart, periodEnd)
        ? [lesson]
        : [];
    }

    const occurrenceDates = this.generateOccurrenceDates(
      lesson,
      periodStart,
      periodEnd
    );

    return this.applyExceptions(lesson, occurrenceDates, exceptions);
  }

  private isSingleLessonInPeriod(
    lesson: Lesson,
    periodStart: Date,
    periodEnd: Date
  ): boolean {
    return (
      this.dateService.isSameOrAfter(lesson.startDate, periodStart) &&
      this.dateService.isSameOrBefore(lesson.startDate, periodEnd)
    );
  }

  private generateOccurrenceDates(
    lesson: Lesson,
    periodStart: Date,
    periodEnd: Date
  ): Date[] {
    if (!lesson.recurringPattern) {
      return [];
    }

    const pattern = lesson.recurringPattern;

    const effectiveStart =
      lesson.startDate > periodStart ? lesson.startDate : periodStart;

    switch (pattern.frequency) {
      case RecurringFrequency.DAILY:
        return this.recurrenceService.generateDailyOccurrencesForPeriod(
          effectiveStart,
          periodEnd,
          pattern,
          lesson.startDate
        );
      case RecurringFrequency.WEEKLY:
        return this.recurrenceService.generateWeeklyOccurrencesForPeriod(
          effectiveStart,
          periodEnd,
          pattern,
          lesson.startDate
        );
      case RecurringFrequency.MONTHLY:
        return this.recurrenceService.generateMonthlyOccurrencesForPeriod(
          effectiveStart,
          periodEnd,
          pattern,
          lesson.startDate
        );
      default:
        throw new Error(`Unknown frequency: ${pattern.frequency}`);
    }
  }

  private applyExceptions(
    baseLesson: Lesson,
    occurrenceDates: Date[],
    exceptions: LessonException[]
  ): Lesson[] {
    const skippedDates = new Set(
      exceptions.map((e) => this.dateService.formatDateOnly(e.originalDate))
    );

    const result: Lesson[] = [];

    for (const occurrenceDate of occurrenceDates) {
      const dateKey = this.dateService.formatDateOnly(occurrenceDate);
      if (skippedDates.has(dateKey)) {
        continue;
      }
      result.push(this.createOccurrenceLesson(baseLesson, occurrenceDate));
    }

    return result;
  }

  private createOccurrenceLesson(baseLesson: Lesson, occurrenceDate: Date): Lesson {
    const duration = this.dateService.diffInMinutes(
      baseLesson.endDate,
      baseLesson.startDate
    );
    const occurrenceEnd = this.dateService.addMinutes(
      occurrenceDate,
      duration
    );

    return new Lesson({
      id: baseLesson.id,
      title: baseLesson.title,
      teacherIds: [...baseLesson.teacherIds],
      pupilIds: [...baseLesson.pupilIds],
      startDate: occurrenceDate,
      endDate: occurrenceEnd,
      createdAt: baseLesson.createdAt,
      updatedAt: baseLesson.updatedAt,
      description: baseLesson.description,
      recurringPattern: baseLesson.recurringPattern,
    });
  }
}
