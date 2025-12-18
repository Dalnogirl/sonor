import { Lesson } from '../models/Lesson';
import { LessonException, ExceptionType } from '../models/LessonException';
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

    const processedOccurrences = this.applyExceptions(
      lesson,
      occurrenceDates,
      exceptions
    );

    return processedOccurrences;
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

    // Use the later of lesson.startDate and periodStart to avoid generating
    // occurrences before the requested period
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
    const result: Lesson[] = [];
    const exceptionMap = this.buildExceptionMap(exceptions);
    const rescheduledOccurrences = new Map<string, Lesson>();

    for (const occurrenceDate of occurrenceDates) {
      const dateKey = this.dateService.formatDateOnly(occurrenceDate);
      const exception = exceptionMap.get(dateKey);

      if (exception?.type === ExceptionType.SKIP) {
        continue;
      }

      if (exception?.type === ExceptionType.RESCHEDULE && exception.newDate) {
        const rescheduledLesson = this.createOccurrenceLesson(
          baseLesson,
          exception.newDate
        );
        const rescheduleKey = this.dateService.formatISO(exception.newDate);
        rescheduledOccurrences.set(rescheduleKey, rescheduledLesson);
        continue;
      }

      if (exception?.type === ExceptionType.MODIFY && exception.modifications) {
        const modifiedLesson = this.createModifiedLesson(
          baseLesson,
          occurrenceDate,
          exception
        );
        result.push(modifiedLesson);
        continue;
      }

      result.push(this.createOccurrenceLesson(baseLesson, occurrenceDate));
    }

    rescheduledOccurrences.forEach((lesson) => result.push(lesson));

    return result.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }

  private buildExceptionMap(
    exceptions: LessonException[]
  ): Map<string, LessonException> {
    const map = new Map<string, LessonException>();
    for (const exception of exceptions) {
      const key = this.dateService.formatDateOnly(exception.originalDate);
      map.set(key, exception);
    }
    return map;
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

    return new Lesson(
      baseLesson.id,
      baseLesson.title,
      baseLesson.teacherIds,
      baseLesson.createdAt,
      baseLesson.updatedAt,
      baseLesson.pupilIds,
      occurrenceDate,
      occurrenceEnd,
      baseLesson.description,
      baseLesson.recurringPattern
    );
  }

  private createModifiedLesson(
    baseLesson: Lesson,
    occurrenceDate: Date,
    exception: LessonException
  ): Lesson {
    if (!exception.modifications) {
      return this.createOccurrenceLesson(baseLesson, occurrenceDate);
    }

    const modifications = exception.modifications;
    const baseOccurrence = this.createOccurrenceLesson(
      baseLesson,
      occurrenceDate
    );

    return new Lesson(
      baseOccurrence.id,
      modifications.title ?? baseOccurrence.title,
      modifications.teacherIds ?? baseOccurrence.teacherIds,
      baseOccurrence.createdAt,
      baseOccurrence.updatedAt,
      modifications.pupilIds ?? baseOccurrence.pupilIds,
      modifications.startDate ?? baseOccurrence.startDate,
      modifications.endDate ?? baseOccurrence.endDate,
      modifications.description ?? baseOccurrence.description,
      baseOccurrence.recurringPattern
    );
  }
}
