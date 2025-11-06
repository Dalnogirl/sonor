import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaLessonRepository } from '@/infrastructure/database/repositories/PrismaLessonRepository';
import { Lesson } from '@/domain/models/Lesson';
import { User } from '@/domain/models/User';
import {
  RecurringPattern,
  RecurringFrequency,
  DayOfWeek,
} from '@/domain/models/RecurringPattern';
import { PrismaClient, Prisma } from '@prisma/client';
import { cleanDatabase } from './test-helpers';

/**
 * Integration tests for PrismaLessonRepository
 * These tests run against a real database
 *
 * Setup required:
 * - Test database running (Docker)
 * - DATABASE_URL pointing to test DB
 */
describe('PrismaLessonRepository Integration Tests', () => {
  let prisma: PrismaClient;
  let repository: PrismaLessonRepository;
  let testTeacher: User;
  let testPupil: User;

  beforeAll(async () => {
    prisma = new PrismaClient();
    repository = new PrismaLessonRepository(prisma);

    // Ensure database is clean
    await cleanDatabase(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean database before each test for isolation
    await cleanDatabase(prisma);

    const teacherData = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        name: 'Test Teacher',
        email: `teacher-${Date.now()}@example.com`,
        password: 'hashed-password',
        isEmailVerified: true,
      },
    });

    const pupilData = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        name: 'Test Pupil',
        email: `pupil-${Date.now()}@example.com`,
        password: 'hashed-password',
        isEmailVerified: false,
      },
    });

    testTeacher = new User(
      teacherData.id,
      teacherData.name,
      teacherData.email,
      teacherData.createdAt,
      teacherData.updatedAt,
      teacherData.password,
      teacherData.isEmailVerified
    );

    testPupil = new User(
      pupilData.id,
      pupilData.name,
      pupilData.email,
      pupilData.createdAt,
      pupilData.updatedAt,
      pupilData.password,
      pupilData.isEmailVerified
    );
  });

  describe('findMyTeachingLessonsForPeriod', () => {
    it('should return lessons where user is a teacher within date range', async () => {
      const startDate = new Date('2025-11-01T00:00:00Z');
      const endDate = new Date('2025-11-30T23:59:59Z');

      const lesson = await prisma.lesson.create({
        data: {
          id: crypto.randomUUID(),
          title: 'Math 101',
          description: 'Introduction to Mathematics',
          startDate: new Date('2025-11-10T10:00:00Z'),
          endDate: new Date('2025-11-10T11:00:00Z'),
        },
      });

      await prisma.lessonTeacher.create({
        data: {
          lessonId: lesson.id,
          userId: testTeacher.id,
        },
      });

      const lessons = await repository.findMyTeachingLessonsForPeriod(
        testTeacher.id,
        startDate,
        endDate
      );

      expect(lessons).toHaveLength(1);
      expect(lessons[0]).toBeInstanceOf(Lesson);
      expect(lessons[0].id).toBe(lesson.id);
      expect(lessons[0].title).toBe('Math 101');
      expect(lessons[0].description).toBe('Introduction to Mathematics');
      expect(lessons[0].teachers).toHaveLength(1);
      expect(lessons[0].teachers[0]).toBeInstanceOf(User);
      expect(lessons[0].teachers[0].id).toBe(testTeacher.id);
      expect(lessons[0].pupils).toHaveLength(0);
      expect(lessons[0].recurringPattern).toBeUndefined();
    });

    it('should return empty array when no lessons found', async () => {
      const lessons = await repository.findMyTeachingLessonsForPeriod(
        testTeacher.id,
        new Date('2025-12-01'),
        new Date('2025-12-31')
      );

      expect(lessons).toEqual([]);
    });

    it('should map multiple lessons correctly', async () => {
      const lesson1 = await prisma.lesson.create({
        data: {
          id: crypto.randomUUID(),
          title: 'Lesson 1',
          description: undefined,
          startDate: new Date('2025-11-10T10:00:00Z'),
          endDate: new Date('2025-11-10T11:00:00Z'),
        },
      });

      const lesson2 = await prisma.lesson.create({
        data: {
          id: crypto.randomUUID(),
          title: 'Lesson 2',
          description: 'Description 2',
          startDate: new Date('2025-11-11T10:00:00Z'),
          endDate: new Date('2025-11-11T11:00:00Z'),
        },
      });

      await prisma.lessonTeacher.createMany({
        data: [
          { lessonId: lesson1.id, userId: testTeacher.id },
          { lessonId: lesson2.id, userId: testTeacher.id },
        ],
      });

      const lessons = await repository.findMyTeachingLessonsForPeriod(
        testTeacher.id,
        new Date('2025-11-01'),
        new Date('2025-11-30')
      );

      expect(lessons).toHaveLength(2);
      expect(lessons.map((l) => l.title)).toContain('Lesson 1');
      expect(lessons.map((l) => l.title)).toContain('Lesson 2');
    });

    it('should map lessons with multiple teachers', async () => {
      const teacher2Data = await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          name: 'Second Teacher',
          email: `teacher2-${Date.now()}@example.com`,
          password: 'hashed',
          isEmailVerified: true,
        },
      });

      const lesson = await prisma.lesson.create({
        data: {
          id: crypto.randomUUID(),
          title: 'Team Teaching',
          startDate: new Date('2025-11-10T10:00:00Z'),
          endDate: new Date('2025-11-10T11:00:00Z'),
        },
      });

      await prisma.lessonTeacher.createMany({
        data: [
          { lessonId: lesson.id, userId: testTeacher.id },
          { lessonId: lesson.id, userId: teacher2Data.id },
        ],
      });

      const lessons = await repository.findMyTeachingLessonsForPeriod(
        testTeacher.id,
        new Date('2025-11-01'),
        new Date('2025-11-30')
      );

      expect(lessons[0].teachers).toHaveLength(2);
      expect(lessons[0].teachers.map((t) => t.name)).toContain('Test Teacher');
      expect(lessons[0].teachers.map((t) => t.name)).toContain(
        'Second Teacher'
      );
    });

    it('should map lessons with pupils', async () => {
      const lesson = await prisma.lesson.create({
        data: {
          id: crypto.randomUUID(),
          title: 'Lesson with Pupils',
          startDate: new Date('2025-11-10T10:00:00Z'),
          endDate: new Date('2025-11-10T11:00:00Z'),
        },
      });

      await prisma.lessonTeacher.create({
        data: { lessonId: lesson.id, userId: testTeacher.id },
      });

      await prisma.lessonPupil.create({
        data: { lessonId: lesson.id, userId: testPupil.id },
      });

      const lessons = await repository.findMyTeachingLessonsForPeriod(
        testTeacher.id,
        new Date('2025-11-01'),
        new Date('2025-11-30')
      );

      expect(lessons[0].pupils).toHaveLength(1);
      expect(lessons[0].pupils[0].name).toBe('Test Pupil');
      expect(lessons[0].pupils[0].isEmailVerified).toBe(false);
    });

    it('should parse recurring pattern from JSON', async () => {
      const recurringPattern = {
        frequency: RecurringFrequency.WEEKLY,
        interval: 1,
        daysOfWeek: [DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY],
        endDate: '2025-12-31T23:59:59Z',
        occurrences: null,
      };

      const lesson = await prisma.lesson.create({
        data: {
          id: crypto.randomUUID(),
          title: 'Recurring Lesson',
          startDate: new Date('2025-11-10T10:00:00Z'),
          endDate: new Date('2025-11-10T11:00:00Z'),
          recurringPattern: recurringPattern as Prisma.InputJsonValue,
        },
      });

      await prisma.lessonTeacher.create({
        data: { lessonId: lesson.id, userId: testTeacher.id },
      });

      const lessons = await repository.findMyTeachingLessonsForPeriod(
        testTeacher.id,
        new Date('2025-11-01'),
        new Date('2025-12-31')
      );

      expect(lessons[0].recurringPattern).toBeDefined();
      expect(lessons[0].recurringPattern).toBeInstanceOf(RecurringPattern);
      expect(lessons[0].recurringPattern?.frequency).toBe(
        RecurringFrequency.WEEKLY
      );
      expect(lessons[0].recurringPattern?.interval).toBe(1);
      expect(lessons[0].recurringPattern?.daysOfWeek).toEqual([
        DayOfWeek.MONDAY,
        DayOfWeek.WEDNESDAY,
      ]);
      expect(lessons[0].recurringPattern?.endDate).toBeInstanceOf(Date);
      expect(lessons[0].recurringPattern?.occurrences).toBeNull();
    });

    it('should filter lessons by date range correctly', async () => {
      const outOfRangeLesson = await prisma.lesson.create({
        data: {
          id: crypto.randomUUID(),
          title: 'Out of Range',
          startDate: new Date('2025-12-01T10:00:00Z'),
          endDate: new Date('2025-12-01T11:00:00Z'),
        },
      });

      const inRangeLesson = await prisma.lesson.create({
        data: {
          id: crypto.randomUUID(),
          title: 'In Range',
          startDate: new Date('2025-11-10T10:00:00Z'),
          endDate: new Date('2025-11-10T11:00:00Z'),
        },
      });

      await prisma.lessonTeacher.createMany({
        data: [
          { lessonId: outOfRangeLesson.id, userId: testTeacher.id },
          { lessonId: inRangeLesson.id, userId: testTeacher.id },
        ],
      });

      const lessons = await repository.findMyTeachingLessonsForPeriod(
        testTeacher.id,
        new Date('2025-11-01'),
        new Date('2025-11-30')
      );

      expect(lessons).toHaveLength(1);
      expect(lessons[0].title).toBe('In Range');
    });

    it('should not return lessons where user is not a teacher', async () => {
      const otherTeacher = await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          name: 'Other Teacher',
          email: `other-${Date.now()}@example.com`,
          password: 'hashed',
          isEmailVerified: true,
        },
      });

      const lesson = await prisma.lesson.create({
        data: {
          id: crypto.randomUUID(),
          title: 'Other Teacher Lesson',
          startDate: new Date('2025-11-10T10:00:00Z'),
          endDate: new Date('2025-11-10T11:00:00Z'),
        },
      });

      await prisma.lessonTeacher.create({
        data: { lessonId: lesson.id, userId: otherTeacher.id },
      });

      const lessons = await repository.findMyTeachingLessonsForPeriod(
        testTeacher.id,
        new Date('2025-11-01'),
        new Date('2025-11-30')
      );

      expect(lessons).toHaveLength(0);
    });
  });
});
