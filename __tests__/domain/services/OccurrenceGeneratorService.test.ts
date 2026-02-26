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
      const lesson = new Lesson({
        id: 'lesson1',
        title: 'Daily Math',
        teacherIds: ['teacher1'],
        pupilIds: ['pupil1'],
        startDate: new Date('2025-01-01T10:00:00'),
        endDate: new Date('2025-01-01T11:00:00'),
        createdAt: new Date(),
        updatedAt: new Date(),
        description: 'Daily lesson',
        recurringPattern,
      });

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
      const lesson = new Lesson({
        id: 'lesson1',
        title: 'Daily Math',
        teacherIds: ['teacher1'],
        pupilIds: ['pupil1'],
        startDate: new Date('2025-01-01T10:00:00'),
        endDate: new Date('2025-01-01T11:30:00'),
        createdAt: new Date(),
        updatedAt: new Date(),
        description: 'Daily lesson',
        recurringPattern,
      });

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
      const lesson = new Lesson({
        id: 'lesson1',
        title: 'Weekly Math',
        teacherIds: ['teacher1'],
        pupilIds: ['pupil1'],
        startDate: new Date('2025-01-06T10:00:00'),
        endDate: new Date('2025-01-06T11:00:00'),
        createdAt: new Date(),
        updatedAt: new Date(),
        description: 'Weekly lesson',
        recurringPattern,
      });

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
      const lesson = new Lesson({
        id: 'lesson1',
        title: 'Daily Math',
        teacherIds: ['teacher1'],
        pupilIds: ['pupil1'],
        startDate: new Date('2025-01-01T10:00:00'),
        endDate: new Date('2025-01-01T11:00:00'),
        createdAt: new Date(),
        updatedAt: new Date(),
        description: 'Daily lesson',
        recurringPattern,
      });

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
      const lesson = new Lesson({
        id: 'lesson1',
        title: 'Daily Math',
        teacherIds: ['teacher1'],
        pupilIds: ['pupil1'],
        startDate: new Date('2025-01-01T10:00:00'),
        endDate: new Date('2025-01-01T11:00:00'),
        createdAt: new Date(),
        updatedAt: new Date(),
        description: 'Daily lesson',
        recurringPattern,
      });

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

  describe('Boundary Conditions - Period vs Lesson Start Date', () => {
    it('should only generate occurrences within period when periodStart > lesson.startDate (daily)', () => {
      const recurringPattern = RecurringPattern.daily(1);
      const lesson = new Lesson({
        id: 'lesson1',
        title: 'Daily Math',
        teacherIds: ['teacher1'],
        pupilIds: ['pupil1'],
        startDate: new Date('2024-10-01T10:00:00Z'),
        endDate: new Date('2024-10-01T11:00:00Z'),
        createdAt: new Date(),
        updatedAt: new Date(),
        description: 'Daily lesson',
        recurringPattern,
      });

      const periodStart = new Date('2025-01-15T00:00:00Z');
      const periodEnd = new Date('2025-01-18T00:00:00Z');

      const occurrences = service.generateOccurrencesForPeriod(
        lesson,
        [],
        periodStart,
        periodEnd
      );

      expect(occurrences.length).toBeLessThan(10);
      expect(occurrences.length).toBeGreaterThanOrEqual(3);
      expect(occurrences.length).toBeLessThanOrEqual(5);

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
      const lesson = new Lesson({
        id: 'lesson1',
        title: 'Weekly Math',
        teacherIds: ['teacher1'],
        pupilIds: ['pupil1'],
        startDate: new Date('2024-09-02T10:00:00'),
        endDate: new Date('2024-09-02T11:00:00'),
        createdAt: new Date(),
        updatedAt: new Date(),
        description: 'Weekly lesson',
        recurringPattern,
      });

      const periodStart = new Date('2025-01-13T00:00:00');
      const periodEnd = new Date('2025-01-19T23:59:59');

      const occurrences = service.generateOccurrencesForPeriod(
        lesson,
        [],
        periodStart,
        periodEnd
      );

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
      const lesson = new Lesson({
        id: 'lesson1',
        title: 'Future Lesson',
        teacherIds: ['teacher1'],
        pupilIds: ['pupil1'],
        startDate: new Date('2025-06-01T10:00:00'),
        endDate: new Date('2025-06-01T11:00:00'),
        createdAt: new Date(),
        updatedAt: new Date(),
        description: 'Future lesson',
        recurringPattern,
      });

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
      const lesson = new Lesson({
        id: 'lesson1',
        title: 'Daily Math',
        teacherIds: ['teacher1'],
        pupilIds: ['pupil1'],
        startDate: new Date('2025-01-10T10:00:00'),
        endDate: new Date('2025-01-10T11:00:00'),
        createdAt: new Date(),
        updatedAt: new Date(),
        description: 'Daily lesson',
        recurringPattern,
      });

      const periodStart = new Date('2025-01-05T00:00:00');
      const periodEnd = new Date('2025-01-15T23:59:59');

      const occurrences = service.generateOccurrencesForPeriod(
        lesson,
        [],
        periodStart,
        periodEnd
      );

      expect(occurrences).toHaveLength(6);
      expect(occurrences[0].startDate).toEqual(new Date('2025-01-10T10:00:00'));
      expect(occurrences[5].startDate).toEqual(new Date('2025-01-15T10:00:00'));
    });

    it('should respect pattern endDate when it falls within period', () => {
      const lessonStartDate = new Date('2025-01-01T10:00:00Z');
      const patternEndDate = new Date('2025-01-12T23:59:59Z');

      const recurringPattern = RecurringPattern.daily(
        1,
        patternEndDate,
        undefined,
        lessonStartDate
      );

      const lesson = new Lesson({
        id: 'lesson1',
        title: 'Limited Daily Math',
        teacherIds: ['teacher1'],
        pupilIds: ['pupil1'],
        startDate: lessonStartDate,
        endDate: new Date('2025-01-01T11:00:00Z'),
        createdAt: new Date(),
        updatedAt: new Date(),
        description: 'Daily lesson with end date',
        recurringPattern,
      });

      const periodStart = new Date('2025-01-01T00:00:00Z');
      const periodEnd = new Date('2025-01-20T00:00:00Z');

      const occurrences = service.generateOccurrencesForPeriod(
        lesson,
        [],
        periodStart,
        periodEnd
      );

      expect(occurrences.length).toBeGreaterThanOrEqual(11);
      expect(occurrences.length).toBeLessThanOrEqual(14);

      occurrences.forEach((occurrence) => {
        const dateStr = dateService.formatISO(occurrence.startDate);
        expect(dateStr <= '2025-01-15').toBe(true);
      });
    });
  });

  describe('Occurrence Count Limit', () => {
    it('should respect occurrence count for daily pattern', () => {
      const recurringPattern = RecurringPattern.daily(1, undefined, 5);
      const lesson = new Lesson({
        id: 'lesson1',
        title: 'Limited Daily Math',
        teacherIds: ['teacher1'],
        pupilIds: ['pupil1'],
        startDate: new Date('2025-01-01T10:00:00'),
        endDate: new Date('2025-01-01T11:00:00'),
        createdAt: new Date(),
        updatedAt: new Date(),
        description: 'Daily lesson with 5 occurrences max',
        recurringPattern,
      });

      const periodStart = new Date('2025-01-01');
      const periodEnd = new Date('2025-01-31');

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

    it('should respect occurrence count for weekly pattern', () => {
      const recurringPattern = RecurringPattern.weekly(
        [DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY],
        1,
        undefined,
        3
      );
      const lesson = new Lesson({
        id: 'lesson1',
        title: 'Limited Weekly Math',
        teacherIds: ['teacher1'],
        pupilIds: ['pupil1'],
        startDate: new Date('2025-01-06T10:00:00'),
        endDate: new Date('2025-01-06T11:00:00'),
        createdAt: new Date(),
        updatedAt: new Date(),
        description: 'Weekly lesson with 3 occurrences max',
        recurringPattern,
      });

      const periodStart = new Date('2025-01-06');
      const periodEnd = new Date('2025-01-31');

      const occurrences = service.generateOccurrencesForPeriod(
        lesson,
        [],
        periodStart,
        periodEnd
      );

      expect(occurrences).toHaveLength(3);
    });

    it('should stop at occurrence count even when period extends further', () => {
      const recurringPattern = RecurringPattern.daily(2, undefined, 3);
      const lesson = new Lesson({
        id: 'lesson1',
        title: 'Limited Daily Math',
        teacherIds: ['teacher1'],
        pupilIds: ['pupil1'],
        startDate: new Date('2025-01-01T10:00:00'),
        endDate: new Date('2025-01-01T11:00:00'),
        createdAt: new Date(),
        updatedAt: new Date(),
        description: 'Every 2 days, max 3 occurrences',
        recurringPattern,
      });

      const periodStart = new Date('2025-01-01');
      const periodEnd = new Date('2025-12-31');

      const occurrences = service.generateOccurrencesForPeriod(
        lesson,
        [],
        periodStart,
        periodEnd
      );

      expect(occurrences).toHaveLength(3);
      expect(occurrences[0].startDate).toEqual(new Date('2025-01-01T10:00:00'));
      expect(occurrences[1].startDate).toEqual(new Date('2025-01-03T10:00:00'));
      expect(occurrences[2].startDate).toEqual(new Date('2025-01-05T10:00:00'));
    });

    it('should return fewer occurrences if period ends before count reached', () => {
      const recurringPattern = RecurringPattern.daily(1, undefined, 10);
      const lesson = new Lesson({
        id: 'lesson1',
        title: 'Limited Daily Math',
        teacherIds: ['teacher1'],
        pupilIds: ['pupil1'],
        startDate: new Date('2025-01-01T10:00:00'),
        endDate: new Date('2025-01-01T11:00:00'),
        createdAt: new Date(),
        updatedAt: new Date(),
        description: 'Daily lesson with 10 occurrences max',
        recurringPattern,
      });

      const periodStart = new Date('2025-01-01');
      const periodEnd = new Date('2025-01-03');

      const occurrences = service.generateOccurrencesForPeriod(
        lesson,
        [],
        periodStart,
        periodEnd
      );

      expect(occurrences).toHaveLength(3);
    });

    it('should handle occurrence count with exceptions (skipped still counts)', () => {
      const recurringPattern = RecurringPattern.daily(1, undefined, 5);
      const lesson = new Lesson({
        id: 'lesson1',
        title: 'Limited Daily Math',
        teacherIds: ['teacher1'],
        pupilIds: ['pupil1'],
        startDate: new Date('2025-01-01T10:00:00'),
        endDate: new Date('2025-01-01T11:00:00'),
        createdAt: new Date(),
        updatedAt: new Date(),
        description: 'Daily lesson with 5 occurrences',
        recurringPattern,
      });

      const skipException = LessonException.skip(
        'lesson1',
        new Date('2025-01-03T10:00:00')
      );

      const periodStart = new Date('2025-01-01');
      const periodEnd = new Date('2025-01-31');

      const occurrences = service.generateOccurrencesForPeriod(
        lesson,
        [skipException],
        periodStart,
        periodEnd
      );

      expect(occurrences).toHaveLength(4);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle multiple skip exceptions', () => {
      const recurringPattern = RecurringPattern.daily(1);
      const lesson = new Lesson({
        id: 'lesson1',
        title: 'Daily Math',
        teacherIds: ['teacher1'],
        pupilIds: ['pupil1'],
        startDate: new Date('2025-01-01T10:00:00'),
        endDate: new Date('2025-01-01T11:00:00'),
        createdAt: new Date(),
        updatedAt: new Date(),
        description: 'Daily lesson',
        recurringPattern,
      });

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
      expect(dates).not.toContain('2025-01-02');
      expect(dates).not.toContain('2025-01-04');
    });

    it('should sort occurrences by date', () => {
      const recurringPattern = RecurringPattern.daily(1);
      const lesson = new Lesson({
        id: 'lesson1',
        title: 'Daily Math',
        teacherIds: ['teacher1'],
        pupilIds: ['pupil1'],
        startDate: new Date('2025-01-01T10:00:00'),
        endDate: new Date('2025-01-01T11:00:00'),
        createdAt: new Date(),
        updatedAt: new Date(),
        description: 'Daily lesson',
        recurringPattern,
      });

      const periodStart = new Date('2025-01-01');
      const periodEnd = new Date('2025-01-05');

      const occurrences = service.generateOccurrencesForPeriod(
        lesson,
        [],
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
