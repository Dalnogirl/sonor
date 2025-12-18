import { RecurringPattern } from '../models/RecurringPattern';
import { DateService } from '../ports/services/DateService';

/**
 * Context for period-based occurrence generation.
 * Encapsulates bounds and limits for cleaner method signatures.
 */
interface PeriodContext {
  periodStart: Date;
  periodEnd: Date;
  effectiveEnd: Date;
  maxOccurrences: number | null;
}

/**
 * Generates occurrence dates for recurring patterns within a specified period.
 *
 * Handles daily, weekly, and monthly recurrence with support for:
 * - Custom intervals (e.g., every 2 days, bi-weekly)
 * - Pattern end dates
 * - Occurrence count limits
 *
 * @example
 * ```ts
 * const service = new RecurrenceService(dateService);
 * const pattern = RecurringPattern.weekly([DayOfWeek.MONDAY, DayOfWeek.FRIDAY]);
 * const dates = service.generateWeeklyOccurrencesForPeriod(
 *   new Date('2025-01-01'),
 *   new Date('2025-01-31'),
 *   pattern,
 *   lessonStartDate
 * );
 * ```
 */
export class RecurrenceService {
  constructor(private dateService: DateService) {}

  /**
   * Generates daily occurrence dates within a period.
   *
   * @param startDate - Period start (inclusive)
   * @param endDate - Period end (inclusive)
   * @param pattern - Recurrence pattern with interval and optional limits
   * @param lessonStartDate - Original lesson start for occurrence count calculation.
   *   Required when pattern has occurrence limit and period starts after lesson.
   * @returns Array of occurrence dates sorted chronologically
   */
  generateDailyOccurrencesForPeriod(
    startDate: Date,
    endDate: Date,
    pattern: RecurringPattern,
    lessonStartDate?: Date
  ): Date[] {
    const context = this.createPeriodContext(
      startDate,
      endDate,
      pattern,
      lessonStartDate,
      (start, lesson) => this.countDailyOccurrencesBefore(start, lesson, pattern.interval)
    );

    if (context.maxOccurrences !== null && context.maxOccurrences <= 0) {
      return [];
    }

    return this.collectDailyOccurrences(startDate, context, pattern.interval);
  }

  /**
   * Generates weekly occurrence dates within a period.
   *
   * @param startDate - Period start (inclusive)
   * @param endDate - Period end (inclusive)
   * @param pattern - Recurrence pattern with days of week, interval, and optional limits
   * @param lessonStartDate - Original lesson start for occurrence count calculation.
   *   Required when pattern has occurrence limit and period starts after lesson.
   * @returns Array of occurrence dates sorted chronologically
   */
  generateWeeklyOccurrencesForPeriod(
    startDate: Date,
    endDate: Date,
    pattern: RecurringPattern,
    lessonStartDate?: Date
  ): Date[] {
    const context = this.createPeriodContext(
      startDate,
      endDate,
      pattern,
      lessonStartDate,
      (start, lesson) => this.countWeeklyOccurrencesBefore(lesson, start, pattern)
    );

    if (context.maxOccurrences !== null && context.maxOccurrences <= 0) {
      return [];
    }

    return this.collectWeeklyOccurrences(startDate, context, pattern);
  }

