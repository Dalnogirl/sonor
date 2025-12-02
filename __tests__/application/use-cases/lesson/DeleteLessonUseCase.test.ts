import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeleteLessonUseCase } from '@/application/use-cases/lesson/DeleteLesson';
import { LessonRepository } from '@/domain/ports/repositories/LessonRepository';
import { Logger } from '@/domain/ports/services/Logger';
import { Lesson } from '@/domain/models/Lesson';
import { LessonNotFoundError } from '@/domain/errors/LessonErrors';
import { UnauthorizedError } from '@/domain/errors/AuthorizationErrors';

describe('DeleteLessonUseCase', () => {
  let deleteLessonUseCase: DeleteLessonUseCase;
  let mockLessonRepository: LessonRepository;
  let mockLogger: Logger;

  const teacherId = 'teacher-1';
  const otherUserId = 'other-user';

  beforeEach(() => {
    mockLessonRepository = {
      findById: vi.fn(),
      create: vi.fn(),
      findMyTeachingLessonsForPeriod: vi.fn(),
      save: vi.fn(),
    };

    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
    };

    deleteLessonUseCase = new DeleteLessonUseCase(
      mockLessonRepository,
      mockLogger
    );
  });

  describe('Successful Soft Delete', () => {
    it('should soft-delete lesson when user is a teacher', async () => {
      // Arrange
      const lessonId = 'lesson-123';
      const lesson = new Lesson(
        lessonId,
        'Math 101',
        [teacherId],
        new Date(),
        new Date(),
        ['pupil-1'],
        new Date('2025-11-10T10:00:00Z'),
        new Date('2025-11-10T11:00:00Z')
      );

      vi.mocked(mockLessonRepository.findById).mockResolvedValue(lesson);
      vi.mocked(mockLessonRepository.save).mockResolvedValue(undefined);

      // Act
      await deleteLessonUseCase.execute(lessonId, teacherId);

      // Assert - Domain method sets deletedAt, repo persists
      expect(mockLessonRepository.findById).toHaveBeenCalledWith(lessonId);
      expect(mockLessonRepository.save).toHaveBeenCalledWith(lesson);
      expect(lesson.isDeleted).toBe(true);
      expect(lesson.deletedAt).toBeInstanceOf(Date);
    });

    it('should log only after successful soft-delete', async () => {
      // Arrange
      const lessonId = 'lesson-456';
      const lesson = new Lesson(
        lessonId,
        'Physics 101',
        [teacherId],
        new Date(),
        new Date(),
        [],
        new Date('2025-11-15T10:00:00Z'),
        new Date('2025-11-15T11:00:00Z')
      );

      vi.mocked(mockLessonRepository.findById).mockResolvedValue(lesson);
      vi.mocked(mockLessonRepository.save).mockResolvedValue(undefined);

      // Act
      await deleteLessonUseCase.execute(lessonId, teacherId);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledTimes(1);
      expect(mockLogger.info).toHaveBeenCalledWith(
        `Lesson ${lessonId} soft-deleted by user ${teacherId}`
      );
    });

    it('should not log if save fails', async () => {
      // Arrange
      const lessonId = 'lesson-789';
      const lesson = new Lesson(
        lessonId,
        'Chemistry 101',
        [teacherId],
        new Date(),
        new Date(),
        [],
        new Date('2025-11-20T10:00:00Z'),
        new Date('2025-11-20T11:00:00Z')
      );

      vi.mocked(mockLessonRepository.findById).mockResolvedValue(lesson);
      vi.mocked(mockLessonRepository.save).mockRejectedValue(
        new Error('DB error')
      );

      // Act & Assert
      await expect(
        deleteLessonUseCase.execute(lessonId, teacherId)
      ).rejects.toThrow('DB error');

      expect(mockLogger.info).not.toHaveBeenCalled();
    });
  });

  describe('Authorization (Protected Variations)', () => {
    it('should throw UnauthorizedError when user is not a teacher', async () => {
      // Arrange
      const lessonId = 'lesson-123';
      const lesson = new Lesson(
        lessonId,
        'Math 101',
        [teacherId],
        new Date(),
        new Date(),
        [otherUserId],
        new Date('2025-11-10T10:00:00Z'),
        new Date('2025-11-10T11:00:00Z')
      );

      vi.mocked(mockLessonRepository.findById).mockResolvedValue(lesson);

      // Act & Assert
      await expect(
        deleteLessonUseCase.execute(lessonId, otherUserId)
      ).rejects.toThrow(UnauthorizedError);

      await expect(
        deleteLessonUseCase.execute(lessonId, otherUserId)
      ).rejects.toThrow('Only teachers can delete their lessons');

      expect(mockLessonRepository.save).not.toHaveBeenCalled();
    });

    it('should allow deletion when user is one of multiple teachers', async () => {
      // Arrange
      const lessonId = 'lesson-multi';
      const secondTeacherId = 'teacher-2';
      const lesson = new Lesson(
        lessonId,
        'Team Teaching',
        [teacherId, secondTeacherId],
        new Date(),
        new Date(),
        [],
        new Date('2025-11-10T10:00:00Z'),
        new Date('2025-11-10T11:00:00Z')
      );

      vi.mocked(mockLessonRepository.findById).mockResolvedValue(lesson);
      vi.mocked(mockLessonRepository.save).mockResolvedValue(undefined);

      // Act
      await deleteLessonUseCase.execute(lessonId, secondTeacherId);

      // Assert
      expect(mockLessonRepository.save).toHaveBeenCalledWith(lesson);
      expect(lesson.isDeleted).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should throw LessonNotFoundError when lesson does not exist', async () => {
      // Arrange
      const lessonId = 'nonexistent-id';
      vi.mocked(mockLessonRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(
        deleteLessonUseCase.execute(lessonId, teacherId)
      ).rejects.toThrow(LessonNotFoundError);

      expect(mockLessonRepository.save).not.toHaveBeenCalled();
      expect(mockLogger.info).not.toHaveBeenCalled();
    });
  });

  describe('Orchestration Order (Controller GRASP)', () => {
    it('should find → authorize → domain.delete() → save → log', async () => {
      // Arrange
      const lessonId = 'lesson-order';
      const callOrder: string[] = [];

      const lesson = new Lesson(
        lessonId,
        'Test Lesson',
        [teacherId],
        new Date(),
        new Date(),
        [],
        new Date('2025-11-20T10:00:00Z'),
        new Date('2025-11-20T11:00:00Z')
      );

      vi.mocked(mockLessonRepository.findById).mockImplementation(async () => {
        callOrder.push('findById');
        return lesson;
      });

      vi.mocked(mockLessonRepository.save).mockImplementation(async () => {
        callOrder.push('save');
        // Verify lesson.delete() was called before save
        expect(lesson.isDeleted).toBe(true);
      });

      vi.mocked(mockLogger.info).mockImplementation(() => {
        callOrder.push('log');
      });

      // Act
      await deleteLessonUseCase.execute(lessonId, teacherId);

      // Assert - find → save (with deleted lesson) → log
      expect(callOrder).toEqual(['findById', 'save', 'log']);
    });
  });
});
