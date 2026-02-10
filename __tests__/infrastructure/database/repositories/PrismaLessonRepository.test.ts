import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaLessonRepository } from '@/infrastructure/database/repositories/PrismaLessonRepository';
import { Lesson } from '@/domain/models/Lesson';
import { PrismaClient } from '@prisma/client';
import { cleanDatabase } from './test-helpers';

describe('PrismaLessonRepository Integration Tests', () => {
  let prisma: PrismaClient;
  let repository: PrismaLessonRepository;
  let testTeacherId: string;
  let testPupilId: string;

  beforeAll(async () => {
    prisma = new PrismaClient();
    repository = new PrismaLessonRepository(prisma);
    await cleanDatabase(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);

    const teacher = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        name: 'Test Teacher',
        email: `teacher-${Date.now()}@example.com`,
        password: 'hashed-password',
        isEmailVerified: true,
      },
    });

    const pupil = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        name: 'Test Pupil',
        email: `pupil-${Date.now()}@example.com`,
        password: 'hashed-password',
        isEmailVerified: false,
      },
    });

    testTeacherId = teacher.id;
    testPupilId = pupil.id;
  });

  describe('findById', () => {
    it('should return lesson by ID with teacher and pupil IDs', async () => {
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
          userId: testTeacherId,
        },
      });

      await prisma.lessonPupil.create({
        data: {
          lessonId: lesson.id,
          userId: testPupilId,
        },
      });

      const result = await repository.findById(lesson.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(lesson.id);
      expect(result?.title).toBe('Math 101');
      expect(result?.teacherIds).toHaveLength(1);
      expect(result?.teacherIds[0]).toBe(testTeacherId);
      expect(result?.pupilIds).toHaveLength(1);
      expect(result?.pupilIds[0]).toBe(testPupilId);
    });

    it('should return null if lesson does not exist', async () => {
      const result = await repository.findById('non-existent-id');
      expect(result).toBeNull();
    });
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
          userId: testTeacherId,
        },
      });

      const results = await repository.findMyTeachingLessonsForPeriod(
        testTeacherId,
        startDate,
        endDate
      );

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe(lesson.id);
      expect(results[0].title).toBe('Math 101');
      expect(results[0].teacherIds).toContain(testTeacherId);
    });

    it('should not return lessons outside date range', async () => {
      const lesson = await prisma.lesson.create({
        data: {
          id: crypto.randomUUID(),
          title: 'Future Lesson',
          startDate: new Date('2026-01-01T10:00:00Z'),
          endDate: new Date('2026-01-01T11:00:00Z'),
        },
      });

      await prisma.lessonTeacher.create({
        data: {
          lessonId: lesson.id,
          userId: testTeacherId,
        },
      });

      const results = await repository.findMyTeachingLessonsForPeriod(
        testTeacherId,
        new Date('2025-11-01T00:00:00Z'),
        new Date('2025-11-30T23:59:59Z')
      );

      expect(results).toHaveLength(0);
    });
  });

  describe('create', () => {
    it('should create a lesson with teacher and pupil IDs', async () => {
      const lesson = Lesson.create(
        'Physics 101',
        [testTeacherId],
        [testPupilId],
        new Date('2025-11-15T10:00:00Z'),
        new Date('2025-11-15T11:00:00Z'),
        'Introduction to Physics'
      );

      await repository.create(lesson);

      const saved = await prisma.lesson.findUnique({
        where: { id: lesson.id },
        include: {
          teachers: true,
          pupils: true,
        },
      });

      expect(saved).toBeDefined();
      expect(saved?.title).toBe('Physics 101');
      expect(saved?.description).toBe('Introduction to Physics');
      expect(saved?.teachers).toHaveLength(1);
      expect(saved?.teachers[0].userId).toBe(testTeacherId);
      expect(saved?.pupils).toHaveLength(1);
      expect(saved?.pupils[0].userId).toBe(testPupilId);
    });

    it('should create a lesson with multiple teachers and pupils', async () => {
      const teacher2 = await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          name: 'Teacher 2',
          email: `teacher2-${Date.now()}@example.com`,
          password: 'hashed',
          isEmailVerified: true,
        },
      });

      const pupil2 = await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          name: 'Pupil 2',
          email: `pupil2-${Date.now()}@example.com`,
          password: 'hashed',
          isEmailVerified: false,
        },
      });

      const lesson = Lesson.create(
        'Team Teaching',
        [testTeacherId, teacher2.id],
        [testPupilId, pupil2.id],
        new Date('2025-11-15T10:00:00Z'),
        new Date('2025-11-15T11:00:00Z')
      );

      await repository.create(lesson);

      const saved = await prisma.lesson.findUnique({
        where: { id: lesson.id },
        include: {
          teachers: true,
          pupils: true,
        },
      });

      expect(saved?.teachers).toHaveLength(2);
      expect(saved?.pupils).toHaveLength(2);
    });
  });

  describe('save', () => {
    it('should update lesson fields including deletedAt', async () => {
      // Arrange
      const lesson = await prisma.lesson.create({
        data: {
          id: crypto.randomUUID(),
          title: 'Original Title',
          startDate: new Date('2025-11-10T10:00:00Z'),
          endDate: new Date('2025-11-10T11:00:00Z'),
        },
      });

      await prisma.lessonTeacher.create({
        data: { lessonId: lesson.id, userId: testTeacherId },
      });

      // Load via repository, modify, save
      const domainLesson = await repository.findById(lesson.id);
      expect(domainLesson).not.toBeNull();

      domainLesson!.title = 'Updated Title';
      domainLesson!.delete(); // Sets deletedAt

      await repository.save(domainLesson!);

      // Assert - check raw DB record
      const updated = await prisma.lesson.findUnique({
        where: { id: lesson.id },
      });
      expect(updated?.title).toBe('Updated Title');
      expect(updated?.deletedAt).toBeInstanceOf(Date);
    });

    it('should throw when saving non-existent lesson', async () => {
      const fakeLesson = new Lesson({
        id: 'non-existent-id',
        title: 'Fake',
        teacherIds: [testTeacherId],
        pupilIds: [],
        startDate: new Date('2025-11-10T10:00:00Z'),
        endDate: new Date('2025-11-10T11:00:00Z'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(repository.save(fakeLesson)).rejects.toThrow();
    });
  });

  describe('soft delete filtering', () => {
    it('findById should return null for soft-deleted lesson', async () => {
      // Arrange - create and soft-delete
      const lesson = await prisma.lesson.create({
        data: {
          id: crypto.randomUUID(),
          title: 'Soft Deleted',
          startDate: new Date('2025-11-10T10:00:00Z'),
          endDate: new Date('2025-11-10T11:00:00Z'),
          deletedAt: new Date(),
        },
      });

      await prisma.lessonTeacher.create({
        data: { lessonId: lesson.id, userId: testTeacherId },
      });

      // Act
      const result = await repository.findById(lesson.id);

      // Assert - filtered out
      expect(result).toBeNull();
    });

    it('findMyTeachingLessonsForPeriod should exclude soft-deleted lessons', async () => {
      const startDate = new Date('2025-11-01T00:00:00Z');
      const endDate = new Date('2025-11-30T23:59:59Z');

      // Create active lesson
      const activeLesson = await prisma.lesson.create({
        data: {
          id: crypto.randomUUID(),
          title: 'Active Lesson',
          startDate: new Date('2025-11-10T10:00:00Z'),
          endDate: new Date('2025-11-10T11:00:00Z'),
        },
      });

      // Create soft-deleted lesson
      const deletedLesson = await prisma.lesson.create({
        data: {
          id: crypto.randomUUID(),
          title: 'Deleted Lesson',
          startDate: new Date('2025-11-15T10:00:00Z'),
          endDate: new Date('2025-11-15T11:00:00Z'),
          deletedAt: new Date(),
        },
      });

      await prisma.lessonTeacher.createMany({
        data: [
          { lessonId: activeLesson.id, userId: testTeacherId },
          { lessonId: deletedLesson.id, userId: testTeacherId },
        ],
      });

      // Act
      const results = await repository.findMyTeachingLessonsForPeriod(
        testTeacherId,
        startDate,
        endDate
      );

      // Assert - only active lesson returned
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe(activeLesson.id);
    });
  });
});
