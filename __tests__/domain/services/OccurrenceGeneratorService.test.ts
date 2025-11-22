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
