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

      const lesson = new Lesson(
        id,
        title,
        teacherIds,
        createdAt,
        updatedAt,
        pupilIds,
        startDate,
        endDate
      );

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
          new Lesson(
            'lesson-1',
            'No Teachers',
            [],
            now,
            now,
            [],
            startDate,
            endDate
          )
      ).toThrow('Lesson must have at least one teacher');
    });

    it('should throw error when endDate is before startDate', () => {
      const now = new Date();
      const laterDate = new Date('2025-11-02T10:00:00Z');
      const earlierDate = new Date('2025-11-01T10:00:00Z');

      expect(
        () =>
          new Lesson(
            'lesson-1',
            'Invalid Time Range',
            [teacher1Id],
            now,
            now,
            [],
            laterDate,
            earlierDate
          )
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

      const lesson = new Lesson(
        'lesson-1',
        'Test',
        [teacher1Id, teacher2Id],
        now,
        now,
        [],
        startDate,
        endDate
      );

      expect(lesson.hasTeacher(teacher1Id)).toBe(true);
      expect(lesson.hasTeacher(teacher2Id)).toBe(true);
    });

    it('should return false if teacher ID does not exist', () => {
      const now = new Date();
      const startDate = new Date('2025-11-10T10:00:00Z');
      const endDate = new Date('2025-11-10T12:00:00Z');

      const lesson = new Lesson(
        'lesson-1',
        'Test',
        [teacher1Id],
        now,
        now,
        [],
        startDate,
        endDate
      );

      expect(lesson.hasTeacher(teacher2Id)).toBe(false);
    });
  });

  describe('hasPupil', () => {
    it('should return true if pupil ID exists', () => {
      const now = new Date();
      const startDate = new Date('2025-11-10T10:00:00Z');
      const endDate = new Date('2025-11-10T12:00:00Z');

      const lesson = new Lesson(
        'lesson-1',
        'Test',
        [teacher1Id],
        now,
        now,
        [pupil1Id, pupil2Id],
        startDate,
        endDate
      );

      expect(lesson.hasPupil(pupil1Id)).toBe(true);
      expect(lesson.hasPupil(pupil2Id)).toBe(true);
    });

    it('should return false if pupil ID does not exist', () => {
      const now = new Date();
      const startDate = new Date('2025-11-10T10:00:00Z');
      const endDate = new Date('2025-11-10T12:00:00Z');

      const lesson = new Lesson(
        'lesson-1',
        'Test',
        [teacher1Id],
        now,
        now,
        [pupil1Id],
        startDate,
        endDate
      );

      expect(lesson.hasPupil(pupil2Id)).toBe(false);
    });
  });
});
