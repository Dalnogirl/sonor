import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LessonMapper } from '@/infrastructure/mappers/LessonMapper';
import { UserMapperPort } from '@/application/ports/mappers/UserMapperPort';
import { Lesson } from '@/domain/models/Lesson';
import { User } from '@/domain/models/User';
import { RecurringPattern, RecurringFrequency, DayOfWeek } from '@/domain/models/RecurringPattern';

describe('LessonMapper', () => {
  let lessonMapper: LessonMapper;
  let mockUserMapper: UserMapperPort;

  beforeEach(() => {
    // Mock UserMapper dependency (Dependency Injection)
    mockUserMapper = {
      toResponseDTO: vi.fn(),
      toResponseDTOArray: vi.fn(),
      toSummaryDTO: vi.fn((user: User) => ({
        id: user.id,
        name: user.name,
        email: user.email,
      })),
    };

    // Inject mock into LessonMapper (Polymorphism - GRASP)
    lessonMapper = new LessonMapper(mockUserMapper);
  });

  describe('toDTO', () => {
    it('should map Lesson entity to LessonResponseDTO with IDs only', () => {
      // Arrange
      const lesson = new Lesson({
        id: 'lesson-123',
        title: 'Introduction to TypeScript',
        teacherIds: ['teacher-1', 'teacher-2'],
        pupilIds: ['pupil-1', 'pupil-2', 'pupil-3'],
        startDate: new Date('2025-11-10T10:00:00Z'),
        endDate: new Date('2025-11-10T12:00:00Z'),
        createdAt: new Date('2025-11-01T10:00:00Z'),
        updatedAt: new Date('2025-11-02T10:00:00Z'),
        description: 'Learn the basics of TypeScript',
      });

      // Act
      const dto = lessonMapper.toDTO(lesson);

      // Assert - Should include IDs, not full user objects (Information Expert)
      expect(dto).toEqual({
        id: 'lesson-123',
        title: 'Introduction to TypeScript',
        description: 'Learn the basics of TypeScript',
        startDate: lesson.startDate,
        endDate: lesson.endDate,
        recurringPattern: undefined,
        teacherIds: ['teacher-1', 'teacher-2'],
        pupilIds: ['pupil-1', 'pupil-2', 'pupil-3'],
      });
    });

    it('should handle lessons without description', () => {
      // Arrange
      const lesson = new Lesson({
        id: 'lesson-456',
        title: 'Quick Lesson',
        teacherIds: ['teacher-1'],
        pupilIds: [],
        startDate: new Date('2025-11-15T10:00:00Z'),
        endDate: new Date('2025-11-15T11:00:00Z'),
        createdAt: new Date(),
        updatedAt: new Date(),
        // No description
      });

      // Act
      const dto = lessonMapper.toDTO(lesson);

      // Assert
      expect(dto.description).toBeUndefined();
    });

    it('should include recurring pattern when present', () => {
      // Arrange
      const recurringPattern = new RecurringPattern(
        RecurringFrequency.WEEKLY,
        1,
        [DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY, DayOfWeek.FRIDAY],
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        null
      );

      const lesson = new Lesson({
        id: 'lesson-789',
        title: 'Recurring Lesson',
        teacherIds: ['teacher-1'],
        pupilIds: ['pupil-1'],
        startDate: new Date('2025-11-10T10:00:00Z'),
        endDate: new Date('2025-11-10T11:00:00Z'),
        createdAt: new Date(),
        updatedAt: new Date(),
        description: 'Weekly recurring lesson',
        recurringPattern,
      });

      // Act
      const dto = lessonMapper.toDTO(lesson);

      // Assert
      expect(dto.recurringPattern).toEqual(recurringPattern);
    });
  });

  describe('toDTOWithUsers', () => {
    it('should map lesson with full teacher and pupil objects', () => {
      // Arrange
      const lesson = new Lesson({
        id: 'lesson-123',
        title: 'TypeScript Advanced',
        teacherIds: ['teacher-1', 'teacher-2'],
        pupilIds: ['pupil-1'],
        startDate: new Date('2025-11-10T10:00:00Z'),
        endDate: new Date('2025-11-10T12:00:00Z'),
        createdAt: new Date('2025-11-01'),
        updatedAt: new Date('2025-11-01'),
        description: 'Advanced TypeScript patterns',
      });

      const teachers = [
        User.createWithDefaults('teacher-1', 'John Doe', 'john@example.com', 'pass'),
        User.createWithDefaults('teacher-2', 'Jane Smith', 'jane@example.com', 'pass'),
      ];

      const pupils = [
        User.createWithDefaults('pupil-1', 'Alice Johnson', 'alice@example.com', 'pass'),
      ];

      // Act
      const dto = lessonMapper.toDTOWithUsers(lesson, teachers, pupils);

      // Assert - UserMapper should be called for each user (Polymorphism)
      expect(mockUserMapper.toSummaryDTO).toHaveBeenCalledTimes(3); // 2 teachers + 1 pupil
      // Note: map() passes (element, index, array) to callback
      expect(mockUserMapper.toSummaryDTO).toHaveBeenNthCalledWith(1, teachers[0], 0, teachers);
      expect(mockUserMapper.toSummaryDTO).toHaveBeenNthCalledWith(2, teachers[1], 1, teachers);
      expect(mockUserMapper.toSummaryDTO).toHaveBeenNthCalledWith(3, pupils[0], 0, pupils);

      // Assert - Should contain user summaries, not IDs
      // DTOs use ISO strings for serialization (DTO pattern)
      expect(dto).toEqual({
        id: 'lesson-123',
        title: 'TypeScript Advanced',
        description: 'Advanced TypeScript patterns',
        startDate: lesson.startDate.toISOString(),
        endDate: lesson.endDate.toISOString(),
        recurringPattern: undefined,
        teachers: [
          { id: 'teacher-1', name: 'John Doe', email: 'john@example.com' },
          { id: 'teacher-2', name: 'Jane Smith', email: 'jane@example.com' },
        ],
        pupils: [
          { id: 'pupil-1', name: 'Alice Johnson', email: 'alice@example.com' },
        ],
      });
    });

    it('should handle empty pupils array', () => {
      // Arrange
      const lesson = new Lesson({
        id: 'lesson-456',
        title: 'No Pupils Lesson',
        teacherIds: ['teacher-1'],
        pupilIds: [], // No pupils
        startDate: new Date('2025-11-15T10:00:00Z'),
        endDate: new Date('2025-11-15T12:00:00Z'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const teachers = [
        User.createWithDefaults('teacher-1', 'John Teacher', 'john@example.com', 'pass'),
      ];

      const pupils: User[] = [];

      // Act
      const dto = lessonMapper.toDTOWithUsers(lesson, teachers, pupils);

      // Assert
      expect(dto.pupils).toEqual([]);
      expect(dto.teachers).toHaveLength(1);
      expect(mockUserMapper.toSummaryDTO).toHaveBeenCalledTimes(1); // Only teacher
    });

    it('should handle multiple teachers and pupils', () => {
      // Arrange
      const lesson = new Lesson({
        id: 'lesson-789',
        title: 'Large Class',
        teacherIds: ['t1', 't2', 't3'],
        pupilIds: ['p1', 'p2', 'p3', 'p4', 'p5'],
        startDate: new Date('2025-11-20T10:00:00Z'),
        endDate: new Date('2025-11-20T12:00:00Z'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const teachers = [
        User.createWithDefaults('t1', 'Teacher 1', 't1@example.com', 'pass'),
        User.createWithDefaults('t2', 'Teacher 2', 't2@example.com', 'pass'),
        User.createWithDefaults('t3', 'Teacher 3', 't3@example.com', 'pass'),
      ];

      const pupils = [
        User.createWithDefaults('p1', 'Pupil 1', 'p1@example.com', 'pass'),
        User.createWithDefaults('p2', 'Pupil 2', 'p2@example.com', 'pass'),
        User.createWithDefaults('p3', 'Pupil 3', 'p3@example.com', 'pass'),
        User.createWithDefaults('p4', 'Pupil 4', 'p4@example.com', 'pass'),
        User.createWithDefaults('p5', 'Pupil 5', 'p5@example.com', 'pass'),
      ];

      // Act
      const dto = lessonMapper.toDTOWithUsers(lesson, teachers, pupils);

      // Assert
      expect(dto.teachers).toHaveLength(3);
      expect(dto.pupils).toHaveLength(5);
      expect(mockUserMapper.toSummaryDTO).toHaveBeenCalledTimes(8); // 3 + 5
    });

    it('should use UserMapper for transformation (Single Responsibility)', () => {
      // Tests that LessonMapper delegates user mapping to UserMapper
      // (Single Responsibility + Indirection patterns)

      const lesson = new Lesson({
        id: 'lesson-1',
        title: 'Test',
        teacherIds: ['t1'],
        pupilIds: ['p1'],
        startDate: new Date('2025-11-20T10:00:00Z'),
        endDate: new Date('2025-11-20T11:00:00Z'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const teacher = User.createWithDefaults('t1', 'Teacher', 't@example.com', 'pass');
      const pupil = User.createWithDefaults('p1', 'Pupil', 'p@example.com', 'pass');

      // Act
      lessonMapper.toDTOWithUsers(lesson, [teacher], [pupil]);

      // Assert - Mapper should delegate to UserMapper, not do mapping itself
      // Note: map() passes (element, index, array) to callback
      expect(mockUserMapper.toSummaryDTO).toHaveBeenNthCalledWith(1, teacher, 0, [teacher]);
      expect(mockUserMapper.toSummaryDTO).toHaveBeenNthCalledWith(2, pupil, 0, [pupil]);
    });

    it('should include recurring pattern in rich DTO', () => {
      // Arrange
      const recurringPattern = new RecurringPattern(
        RecurringFrequency.DAILY,
        2,
        [],
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        null
      );

      const lesson = new Lesson({
        id: 'lesson-recurring',
        title: 'Daily Lesson',
        teacherIds: ['teacher-1'],
        pupilIds: [],
        startDate: new Date('2025-11-10T10:00:00Z'),
        endDate: new Date('2025-11-10T11:00:00Z'),
        createdAt: new Date(),
        updatedAt: new Date(),
        description: 'Recurring every 2 days',
        recurringPattern,
      });

      const teachers = [
        User.createWithDefaults('teacher-1', 'John', 'john@example.com', 'pass'),
      ];

      // Act
      const dto = lessonMapper.toDTOWithUsers(lesson, teachers, []);

      // Assert - DTO contains plain object, not class instance (DTO pattern)
      expect(dto.recurringPattern).toEqual({
        frequency: recurringPattern.frequency,
        interval: recurringPattern.interval,
        daysOfWeek: recurringPattern.daysOfWeek,
        endDate: recurringPattern.endDate?.toISOString() ?? null,
        occurrences: recurringPattern.occurrences,
      });
    });
  });

  describe('Mapper Responsibilities', () => {
    it('should NOT include sensitive data in DTOs', () => {
      // Security test - ensures mapper filters sensitive data
      const lesson = new Lesson({
        id: 'lesson-1',
        title: 'Test Lesson',
        teacherIds: ['teacher-1'],
        pupilIds: ['pupil-1'],
        startDate: new Date('2025-11-20T10:00:00Z'),
        endDate: new Date('2025-11-20T11:00:00Z'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const teacher = User.createWithDefaults('teacher-1', 'John', 'john@example.com', 'hashed-password-secret');
      const pupil = User.createWithDefaults('pupil-1', 'Alice', 'alice@example.com', 'hashed-password-secret');

      // Act
      const dto = lessonMapper.toDTOWithUsers(lesson, [teacher], [pupil]);

      // Assert - DTOs should NOT leak sensitive data
      const dtoString = JSON.stringify(dto);
      expect(dtoString).not.toContain('password');
      expect(dtoString).not.toContain('hashed');
    });

    it('should NOT include timestamps (createdAt, updatedAt) in DTO', () => {
      // Design decision: Response DTOs don't expose internal timestamps
      const lesson = new Lesson({
        id: 'lesson-1',
        title: 'Test',
        teacherIds: ['t1'],
        pupilIds: [],
        startDate: new Date('2025-11-20T10:00:00Z'),
        endDate: new Date('2025-11-20T11:00:00Z'),
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-15'),
      });

      const dto = lessonMapper.toDTO(lesson);

      // Assert - Internal timestamps not exposed
      expect(dto).not.toHaveProperty('createdAt');
      expect(dto).not.toHaveProperty('updatedAt');
    });
  });
});
