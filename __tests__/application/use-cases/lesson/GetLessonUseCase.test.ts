import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetLessonUseCase } from '@/application/use-cases/lesson/GetLesson';
import { LessonRepository } from '@/domain/ports/repositories/LessonRepository';
import { UserRepository } from '@/domain/ports/repositories/UserRepository';
import { LessonMapperPort } from '@/domain/ports/mappers/LessonMapperPort';
import { Lesson } from '@/domain/models/Lesson';
import { User } from '@/domain/models/User';
import { LessonNotFoundError } from '@/domain/errors/LessonErrors';

describe('GetLessonUseCase', () => {
  let getLessonUseCase: GetLessonUseCase;
  let mockLessonRepository: LessonRepository;
  let mockUserRepository: UserRepository;
  let mockLessonMapper: LessonMapperPort;

  beforeEach(() => {
    // Create mocks (Dependency Injection pattern)
    mockLessonRepository = {
      findById: vi.fn(),
      create: vi.fn(),
      findMyTeachingLessonsForPeriod: vi.fn(),
    };

    mockUserRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findByEmail: vi.fn(),
      findByIds: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    mockLessonMapper = {
      toDTO: vi.fn(),
      toDTOWithUsers: vi.fn(),
    };

    // Inject mocks into use case (Dependency Inversion Principle)
    getLessonUseCase = new GetLessonUseCase(
      mockLessonRepository,
      mockUserRepository,
      mockLessonMapper
    );
  });

  describe('Successful Execution', () => {
    it('should return lesson with full user data when lesson exists', async () => {
      // Arrange
      const lessonId = 'lesson-123';
      const teacher1Id = 'teacher-1';
      const teacher2Id = 'teacher-2';
      const pupil1Id = 'pupil-1';

      const lesson = new Lesson(
        lessonId,
        'Introduction to TypeScript',
        [teacher1Id, teacher2Id],
        new Date('2025-11-01'),
        new Date('2025-11-01'),
        [pupil1Id],
        new Date('2025-11-10T10:00:00Z'),
        new Date('2025-11-10T12:00:00Z'),
        'Learn TypeScript basics'
      );

      const teachers = [
        User.createWithDefaults(teacher1Id, 'John Teacher', 'john@example.com', 'pass'),
        User.createWithDefaults(teacher2Id, 'Jane Teacher', 'jane@example.com', 'pass'),
      ];

      const pupils = [
        User.createWithDefaults(pupil1Id, 'Alice Pupil', 'alice@example.com', 'pass'),
      ];

      const expectedDTO = {
        id: lessonId,
        title: 'Introduction to TypeScript',
        description: 'Learn TypeScript basics',
        startDate: lesson.startDate,
        endDate: lesson.endDate,
        recurringPattern: undefined,
        teachers: [
          { id: teacher1Id, name: 'John Teacher', email: 'john@example.com' },
          { id: teacher2Id, name: 'Jane Teacher', email: 'jane@example.com' },
        ],
        pupils: [
          { id: pupil1Id, name: 'Alice Pupil', email: 'alice@example.com' },
        ],
      };

      // Mock repository responses
      vi.mocked(mockLessonRepository.findById).mockResolvedValue(lesson);
      vi.mocked(mockUserRepository.findByIds)
        .mockResolvedValueOnce(teachers) // First call: teachers
        .mockResolvedValueOnce(pupils);   // Second call: pupils
      vi.mocked(mockLessonMapper.toDTOWithUsers).mockReturnValue(expectedDTO);

      // Act
      const result = await getLessonUseCase.execute({ lessonId });

      // Assert - Controller pattern (use case orchestrates)
      expect(mockLessonRepository.findById).toHaveBeenCalledWith(lessonId);
      expect(mockUserRepository.findByIds).toHaveBeenCalledWith([teacher1Id, teacher2Id]);
      expect(mockUserRepository.findByIds).toHaveBeenCalledWith([pupil1Id]);
      expect(mockLessonMapper.toDTOWithUsers).toHaveBeenCalledWith(lesson, teachers, pupils);
      expect(result).toEqual(expectedDTO);
    });

    it('should handle lessons with no pupils', async () => {
      // Arrange
      const lessonId = 'lesson-456';
      const teacherId = 'teacher-1';

      const lesson = new Lesson(
        lessonId,
        'Advanced TypeScript',
        [teacherId],
        new Date(),
        new Date(),
        [], // No pupils
        new Date('2025-11-15T10:00:00Z'),
        new Date('2025-11-15T12:00:00Z')
      );

      const teachers = [
        User.createWithDefaults(teacherId, 'John Teacher', 'john@example.com', 'pass'),
      ];

      const expectedDTO = {
        id: lessonId,
        title: 'Advanced TypeScript',
        description: undefined,
        startDate: lesson.startDate,
        endDate: lesson.endDate,
        recurringPattern: undefined,
        teachers: [{ id: teacherId, name: 'John Teacher', email: 'john@example.com' }],
        pupils: [],
      };

      vi.mocked(mockLessonRepository.findById).mockResolvedValue(lesson);
      vi.mocked(mockUserRepository.findByIds)
        .mockResolvedValueOnce(teachers)
        .mockResolvedValueOnce([]); // No pupils
      vi.mocked(mockLessonMapper.toDTOWithUsers).mockReturnValue(expectedDTO);

      // Act
      const result = await getLessonUseCase.execute({ lessonId });

      // Assert
      expect(result).toEqual(expectedDTO);
      expect(result?.pupils).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    it('should throw LessonNotFoundError when lesson does not exist', async () => {
      // Arrange
      const lessonId = 'nonexistent-lesson';
      vi.mocked(mockLessonRepository.findById).mockResolvedValue(null);

      // Act & Assert - Domain error (not HTTP error)
      await expect(
        getLessonUseCase.execute({ lessonId })
      ).rejects.toThrow(LessonNotFoundError);

      // Verify error message includes lesson ID
      await expect(
        getLessonUseCase.execute({ lessonId })
      ).rejects.toThrow(lessonId);

      // Should not call user repository or mapper when lesson not found
      expect(mockUserRepository.findByIds).not.toHaveBeenCalled();
      expect(mockLessonMapper.toDTOWithUsers).not.toHaveBeenCalled();
    });
  });

  describe('Use Case Orchestration', () => {
    it('should fetch users only after lesson is found (Controller pattern)', async () => {
      // Tests execution order - orchestration responsibility
      const lessonId = 'lesson-789';
      const lesson = new Lesson(
        lessonId,
        'Test Lesson',
        ['teacher-1'],
        new Date(),
        new Date(),
        ['pupil-1'],
        new Date('2025-11-20T10:00:00Z'),
        new Date('2025-11-20T12:00:00Z')
      );

      const callOrder: string[] = [];

      vi.mocked(mockLessonRepository.findById).mockImplementation(async () => {
        callOrder.push('findById');
        return lesson;
      });

      vi.mocked(mockUserRepository.findByIds).mockImplementation(async () => {
        callOrder.push('findByIds');
        return [];
      });

      vi.mocked(mockLessonMapper.toDTOWithUsers).mockImplementation(() => {
        callOrder.push('toDTOWithUsers');
        return {} as any;
      });

      // Act
      await getLessonUseCase.execute({ lessonId });

      // Assert - Correct orchestration order (Controller GRASP)
      expect(callOrder).toEqual([
        'findById',      // 1. Find lesson first
        'findByIds',     // 2. Find teachers
        'findByIds',     // 3. Find pupils
        'toDTOWithUsers' // 4. Map to DTO
      ]);
    });
  });

  describe('Integration with Multiple Aggregates', () => {
    it('should correctly pass teacher and pupil IDs to repository', async () => {
      // Tests aggregate boundary crossing
      const lesson = new Lesson(
        'lesson-1',
        'Test',
        ['t1', 't2', 't3'],
        new Date(),
        new Date(),
        ['p1', 'p2'],
        new Date('2025-11-20T10:00:00Z'),
        new Date('2025-11-20T12:00:00Z')
      );

      vi.mocked(mockLessonRepository.findById).mockResolvedValue(lesson);
      vi.mocked(mockUserRepository.findByIds).mockResolvedValue([]);
      vi.mocked(mockLessonMapper.toDTOWithUsers).mockReturnValue({} as any);

      // Act
      await getLessonUseCase.execute({ lessonId: 'lesson-1' });

      // Assert - Separate calls for teachers and pupils (Low Coupling)
      expect(mockUserRepository.findByIds).toHaveBeenNthCalledWith(1, ['t1', 't2', 't3']);
      expect(mockUserRepository.findByIds).toHaveBeenNthCalledWith(2, ['p1', 'p2']);
    });
  });
});
