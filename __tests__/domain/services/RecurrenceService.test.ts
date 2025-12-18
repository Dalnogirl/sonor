import { describe, it, expect, beforeEach } from 'vitest';
import { RecurrenceService } from '@/domain/services/RecurrenceService';
import { DayjsDateService } from '@/infrastructure/services/DayjsDateService';
import {
  RecurringPattern,
  DayOfWeek,
} from '@/domain/models/RecurringPattern';

describe('RecurrenceService', () => {
  let service: RecurrenceService;

  beforeEach(() => {
    const dateService = new DayjsDateService();
    service = new RecurrenceService(dateService);
  });

  describe('generateWeeklyOccurrencesForPeriod', () => {
    it('should generate occurrences within period for single day', () => {
      const startDate = new Date('2025-01-06'); // Monday
      const endDate = new Date('2025-01-27'); // Monday, 3 weeks later
      const pattern = RecurringPattern.weekly([DayOfWeek.MONDAY], 1);

      const occurrences = service.generateWeeklyOccurrencesForPeriod(
        startDate,
        endDate,
        pattern
      );

      expect(occurrences).toHaveLength(4);
      expect(occurrences[0]).toEqual(new Date('2025-01-06'));
      expect(occurrences[1]).toEqual(new Date('2025-01-13'));
      expect(occurrences[2]).toEqual(new Date('2025-01-20'));
      expect(occurrences[3]).toEqual(new Date('2025-01-27'));
    });

    it('should generate occurrences for multiple days of week', () => {
      const startDate = new Date('2025-01-06'); // Monday
      const endDate = new Date('2025-01-17'); // Friday, 2 weeks later
      const pattern = RecurringPattern.weekly(
        [DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY, DayOfWeek.FRIDAY],
        1
      );

      const occurrences = service.generateWeeklyOccurrencesForPeriod(
        startDate,
        endDate,
        pattern
      );

      expect(occurrences).toHaveLength(6);
      expect(occurrences[0]).toEqual(new Date('2025-01-06')); // Mon
      expect(occurrences[1]).toEqual(new Date('2025-01-08')); // Wed
      expect(occurrences[2]).toEqual(new Date('2025-01-10')); // Fri
      expect(occurrences[3]).toEqual(new Date('2025-01-13')); // Mon
      expect(occurrences[4]).toEqual(new Date('2025-01-15')); // Wed
      expect(occurrences[5]).toEqual(new Date('2025-01-17')); // Fri
    });

    it('should respect bi-weekly interval', () => {
      const startDate = new Date('2025-01-06'); // Monday
      const endDate = new Date('2025-02-03'); // Monday, 4 weeks later
      const pattern = RecurringPattern.weekly([DayOfWeek.MONDAY], 2);

      const occurrences = service.generateWeeklyOccurrencesForPeriod(
        startDate,
        endDate,
        pattern
      );

      expect(occurrences).toHaveLength(3);
      expect(occurrences[0]).toEqual(new Date('2025-01-06'));
      expect(occurrences[1]).toEqual(new Date('2025-01-20'));
      expect(occurrences[2]).toEqual(new Date('2025-02-03'));
    });

    it('should skip occurrences before startDate', () => {
      const startDate = new Date('2025-01-08'); // Wednesday
      const endDate = new Date('2025-01-17'); // Friday
      const pattern = RecurringPattern.weekly(
        [DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY, DayOfWeek.FRIDAY],
        1
      );

      const occurrences = service.generateWeeklyOccurrencesForPeriod(
        startDate,
        endDate,
        pattern
      );

      expect(occurrences).toHaveLength(5);
      expect(occurrences[0]).toEqual(new Date('2025-01-08')); // Wed (start)
      expect(occurrences[1]).toEqual(new Date('2025-01-10')); // Fri
      expect(occurrences[2]).toEqual(new Date('2025-01-13')); // Mon
      expect(occurrences[3]).toEqual(new Date('2025-01-15')); // Wed
      expect(occurrences[4]).toEqual(new Date('2025-01-17')); // Fri
    });

    it('should stop at endDate boundary', () => {
      const startDate = new Date('2025-01-06'); // Monday
      const endDate = new Date('2025-01-08'); // Wednesday
      const pattern = RecurringPattern.weekly(
        [DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY, DayOfWeek.FRIDAY],
        1
      );

      const occurrences = service.generateWeeklyOccurrencesForPeriod(
        startDate,
        endDate,
        pattern
      );

      expect(occurrences).toHaveLength(2);
      expect(occurrences[0]).toEqual(new Date('2025-01-06')); // Mon
      expect(occurrences[1]).toEqual(new Date('2025-01-08')); // Wed
    });

    it('should respect pattern endDate when before period endDate', () => {
      const startDate = new Date('2025-01-06'); // Monday
      const endDate = new Date('2025-01-27'); // Monday, 3 weeks later
      const patternEndDate = new Date('2025-01-13'); // Monday, 1 week later
      const pattern = RecurringPattern.weekly(
        [DayOfWeek.MONDAY],
        1,
        patternEndDate,
        undefined,
        startDate
      );

      const occurrences = service.generateWeeklyOccurrencesForPeriod(
        startDate,
        endDate,
        pattern
      );

      expect(occurrences).toHaveLength(2);
      expect(occurrences[0]).toEqual(new Date('2025-01-06'));
      expect(occurrences[1]).toEqual(new Date('2025-01-13'));
    });

    it('should use period endDate when pattern endDate is after it', () => {
      const startDate = new Date('2025-01-06'); // Monday
      const endDate = new Date('2025-01-13'); // Monday, 1 week later
      const patternEndDate = new Date('2025-01-27'); // Monday, 3 weeks later
      const pattern = RecurringPattern.weekly(
        [DayOfWeek.MONDAY],
        1,
        patternEndDate,
        undefined,
        startDate
      );

      const occurrences = service.generateWeeklyOccurrencesForPeriod(
        startDate,
        endDate,
        pattern
      );

      expect(occurrences).toHaveLength(2);
      expect(occurrences[0]).toEqual(new Date('2025-01-06'));
      expect(occurrences[1]).toEqual(new Date('2025-01-13'));
    });

    it('should return empty array when no occurrences in period', () => {
      const startDate = new Date('2025-01-07'); // Tuesday
      const endDate = new Date('2025-01-08'); // Wednesday
      const pattern = RecurringPattern.weekly([DayOfWeek.FRIDAY], 1);

      const occurrences = service.generateWeeklyOccurrencesForPeriod(
        startDate,
        endDate,
        pattern
      );

      expect(occurrences).toHaveLength(0);
    });

    it('should handle weekend days correctly', () => {
      const startDate = new Date('2025-01-04'); // Saturday
      const endDate = new Date('2025-01-19'); // Sunday, 2 weeks later
      const pattern = RecurringPattern.weekly(
        [DayOfWeek.SATURDAY, DayOfWeek.SUNDAY],
        1
      );

      const occurrences = service.generateWeeklyOccurrencesForPeriod(
        startDate,
        endDate,
        pattern
      );

      expect(occurrences).toHaveLength(6);
      expect(occurrences[0]).toEqual(new Date('2025-01-04')); // Sat
      expect(occurrences[1]).toEqual(new Date('2025-01-05')); // Sun
      expect(occurrences[2]).toEqual(new Date('2025-01-11')); // Sat
      expect(occurrences[3]).toEqual(new Date('2025-01-12')); // Sun
      expect(occurrences[4]).toEqual(new Date('2025-01-18')); // Sat
      expect(occurrences[5]).toEqual(new Date('2025-01-19')); // Sun
    });

    it('should handle single day period', () => {
      const startDate = new Date('2025-01-06'); // Monday
      const endDate = new Date('2025-01-06'); // Same day
      const pattern = RecurringPattern.weekly([DayOfWeek.MONDAY], 1);

      const occurrences = service.generateWeeklyOccurrencesForPeriod(
        startDate,
        endDate,
        pattern
      );

      expect(occurrences).toHaveLength(1);
      expect(occurrences[0]).toEqual(new Date('2025-01-06'));
    });

    it('should handle tri-weekly interval', () => {
      const startDate = new Date('2025-01-06'); // Monday
      const endDate = new Date('2025-02-24'); // Monday, 7 weeks later
      const pattern = RecurringPattern.weekly([DayOfWeek.MONDAY], 3);

      const occurrences = service.generateWeeklyOccurrencesForPeriod(
        startDate,
        endDate,
        pattern
      );

      expect(occurrences).toHaveLength(3);
      expect(occurrences[0]).toEqual(new Date('2025-01-06'));
      expect(occurrences[1]).toEqual(new Date('2025-01-27'));
      expect(occurrences[2]).toEqual(new Date('2025-02-17'));
    });

    it('should handle cross-month boundaries', () => {
      const startDate = new Date('2025-01-27'); // Monday, near end of Jan
      const endDate = new Date('2025-02-10'); // Monday, early Feb
      const pattern = RecurringPattern.weekly([DayOfWeek.MONDAY], 1);

      const occurrences = service.generateWeeklyOccurrencesForPeriod(
        startDate,
        endDate,
        pattern
      );

      expect(occurrences).toHaveLength(3);
      expect(occurrences[0]).toEqual(new Date('2025-01-27'));
      expect(occurrences[1]).toEqual(new Date('2025-02-03'));
      expect(occurrences[2]).toEqual(new Date('2025-02-10'));
    });
  });

  describe('generateDailyOccurrencesForPeriod', () => {
    it('should generate daily occurrences within period', () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-05');
      const pattern = RecurringPattern.daily(1);

      const occurrences = service.generateDailyOccurrencesForPeriod(
        startDate,
        endDate,
        pattern
      );

      expect(occurrences).toHaveLength(5);
      expect(occurrences[0]).toEqual(new Date('2025-01-01'));
      expect(occurrences[1]).toEqual(new Date('2025-01-02'));
      expect(occurrences[2]).toEqual(new Date('2025-01-03'));
      expect(occurrences[3]).toEqual(new Date('2025-01-04'));
      expect(occurrences[4]).toEqual(new Date('2025-01-05'));
    });

    it('should respect custom interval', () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-11');
      const pattern = RecurringPattern.daily(3);

      const occurrences = service.generateDailyOccurrencesForPeriod(
        startDate,
        endDate,
        pattern
      );

      expect(occurrences).toHaveLength(4);
      expect(occurrences[0]).toEqual(new Date('2025-01-01'));
      expect(occurrences[1]).toEqual(new Date('2025-01-04'));
      expect(occurrences[2]).toEqual(new Date('2025-01-07'));
      expect(occurrences[3]).toEqual(new Date('2025-01-10'));
    });

    it('should stop at endDate boundary', () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-03');
      const pattern = RecurringPattern.daily(1);

      const occurrences = service.generateDailyOccurrencesForPeriod(
        startDate,
        endDate,
        pattern
      );

      expect(occurrences).toHaveLength(3);
      expect(occurrences[2]).toEqual(new Date('2025-01-03'));
    });

    it('should respect pattern endDate when before period endDate', () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-10');
      const patternEndDate = new Date('2025-01-05');
      const pattern = RecurringPattern.daily(1, patternEndDate, undefined, startDate);

      const occurrences = service.generateDailyOccurrencesForPeriod(
        startDate,
        endDate,
        pattern
      );

      expect(occurrences).toHaveLength(5);
      expect(occurrences[occurrences.length - 1]).toEqual(
        new Date('2025-01-05')
      );
    });

    it('should use period endDate when pattern endDate is after it', () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-05');
      const patternEndDate = new Date('2025-01-10');
      const pattern = RecurringPattern.daily(1, patternEndDate, undefined, startDate);

      const occurrences = service.generateDailyOccurrencesForPeriod(
        startDate,
        endDate,
        pattern
      );

      expect(occurrences).toHaveLength(5);
      expect(occurrences[occurrences.length - 1]).toEqual(
        new Date('2025-01-05')
      );
    });

    it('should handle single day period', () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-01');
      const pattern = RecurringPattern.daily(1);

      const occurrences = service.generateDailyOccurrencesForPeriod(
        startDate,
        endDate,
        pattern
      );

      expect(occurrences).toHaveLength(1);
      expect(occurrences[0]).toEqual(new Date('2025-01-01'));
    });

    it('should return empty array when startDate after endDate', () => {
      const startDate = new Date('2025-01-10');
      const endDate = new Date('2025-01-05');
      const pattern = RecurringPattern.daily(1);

      const occurrences = service.generateDailyOccurrencesForPeriod(
        startDate,
        endDate,
        pattern
      );

      expect(occurrences).toHaveLength(0);
    });

    it('should handle cross-month boundaries', () => {
      const startDate = new Date('2025-01-30');
      const endDate = new Date('2025-02-03');
      const pattern = RecurringPattern.daily(1);

      const occurrences = service.generateDailyOccurrencesForPeriod(
        startDate,
        endDate,
        pattern
      );

      expect(occurrences).toHaveLength(5);
      expect(occurrences[0]).toEqual(new Date('2025-01-30'));
      expect(occurrences[1]).toEqual(new Date('2025-01-31'));
      expect(occurrences[2]).toEqual(new Date('2025-02-01'));
      expect(occurrences[3]).toEqual(new Date('2025-02-02'));
      expect(occurrences[4]).toEqual(new Date('2025-02-03'));
    });

    it('should handle cross-year boundaries', () => {
      const startDate = new Date('2025-12-30');
      const endDate = new Date('2026-01-02');
      const pattern = RecurringPattern.daily(1);

      const occurrences = service.generateDailyOccurrencesForPeriod(
        startDate,
        endDate,
        pattern
      );

      expect(occurrences).toHaveLength(4);
      expect(occurrences[0]).toEqual(new Date('2025-12-30'));
      expect(occurrences[1]).toEqual(new Date('2025-12-31'));
      expect(occurrences[2]).toEqual(new Date('2026-01-01'));
      expect(occurrences[3]).toEqual(new Date('2026-01-02'));
    });

    it('should preserve time component', () => {
      const startDate = new Date('2025-01-01T10:30:00');
      const endDate = new Date('2025-01-03T10:30:00');
      const pattern = RecurringPattern.daily(1);

      const occurrences = service.generateDailyOccurrencesForPeriod(
        startDate,
        endDate,
        pattern
      );

      occurrences.forEach((occurrence) => {
        expect(occurrence.getHours()).toBe(10);
        expect(occurrence.getMinutes()).toBe(30);
      });
    });
  });

  describe('generateMonthlyOccurrencesForPeriod', () => {
    it('should generate monthly occurrences within period', () => {
      const startDate = new Date(2025, 0, 15);
      const endDate = new Date(2025, 3, 15);
      const pattern = RecurringPattern.monthly(1);

      const occurrences = service.generateMonthlyOccurrencesForPeriod(
        startDate,
        endDate,
        pattern
      );

      expect(occurrences).toHaveLength(4);
      expect(occurrences[0]).toEqual(new Date(2025, 0, 15));
      expect(occurrences[1]).toEqual(new Date(2025, 1, 15));
      expect(occurrences[2]).toEqual(new Date(2025, 2, 15));
      expect(occurrences[3]).toEqual(new Date(2025, 3, 15));
    });

    it('should respect custom interval (quarterly)', () => {
      const startDate = new Date(2025, 0, 1);
      const endDate = new Date(2026, 0, 1);
      const pattern = RecurringPattern.monthly(3);

      const occurrences = service.generateMonthlyOccurrencesForPeriod(
        startDate,
        endDate,
        pattern
      );

      expect(occurrences).toHaveLength(5);
      expect(occurrences[0]).toEqual(new Date(2025, 0, 1));
      expect(occurrences[1]).toEqual(new Date(2025, 3, 1));
      expect(occurrences[2]).toEqual(new Date(2025, 6, 1));
      expect(occurrences[3]).toEqual(new Date(2025, 9, 1));
      expect(occurrences[4]).toEqual(new Date(2026, 0, 1));
    });

    it('should handle month-end overflow with sticky clamping', () => {
      const startDate = new Date(2025, 0, 31);
      const endDate = new Date(2025, 4, 31);
      const pattern = RecurringPattern.monthly(1);

      const occurrences = service.generateMonthlyOccurrencesForPeriod(
        startDate,
        endDate,
        pattern
      );

      expect(occurrences).toHaveLength(5);
      expect(occurrences[0]).toEqual(new Date(2025, 0, 31));
      expect(occurrences[1]).toEqual(new Date(2025, 1, 28)); // Feb has 28
      expect(occurrences[2]).toEqual(new Date(2025, 2, 28)); // Stays 28
      expect(occurrences[3]).toEqual(new Date(2025, 3, 28));
      expect(occurrences[4]).toEqual(new Date(2025, 4, 28));
    });

    it('should handle leap year February', () => {
      const startDate = new Date(2024, 0, 31);
      const endDate = new Date(2024, 3, 30);
      const pattern = RecurringPattern.monthly(1);

      const occurrences = service.generateMonthlyOccurrencesForPeriod(
        startDate,
        endDate,
        pattern
      );

      expect(occurrences).toHaveLength(4);
      expect(occurrences[0]).toEqual(new Date(2024, 0, 31));
      expect(occurrences[1]).toEqual(new Date(2024, 1, 29)); // Leap year
      expect(occurrences[2]).toEqual(new Date(2024, 2, 29));
      expect(occurrences[3]).toEqual(new Date(2024, 3, 29));
    });

    it('should stop at endDate boundary', () => {
      const startDate = new Date(2025, 0, 15);
      const endDate = new Date(2025, 2, 15);
      const pattern = RecurringPattern.monthly(1);

      const occurrences = service.generateMonthlyOccurrencesForPeriod(
        startDate,
        endDate,
        pattern
      );

      expect(occurrences).toHaveLength(3);
      expect(occurrences[occurrences.length - 1]).toEqual(new Date(2025, 2, 15));
    });

    it('should respect pattern endDate when before period endDate', () => {
      const startDate = new Date(2025, 0, 15);
      const endDate = new Date(2025, 5, 15);
      const patternEndDate = new Date(2025, 2, 15);
      const pattern = RecurringPattern.monthly(
        1,
        patternEndDate,
        undefined,
        startDate
      );

      const occurrences = service.generateMonthlyOccurrencesForPeriod(
        startDate,
        endDate,
        pattern
      );

      expect(occurrences).toHaveLength(3);
      expect(occurrences[occurrences.length - 1]).toEqual(new Date(2025, 2, 15));
    });

    it('should use period endDate when pattern endDate is after it', () => {
      const startDate = new Date(2025, 0, 15);
      const endDate = new Date(2025, 2, 15);
      const patternEndDate = new Date(2025, 5, 15);
      const pattern = RecurringPattern.monthly(
        1,
        patternEndDate,
        undefined,
        startDate
      );

      const occurrences = service.generateMonthlyOccurrencesForPeriod(
        startDate,
        endDate,
        pattern
      );

      expect(occurrences).toHaveLength(3);
      expect(occurrences[occurrences.length - 1]).toEqual(new Date(2025, 2, 15));
    });

    it('should handle single month period', () => {
      const startDate = new Date(2025, 0, 15);
      const endDate = new Date(2025, 0, 15);
      const pattern = RecurringPattern.monthly(1);

      const occurrences = service.generateMonthlyOccurrencesForPeriod(
        startDate,
        endDate,
        pattern
      );

      expect(occurrences).toHaveLength(1);
      expect(occurrences[0]).toEqual(new Date(2025, 0, 15));
    });

    it('should return empty array when startDate after endDate', () => {
      const startDate = new Date(2025, 5, 15);
      const endDate = new Date(2025, 2, 15);
      const pattern = RecurringPattern.monthly(1);

      const occurrences = service.generateMonthlyOccurrencesForPeriod(
        startDate,
        endDate,
        pattern
      );

      expect(occurrences).toHaveLength(0);
    });

    it('should handle cross-year boundaries', () => {
      const startDate = new Date(2025, 10, 15);
      const endDate = new Date(2026, 1, 15);
      const pattern = RecurringPattern.monthly(1);

      const occurrences = service.generateMonthlyOccurrencesForPeriod(
        startDate,
        endDate,
        pattern
      );

      expect(occurrences).toHaveLength(4);
      expect(occurrences[0]).toEqual(new Date(2025, 10, 15));
      expect(occurrences[1]).toEqual(new Date(2025, 11, 15));
      expect(occurrences[2]).toEqual(new Date(2026, 0, 15));
      expect(occurrences[3]).toEqual(new Date(2026, 1, 15));
    });

    it('should handle bi-monthly interval', () => {
      const startDate = new Date(2025, 0, 15);
      const endDate = new Date(2025, 6, 15);
      const pattern = RecurringPattern.monthly(2);

      const occurrences = service.generateMonthlyOccurrencesForPeriod(
        startDate,
        endDate,
        pattern
      );

      expect(occurrences).toHaveLength(4);
      expect(occurrences[0]).toEqual(new Date(2025, 0, 15));
      expect(occurrences[1]).toEqual(new Date(2025, 2, 15));
      expect(occurrences[2]).toEqual(new Date(2025, 4, 15));
      expect(occurrences[3]).toEqual(new Date(2025, 6, 15));
    });

    it('should preserve time component', () => {
      const startDate = new Date(2025, 0, 15, 9, 0, 0);
      const endDate = new Date(2025, 2, 15, 9, 0, 0);
      const pattern = RecurringPattern.monthly(1);

      const occurrences = service.generateMonthlyOccurrencesForPeriod(
        startDate,
        endDate,
        pattern
      );

      occurrences.forEach((occurrence) => {
        expect(occurrence.getHours()).toBe(9);
        expect(occurrence.getMinutes()).toBe(0);
      });
    });

    it('should handle endDate mid-month', () => {
      const startDate = new Date(2025, 0, 15);
      const endDate = new Date(2025, 1, 20);
      const pattern = RecurringPattern.monthly(1);

      const occurrences = service.generateMonthlyOccurrencesForPeriod(
        startDate,
        endDate,
        pattern
      );

      expect(occurrences).toHaveLength(2);
      expect(occurrences[0]).toEqual(new Date(2025, 0, 15));
      expect(occurrences[1]).toEqual(new Date(2025, 1, 15));
    });
  });
});
