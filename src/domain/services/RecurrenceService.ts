import {
  RecurringPattern,
  RecurringFrequency,
} from '../models/RecurringPattern';

export class RecurrenceService {
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
    const currentDate = new Date(startDate);

    const effectiveEndDate =
      pattern.endDate && pattern.endDate < endDate ? pattern.endDate : endDate;

    while (currentDate <= effectiveEndDate) {
      result.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + pattern.interval);
    }

    return result;
  }

  generateWeeklyOccurrencesForPeriod(
    startDate: Date,
    endDate: Date,
    pattern: RecurringPattern
  ): Date[] {
    const result = [];
    const weekStart = this.getStartOfWeek(new Date(startDate));
    let weekNumber = 0;

    while (weekStart <= endDate) {
      const currentWeekStart = new Date(weekStart);
      currentWeekStart.setDate(
        currentWeekStart.getDate() + weekNumber * 7 * pattern.interval
      );

      if (currentWeekStart > endDate) break;
      if (pattern.endDate && currentWeekStart > pattern.endDate) break;

      for (const dayOfWeek of pattern.daysOfWeek.sort()) {
        const occurrenceDate = new Date(currentWeekStart);
        occurrenceDate.setDate(occurrenceDate.getDate() + dayOfWeek);

        if (occurrenceDate < startDate) continue;
        if (occurrenceDate > endDate) break;
        if (pattern.endDate && occurrenceDate > pattern.endDate) break;

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
    const targetDayOfMonth = startDate.getDate();
    const hours = startDate.getHours();
    const minutes = startDate.getMinutes();
    const seconds = startDate.getSeconds();
    const milliseconds = startDate.getMilliseconds();

    const effectiveEndDate =
      pattern.endDate && pattern.endDate < endDate ? pattern.endDate : endDate;

    let year = startDate.getFullYear();
    let month = startDate.getMonth();
    let currentDay = targetDayOfMonth;

    while (true) {
      const clampedDay = Math.min(currentDay, this.getDaysInMonth(year, month));

      const occurrenceDate = new Date(
        year,
        month,
        clampedDay,
        hours,
        minutes,
        seconds,
        milliseconds
      );

      if (occurrenceDate > effectiveEndDate) {
        break;
      }

      result.push(occurrenceDate);

      currentDay = clampedDay;

      month += pattern.interval;
      while (month >= 12) {
        month -= 12;
        year++;
      }
    }

    return result;
  }

  private generateDailyOccurrences(
    startDate: Date,
    pattern: RecurringPattern,
    limit: number
  ): Date[] {
    const occurrences: Date[] = [];
    const currentDate = new Date(startDate);

    while (occurrences.length < limit) {
      if (pattern.endDate && currentDate > pattern.endDate) {
        break;
      }

      occurrences.push(new Date(currentDate));

      currentDate.setDate(currentDate.getDate() + pattern.interval);
    }

    return occurrences;
  }

  private generateWeeklyOccurrences(
    startDate: Date,
    pattern: RecurringPattern,
    limit: number
  ): Date[] {
    const occurrences: Date[] = [];
    let weekStart = new Date(startDate);
    weekStart = this.getStartOfWeek(weekStart);

    let weekNumber = 0;

    while (occurrences.length < limit) {
      const currentWeekStart = new Date(weekStart);
      currentWeekStart.setDate(
        currentWeekStart.getDate() + weekNumber * 7 * pattern.interval
      );

      for (const dayOfWeek of pattern.daysOfWeek.sort()) {
        const occurrenceDate = new Date(currentWeekStart);
        occurrenceDate.setDate(occurrenceDate.getDate() + dayOfWeek);

        if (occurrenceDate < startDate) {
          continue;
        }

        if (pattern.endDate && occurrenceDate > pattern.endDate) {
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
    const targetDayOfMonth = startDate.getDate();
    const hours = startDate.getHours();
    const minutes = startDate.getMinutes();
    const seconds = startDate.getSeconds();
    const milliseconds = startDate.getMilliseconds();

    let year = startDate.getFullYear();
    let month = startDate.getMonth();
    let currentDay = targetDayOfMonth;

    while (occurrences.length < limit) {
      const clampedDay = Math.min(currentDay, this.getDaysInMonth(year, month));

      const occurrenceDate = new Date(
        year,
        month,
        clampedDay,
        hours,
        minutes,
        seconds,
        milliseconds
      );

      if (pattern.endDate && occurrenceDate > pattern.endDate) {
        break;
      }

      occurrences.push(occurrenceDate);

      currentDay = clampedDay;

      month += pattern.interval;
      while (month >= 12) {
        month -= 12;
        year++;
      }
    }

    return occurrences;
  }

  private getStartOfWeek(date: Date): Date {
    const result = new Date(date);
    const day = result.getDay();
    result.setDate(result.getDate() - day);
    return result;
  }

  private getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }
}
