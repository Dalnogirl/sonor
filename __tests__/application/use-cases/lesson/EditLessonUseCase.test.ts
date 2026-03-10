import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EditLessonUseCase } from '@/application/use-cases/lesson/EditLessonUseCase';
import { LessonRepository } from '@/domain/ports/repositories/LessonRepository';
import { LessonExceptionRepository } from '@/domain/ports/repositories/LessonExceptionRepository';
import { UserRepository } from '@/domain/ports/repositories/UserRepository';
import { LessonMapperPort } from '@/application/ports/mappers/LessonMapperPort';
import { LessonAuthorizationService } from '@/domain/services/LessonAuthorizationService';
import { Lesson } from '@/domain/models/Lesson';
import { User } from '@/domain/models/User';
import { UserRole } from '@/domain/models/UserRole';
import {
  RecurringPattern,
  RecurringFrequency,
  DayOfWeek,
} from '@/domain/models/RecurringPattern';
import { LessonNotFoundError } from '@/domain/errors/LessonErrors';
import { UnauthorizedError } from '@/domain/errors/AuthorizationErrors';
import { UserNotFoundError } from '@/domain/errors/UserErrors';

describe('EditLessonUseCase', () => {
  let editLessonUseCase: EditLessonUseCase;
  let mockLessonRepository: LessonRepository;
  let mockLessonExceptionRepository: LessonExceptionRepository;
  let mockUserRepository: UserRepository;
  let mockLessonMapper: LessonMapperPort;
  const authService = new LessonAuthorizationService();

  const teacherId = 'teacher-1';
  const baseStartDate = new Date('2025-11-10T10:00:00Z');
  const baseEndDate = new Date('2025-11-10T12:00:00Z');

  const createLesson = (overrides?: Partial<ConstructorParameters<typeof Lesson>[0]>) =>
    new Lesson({
      id: 'lesson-1',
      title: 'Original Title',
      teacherIds: [teacherId],
      pupilIds: ['pupil-1'],
      startDate: baseStartDate,
      endDate: baseEndDate,
      createdAt: new Date('2025-11-01T10:00:00Z'),
      updatedAt: new Date('2025-11-01T10:00:00Z'),
      ...overrides,
    });

  const createTeacher = (id = teacherId) =>
    User.createWithDefaults(id, 'Teacher', 't@t.com', 'Pass123!', UserRole.TEACHER);

  beforeEach(() => {
    mockLessonRepository = {
      findById: vi.fn(),
      create: vi.fn(),
      findMyTeachingLessonsForPeriod: vi.fn(),
      save: vi.fn(),
    };

    mockLessonExceptionRepository = {
      findByLessonId: vi.fn(),
      findByLessonAndDate: vi.fn(),
      findByDateRange: vi.fn(),
      findByLessonIdsAndDateRange: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      deleteByLessonId: vi.fn(),
      exists: vi.fn(),
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

    mockLessonMapper = {
      toDTO: vi.fn().mockReturnValue({ id: 'lesson-1', title: 'Updated' }),
      toDTOWithUsers: vi.fn(),
    };

    editLessonUseCase = new EditLessonUseCase(
      mockLessonRepository,
      mockLessonExceptionRepository,
      mockLessonMapper,
      mockUserRepository,
      authService
    );
  });

  describe('Happy Path', () => {
    it('should edit lesson and save', async () => {
      const lesson = createLesson();
      const teacher = createTeacher();
      vi.mocked(mockUserRepository.findById).mockResolvedValue(teacher);
      vi.mocked(mockLessonRepository.findById).mockResolvedValue(lesson);
      vi.mocked(mockLessonRepository.save).mockResolvedValue(undefined);

      await editLessonUseCase.execute(
        {
          id: 'lesson-1',
          title: 'Updated Title',
          teacherIds: [teacherId],
          pupilIds: ['pupil-1', 'pupil-2'],
          startDate: baseStartDate,
          endDate: baseEndDate,
        },
        teacherId
      );

      expect(mockLessonRepository.findById).toHaveBeenCalledWith('lesson-1');
      expect(mockLessonRepository.save).toHaveBeenCalledWith(lesson);
      expect(lesson.title).toBe('Updated Title');
      expect(lesson.pupilIds).toEqual(['pupil-1', 'pupil-2']);
    });

    it('should return mapped DTO', async () => {
      const lesson = createLesson();
      const teacher = createTeacher();
      vi.mocked(mockUserRepository.findById).mockResolvedValue(teacher);
      vi.mocked(mockLessonRepository.findById).mockResolvedValue(lesson);
      vi.mocked(mockLessonRepository.save).mockResolvedValue(undefined);

      const result = await editLessonUseCase.execute(
        {
          id: 'lesson-1',
          title: 'Updated',
          teacherIds: [teacherId],
          pupilIds: ['pupil-1'],
          startDate: baseStartDate,
          endDate: baseEndDate,
        },
        teacherId
      );

      expect(mockLessonMapper.toDTO).toHaveBeenCalledWith(lesson);
      expect(result).toEqual({ id: 'lesson-1', title: 'Updated' });
    });
  });

  describe('Authorization', () => {
    it('should throw UserNotFoundError when user does not exist', async () => {
      vi.mocked(mockUserRepository.findById).mockResolvedValue(null);

      await expect(
        editLessonUseCase.execute(
          {
            id: 'lesson-1',
            title: 'Updated',
            teacherIds: [teacherId],
            pupilIds: ['pupil-1'],
            startDate: baseStartDate,
            endDate: baseEndDate,
          },
          'nonexistent-user'
        )
      ).rejects.toThrow(UserNotFoundError);
    });

    it('should throw UnauthorizedError when user is not lesson teacher', async () => {
      const lesson = createLesson();
      const otherTeacher = createTeacher('other-teacher');
      vi.mocked(mockUserRepository.findById).mockResolvedValue(otherTeacher);
      vi.mocked(mockLessonRepository.findById).mockResolvedValue(lesson);

      await expect(
        editLessonUseCase.execute(
          {
            id: 'lesson-1',
            title: 'Updated',
            teacherIds: [teacherId],
            pupilIds: ['pupil-1'],
            startDate: baseStartDate,
            endDate: baseEndDate,
          },
          'other-teacher'
        )
      ).rejects.toThrow(UnauthorizedError);

      expect(mockLessonRepository.save).not.toHaveBeenCalled();
    });

    it('should allow ADMIN to edit any lesson', async () => {
      const lesson = createLesson();
      const admin = User.createWithDefaults('admin-1', 'Admin', 'a@a.com', 'Pass123!', UserRole.ADMIN);
      vi.mocked(mockUserRepository.findById).mockResolvedValue(admin);
      vi.mocked(mockLessonRepository.findById).mockResolvedValue(lesson);
      vi.mocked(mockLessonRepository.save).mockResolvedValue(undefined);

      await editLessonUseCase.execute(
        {
          id: 'lesson-1',
          title: 'Admin Edit',
          teacherIds: [teacherId],
          pupilIds: ['pupil-1'],
          startDate: baseStartDate,
          endDate: baseEndDate,
        },
        'admin-1'
      );

      expect(mockLessonRepository.save).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should throw LessonNotFoundError when lesson does not exist', async () => {
      const teacher = createTeacher();
      vi.mocked(mockUserRepository.findById).mockResolvedValue(teacher);
      vi.mocked(mockLessonRepository.findById).mockResolvedValue(null);

      await expect(
        editLessonUseCase.execute(
          {
            id: 'nonexistent',
            title: 'Updated',
            teacherIds: [teacherId],
            pupilIds: ['pupil-1'],
            startDate: baseStartDate,
            endDate: baseEndDate,
          },
          teacherId
        )
      ).rejects.toThrow(LessonNotFoundError);

      expect(mockLessonRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('Recurring Pattern & Exceptions', () => {
    it('should clear exceptions when recurring pattern changes', async () => {
      const oldPattern = RecurringPattern.daily(1, undefined, undefined, baseStartDate);
      const lesson = createLesson({ recurringPattern: oldPattern });
      const teacher = createTeacher();

      vi.mocked(mockUserRepository.findById).mockResolvedValue(teacher);
      vi.mocked(mockLessonRepository.findById).mockResolvedValue(lesson);
      vi.mocked(mockLessonRepository.save).mockResolvedValue(undefined);
      vi.mocked(mockLessonExceptionRepository.deleteByLessonId).mockResolvedValue(undefined);

      await editLessonUseCase.execute(
        {
          id: 'lesson-1',
          title: 'Updated',
          teacherIds: [teacherId],
          pupilIds: ['pupil-1'],
          startDate: baseStartDate,
          endDate: baseEndDate,
          recurringPattern: {
            frequency: RecurringFrequency.WEEKLY,
            interval: 1,
            daysOfWeek: [DayOfWeek.MONDAY],
          },
        },
        teacherId
      );

      expect(mockLessonExceptionRepository.deleteByLessonId).toHaveBeenCalledWith('lesson-1');
    });

    it('should not clear exceptions when recurring pattern unchanged', async () => {
      const pattern = RecurringPattern.daily(1, undefined, undefined, baseStartDate);
      const lesson = createLesson({ recurringPattern: pattern });
      const teacher = createTeacher();

      vi.mocked(mockUserRepository.findById).mockResolvedValue(teacher);
      vi.mocked(mockLessonRepository.findById).mockResolvedValue(lesson);
      vi.mocked(mockLessonRepository.save).mockResolvedValue(undefined);

      await editLessonUseCase.execute(
        {
          id: 'lesson-1',
          title: 'Updated',
          teacherIds: [teacherId],
          pupilIds: ['pupil-1'],
          startDate: baseStartDate,
          endDate: baseEndDate,
          recurringPattern: {
            frequency: RecurringFrequency.DAILY,
            interval: 1,
          },
        },
        teacherId
      );

      expect(mockLessonExceptionRepository.deleteByLessonId).not.toHaveBeenCalled();
    });

    it('should clear exceptions when pattern removed', async () => {
      const pattern = RecurringPattern.daily(1, undefined, undefined, baseStartDate);
      const lesson = createLesson({ recurringPattern: pattern });
      const teacher = createTeacher();

      vi.mocked(mockUserRepository.findById).mockResolvedValue(teacher);
      vi.mocked(mockLessonRepository.findById).mockResolvedValue(lesson);
      vi.mocked(mockLessonRepository.save).mockResolvedValue(undefined);
      vi.mocked(mockLessonExceptionRepository.deleteByLessonId).mockResolvedValue(undefined);

      await editLessonUseCase.execute(
        {
          id: 'lesson-1',
          title: 'Updated',
          teacherIds: [teacherId],
          pupilIds: ['pupil-1'],
          startDate: baseStartDate,
          endDate: baseEndDate,
        },
        teacherId
      );

      expect(mockLessonExceptionRepository.deleteByLessonId).toHaveBeenCalledWith('lesson-1');
    });

    it('should not clear exceptions when both patterns undefined', async () => {
      const lesson = createLesson();
      const teacher = createTeacher();

      vi.mocked(mockUserRepository.findById).mockResolvedValue(teacher);
      vi.mocked(mockLessonRepository.findById).mockResolvedValue(lesson);
      vi.mocked(mockLessonRepository.save).mockResolvedValue(undefined);

      await editLessonUseCase.execute(
        {
          id: 'lesson-1',
          title: 'Updated',
          teacherIds: [teacherId],
          pupilIds: ['pupil-1'],
          startDate: baseStartDate,
          endDate: baseEndDate,
        },
        teacherId
      );

      expect(mockLessonExceptionRepository.deleteByLessonId).not.toHaveBeenCalled();
    });
  });

  describe('Orchestration Order', () => {
    it('should find user → find lesson → auth → edit → clear exceptions → save → map', async () => {
      const oldPattern = RecurringPattern.daily(1, undefined, undefined, baseStartDate);
      const lesson = createLesson({ recurringPattern: oldPattern });
      const teacher = createTeacher();
      const callOrder: string[] = [];

      vi.mocked(mockUserRepository.findById).mockImplementation(async () => {
        callOrder.push('findUser');
        return teacher;
      });

      vi.mocked(mockLessonRepository.findById).mockImplementation(async () => {
        callOrder.push('findLesson');
        return lesson;
      });

      vi.mocked(mockLessonExceptionRepository.deleteByLessonId).mockImplementation(async () => {
        callOrder.push('deleteExceptions');
      });

      vi.mocked(mockLessonRepository.save).mockImplementation(async () => {
        callOrder.push('save');
      });

      vi.mocked(mockLessonMapper.toDTO).mockImplementation(() => {
        callOrder.push('toDTO');
        return {} as ReturnType<LessonMapperPort['toDTO']>;
      });

      await editLessonUseCase.execute(
        {
          id: 'lesson-1',
          title: 'Updated',
          teacherIds: [teacherId],
          pupilIds: ['pupil-1'],
          startDate: baseStartDate,
          endDate: baseEndDate,
          recurringPattern: {
            frequency: RecurringFrequency.WEEKLY,
            interval: 1,
            daysOfWeek: [DayOfWeek.MONDAY],
          },
        },
        teacherId
      );

      expect(callOrder).toEqual([
        'findUser',
        'findLesson',
        'deleteExceptions',
        'save',
        'toDTO',
      ]);
    });
  });
});
