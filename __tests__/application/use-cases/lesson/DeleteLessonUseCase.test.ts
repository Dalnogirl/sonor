import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeleteLessonUseCase } from '@/application/use-cases/lesson/DeleteLessonUseCase';
import { LessonRepository } from '@/domain/ports/repositories/LessonRepository';
import { UserRepository } from '@/domain/ports/repositories/UserRepository';
import { Logger } from '@/domain/ports/services/Logger';
import { LessonAuthorizationService } from '@/domain/services/LessonAuthorizationService';
import { Lesson } from '@/domain/models/Lesson';
import { User } from '@/domain/models/User';
import { UserRole } from '@/domain/models/UserRole';
import { LessonNotFoundError } from '@/domain/errors/LessonErrors';
import { UnauthorizedError } from '@/domain/errors/AuthorizationErrors';
import { UserNotFoundError } from '@/domain/errors/UserErrors';

describe('DeleteLessonUseCase', () => {
  let deleteLessonUseCase: DeleteLessonUseCase;
  let mockLessonRepository: LessonRepository;
  let mockUserRepository: UserRepository;
  let mockLogger: Logger;
  const authService = new LessonAuthorizationService();

  const teacherId = 'teacher-1';

  const createTeacher = (id = teacherId) =>
    User.createWithDefaults(id, 'Teacher', 't@t.com', 'Pass123!', UserRole.TEACHER);

  beforeEach(() => {
    mockLessonRepository = {
      findById: vi.fn(),
      create: vi.fn(),
      findMyTeachingLessonsForPeriod: vi.fn(),
      save: vi.fn(),
    };

    mockUserRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      findAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findByIds: vi.fn(),
    };

    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
    };

    deleteLessonUseCase = new DeleteLessonUseCase(
      mockLessonRepository,
      mockLogger,
      mockUserRepository,
      authService
    );
  });

  describe('Successful Soft Delete', () => {
    it('should soft-delete lesson when user is a teacher of the lesson', async () => {
      const lessonId = 'lesson-123';
      const lesson = new Lesson({
        id: lessonId,
        title: 'Math 101',
        teacherIds: [teacherId],
        pupilIds: ['pupil-1'],
        startDate: new Date('2025-11-10T10:00:00Z'),
        endDate: new Date('2025-11-10T11:00:00Z'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const teacher = createTeacher();

      vi.mocked(mockUserRepository.findById).mockResolvedValue(teacher);
      vi.mocked(mockLessonRepository.findById).mockResolvedValue(lesson);
      vi.mocked(mockLessonRepository.save).mockResolvedValue(undefined);

      await deleteLessonUseCase.execute(lessonId, teacherId);

      expect(mockLessonRepository.findById).toHaveBeenCalledWith(lessonId);
      expect(mockLessonRepository.save).toHaveBeenCalledWith(lesson);
      expect(lesson.isDeleted).toBe(true);
      expect(lesson.deletedAt).toBeInstanceOf(Date);
    });

    it('should log only after successful soft-delete', async () => {
      const lessonId = 'lesson-456';
      const lesson = new Lesson({
        id: lessonId,
        title: 'Physics 101',
        teacherIds: [teacherId],
        pupilIds: [],
        startDate: new Date('2025-11-15T10:00:00Z'),
        endDate: new Date('2025-11-15T11:00:00Z'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const teacher = createTeacher();

      vi.mocked(mockUserRepository.findById).mockResolvedValue(teacher);
      vi.mocked(mockLessonRepository.findById).mockResolvedValue(lesson);
      vi.mocked(mockLessonRepository.save).mockResolvedValue(undefined);

      await deleteLessonUseCase.execute(lessonId, teacherId);

      expect(mockLogger.info).toHaveBeenCalledTimes(1);
      expect(mockLogger.info).toHaveBeenCalledWith(
        `Lesson ${lessonId} soft-deleted by user ${teacherId}`
      );
    });

    it('should not log if save fails', async () => {
      const lessonId = 'lesson-789';
      const lesson = new Lesson({
        id: lessonId,
        title: 'Chemistry 101',
        teacherIds: [teacherId],
        pupilIds: [],
        startDate: new Date('2025-11-20T10:00:00Z'),
        endDate: new Date('2025-11-20T11:00:00Z'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const teacher = createTeacher();

      vi.mocked(mockUserRepository.findById).mockResolvedValue(teacher);
      vi.mocked(mockLessonRepository.findById).mockResolvedValue(lesson);
      vi.mocked(mockLessonRepository.save).mockRejectedValue(new Error('DB error'));

      await expect(
        deleteLessonUseCase.execute(lessonId, teacherId)
      ).rejects.toThrow('DB error');

      expect(mockLogger.info).not.toHaveBeenCalled();
    });
  });

  describe('Authorization (Protected Variations via LessonAuthorizationService)', () => {
    it('should throw UserNotFoundError when user does not exist', async () => {
      vi.mocked(mockUserRepository.findById).mockResolvedValue(null);

      await expect(
        deleteLessonUseCase.execute('lesson-123', 'nonexistent')
      ).rejects.toThrow(UserNotFoundError);

      expect(mockLessonRepository.save).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedError when teacher is not lesson owner', async () => {
      const lessonId = 'lesson-123';
      const lesson = new Lesson({
        id: lessonId,
        title: 'Math 101',
        teacherIds: [teacherId],
        pupilIds: ['pupil-1'],
        startDate: new Date('2025-11-10T10:00:00Z'),
        endDate: new Date('2025-11-10T11:00:00Z'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const otherTeacher = createTeacher('other-teacher');

      vi.mocked(mockUserRepository.findById).mockResolvedValue(otherTeacher);
      vi.mocked(mockLessonRepository.findById).mockResolvedValue(lesson);

      await expect(
        deleteLessonUseCase.execute(lessonId, 'other-teacher')
      ).rejects.toThrow(UnauthorizedError);

      expect(mockLessonRepository.save).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedError for PUPIL', async () => {
      const lessonId = 'lesson-123';
      const lesson = new Lesson({
        id: lessonId,
        title: 'Math 101',
        teacherIds: [teacherId],
        pupilIds: ['pupil-1'],
        startDate: new Date('2025-11-10T10:00:00Z'),
        endDate: new Date('2025-11-10T11:00:00Z'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const pupil = User.createWithDefaults('pupil-1', 'Pupil', 'p@p.com', 'Pass123!', UserRole.PUPIL);

      vi.mocked(mockUserRepository.findById).mockResolvedValue(pupil);
      vi.mocked(mockLessonRepository.findById).mockResolvedValue(lesson);

      await expect(
        deleteLessonUseCase.execute(lessonId, 'pupil-1')
      ).rejects.toThrow(UnauthorizedError);

      expect(mockLessonRepository.save).not.toHaveBeenCalled();
    });

    it('should allow ADMIN to delete any lesson', async () => {
      const lessonId = 'lesson-123';
      const lesson = new Lesson({
        id: lessonId,
        title: 'Math 101',
        teacherIds: [teacherId],
        pupilIds: [],
        startDate: new Date('2025-11-10T10:00:00Z'),
        endDate: new Date('2025-11-10T11:00:00Z'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const admin = User.createWithDefaults('admin-1', 'Admin', 'a@a.com', 'Pass123!', UserRole.ADMIN);

      vi.mocked(mockUserRepository.findById).mockResolvedValue(admin);
      vi.mocked(mockLessonRepository.findById).mockResolvedValue(lesson);
      vi.mocked(mockLessonRepository.save).mockResolvedValue(undefined);

      await deleteLessonUseCase.execute(lessonId, 'admin-1');

      expect(mockLessonRepository.save).toHaveBeenCalledWith(lesson);
      expect(lesson.isDeleted).toBe(true);
    });

    it('should allow deletion when user is one of multiple teachers', async () => {
      const lessonId = 'lesson-multi';
      const secondTeacherId = 'teacher-2';
      const lesson = new Lesson({
        id: lessonId,
        title: 'Team Teaching',
        teacherIds: [teacherId, secondTeacherId],
        pupilIds: [],
        startDate: new Date('2025-11-10T10:00:00Z'),
        endDate: new Date('2025-11-10T11:00:00Z'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const teacher2 = createTeacher(secondTeacherId);

      vi.mocked(mockUserRepository.findById).mockResolvedValue(teacher2);
      vi.mocked(mockLessonRepository.findById).mockResolvedValue(lesson);
      vi.mocked(mockLessonRepository.save).mockResolvedValue(undefined);

      await deleteLessonUseCase.execute(lessonId, secondTeacherId);

      expect(mockLessonRepository.save).toHaveBeenCalledWith(lesson);
      expect(lesson.isDeleted).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should throw LessonNotFoundError when lesson does not exist', async () => {
      const teacher = createTeacher();
      vi.mocked(mockUserRepository.findById).mockResolvedValue(teacher);
      vi.mocked(mockLessonRepository.findById).mockResolvedValue(null);

      await expect(
        deleteLessonUseCase.execute('nonexistent-id', teacherId)
      ).rejects.toThrow(LessonNotFoundError);

      expect(mockLessonRepository.save).not.toHaveBeenCalled();
      expect(mockLogger.info).not.toHaveBeenCalled();
    });
  });

  describe('Orchestration Order (Controller GRASP)', () => {
    it('should findUser → findLesson → auth → domain.delete() → save → log', async () => {
      const lessonId = 'lesson-order';
      const callOrder: string[] = [];

      const lesson = new Lesson({
        id: lessonId,
        title: 'Test Lesson',
        teacherIds: [teacherId],
        pupilIds: [],
        startDate: new Date('2025-11-20T10:00:00Z'),
        endDate: new Date('2025-11-20T11:00:00Z'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const teacher = createTeacher();

      vi.mocked(mockUserRepository.findById).mockImplementation(async () => {
        callOrder.push('findUser');
        return teacher;
      });

      vi.mocked(mockLessonRepository.findById).mockImplementation(async () => {
        callOrder.push('findLesson');
        return lesson;
      });

      vi.mocked(mockLessonRepository.save).mockImplementation(async () => {
        callOrder.push('save');
        expect(lesson.isDeleted).toBe(true);
      });

      vi.mocked(mockLogger.info).mockImplementation(() => {
        callOrder.push('log');
      });

      await deleteLessonUseCase.execute(lessonId, teacherId);

      expect(callOrder).toEqual(['findUser', 'findLesson', 'save', 'log']);
    });
  });
});
