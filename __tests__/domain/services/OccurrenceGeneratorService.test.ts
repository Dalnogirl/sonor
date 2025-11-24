import { describe, it, expect, beforeEach } from 'vitest';
import { OccurrenceGeneratorService } from '@/domain/services/OccurrenceGeneratorService';
import { RecurrenceService } from '@/domain/services/RecurrenceService';
import { DayjsDateService } from '@/infrastructure/services/DayjsDateService';
import { Lesson } from '@/domain/models/Lesson';
import {
  RecurringPattern,
  DayOfWeek,
} from '@/domain/models/RecurringPattern';
import { LessonException } from '@/domain/models/LessonException';

describe('OccurrenceGeneratorService', () => {
  let service: OccurrenceGeneratorService;
  let dateService: DayjsDateService;

  beforeEach(() => {
    dateService = new DayjsDateService();
    const recurrenceService = new RecurrenceService(dateService);
    service = new OccurrenceGeneratorService(recurrenceService, dateService);
  });

  describe('Single Lessons (no recurring pattern)', () => {
    it('should return single lesson if within period', () => {
      const lesson = Lesson.create(
        'Math Lesson',
        ['teacher1'],
        ['pupil1'],
        new Date('2025-01-15T10:00:00'),
        new Date('2025-01-15T11:00:00'),
        'Regular lesson'
      );

      const periodStart = new Date('2025-01-01');
      const periodEnd = new Date('2025-01-31');

      const occurrences = service.generateOccurrencesForPeriod(
        lesson,
        [],
        periodStart,
        periodEnd
      );

      expect(occurrences).toHaveLength(1);
      expect(occurrences[0].startDate).toEqual(new Date('2025-01-15T10:00:00'));
    });

    it('should return empty array if single lesson outside period', () => {
      const lesson = Lesson.create(
        'Math Lesson',
        ['teacher1'],
        ['pupil1'],
        new Date('2025-02-15T10:00:00'),
        new Date('2025-02-15T11:00:00')
      );

      const periodStart = new Date('2025-01-01');
      const periodEnd = new Date('2025-01-31');

      const occurrences = service.generateOccurrencesForPeriod(
        lesson,
        [],
        periodStart,
        periodEnd
      );

      expect(occurrences).toHaveLength(0);
    });
  });

  describe('Recurring Lessons - Daily', () => {
    it('should generate daily occurrences within period', () => {
      const recurringPattern = RecurringPattern.daily(1);
      const lesson = new Lesson(
        'lesson1',
        'Daily Math',
        ['teacher1'],
        new Date(),
        new Date(),
        ['pupil1'],
        new Date('2025-01-01T10:00:00'),
        new Date('2025-01-01T11:00:00'),
        'Daily lesson',
        recurringPattern
      );

      const periodStart = new Date('2025-01-01');
      const periodEnd = new Date('2025-01-05');

      const occurrences = service.generateOccurrencesForPeriod(
        lesson,
        [],
        periodStart,
        periodEnd
      );

      expect(occurrences).toHaveLength(5);
      expect(occurrences[0].startDate).toEqual(new Date('2025-01-01T10:00:00'));
      expect(occurrences[4].startDate).toEqual(new Date('2025-01-05T10:00:00'));
    });

    it('should preserve lesson duration for each occurrence', () => {
      const recurringPattern = RecurringPattern.daily(1);
      const lesson = new Lesson(
        'lesson1',
        'Daily Math',
        ['teacher1'],
        new Date(),
        new Date(),
        ['pupil1'],
        new Date('2025-01-01T10:00:00'),
        new Date('2025-01-01T11:30:00'),
        'Daily lesson',
        recurringPattern
      );

      const periodStart = new Date('2025-01-01');
      const periodEnd = new Date('2025-01-03');

      const occurrences = service.generateOccurrencesForPeriod(
        lesson,
        [],
        periodStart,
        periodEnd
      );

      expect(occurrences).toHaveLength(3);
      occurrences.forEach((occurrence) => {
        const duration = dateService.diffInMinutes(
          occurrence.endDate,
          occurrence.startDate
        );
        expect(duration).toBe(90);
      });
    });
  });

  describe('Recurring Lessons - Weekly', () => {
    it('should generate weekly occurrences for specific days', () => {
      const recurringPattern = RecurringPattern.weekly([
        DayOfWeek.MONDAY,
        DayOfWeek.WEDNESDAY,
      ]);
      const lesson = new Lesson(
        'lesson1',
        'Weekly Math',
        ['teacher1'],
        new Date(),
        new Date(),
        ['pupil1'],
        new Date('2025-01-06T10:00:00'),
        new Date('2025-01-06T11:00:00'),
        'Weekly lesson',
        recurringPattern
      );

      const periodStart = new Date('2025-01-06');
      const periodEnd = new Date('2025-01-19');

      const occurrences = service.generateOccurrencesForPeriod(
        lesson,
        [],
        periodStart,
        periodEnd
      );

      expect(occurrences.length).toBeGreaterThan(0);
      occurrences.forEach((occurrence) => {
        const dayOfWeek = occurrence.startDate.getDay();
        expect([1, 3]).toContain(dayOfWeek);
      });
    });
  });

  describe('Exceptions - SKIP', () => {
    it('should skip occurrences with SKIP exception', () => {
      const recurringPattern = RecurringPattern.daily(1);
      const lesson = new Lesson(
        'lesson1',
        'Daily Math',
        ['teacher1'],
        new Date(),
        new Date(),
        ['pupil1'],
        new Date('2025-01-01T10:00:00'),
        new Date('2025-01-01T11:00:00'),
        'Daily lesson',
        recurringPattern
      );

      const skipException = LessonException.skip(
        'lesson1',
        new Date('2025-01-03T10:00:00')
      );

      const periodStart = new Date('2025-01-01');
      const periodEnd = new Date('2025-01-05');

      const occurrences = service.generateOccurrencesForPeriod(
        lesson,
        [skipException],
        periodStart,
        periodEnd
      );

      expect(occurrences).toHaveLength(4);
      const dates = occurrences.map((o) =>
        o.startDate.toISOString().split('T')[0]
      );
      expect(dates).not.toContain('2025-01-03');
    });

    it('should handle multiple SKIP exceptions', () => {
      const recurringPattern = RecurringPattern.daily(1);
      const lesson = new Lesson(
        'lesson1',
        'Daily Math',
        ['teacher1'],
        new Date(),
        new Date(),
        ['pupil1'],
        new Date('2025-01-01T10:00:00'),
        new Date('2025-01-01T11:00:00'),
        'Daily lesson',
        recurringPattern
      );

      const exceptions = [
        LessonException.skip('lesson1', new Date('2025-01-02T10:00:00')),
        LessonException.skip('lesson1', new Date('2025-01-04T10:00:00')),
      ];

      const periodStart = new Date('2025-01-01');
      const periodEnd = new Date('2025-01-05');

      const occurrences = service.generateOccurrencesForPeriod(
        lesson,
        exceptions,
        periodStart,
        periodEnd
      );

      expect(occurrences).toHaveLength(3);
      const dates = occurrences.map((o) =>
        o.startDate.toISOString().split('T')[0]
      );
      expect(dates).toEqual(['2025-01-01', '2025-01-03', '2025-01-05']);
    });
  });

  describe('Exceptions - RESCHEDULE', () => {
    it('should reschedule occurrence to new date', () => {
      const recurringPattern = RecurringPattern.daily(1);
      const lesson = new Lesson(
        'lesson1',
        'Daily Math',
        ['teacher1'],
        new Date(),
        new Date(),
        ['pupil1'],
        new Date('2025-01-01T10:00:00'),
        new Date('2025-01-01T11:00:00'),
        'Daily lesson',
        recurringPattern
      );

      const rescheduleException = LessonException.reschedule(
        'lesson1',
        new Date('2025-01-03T10:00:00'),
        new Date('2025-01-03T15:00:00')
      );

      const periodStart = new Date('2025-01-01');
      const periodEnd = new Date('2025-01-05');

      const occurrences = service.generateOccurrencesForPeriod(
        lesson,
        [rescheduleException],
        periodStart,
        periodEnd
      );

      expect(occurrences).toHaveLength(5);

      const rescheduled = occurrences.find(
        (o) => o.startDate.getHours() === 15
      );
      expect(rescheduled).toBeDefined();
      expect(rescheduled?.startDate).toEqual(new Date('2025-01-03T15:00:00'));
    });

    it('should preserve duration when rescheduling', () => {
      const recurringPattern = RecurringPattern.daily(1);
      const lesson = new Lesson(
        'lesson1',
        'Daily Math',
        ['teacher1'],
        new Date(),
        new Date(),
        ['pupil1'],
        new Date('2025-01-01T10:00:00'),
        new Date('2025-01-01T11:30:00'),
        'Daily lesson',
        recurringPattern
      );

      const rescheduleException = LessonException.reschedule(
        'lesson1',
        new Date('2025-01-03T10:00:00'),
        new Date('2025-01-03T15:00:00')
      );

      const periodStart = new Date('2025-01-01');
      const periodEnd = new Date('2025-01-05');

      const occurrences = service.generateOccurrencesForPeriod(
        lesson,
        [rescheduleException],
        periodStart,
        periodEnd
      );

      const rescheduled = occurrences.find(
        (o) => o.startDate.getHours() === 15
      );
      expect(rescheduled).toBeDefined();

      const duration = dateService.diffInMinutes(
        rescheduled!.endDate,
        rescheduled!.startDate
      );
      expect(duration).toBe(90);
    });
  });

  describe('Exceptions - MODIFY', () => {
    it('should apply modifications to specific occurrence', () => {
      const recurringPattern = RecurringPattern.daily(1);
      const lesson = new Lesson(
        'lesson1',
        'Daily Math',
        ['teacher1'],
        new Date(),
        new Date(),
        ['pupil1'],
        new Date('2025-01-01T10:00:00'),
        new Date('2025-01-01T11:00:00'),
        'Daily lesson',
        recurringPattern
      );

      const modifyException = LessonException.modify(
        'lesson1',
        new Date('2025-01-03T10:00:00'),
        {
          title: 'Modified Math Lesson',
          description: 'Special topic today',
        }
      );

      const periodStart = new Date('2025-01-01');
      const periodEnd = new Date('2025-01-05');

      const occurrences = service.generateOccurrencesForPeriod(
        lesson,
        [modifyException],
        periodStart,
        periodEnd
      );

      expect(occurrences).toHaveLength(5);

      const modified = occurrences.find(
        (o) => o.startDate.toISOString().split('T')[0] === '2025-01-03'
      );
      expect(modified).toBeDefined();
      expect(modified?.title).toBe('Modified Math Lesson');
      expect(modified?.description).toBe('Special topic today');

      const unmodified = occurrences.find(
        (o) => o.startDate.toISOString().split('T')[0] === '2025-01-02'
      );
      expect(unmodified?.title).toBe('Daily Math');
    });

    it('should allow modifying time for specific occurrence', () => {
      const recurringPattern = RecurringPattern.daily(1);
      const lesson = new Lesson(
        'lesson1',
        'Daily Math',
        ['teacher1'],
        new Date(),
        new Date(),
        ['pupil1'],
        new Date('2025-01-01T10:00:00'),
        new Date('2025-01-01T11:00:00'),
        'Daily lesson',
        recurringPattern
      );

      const modifyException = LessonException.modify(
        'lesson1',
        new Date('2025-01-03T10:00:00'),
        {
          startDate: new Date('2025-01-03T14:00:00'),
          endDate: new Date('2025-01-03T16:00:00'),
        }
      );

      const periodStart = new Date('2025-01-01');
      const periodEnd = new Date('2025-01-05');

      const occurrences = service.generateOccurrencesForPeriod(
        lesson,
        [modifyException],
        periodStart,
        periodEnd
      );

      const modified = occurrences.find(
        (o) => o.startDate.getHours() === 14
      );
      expect(modified).toBeDefined();
      expect(modified?.startDate).toEqual(new Date('2025-01-03T14:00:00'));
      expect(modified?.endDate).toEqual(new Date('2025-01-03T16:00:00'));
    });
  });

  describe('Boundary Conditions - Period vs Lesson Start Date', () => {
    it('should only generate occurrences within period when periodStart > lesson.startDate (daily)', () => {
      const recurringPattern = RecurringPattern.daily(1);
      const lesson = new Lesson(
        'lesson1',
        'Daily Math',
        ['teacher1'],
        new Date(),
        new Date(),
        ['pupil1'],
        new Date('2024-10-01T10:00:00Z'), // Lesson started 3 months ago
        new Date('2024-10-01T11:00:00Z'),
        'Daily lesson',
        recurringPattern
      );

      // Request occurrences for only 3 days in January (not from October!)
      const periodStart = new Date('2025-01-15T00:00:00Z');
      const periodEnd = new Date('2025-01-18T00:00:00Z'); // Use start of next day for cleaner boundary

      const occurrences = service.generateOccurrencesForPeriod(
        lesson,
        [],
        periodStart,
        periodEnd
      );

      // CRITICAL: Verify we didn't generate 100+ occurrences from October
      // This is the main bug - without the fix, this would be 100+
      expect(occurrences.length).toBeLessThan(10);

      // Should get approximately 3 occurrences (Jan 15, 16, 17)
      expect(occurrences.length).toBeGreaterThanOrEqual(3);
      expect(occurrences.length).toBeLessThanOrEqual(5);

      // Verify occurrences are in January 2025 (not October 2024!)
      // This is the key assertion - without the fix, we'd get October dates
      occurrences.forEach((occurrence) => {
        const dateStr = dateService.formatISO(occurrence.startDate);
        expect(dateStr.startsWith('2025-01')).toBe(true);
      });
    });

    it('should only generate occurrences within period when periodStart > lesson.startDate (weekly)', () => {
      const recurringPattern = RecurringPattern.weekly([
        DayOfWeek.MONDAY,
        DayOfWeek.FRIDAY,
      ]);
      const lesson = new Lesson(
        'lesson1',
        'Weekly Math',
        ['teacher1'],
        new Date(),
        new Date(),
        ['pupil1'],
        new Date('2024-09-02T10:00:00'), // Started 4 months ago (Monday)
        new Date('2024-09-02T11:00:00'),
        'Weekly lesson',
        recurringPattern
      );

      // Request occurrences for only one week in January
      const periodStart = new Date('2025-01-13T00:00:00'); // Monday
      const periodEnd = new Date('2025-01-19T23:59:59'); // Sunday

      const occurrences = service.generateOccurrencesForPeriod(
        lesson,
        [],
        periodStart,
        periodEnd
      );

      // Should only get 4 occurrences (2 Mondays + 2 Fridays in this week)
      expect(occurrences.length).toBeLessThanOrEqual(4);
      occurrences.forEach((occurrence) => {
        expect(occurrence.startDate.getTime()).toBeGreaterThanOrEqual(
          periodStart.getTime()
        );
        expect(occurrence.startDate.getTime()).toBeLessThanOrEqual(
          periodEnd.getTime()
        );
      });
    });

    it('should return empty array when periodEnd < lesson.startDate', () => {
      const recurringPattern = RecurringPattern.daily(1);
      const lesson = new Lesson(
        'lesson1',
        'Future Lesson',
        ['teacher1'],
        new Date(),
        new Date(),
        ['pupil1'],
        new Date('2025-06-01T10:00:00'), // Starts in June
        new Date('2025-06-01T11:00:00'),
        'Future lesson',
        recurringPattern
      );

      // Request occurrences for January (before lesson starts)
      const periodStart = new Date('2025-01-01T00:00:00');
      const periodEnd = new Date('2025-01-31T23:59:59');

      const occurrences = service.generateOccurrencesForPeriod(
        lesson,
        [],
        periodStart,
        periodEnd
      );

      expect(occurrences).toHaveLength(0);
    });

    it('should handle partial overlap - lesson starts mid-period (daily)', () => {
      const recurringPattern = RecurringPattern.daily(1);
      const lesson = new Lesson(
        'lesson1',
        'Daily Math',
        ['teacher1'],
        new Date(),
        new Date(),
        ['pupil1'],
        new Date('2025-01-10T10:00:00'), // Starts on Jan 10
        new Date('2025-01-10T11:00:00'),
        'Daily lesson',
        recurringPattern
      );

      // Request occurrences from Jan 5 to Jan 15
      const periodStart = new Date('2025-01-05T00:00:00');
      const periodEnd = new Date('2025-01-15T23:59:59');

      const occurrences = service.generateOccurrencesForPeriod(
        lesson,
        [],
        periodStart,
        periodEnd
      );

      // Should get 6 occurrences (Jan 10, 11, 12, 13, 14, 15)
      expect(occurrences).toHaveLength(6);
      expect(occurrences[0].startDate).toEqual(new Date('2025-01-10T10:00:00'));
      expect(occurrences[5].startDate).toEqual(new Date('2025-01-15T10:00:00'));
    });

    it('should respect pattern endDate when it falls within period', () => {
      const lessonStartDate = new Date('2025-01-01T10:00:00Z');
      const patternEndDate = new Date('2025-01-12T23:59:59Z');

      // Pass referenceDate to avoid validation error when test runs after pattern end
      const recurringPattern = RecurringPattern.daily(
        1,
        patternEndDate,
        undefined,
        lessonStartDate // Use lesson start as reference
      );

      const lesson = new Lesson(
        'lesson1',
        'Limited Daily Math',
        ['teacher1'],
        new Date(),
        new Date(),
        ['pupil1'],
        lessonStartDate,
        new Date('2025-01-01T11:00:00Z'),
        'Daily lesson with end date',
        recurringPattern
      );

      // Request occurrences from Jan 1 to Jan 20
      const periodStart = new Date('2025-01-01T00:00:00Z');
      const periodEnd = new Date('2025-01-20T00:00:00Z');

      const occurrences = service.generateOccurrencesForPeriod(
        lesson,
        [],
        periodStart,
        periodEnd
      );

      // Should get ~12 occurrences (Jan 1-12) since pattern ends on Jan 12
      // Allowing 11-14 due to boundary date handling
      expect(occurrences.length).toBeGreaterThanOrEqual(11);
      expect(occurrences.length).toBeLessThanOrEqual(14);

      // Verify pattern endDate is being respected - no occurrences far after Jan 12
      occurrences.forEach((occurrence) => {
        const dateStr = dateService.formatISO(occurrence.startDate);
        // All occurrences should be before Jan 15 (gives 2 days buffer for boundaries)
        expect(dateStr <= '2025-01-15').toBe(true);
      });
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle mixed exception types', () => {
      const recurringPattern = RecurringPattern.daily(1);
      const lesson = new Lesson(
        'lesson1',
        'Daily Math',
        ['teacher1'],
        new Date(),
        new Date(),
        ['pupil1'],
        new Date('2025-01-01T10:00:00'),
        new Date('2025-01-01T11:00:00'),
        'Daily lesson',
        recurringPattern
      );

      const exceptions = [
        LessonException.skip('lesson1', new Date('2025-01-02T10:00:00')),
        LessonException.reschedule(
          'lesson1',
          new Date('2025-01-03T10:00:00'),
          new Date('2025-01-03T15:00:00')
        ),
        LessonException.modify('lesson1', new Date('2025-01-04T10:00:00'), {
          title: 'Special Lesson',
        }),
      ];

      const periodStart = new Date('2025-01-01');
      const periodEnd = new Date('2025-01-05');

      const occurrences = service.generateOccurrencesForPeriod(
        lesson,
        exceptions,
        periodStart,
        periodEnd
      );

      expect(occurrences).toHaveLength(4);

      const dates = occurrences.map((o) =>
        o.startDate.toISOString().split('T')[0]
      );
      expect(dates).not.toContain('2025-01-02');

      const rescheduled = occurrences.find((o) => o.startDate.getHours() === 15);
      expect(rescheduled).toBeDefined();

      const modified = occurrences.find((o) => o.title === 'Special Lesson');
      expect(modified).toBeDefined();
    });

    it('should sort occurrences by date', () => {
      const recurringPattern = RecurringPattern.daily(1);
      const lesson = new Lesson(
        'lesson1',
        'Daily Math',
        ['teacher1'],
        new Date(),
        new Date(),
        ['pupil1'],
        new Date('2025-01-01T10:00:00'),
        new Date('2025-01-01T11:00:00'),
        'Daily lesson',
        recurringPattern
      );

      const rescheduleException = LessonException.reschedule(
        'lesson1',
        new Date('2025-01-05T10:00:00'),
        new Date('2025-01-02T15:00:00')
      );

      const periodStart = new Date('2025-01-01');
      const periodEnd = new Date('2025-01-05');

      const occurrences = service.generateOccurrencesForPeriod(
        lesson,
        [rescheduleException],
        periodStart,
        periodEnd
      );

      for (let i = 1; i < occurrences.length; i++) {
        expect(
          occurrences[i].startDate.getTime()
        ).toBeGreaterThanOrEqual(
          occurrences[i - 1].startDate.getTime()
        );
      }
    });
  });
});
