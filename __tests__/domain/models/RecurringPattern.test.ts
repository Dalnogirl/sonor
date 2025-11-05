import { describe, it, expect } from 'vitest';
import {
  RecurringPattern,
  RecurringFrequency,
  DayOfWeek,
} from '@/domain/models/RecurringPattern';

describe('RecurringPattern', () => {
  describe('constructor validation', () => {
    it('should create a valid daily pattern', () => {
      const pattern = new RecurringPattern(RecurringFrequency.DAILY, 1);

      expect(pattern.frequency).toBe(RecurringFrequency.DAILY);
      expect(pattern.interval).toBe(1);
      expect(pattern.daysOfWeek).toEqual([]);
      expect(pattern.endDate).toBeNull();
      expect(pattern.occurrences).toBeNull();
    });

    it('should create a valid weekly pattern with days', () => {
      const pattern = new RecurringPattern(RecurringFrequency.WEEKLY, 1, [
        DayOfWeek.MONDAY,
        DayOfWeek.WEDNESDAY,
      ]);

      expect(pattern.frequency).toBe(RecurringFrequency.WEEKLY);
      expect(pattern.daysOfWeek).toEqual([
        DayOfWeek.MONDAY,
        DayOfWeek.WEDNESDAY,
      ]);
    });

    it('should create a valid monthly pattern', () => {
      const pattern = new RecurringPattern(RecurringFrequency.MONTHLY, 2);

      expect(pattern.frequency).toBe(RecurringFrequency.MONTHLY);
      expect(pattern.interval).toBe(2);
    });

    it('should throw error when interval is less than 1', () => {
      expect(() => new RecurringPattern(RecurringFrequency.DAILY, 0)).toThrow(
        'Interval must be at least 1'
      );

      expect(() => new RecurringPattern(RecurringFrequency.DAILY, -1)).toThrow(
        'Interval must be at least 1'
      );
    });

    it('should throw error when occurrences is less than 1', () => {
      expect(
        () => new RecurringPattern(RecurringFrequency.DAILY, 1, [], null, 0)
      ).toThrow('Occurrences must be at least 1');

      expect(
        () => new RecurringPattern(RecurringFrequency.DAILY, 1, [], null, -5)
      ).toThrow('Occurrences must be at least 1');
    });

    it('should throw error when both endDate and occurrences are specified', () => {
      const endDate = new Date('2025-12-31');

      expect(
        () => new RecurringPattern(RecurringFrequency.DAILY, 1, [], endDate, 10)
      ).toThrow('Cannot specify both endDate and occurrences');
    });

    it('should throw error when weekly pattern has no days of week', () => {
      expect(
        () => new RecurringPattern(RecurringFrequency.WEEKLY, 1, [])
      ).toThrow('Weekly recurrence must specify at least one day of week');
    });

    it('should throw error when non-weekly pattern has days of week', () => {
      expect(
        () =>
          new RecurringPattern(RecurringFrequency.DAILY, 1, [DayOfWeek.MONDAY])
      ).toThrow('Days of week can only be specified for weekly recurrence');

      expect(
        () =>
          new RecurringPattern(RecurringFrequency.MONTHLY, 1, [
            DayOfWeek.FRIDAY,
          ])
      ).toThrow('Days of week can only be specified for weekly recurrence');
    });

    it('should throw error when days of week contain duplicates', () => {
      expect(
        () =>
          new RecurringPattern(RecurringFrequency.WEEKLY, 1, [
            DayOfWeek.MONDAY,
            DayOfWeek.MONDAY,
          ])
      ).toThrow('Duplicate days of week are not allowed');
    });
  });

  describe('factory methods', () => {
    describe('daily', () => {
      it('should create daily pattern with default interval', () => {
        const pattern = RecurringPattern.daily();

        expect(pattern.frequency).toBe(RecurringFrequency.DAILY);
        expect(pattern.interval).toBe(1);
        expect(pattern.daysOfWeek).toEqual([]);
        expect(pattern.endDate).toBeNull();
        expect(pattern.occurrences).toBeNull();
      });

      it('should create daily pattern with custom interval', () => {
        const pattern = RecurringPattern.daily(3);

        expect(pattern.interval).toBe(3);
      });

      it('should create daily pattern with end date', () => {
        const endDate = new Date('2025-12-31');
        const pattern = RecurringPattern.daily(1, endDate);

        expect(pattern.endDate).toEqual(endDate);
      });

      it('should create daily pattern with occurrences', () => {
        const pattern = RecurringPattern.daily(1, undefined, 10);

        expect(pattern.occurrences).toBe(10);
      });
    });

    describe('weekly', () => {
      it('should create weekly pattern with default interval', () => {
        const pattern = RecurringPattern.weekly([DayOfWeek.MONDAY]);

        expect(pattern.frequency).toBe(RecurringFrequency.WEEKLY);
        expect(pattern.interval).toBe(1);
        expect(pattern.daysOfWeek).toEqual([DayOfWeek.MONDAY]);
      });

      it('should create weekly pattern with multiple days', () => {
        const days = [DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY, DayOfWeek.FRIDAY];
        const pattern = RecurringPattern.weekly(days);

        expect(pattern.daysOfWeek).toEqual(days);
      });

      it('should create bi-weekly pattern', () => {
        const pattern = RecurringPattern.weekly([DayOfWeek.TUESDAY], 2);

        expect(pattern.interval).toBe(2);
      });

      it('should create weekly pattern with end date', () => {
        const endDate = new Date('2026-01-01');
        const pattern = RecurringPattern.weekly([DayOfWeek.FRIDAY], 1, endDate);

        expect(pattern.endDate).toEqual(endDate);
      });

      it('should create weekly pattern with occurrences', () => {
        const pattern = RecurringPattern.weekly(
          [DayOfWeek.THURSDAY],
          1,
          undefined,
          8
        );

        expect(pattern.occurrences).toBe(8);
      });
    });

    describe('monthly', () => {
      it('should create monthly pattern with default interval', () => {
        const pattern = RecurringPattern.monthly();

        expect(pattern.frequency).toBe(RecurringFrequency.MONTHLY);
        expect(pattern.interval).toBe(1);
        expect(pattern.daysOfWeek).toEqual([]);
      });

      it('should create monthly pattern with custom interval', () => {
        const pattern = RecurringPattern.monthly(3);

        expect(pattern.interval).toBe(3);
      });

      it('should create monthly pattern with end date', () => {
        const endDate = new Date('2026-06-30');
        const pattern = RecurringPattern.monthly(1, endDate);

        expect(pattern.endDate).toEqual(endDate);
      });

      it('should create monthly pattern with occurrences', () => {
        const pattern = RecurringPattern.monthly(2, undefined, 6);

        expect(pattern.occurrences).toBe(6);
      });
    });
  });

  describe('equals', () => {
    it('should return true for identical patterns', () => {
      const pattern1 = RecurringPattern.daily(2);
      const pattern2 = RecurringPattern.daily(2);

      expect(pattern1.equals(pattern2)).toBe(true);
    });

    it('should return false when frequencies differ', () => {
      const pattern1 = RecurringPattern.daily();
      const pattern2 = RecurringPattern.monthly();

      expect(pattern1.equals(pattern2)).toBe(false);
    });

    it('should return false when intervals differ', () => {
      const pattern1 = RecurringPattern.daily(1);
      const pattern2 = RecurringPattern.daily(2);

      expect(pattern1.equals(pattern2)).toBe(false);
    });

    it('should return false when days of week differ', () => {
      const pattern1 = RecurringPattern.weekly([DayOfWeek.MONDAY]);
      const pattern2 = RecurringPattern.weekly([DayOfWeek.TUESDAY]);

      expect(pattern1.equals(pattern2)).toBe(false);
    });

    it('should return true when days of week are in different order', () => {
      const pattern1 = RecurringPattern.weekly([
        DayOfWeek.MONDAY,
        DayOfWeek.FRIDAY,
      ]);
      const pattern2 = RecurringPattern.weekly([
        DayOfWeek.FRIDAY,
        DayOfWeek.MONDAY,
      ]);

      expect(pattern1.equals(pattern2)).toBe(true);
    });

    it('should return false when end dates differ', () => {
      const date1 = new Date('2025-12-31');
      const date2 = new Date('2026-01-01');
      const pattern1 = RecurringPattern.daily(1, date1);
      const pattern2 = RecurringPattern.daily(1, date2);

      expect(pattern1.equals(pattern2)).toBe(false);
    });

    it('should return false when occurrences differ', () => {
      const pattern1 = RecurringPattern.daily(1, undefined, 5);
      const pattern2 = RecurringPattern.daily(1, undefined, 10);

      expect(pattern1.equals(pattern2)).toBe(false);
    });

    it('should return true for complex identical patterns', () => {
      const endDate = new Date('2026-03-15');
      const pattern1 = RecurringPattern.weekly(
        [DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY],
        2,
        endDate
      );
      const pattern2 = RecurringPattern.weekly(
        [DayOfWeek.WEDNESDAY, DayOfWeek.MONDAY],
        2,
        endDate
      );

      expect(pattern1.equals(pattern2)).toBe(true);
    });
  });

  describe('immutability', () => {
    it('should not allow modification of daysOfWeek array', () => {
      const pattern = RecurringPattern.weekly([DayOfWeek.MONDAY]);
      const originalLength = pattern.daysOfWeek.length;

      pattern.daysOfWeek.push(DayOfWeek.TUESDAY);

      const newPattern = RecurringPattern.weekly([DayOfWeek.MONDAY]);
      expect(newPattern.daysOfWeek).toHaveLength(originalLength);
    });
  });

  describe('edge cases', () => {
    it('should handle weekly pattern with all days of week', () => {
      const allDays = [
        DayOfWeek.SUNDAY,
        DayOfWeek.MONDAY,
        DayOfWeek.TUESDAY,
        DayOfWeek.WEDNESDAY,
        DayOfWeek.THURSDAY,
        DayOfWeek.FRIDAY,
        DayOfWeek.SATURDAY,
      ];

      const pattern = RecurringPattern.weekly(allDays);

      expect(pattern.daysOfWeek).toHaveLength(7);
    });

    it('should handle large interval values', () => {
      const pattern = RecurringPattern.daily(365);

      expect(pattern.interval).toBe(365);
    });

    it('should handle large occurrence values', () => {
      const pattern = RecurringPattern.daily(1, undefined, 1000);

      expect(pattern.occurrences).toBe(1000);
    });
  });
});
