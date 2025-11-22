import { describe, it, expect } from 'vitest';
import {
  LessonException,
  ExceptionType,
} from '@/domain/models/LessonException';

describe('LessonException', () => {
  const lessonId = 'lesson-123';
  const originalDate = new Date('2025-01-15');

  describe('skip factory', () => {
    it('should create SKIP exception', () => {
      const exception = LessonException.skip(lessonId, originalDate);

      expect(exception.lessonId).toBe(lessonId);
      expect(exception.originalDate).toEqual(originalDate);
      expect(exception.type).toBe(ExceptionType.SKIP);
      expect(exception.newDate).toBeNull();
      expect(exception.modifications).toBeNull();
      expect(exception.isSkipped()).toBe(true);
      expect(exception.isRescheduled()).toBe(false);
      expect(exception.isModified()).toBe(false);
    });

    it('should generate unique IDs', () => {
      const exception1 = LessonException.skip(lessonId, originalDate);
      const exception2 = LessonException.skip(lessonId, originalDate);

      expect(exception1.id).not.toBe(exception2.id);
    });
  });

  describe('reschedule factory', () => {
    it('should create RESCHEDULE exception', () => {
      const newDate = new Date('2025-01-20');
      const exception = LessonException.reschedule(
        lessonId,
        originalDate,
        newDate
      );

      expect(exception.lessonId).toBe(lessonId);
      expect(exception.originalDate).toEqual(originalDate);
      expect(exception.type).toBe(ExceptionType.RESCHEDULE);
      expect(exception.newDate).toEqual(newDate);
      expect(exception.modifications).toBeNull();
      expect(exception.isSkipped()).toBe(false);
      expect(exception.isRescheduled()).toBe(true);
      expect(exception.isModified()).toBe(false);
    });

    it('should throw when rescheduling to same date', () => {
      expect(() =>
        LessonException.reschedule(lessonId, originalDate, originalDate)
      ).toThrow('Cannot reschedule to same date');
    });
  });

  describe('modify factory', () => {
    it('should create MODIFY exception', () => {
      const modifications = {
        title: 'Modified Title',
        description: 'Modified Description',
      };

      const exception = LessonException.modify(
        lessonId,
        originalDate,
        modifications
      );

      expect(exception.lessonId).toBe(lessonId);
      expect(exception.originalDate).toEqual(originalDate);
      expect(exception.type).toBe(ExceptionType.MODIFY);
      expect(exception.newDate).toBeNull();
      expect(exception.modifications).toEqual(modifications);
      expect(exception.isSkipped()).toBe(false);
      expect(exception.isRescheduled()).toBe(false);
      expect(exception.isModified()).toBe(true);
    });

    it('should accept partial modifications', () => {
      const modifications = { title: 'New Title' };

      const exception = LessonException.modify(
        lessonId,
        originalDate,
        modifications
      );

      expect(exception.modifications).toEqual(modifications);
    });
  });

  describe('validation', () => {
    it('should throw when RESCHEDULE missing newDate', () => {
      expect(
        () =>
          new LessonException(
            'id',
            lessonId,
            originalDate,
            ExceptionType.RESCHEDULE,
            null
          )
      ).toThrow('RESCHEDULE exception requires newDate');
    });

    it('should throw when MODIFY missing modifications', () => {
      expect(
        () =>
          new LessonException(
            'id',
            lessonId,
            originalDate,
            ExceptionType.MODIFY,
            null,
            null
          )
      ).toThrow('MODIFY exception requires modifications');
    });

    it('should throw when SKIP has newDate', () => {
      expect(
        () =>
          new LessonException(
            'id',
            lessonId,
            originalDate,
            ExceptionType.SKIP,
            new Date()
          )
      ).toThrow('SKIP exception cannot have newDate or modifications');
    });

    it('should throw when SKIP has modifications', () => {
      expect(
        () =>
          new LessonException(
            'id',
            lessonId,
            originalDate,
            ExceptionType.SKIP,
            null,
            { title: 'Test' }
          )
      ).toThrow('SKIP exception cannot have newDate or modifications');
    });
  });

  describe('appliesTo', () => {
    it('should return true for matching date', () => {
      const exception = LessonException.skip(lessonId, originalDate);
      const sameDate = new Date('2025-01-15');

      expect(exception.appliesTo(sameDate)).toBe(true);
    });

    it('should return false for different date', () => {
      const exception = LessonException.skip(lessonId, originalDate);
      const differentDate = new Date('2025-01-16');

      expect(exception.appliesTo(differentDate)).toBe(false);
    });

    it('should use exact timestamp comparison', () => {
      const dateWithTime = new Date('2025-01-15T10:30:00');
      const exception = LessonException.skip(lessonId, dateWithTime);

      expect(exception.appliesTo(new Date('2025-01-15T10:30:00'))).toBe(true);
      expect(exception.appliesTo(new Date('2025-01-15T10:31:00'))).toBe(false);
    });
  });

  describe('modification types', () => {
    it('should support title modification', () => {
      const exception = LessonException.modify(lessonId, originalDate, {
        title: 'New Title',
      });

      expect(exception.modifications?.title).toBe('New Title');
    });

    it('should support description modification', () => {
      const exception = LessonException.modify(lessonId, originalDate, {
        description: 'New Description',
      });

      expect(exception.modifications?.description).toBe('New Description');
    });

    it('should support date range modification', () => {
      const newStart = new Date('2025-01-15T10:00:00');
      const newEnd = new Date('2025-01-15T11:00:00');

      const exception = LessonException.modify(lessonId, originalDate, {
        startDate: newStart,
        endDate: newEnd,
      });

      expect(exception.modifications?.startDate).toEqual(newStart);
      expect(exception.modifications?.endDate).toEqual(newEnd);
    });

    it('should support teacher IDs modification', () => {
      const exception = LessonException.modify(lessonId, originalDate, {
        teacherIds: ['teacher1', 'teacher2'],
      });

      expect(exception.modifications?.teacherIds).toEqual([
        'teacher1',
        'teacher2',
      ]);
    });

    it('should support pupil IDs modification', () => {
      const exception = LessonException.modify(lessonId, originalDate, {
        pupilIds: ['pupil1', 'pupil2'],
      });

      expect(exception.modifications?.pupilIds).toEqual(['pupil1', 'pupil2']);
    });

    it('should support multiple modifications at once', () => {
      const exception = LessonException.modify(lessonId, originalDate, {
        title: 'New Title',
        description: 'New Description',
        teacherIds: ['teacher1'],
      });

      expect(exception.modifications).toMatchObject({
        title: 'New Title',
        description: 'New Description',
        teacherIds: ['teacher1'],
      });
    });
  });
});
