import { describe, it, expect } from 'vitest';
import { Lesson } from '@/domain/models/Lesson';
import {
  RecurringPattern,
  RecurringFrequency,
  DayOfWeek,
} from '@/domain/models/RecurringPattern';

describe('Lesson', () => {
  const teacher1Id = 'teacher-1';
  const teacher2Id = 'teacher-2';
  const pupil1Id = 'pupil-1';
  const pupil2Id = 'pupil-2';

  describe('constructor', () => {
    it('should create a lesson with all required properties', () => {
      const id = 'lesson-1';
      const title = 'Introduction to TypeScript';
      const teacherIds = [teacher1Id];
      const createdAt = new Date('2025-11-01T10:00:00Z');
      const updatedAt = new Date('2025-11-01T12:00:00Z');
      const pupilIds = [pupil1Id, pupil2Id];
      const startDate = new Date('2025-11-05T10:00:00Z');
      const endDate = new Date('2025-11-05T12:00:00Z');

      const lesson = new Lesson({
        id,
        title,
        teacherIds,
        pupilIds,
        startDate,
        endDate,
        createdAt,
        updatedAt,
      });

      expect(lesson.id).toBe(id);
      expect(lesson.title).toBe(title);
      expect(lesson.teacherIds).toEqual(teacherIds);
      expect(lesson.createdAt).toEqual(createdAt);
      expect(lesson.updatedAt).toEqual(updatedAt);
      expect(lesson.pupilIds).toEqual(pupilIds);
      expect(lesson.startDate).toEqual(startDate);
      expect(lesson.endDate).toEqual(endDate);
    });

    it('should throw error when teachers array is empty', () => {
      const now = new Date();
      const startDate = new Date('2025-11-10T10:00:00Z');
      const endDate = new Date('2025-11-10T12:00:00Z');

      expect(
        () =>
          new Lesson({
            id: 'lesson-1',
            title: 'No Teachers',
            teacherIds: [],
            pupilIds: [],
            startDate,
            endDate,
            createdAt: now,
            updatedAt: now,
          })
      ).toThrow('Lesson must have at least one teacher');
    });

    it('should throw error when endDate is before startDate', () => {
      const now = new Date();
      const laterDate = new Date('2025-11-02T10:00:00Z');
      const earlierDate = new Date('2025-11-01T10:00:00Z');

      expect(
        () =>
          new Lesson({
            id: 'lesson-1',
            title: 'Invalid Time Range',
            teacherIds: [teacher1Id],
            pupilIds: [],
            startDate: laterDate,
            endDate: earlierDate,
            createdAt: now,
            updatedAt: now,
          })
      ).toThrow('Lesson endDate must be after startDate');
    });
  });

  describe('create factory method', () => {
    it('should create a lesson with auto-generated ID and timestamps', () => {
      const title = 'Default Lesson';
      const teacherIds = [teacher1Id];
      const pupilIds: string[] = [];
      const startDate = new Date('2025-11-10T10:00:00Z');
      const endDate = new Date('2025-11-10T12:00:00Z');

      const lesson = Lesson.create(
        title,
        teacherIds,
        pupilIds,
        startDate,
        endDate
      );

      expect(lesson.id).toBeDefined();
      expect(typeof lesson.id).toBe('string');
      expect(lesson.title).toBe(title);
      expect(lesson.teacherIds).toEqual(teacherIds);
      expect(lesson.pupilIds).toEqual(pupilIds);
      expect(lesson.startDate).toEqual(startDate);
      expect(lesson.endDate).toEqual(endDate);
      expect(lesson.createdAt).toBeInstanceOf(Date);
      expect(lesson.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('hasTeacher', () => {
    it('should return true if teacher ID exists', () => {
      const now = new Date();
      const startDate = new Date('2025-11-10T10:00:00Z');
      const endDate = new Date('2025-11-10T12:00:00Z');

      const lesson = new Lesson({
        id: 'lesson-1',
        title: 'Test',
        teacherIds: [teacher1Id, teacher2Id],
        pupilIds: [],
        startDate,
        endDate,
        createdAt: now,
        updatedAt: now,
      });

      expect(lesson.hasTeacher(teacher1Id)).toBe(true);
      expect(lesson.hasTeacher(teacher2Id)).toBe(true);
    });

    it('should return false if teacher ID does not exist', () => {
      const now = new Date();
      const startDate = new Date('2025-11-10T10:00:00Z');
      const endDate = new Date('2025-11-10T12:00:00Z');

      const lesson = new Lesson({
        id: 'lesson-1',
        title: 'Test',
        teacherIds: [teacher1Id],
        pupilIds: [],
        startDate,
        endDate,
        createdAt: now,
        updatedAt: now,
      });

      expect(lesson.hasTeacher(teacher2Id)).toBe(false);
    });
  });

  describe('hasPupil', () => {
    it('should return true if pupil ID exists', () => {
      const now = new Date();
      const startDate = new Date('2025-11-10T10:00:00Z');
      const endDate = new Date('2025-11-10T12:00:00Z');

      const lesson = new Lesson({
        id: 'lesson-1',
        title: 'Test',
        teacherIds: [teacher1Id],
        pupilIds: [pupil1Id, pupil2Id],
        startDate,
        endDate,
        createdAt: now,
        updatedAt: now,
      });

      expect(lesson.hasPupil(pupil1Id)).toBe(true);
      expect(lesson.hasPupil(pupil2Id)).toBe(true);
    });

    it('should return false if pupil ID does not exist', () => {
      const now = new Date();
      const startDate = new Date('2025-11-10T10:00:00Z');
      const endDate = new Date('2025-11-10T12:00:00Z');

      const lesson = new Lesson({
        id: 'lesson-1',
        title: 'Test',
        teacherIds: [teacher1Id],
        pupilIds: [pupil1Id],
        startDate,
        endDate,
        createdAt: now,
        updatedAt: now,
      });

      expect(lesson.hasPupil(pupil2Id)).toBe(false);
    });
  });

  describe('edit', () => {
    const baseLessonProps = {
      id: 'lesson-1',
      title: 'Original Title',
      teacherIds: [teacher1Id],
      pupilIds: [pupil1Id],
      startDate: new Date('2025-11-10T10:00:00Z'),
      endDate: new Date('2025-11-10T12:00:00Z'),
      createdAt: new Date('2025-11-01T10:00:00Z'),
      updatedAt: new Date('2025-11-01T10:00:00Z'),
    };

    it('should update all mutable fields', () => {
      const lesson = new Lesson(baseLessonProps);
      const newStart = new Date('2025-12-01T09:00:00Z');
      const newEnd = new Date('2025-12-01T11:00:00Z');

      lesson.edit({
        title: 'Updated Title',
        teacherIds: [teacher2Id],
        pupilIds: [pupil2Id],
        startDate: newStart,
        endDate: newEnd,
        description: 'New description',
      });

      expect(lesson.title).toBe('Updated Title');
      expect(lesson.teacherIds).toEqual([teacher2Id]);
      expect(lesson.pupilIds).toEqual([pupil2Id]);
      expect(lesson.startDate).toEqual(newStart);
      expect(lesson.endDate).toEqual(newEnd);
      expect(lesson.description).toBe('New description');
    });

    it('should preserve id and createdAt', () => {
      const lesson = new Lesson(baseLessonProps);

      lesson.edit({
        title: 'Updated',
        teacherIds: [teacher1Id],
        pupilIds: [pupil1Id],
        startDate: baseLessonProps.startDate,
        endDate: baseLessonProps.endDate,
      });

      expect(lesson.id).toBe('lesson-1');
      expect(lesson.createdAt).toEqual(baseLessonProps.createdAt);
    });

    it('should update updatedAt', () => {
      const lesson = new Lesson(baseLessonProps);
      const originalUpdatedAt = lesson.updatedAt;

      lesson.edit({
        title: 'Updated',
        teacherIds: [teacher1Id],
        pupilIds: [pupil1Id],
        startDate: baseLessonProps.startDate,
        endDate: baseLessonProps.endDate,
      });

      expect(lesson.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime()
      );
    });

    it('should throw when teacherIds is empty', () => {
      const lesson = new Lesson(baseLessonProps);

      expect(() =>
        lesson.edit({
          title: 'Updated',
          teacherIds: [],
          pupilIds: [pupil1Id],
          startDate: baseLessonProps.startDate,
          endDate: baseLessonProps.endDate,
        })
      ).toThrow('Lesson must have at least one teacher');
    });

    it('should throw when endDate <= startDate', () => {
      const lesson = new Lesson(baseLessonProps);

      expect(() =>
        lesson.edit({
          title: 'Updated',
          teacherIds: [teacher1Id],
          pupilIds: [pupil1Id],
          startDate: new Date('2025-12-01T12:00:00Z'),
          endDate: new Date('2025-12-01T10:00:00Z'),
        })
      ).toThrow('Lesson endDate must be after startDate');
    });

    it('should throw when lesson is deleted', () => {
      const lesson = new Lesson({
        ...baseLessonProps,
        deletedAt: new Date(),
      });

      expect(() =>
        lesson.edit({
          title: 'Updated',
          teacherIds: [teacher1Id],
          pupilIds: [pupil1Id],
          startDate: baseLessonProps.startDate,
          endDate: baseLessonProps.endDate,
        })
      ).toThrow('Cannot edit a deleted lesson');
    });

    it('should return recurringPatternChanged: true when pattern added', () => {
      const lesson = new Lesson(baseLessonProps);
      const pattern = RecurringPattern.daily(1, undefined, undefined, baseLessonProps.startDate);

      const result = lesson.edit({
        title: 'Updated',
        teacherIds: [teacher1Id],
        pupilIds: [pupil1Id],
        startDate: baseLessonProps.startDate,
        endDate: baseLessonProps.endDate,
        recurringPattern: pattern,
      });

      expect(result.recurringPatternChanged).toBe(true);
    });

    it('should return recurringPatternChanged: true when pattern removed', () => {
      const pattern = RecurringPattern.daily(1, undefined, undefined, baseLessonProps.startDate);
      const lesson = new Lesson({
        ...baseLessonProps,
        recurringPattern: pattern,
      });

      const result = lesson.edit({
        title: 'Updated',
        teacherIds: [teacher1Id],
        pupilIds: [pupil1Id],
        startDate: baseLessonProps.startDate,
        endDate: baseLessonProps.endDate,
      });

      expect(result.recurringPatternChanged).toBe(true);
    });

    it('should return recurringPatternChanged: true when pattern differs', () => {
      const oldPattern = RecurringPattern.daily(1, undefined, undefined, baseLessonProps.startDate);
      const newPattern = RecurringPattern.weekly(
        [DayOfWeek.MONDAY],
        1,
        undefined,
        undefined,
        baseLessonProps.startDate
      );
      const lesson = new Lesson({
        ...baseLessonProps,
        recurringPattern: oldPattern,
      });

      const result = lesson.edit({
        title: 'Updated',
        teacherIds: [teacher1Id],
        pupilIds: [pupil1Id],
        startDate: baseLessonProps.startDate,
        endDate: baseLessonProps.endDate,
        recurringPattern: newPattern,
      });

      expect(result.recurringPatternChanged).toBe(true);
    });

    it('should return recurringPatternChanged: false when pattern unchanged', () => {
      const pattern = RecurringPattern.daily(1, undefined, undefined, baseLessonProps.startDate);
      const lesson = new Lesson({
        ...baseLessonProps,
        recurringPattern: pattern,
      });

      const result = lesson.edit({
        title: 'Updated',
        teacherIds: [teacher1Id],
        pupilIds: [pupil1Id],
        startDate: baseLessonProps.startDate,
        endDate: baseLessonProps.endDate,
        recurringPattern: pattern,
      });

      expect(result.recurringPatternChanged).toBe(false);
    });

    it('should return recurringPatternChanged: false when both undefined', () => {
      const lesson = new Lesson(baseLessonProps);

      const result = lesson.edit({
        title: 'Updated',
        teacherIds: [teacher1Id],
        pupilIds: [pupil1Id],
        startDate: baseLessonProps.startDate,
        endDate: baseLessonProps.endDate,
      });

      expect(result.recurringPatternChanged).toBe(false);
    });

    it('should not mutate state when validation fails', () => {
      const lesson = new Lesson(baseLessonProps);

      expect(() =>
        lesson.edit({
          title: 'Updated',
          teacherIds: [],
          pupilIds: [pupil1Id],
          startDate: baseLessonProps.startDate,
          endDate: baseLessonProps.endDate,
        })
      ).toThrow();

      expect(lesson.title).toBe('Original Title');
      expect(lesson.teacherIds).toEqual([teacher1Id]);
    });
  });
});
