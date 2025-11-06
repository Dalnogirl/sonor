import { describe, it, expect, beforeEach } from 'vitest';
import { Lesson } from '@/domain/models/Lesson';
import { User } from '@/domain/models/User';

describe('Lesson', () => {
  let teacher1: User;
  let teacher2: User;
  let pupil1: User;
  let pupil2: User;

  beforeEach(() => {
    const now = new Date();
    teacher1 = new User(
      'teacher-1',
      'John Doe',
      'john@example.com',
      now,
      now,
      'hashedpass1',
      true
    );
    teacher2 = new User(
      'teacher-2',
      'Jane Smith',
      'jane@example.com',
      now,
      now,
      'hashedpass2',
      true
    );
    pupil1 = new User(
      'pupil-1',
      'Alice Johnson',
      'alice@example.com',
      now,
      now,
      'hashedpass3',
      true
    );
    pupil2 = new User(
      'pupil-2',
      'Bob Williams',
      'bob@example.com',
      now,
      now,
      'hashedpass4',
      true
    );
  });

  describe('constructor', () => {
    it('should create a lesson with all properties', () => {
      const id = 'lesson-1';
      const title = 'Introduction to TypeScript';
      const teachers = [teacher1];
      const createdAt = new Date('2025-11-01T10:00:00Z');
      const updatedAt = new Date('2025-11-01T12:00:00Z');
      const pupils = [pupil1, pupil2];
      const startDate = new Date('2025-11-05T10:00:00Z');
      const endDate = new Date('2025-11-05T12:00:00Z');

      const lesson = new Lesson(
        id,
        title,
        teachers,
        createdAt,
        updatedAt,
        pupils,
        startDate,
        endDate
      );

      expect(lesson.id).toBe(id);
      expect(lesson.title).toBe(title);
      expect(lesson.teachers).toEqual(teachers);
      expect(lesson.createdAt).toEqual(createdAt);
      expect(lesson.updatedAt).toEqual(updatedAt);
      expect(lesson.pupils).toEqual(pupils);
      expect(lesson.startDate).toEqual(startDate);
      expect(lesson.endDate).toEqual(endDate);
    });

    it('should create a lesson with multiple teachers', () => {
      const now = new Date();
      const startDate = new Date('2025-11-10T10:00:00Z');
      const endDate = new Date('2025-11-10T12:00:00Z');

      const lesson = new Lesson(
        'lesson-1',
        'Advanced Programming',
        [teacher1, teacher2],
        now,
        now,
        [],
        startDate,
        endDate
      );

      expect(lesson.teachers).toHaveLength(2);
      expect(lesson.teachers).toContain(teacher1);
      expect(lesson.teachers).toContain(teacher2);
    });

    it('should create a lesson with no pupils', () => {
      const now = new Date();
      const startDate = new Date('2025-11-10T10:00:00Z');
      const endDate = new Date('2025-11-10T12:00:00Z');

      const lesson = new Lesson(
        'lesson-1',
        'Empty Class',
        [teacher1],
        now,
        now,
        [],
        startDate,
        endDate
      );

      expect(lesson.pupils).toHaveLength(0);
    });
  });

  describe('createWithDefaults', () => {
    it('should create a lesson with default dates and empty pupils', () => {
      const title = 'Default Lesson';
      const teachers = [teacher1];
      const startDate = new Date('2025-11-10T10:00:00Z');
      const endDate = new Date('2025-11-10T12:00:00Z');

      const lesson = Lesson.createWithDefaults(
        title,
        teachers,
        [],
        startDate,
        endDate
      );

      expect(lesson.id).toBeDefined();
      expect(typeof lesson.id).toBe('string');
      expect(lesson.title).toBe(title);
      expect(lesson.teachers).toEqual(teachers);
      expect(lesson.pupils).toEqual([]);
      expect(lesson.startDate).toEqual(startDate);
      expect(lesson.endDate).toEqual(endDate);
      expect(lesson.createdAt).toBeInstanceOf(Date);
      expect(lesson.updatedAt).toBeInstanceOf(Date);
    });

    it('should set createdAt and updatedAt to the same time', () => {
      const startDate = new Date('2025-11-10T10:00:00Z');
      const endDate = new Date('2025-11-10T12:00:00Z');
      const lesson = Lesson.createWithDefaults(
        'lesson-1',
        'Test',
        [teacher1],
        startDate,
        endDate
      );

      expect(lesson.createdAt.getTime()).toBe(lesson.updatedAt.getTime());
    });

    it('should create lesson with current timestamp', () => {
      const startDate = new Date('2025-11-10T10:00:00Z');
      const endDate = new Date('2025-11-10T12:00:00Z');
      const before = new Date();
      const lesson = Lesson.createWithDefaults(
        'lesson-1',
        'Test',
        [teacher1],
        startDate,
        endDate
      );
      const after = new Date();

      expect(lesson.createdAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime()
      );
      expect(lesson.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('isPast', () => {
    it('should return true when endDate is in the past', () => {
      const now = new Date();
      const pastStartDate = new Date('2020-01-01T10:00:00Z');
      const pastEndDate = new Date('2020-01-01T12:00:00Z');

      const lesson = new Lesson(
        'lesson-1',
        'Past Lesson',
        [teacher1],
        now,
        now,
        [],
        pastStartDate,
        pastEndDate
      );

      expect(lesson.isPast).toBe(true);
    });

    it('should return false when endDate is in the future', () => {
      const now = new Date();
      const futureStartDate = new Date('2030-01-01T10:00:00Z');
      const futureEndDate = new Date('2030-01-01T12:00:00Z');

      const lesson = new Lesson(
        'lesson-1',
        'Future Lesson',
        [teacher1],
        now,
        now,
        [],
        futureStartDate,
        futureEndDate
      );

      expect(lesson.isPast).toBe(false);
    });

    it('should return false when endDate is now', () => {
      const now = new Date();
      const startDate = new Date(now.getTime() - 3600000);

      const lesson = new Lesson(
        'lesson-1',
        'Current Lesson',
        [teacher1],
        now,
        now,
        [],
        startDate,
        now
      );

      expect(lesson.isPast).toBe(false);
    });
  });

  describe('isActive', () => {
    it('should return true when current time is between startDate and endDate', () => {
      const now = new Date();
      const createdAt = new Date();
      const startDate = new Date(now.getTime() - 3600000); // 1 hour ago
      const endDate = new Date(now.getTime() + 3600000); // 1 hour from now

      const lesson = new Lesson(
        'lesson-1',
        'Active Lesson',
        [teacher1],
        createdAt,
        createdAt,
        [],
        startDate,
        endDate
      );

      expect(lesson.isActive).toBe(true);
    });

    it('should return false when current time is before startDate', () => {
      const now = new Date();
      const futureStart = new Date('2030-01-01T10:00:00Z');
      const futureEnd = new Date('2030-01-01T12:00:00Z');

      const lesson = new Lesson(
        'lesson-1',
        'Future Lesson',
        [teacher1],
        now,
        now,
        [],
        futureStart,
        futureEnd
      );

      expect(lesson.isActive).toBe(false);
    });

    it('should return false when current time is after endDate', () => {
      const now = new Date();
      const pastStart = new Date('2020-01-01T10:00:00Z');
      const pastEnd = new Date('2020-01-01T12:00:00Z');

      const lesson = new Lesson(
        'lesson-1',
        'Past Lesson',
        [teacher1],
        now,
        now,
        [],
        pastStart,
        pastEnd
      );

      expect(lesson.isActive).toBe(false);
    });

    it('should return true when current time equals startDate', () => {
      const now = new Date();
      const endDate = new Date(now.getTime() + 3600000);

      const lesson = new Lesson(
        'lesson-1',
        'Starting Now',
        [teacher1],
        now,
        now,
        [],
        now,
        endDate
      );

      expect(lesson.isActive).toBe(true);
    });

    it('should return true when current time equals endDate', () => {
      const now = new Date();
      const startDate = new Date(now.getTime() - 3600000);

      const lesson = new Lesson(
        'lesson-1',
        'Ending Now',
        [teacher1],
        now,
        now,
        [],
        startDate,
        now
      );

      expect(lesson.isActive).toBe(true);
    });
  });

  describe('isUpcoming', () => {
    it('should return true when startDate is in the future', () => {
      const now = new Date();
      const futureStartDate = new Date('2030-01-01T10:00:00Z');
      const futureEndDate = new Date('2030-01-01T12:00:00Z');

      const lesson = new Lesson(
        'lesson-1',
        'Upcoming Lesson',
        [teacher1],
        now,
        now,
        [],
        futureStartDate,
        futureEndDate
      );

      expect(lesson.isUpcoming).toBe(true);
    });

    it('should return false when startDate is in the past', () => {
      const now = new Date();
      const pastStartDate = new Date('2020-01-01T10:00:00Z');
      const pastEndDate = new Date('2020-01-01T12:00:00Z');

      const lesson = new Lesson(
        'lesson-1',
        'Past Lesson',
        [teacher1],
        now,
        now,
        [],
        pastStartDate,
        pastEndDate
      );

      expect(lesson.isUpcoming).toBe(false);
    });

    it('should return false when startDate is now', () => {
      const now = new Date();
      const endDate = new Date(now.getTime() + 3600000);

      const lesson = new Lesson(
        'lesson-1',
        'Current Lesson',
        [teacher1],
        now,
        now,
        [],
        now,
        endDate
      );

      expect(lesson.isUpcoming).toBe(false);
    });
  });

  describe('lesson state transitions', () => {
    it('should transition from upcoming to active to past', () => {
      const now = new Date();
      const createdAt = new Date();

      // Upcoming lesson
      const upcomingLesson = new Lesson(
        'lesson-1',
        'Test',
        [teacher1],
        createdAt,
        createdAt,
        [],
        new Date(now.getTime() + 3600000),
        new Date(now.getTime() + 7200000)
      );
      expect(upcomingLesson.isUpcoming).toBe(true);
      expect(upcomingLesson.isActive).toBe(false);
      expect(upcomingLesson.isPast).toBe(false);

      // Active lesson
      const activeLesson = new Lesson(
        'lesson-2',
        'Test',
        [teacher1],
        createdAt,
        createdAt,
        [],
        new Date(now.getTime() - 1800000),
        new Date(now.getTime() + 1800000)
      );
      expect(activeLesson.isUpcoming).toBe(false);
      expect(activeLesson.isActive).toBe(true);
      expect(activeLesson.isPast).toBe(false);

      // Past lesson
      const pastLesson = new Lesson(
        'lesson-3',
        'Test',
        [teacher1],
        createdAt,
        createdAt,
        [],
        new Date(now.getTime() - 7200000),
        new Date(now.getTime() - 3600000)
      );
      expect(pastLesson.isUpcoming).toBe(false);
      expect(pastLesson.isActive).toBe(false);
      expect(pastLesson.isPast).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle lesson with empty teachers array', () => {
      const now = new Date();
      const startDate = new Date('2025-11-10T10:00:00Z');
      const endDate = new Date('2025-11-10T12:00:00Z');

      const lesson = new Lesson(
        'lesson-1',
        'No Teachers',
        [],
        now,
        now,
        [],
        startDate,
        endDate
      );

      expect(lesson.teachers).toHaveLength(0);
    });

    it('should handle lesson with empty title', () => {
      const now = new Date();
      const startDate = new Date('2025-11-10T10:00:00Z');
      const endDate = new Date('2025-11-10T12:00:00Z');

      const lesson = new Lesson(
        'lesson-1',
        '',
        [teacher1],
        now,
        now,
        [],
        startDate,
        endDate
      );

      expect(lesson.title).toBe('');
    });

    it('should handle lesson where endDate is before startDate', () => {
      const now = new Date();
      const laterDate = new Date('2025-11-02T10:00:00Z');
      const earlierDate = new Date('2025-11-01T10:00:00Z');

      const lesson = new Lesson(
        'lesson-1',
        'Invalid Time Range',
        [teacher1],
        now,
        now,
        [],
        laterDate,
        earlierDate
      );

      // This represents invalid data but the model should still handle it
      expect(lesson.startDate).toEqual(laterDate);
      expect(lesson.endDate).toEqual(earlierDate);
      expect(lesson.isActive).toBe(false);
      expect(lesson.isPast).toBe(true);
    });
  });
});