  /**
   * Generates monthly occurrence dates within a period.
   *
   * @param startDate - Period start (inclusive)
   * @param endDate - Period end (inclusive)
   * @param pattern - Recurrence pattern with interval and optional limits
   * @param lessonStartDate - Original lesson start for occurrence count calculation.
   *   Required when pattern has occurrence limit and period starts after lesson.
   * @returns Array of occurrence dates sorted chronologically
   */
  generateMonthlyOccurrencesForPeriod(
    startDate: Date,
    endDate: Date,
    pattern: RecurringPattern,
    lessonStartDate?: Date
  ): Date[] {
    const context = this.createPeriodContext(
      startDate,
      endDate,
      pattern,
      lessonStartDate,
      (start, lesson) => this.countMonthlyOccurrencesBefore(start, lesson, pattern.interval)
    );

    if (context.maxOccurrences !== null && context.maxOccurrences <= 0) {
      return [];
    }

    return this.collectMonthlyOccurrences(startDate, context, pattern.interval);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Period Context Creation
  // ─────────────────────────────────────────────────────────────────────────────

  private createPeriodContext(
    periodStart: Date,
    periodEnd: Date,
    pattern: RecurringPattern,
    lessonStartDate: Date | undefined,
    countOccurrencesBefore: (periodStart: Date, lessonStart: Date) => number
  ): PeriodContext {
    const effectiveEnd = this.getEffectiveEndDate(periodEnd, pattern.endDate);
    const maxOccurrences = this.calculateMaxOccurrences(
      pattern.occurrences,
      lessonStartDate,
      periodStart,
      countOccurrencesBefore
    );

    return { periodStart, periodEnd, effectiveEnd, maxOccurrences };
  }

  private getEffectiveEndDate(periodEnd: Date, patternEnd: Date | null): Date {
    if (!patternEnd) return periodEnd;
    return this.dateService.isBefore(patternEnd, periodEnd) ? patternEnd : periodEnd;
  }

  private calculateMaxOccurrences(
    patternOccurrences: number | null,
    lessonStartDate: Date | undefined,
    periodStart: Date,
    countBefore: (periodStart: Date, lessonStart: Date) => number
  ): number | null {
    if (patternOccurrences === null || !lessonStartDate) {
      return null;
    }
    const alreadyOccurred = countBefore(periodStart, lessonStartDate);
    return patternOccurrences - alreadyOccurred;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Occurrence Counting (before period start)
  // ─────────────────────────────────────────────────────────────────────────────

  private countDailyOccurrencesBefore(
    periodStart: Date,
    lessonStart: Date,
    interval: number
  ): number {
    const daysBefore = this.dateService.diffInDays(periodStart, lessonStart);
    return Math.floor(daysBefore / interval);
  }

  private countMonthlyOccurrencesBefore(
    periodStart: Date,
    lessonStart: Date,
    interval: number
  ): number {
    const monthsBefore = this.dateService.diffInMonths(periodStart, lessonStart);
    return Math.floor(monthsBefore / interval);
  }

  private countWeeklyOccurrencesBefore(
    lessonStartDate: Date,
    periodStartDate: Date,
    pattern: RecurringPattern
  ): number {
    const lessonWeekStart = this.dateService.startOfWeek(lessonStartDate);
    let count = 0;
    let weekNumber = 0;

    while (true) {
      const currentWeekStart = this.dateService.addWeeks(
        lessonWeekStart,
        weekNumber * pattern.interval
      );

      if (this.dateService.isSameOrAfter(currentWeekStart, periodStartDate)) {
        break;
      }

      for (const dayOfWeek of pattern.daysOfWeek.sort()) {
        const occurrenceDate = this.dateService.addDays(currentWeekStart, dayOfWeek);

        if (this.dateService.isBefore(occurrenceDate, lessonStartDate)) continue;
        if (this.dateService.isSameOrAfter(occurrenceDate, periodStartDate)) break;

        count++;
      }

      weekNumber++;
    }

    return count;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Occurrence Collection (within period)
  // ─────────────────────────────────────────────────────────────────────────────

  private collectDailyOccurrences(
    startDate: Date,
    context: PeriodContext,
    interval: number
  ): Date[] {
    const result: Date[] = [];
    let currentDate = startDate;

    while (this.isWithinBounds(currentDate, context.effectiveEnd)) {
      if (this.hasReachedLimit(result.length, context.maxOccurrences)) break;

      result.push(currentDate);
      currentDate = this.dateService.addDays(currentDate, interval);
    }

    return result;
  }

  private collectMonthlyOccurrences(
    startDate: Date,
    context: PeriodContext,
    interval: number
  ): Date[] {
    const result: Date[] = [];
    let currentDate = startDate;

    while (this.isWithinBounds(currentDate, context.effectiveEnd)) {
      if (this.hasReachedLimit(result.length, context.maxOccurrences)) break;

      result.push(currentDate);
      currentDate = this.dateService.addMonths(currentDate, interval);
    }

    return result;
  }

  private collectWeeklyOccurrences(
    startDate: Date,
    context: PeriodContext,
    pattern: RecurringPattern
  ): Date[] {
    const result: Date[] = [];
    const weekStart = this.dateService.startOfWeek(startDate);
    let weekNumber = 0;

    while (this.isWithinBounds(weekStart, context.periodEnd)) {
      const currentWeekStart = this.dateService.addWeeks(
        weekStart,
        weekNumber * pattern.interval
      );

      if (this.dateService.isAfter(currentWeekStart, context.periodEnd)) break;
      if (this.isAfterPatternEnd(currentWeekStart, pattern.endDate)) break;

      for (const dayOfWeek of pattern.daysOfWeek.sort()) {
        if (this.hasReachedLimit(result.length, context.maxOccurrences)) {
          return result;
        }

        const occurrenceDate = this.dateService.addDays(currentWeekStart, dayOfWeek);

        if (this.dateService.isBefore(occurrenceDate, startDate)) continue;
        if (this.dateService.isAfter(occurrenceDate, context.periodEnd)) break;
        if (this.isAfterPatternEnd(occurrenceDate, pattern.endDate)) break;

        result.push(occurrenceDate);
      }

      weekNumber++;
    }

    return result;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Boundary Checks
  // ─────────────────────────────────────────────────────────────────────────────

  private isWithinBounds(date: Date, endDate: Date): boolean {
    return this.dateService.isSameOrBefore(date, endDate);
  }

  private hasReachedLimit(currentCount: number, maxOccurrences: number | null): boolean {
    return maxOccurrences !== null && currentCount >= maxOccurrences;
  }

  private isAfterPatternEnd(date: Date, patternEnd: Date | null): boolean {
    return patternEnd !== null && this.dateService.isAfter(date, patternEnd);
  }
}
