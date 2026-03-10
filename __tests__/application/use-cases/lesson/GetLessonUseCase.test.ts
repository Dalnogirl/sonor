import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetLessonUseCase } from '@/application/use-cases/lesson/GetLessonUseCase';
import { LessonRepository } from '@/domain/ports/repositories/LessonRepository';
import { UserRepository } from '@/domain/ports/repositories/UserRepository';
import { LessonMapperPort } from '@/application/ports/mappers/LessonMapperPort';
import { LessonAuthorizationService } from '@/domain/services/LessonAuthorizationService';
import { Lesson } from '@/domain/models/Lesson';
import { User } from '@/domain/models/User';
import { UserRole } from '@/domain/models/UserRole';
import { LessonNotFoundError } from '@/domain/errors/LessonErrors';
import { UserNotFoundError } from '@/domain/errors/UserErrors';

describe('GetLessonUseCase', () => {
  let getLessonUseCase: GetLessonUseCase;
  let mockLessonRepository: LessonRepository;
  let mockUserRepository: UserRepository;
  let mockLessonMapper: LessonMapperPort;
  const authService = new LessonAuthorizationService();

  const teacherId = 'teacher-1';

  beforeEach(() => {
    mockLessonRepository = {
      findById: vi.fn(),
      create: vi.fn(),
      findMyTeachingLessonsForPeriod: vi.fn(),
      save: vi.fn(),
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

    getLessonUseCase = new GetLessonUseCase(
      mockLessonRepository,
      mockUserRepository,
      mockLessonMapper,
      authService
    );
  });

  const createLesson = (teacherIds: string[] = [teacherId]) =>
    new Lesson({
      id: 'lesson-123',
      title: 'Introduction to TypeScript',
      teacherIds,
      pupilIds: ['pupil-1'],
      startDate: new Date('2025-11-10T10:00:00Z'),
      endDate: new Date('2025-11-10T12:00:00Z'),
      createdAt: new Date('2025-11-01'),
      updatedAt: new Date('2025-11-01'),
      description: 'Learn TypeScript basics',
    });

  const createUser = (role: UserRole, id = teacherId) =>
    User.createWithDefaults(id, 'Test User', 'test@example.com', 'pass', role);

  describe('Successful Execution', () => {
    it('should return lesson with users and permissions', async () => {
      const lesson = createLesson();
      const teacher = createUser(UserRole.TEACHER);

      const baseDTO = {
        id: 'lesson-123',
        title: 'Introduction to TypeScript',
        description: 'Learn TypeScript basics',
        startDate: lesson.startDate.toISOString(),
        endDate: lesson.endDate.toISOString(),
        recurringPattern: undefined,
        teachers: [{ id: teacherId, name: 'Test User', email: 'test@example.com' }],
        pupils: [],
      };

      vi.mocked(mockLessonRepository.findById).mockResolvedValue(lesson);
      vi.mocked(mockUserRepository.findById).mockResolvedValue(teacher);
      vi.mocked(mockUserRepository.findByIds).mockResolvedValue([]);
      vi.mocked(mockLessonMapper.toDTOWithUsers).mockReturnValue(baseDTO);

      const result = await getLessonUseCase.execute({ lessonId: 'lesson-123' }, teacherId);

      expect(result.permissions).toEqual({
        canEdit: true,
        canDelete: true,
        canSkip: true,
      });
    });

    it('should return false permissions for PUPIL', async () => {
      const lesson = createLesson();
      const pupil = createUser(UserRole.PUPIL, 'pupil-1');

      vi.mocked(mockLessonRepository.findById).mockResolvedValue(lesson);
      vi.mocked(mockUserRepository.findById).mockResolvedValue(pupil);
      vi.mocked(mockUserRepository.findByIds).mockResolvedValue([]);
      vi.mocked(mockLessonMapper.toDTOWithUsers).mockReturnValue({} as any);

      const result = await getLessonUseCase.execute({ lessonId: 'lesson-123' }, 'pupil-1');

      expect(result.permissions).toEqual({
        canEdit: false,
        canDelete: false,
        canSkip: false,
      });
    });

    it('should return true permissions for ADMIN on any lesson', async () => {
      const lesson = createLesson();
      const admin = createUser(UserRole.ADMIN, 'admin-1');

      vi.mocked(mockLessonRepository.findById).mockResolvedValue(lesson);
      vi.mocked(mockUserRepository.findById).mockResolvedValue(admin);
      vi.mocked(mockUserRepository.findByIds).mockResolvedValue([]);
      vi.mocked(mockLessonMapper.toDTOWithUsers).mockReturnValue({} as any);

      const result = await getLessonUseCase.execute({ lessonId: 'lesson-123' }, 'admin-1');

      expect(result.permissions).toEqual({
        canEdit: true,
        canDelete: true,
        canSkip: true,
      });
    });

    it('should return false permissions for non-owning teacher', async () => {
      const lesson = createLesson(['teacher-1']);
      const otherTeacher = createUser(UserRole.TEACHER, 'teacher-2');

      vi.mocked(mockLessonRepository.findById).mockResolvedValue(lesson);
      vi.mocked(mockUserRepository.findById).mockResolvedValue(otherTeacher);
      vi.mocked(mockUserRepository.findByIds).mockResolvedValue([]);
      vi.mocked(mockLessonMapper.toDTOWithUsers).mockReturnValue({} as any);

      const result = await getLessonUseCase.execute({ lessonId: 'lesson-123' }, 'teacher-2');

      expect(result.permissions).toEqual({
        canEdit: false,
        canDelete: false,
        canSkip: false,
      });
    });
  });

  describe('Error Handling', () => {
    it('should throw LessonNotFoundError when lesson does not exist', async () => {
      const user = createUser(UserRole.TEACHER);
      vi.mocked(mockLessonRepository.findById).mockResolvedValue(null);
      vi.mocked(mockUserRepository.findById).mockResolvedValue(user);

      await expect(
        getLessonUseCase.execute({ lessonId: 'nonexistent' }, teacherId)
      ).rejects.toThrow(LessonNotFoundError);

      expect(mockLessonMapper.toDTOWithUsers).not.toHaveBeenCalled();
    });

    it('should throw UserNotFoundError when user does not exist', async () => {
      const lesson = createLesson();
      vi.mocked(mockLessonRepository.findById).mockResolvedValue(lesson);
      vi.mocked(mockUserRepository.findById).mockResolvedValue(null);

      await expect(
        getLessonUseCase.execute({ lessonId: 'lesson-123' }, 'nonexistent')
      ).rejects.toThrow(UserNotFoundError);
    });
  });

  describe('Orchestration', () => {
    it('should fetch lesson and user in parallel, then users by IDs', async () => {
      const lesson = createLesson();
      const teacher = createUser(UserRole.TEACHER);
      const callOrder: string[] = [];

      vi.mocked(mockLessonRepository.findById).mockImplementation(async () => {
        callOrder.push('findLesson');
        return lesson;
      });

      vi.mocked(mockUserRepository.findById).mockImplementation(async () => {
        callOrder.push('findUser');
        return teacher;
      });

      vi.mocked(mockUserRepository.findByIds).mockImplementation(async () => {
        callOrder.push('findByIds');
        return [];
      });

      vi.mocked(mockLessonMapper.toDTOWithUsers).mockImplementation(() => {
        callOrder.push('toDTOWithUsers');
        return {} as any;
      });

      await getLessonUseCase.execute({ lessonId: 'lesson-123' }, teacherId);

      // findLesson and findUser run in parallel (Promise.all), so order may vary
      expect(callOrder).toContain('findLesson');
      expect(callOrder).toContain('findUser');
      // findByIds must come after
      const findByIdsIndex = callOrder.indexOf('findByIds');
      expect(findByIdsIndex).toBeGreaterThan(0);
      expect(callOrder[callOrder.length - 1]).toBe('toDTOWithUsers');
    });
  });
});
