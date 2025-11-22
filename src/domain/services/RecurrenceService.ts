import {
  RecurringPattern,
  RecurringFrequency,
} from '../models/RecurringPattern';
import { DateService } from '../ports/services/DateService';

export class RecurrenceService {
  constructor(private dateService: DateService) {}
  generateOccurrences(
    startDate: Date,
    pattern: RecurringPattern,
    maxOccurrences: number = 100
  ): Date[] {
    const limit = pattern.occurrences ?? maxOccurrences;

    switch (pattern.frequency) {
      case RecurringFrequency.DAILY:
        return this.generateDailyOccurrences(startDate, pattern, limit);
      case RecurringFrequency.WEEKLY:
        return this.generateWeeklyOccurrences(startDate, pattern, limit);
      case RecurringFrequency.MONTHLY:
        return this.generateMonthlyOccurrences(startDate, pattern, limit);
      default:
        throw new Error(`Unknown frequency: ${pattern.frequency}`);
    }
  }

  generateDailyOccurrencesForPeriod(
    startDate: Date,
    endDate: Date,
    pattern: RecurringPattern
  ): Date[] {
    const result: Date[] = [];
    let currentDate = startDate;

    const effectiveEndDate =
      pattern.endDate && this.dateService.isBefore(pattern.endDate, endDate)
        ? pattern.endDate
        : endDate;

    while (this.dateService.isSameOrBefore(currentDate, effectiveEndDate)) {
      result.push(currentDate);
      currentDate = this.dateService.addDays(currentDate, pattern.interval);
    }

    return result;
  }

  generateWeeklyOccurrencesForPeriod(
    startDate: Date,
    endDate: Date,
    pattern: RecurringPattern
  ): Date[] {
    const result = [];
    const weekStart = this.dateService.startOfWeek(startDate);
    let weekNumber = 0;

    while (this.dateService.isSameOrBefore(weekStart, endDate)) {
      const currentWeekStart = this.dateService.addWeeks(
        weekStart,
        weekNumber * pattern.interval
      );

      if (this.dateService.isAfter(currentWeekStart, endDate)) break;
      if (
        pattern.endDate &&
        this.dateService.isAfter(currentWeekStart, pattern.endDate)
      )
        break;

      for (const dayOfWeek of pattern.daysOfWeek.sort()) {
        const occurrenceDate = this.dateService.addDays(
          currentWeekStart,
          dayOfWeek
        );

        if (this.dateService.isBefore(occurrenceDate, startDate)) continue;
        if (this.dateService.isAfter(occurrenceDate, endDate)) break;
        if (
          pattern.endDate &&
          this.dateService.isAfter(occurrenceDate, pattern.endDate)
        )
          break;

        result.push(occurrenceDate);
      }

      weekNumber++;
    }

    return result;
  }

  generateMonthlyOccurrencesForPeriod(
    startDate: Date,
    endDate: Date,
    pattern: RecurringPattern
  ): Date[] {
    const result: Date[] = [];
    let currentDate = startDate;

    const effectiveEndDate =
      pattern.endDate && this.dateService.isBefore(pattern.endDate, endDate)
        ? pattern.endDate
        : endDate;

    while (this.dateService.isSameOrBefore(currentDate, effectiveEndDate)) {
      result.push(currentDate);
      currentDate = this.dateService.addMonths(currentDate, pattern.interval);
    }

    return result;
  }

  private generateDailyOccurrences(
    startDate: Date,
    pattern: RecurringPattern,
    limit: number
  ): Date[] {
    const occurrences: Date[] = [];
    let currentDate = startDate;

    while (occurrences.length < limit) {
      if (
        pattern.endDate &&
        this.dateService.isAfter(currentDate, pattern.endDate)
      ) {
        break;
      }

      occurrences.push(currentDate);
      currentDate = this.dateService.addDays(currentDate, pattern.interval);
    }

    return occurrences;
  }

  private generateWeeklyOccurrences(
    startDate: Date,
    pattern: RecurringPattern,
    limit: number
  ): Date[] {
    const occurrences: Date[] = [];
    const weekStart = this.dateService.startOfWeek(startDate);
    let weekNumber = 0;

    while (occurrences.length < limit) {
      const currentWeekStart = this.dateService.addWeeks(
        weekStart,
        weekNumber * pattern.interval
      );

      for (const dayOfWeek of pattern.daysOfWeek.sort()) {
        const occurrenceDate = this.dateService.addDays(
          currentWeekStart,
          dayOfWeek
        );

        if (this.dateService.isBefore(occurrenceDate, startDate)) {
          continue;
        }

        if (
          pattern.endDate &&
          this.dateService.isAfter(occurrenceDate, pattern.endDate)
        ) {
          return occurrences;
        }

        occurrences.push(occurrenceDate);

        if (occurrences.length >= limit) {
          return occurrences;
        }
      }

      weekNumber++;
    }

    return occurrences;
  }

  private generateMonthlyOccurrences(
    startDate: Date,
    pattern: RecurringPattern,
    limit: number
  ): Date[] {
    const occurrences: Date[] = [];
    let currentDate = startDate;

    while (occurrences.length < limit) {
      if (
        pattern.endDate &&
        this.dateService.isAfter(currentDate, pattern.endDate)
      ) {
        break;
      }

      occurrences.push(currentDate);
      currentDate = this.dateService.addMonths(currentDate, pattern.interval);
    }

    return occurrences;
  }
}
