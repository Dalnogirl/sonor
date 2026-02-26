import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EditLessonUseCase } from '@/application/use-cases/lesson/EditLessonUseCase';
import { LessonRepository } from '@/domain/ports/repositories/LessonRepository';
import { LessonExceptionRepository } from '@/domain/ports/repositories/LessonExceptionRepository';
import { LessonMapperPort } from '@/application/ports/mappers/LessonMapperPort';
import { Lesson } from '@/domain/models/Lesson';
import {
  RecurringPattern,
  RecurringFrequency,
  DayOfWeek,
} from '@/domain/models/RecurringPattern';
import { LessonNotFoundError } from '@/domain/errors/LessonErrors';

describe('EditLessonUseCase', () => {
  let editLessonUseCase: EditLessonUseCase;
  let mockLessonRepository: LessonRepository;
  let mockLessonExceptionRepository: LessonExceptionRepository;
  let mockLessonMapper: LessonMapperPort;

  const baseStartDate = new Date('2025-11-10T10:00:00Z');
  const baseEndDate = new Date('2025-11-10T12:00:00Z');

  const createLesson = (overrides?: Partial<ConstructorParameters<typeof Lesson>[0]>) =>
    new Lesson({
      id: 'lesson-1',
      title: 'Original Title',
      teacherIds: ['teacher-1'],
      pupilIds: ['pupil-1'],
      startDate: baseStartDate,
      endDate: baseEndDate,
      createdAt: new Date('2025-11-01T10:00:00Z'),
      updatedAt: new Date('2025-11-01T10:00:00Z'),
      ...overrides,
    });

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

    mockLessonMapper = {
      toDTO: vi.fn().mockReturnValue({ id: 'lesson-1', title: 'Updated' }),
      toDTOWithUsers: vi.fn(),
    };

    editLessonUseCase = new EditLessonUseCase(
      mockLessonRepository,
      mockLessonExceptionRepository,
      mockLessonMapper
    );
  });

  describe('Happy Path', () => {
    it('should edit lesson and save', async () => {
      const lesson = createLesson();
      vi.mocked(mockLessonRepository.findById).mockResolvedValue(lesson);
      vi.mocked(mockLessonRepository.save).mockResolvedValue(undefined);

      await editLessonUseCase.execute({
        id: 'lesson-1',
        title: 'Updated Title',
        teacherIds: ['teacher-1'],
        pupilIds: ['pupil-1', 'pupil-2'],
        startDate: baseStartDate,
        endDate: baseEndDate,
      });

      expect(mockLessonRepository.findById).toHaveBeenCalledWith('lesson-1');
      expect(mockLessonRepository.save).toHaveBeenCalledWith(lesson);
      expect(lesson.title).toBe('Updated Title');
      expect(lesson.pupilIds).toEqual(['pupil-1', 'pupil-2']);
    });

    it('should return mapped DTO', async () => {
      const lesson = createLesson();
      vi.mocked(mockLessonRepository.findById).mockResolvedValue(lesson);
      vi.mocked(mockLessonRepository.save).mockResolvedValue(undefined);

      const result = await editLessonUseCase.execute({
        id: 'lesson-1',
        title: 'Updated',
        teacherIds: ['teacher-1'],
        pupilIds: ['pupil-1'],
        startDate: baseStartDate,
        endDate: baseEndDate,
      });

      expect(mockLessonMapper.toDTO).toHaveBeenCalledWith(lesson);
      expect(result).toEqual({ id: 'lesson-1', title: 'Updated' });
    });
  });

  describe('Error Handling', () => {
    it('should throw LessonNotFoundError when lesson does not exist', async () => {
      vi.mocked(mockLessonRepository.findById).mockResolvedValue(null);

      await expect(
        editLessonUseCase.execute({
          id: 'nonexistent',
          title: 'Updated',
          teacherIds: ['teacher-1'],
          pupilIds: ['pupil-1'],
          startDate: baseStartDate,
          endDate: baseEndDate,
        })
      ).rejects.toThrow(LessonNotFoundError);

      expect(mockLessonRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('Recurring Pattern & Exceptions', () => {
    it('should clear exceptions when recurring pattern changes', async () => {
      const oldPattern = RecurringPattern.daily(
        1,
        undefined,
        undefined,
        baseStartDate
      );
      const lesson = createLesson({ recurringPattern: oldPattern });

      vi.mocked(mockLessonRepository.findById).mockResolvedValue(lesson);
      vi.mocked(mockLessonRepository.save).mockResolvedValue(undefined);
      vi.mocked(
        mockLessonExceptionRepository.deleteByLessonId
      ).mockResolvedValue(undefined);

      await editLessonUseCase.execute({
        id: 'lesson-1',
        title: 'Updated',
        teacherIds: ['teacher-1'],
        pupilIds: ['pupil-1'],
        startDate: baseStartDate,
        endDate: baseEndDate,
        recurringPattern: {
          frequency: RecurringFrequency.WEEKLY,
          interval: 1,
          daysOfWeek: [DayOfWeek.MONDAY],
        },
      });

      expect(
        mockLessonExceptionRepository.deleteByLessonId
      ).toHaveBeenCalledWith('lesson-1');
    });

    it('should not clear exceptions when recurring pattern unchanged', async () => {
      const pattern = RecurringPattern.daily(
        1,
        undefined,
        undefined,
        baseStartDate
      );
      const lesson = createLesson({ recurringPattern: pattern });

      vi.mocked(mockLessonRepository.findById).mockResolvedValue(lesson);
      vi.mocked(mockLessonRepository.save).mockResolvedValue(undefined);

      await editLessonUseCase.execute({
        id: 'lesson-1',
        title: 'Updated',
        teacherIds: ['teacher-1'],
        pupilIds: ['pupil-1'],
        startDate: baseStartDate,
        endDate: baseEndDate,
        recurringPattern: {
          frequency: RecurringFrequency.DAILY,
          interval: 1,
        },
      });

      expect(
        mockLessonExceptionRepository.deleteByLessonId
      ).not.toHaveBeenCalled();
    });

    it('should clear exceptions when pattern removed', async () => {
      const pattern = RecurringPattern.daily(
        1,
        undefined,
        undefined,
        baseStartDate
      );
      const lesson = createLesson({ recurringPattern: pattern });

      vi.mocked(mockLessonRepository.findById).mockResolvedValue(lesson);
      vi.mocked(mockLessonRepository.save).mockResolvedValue(undefined);
      vi.mocked(
        mockLessonExceptionRepository.deleteByLessonId
      ).mockResolvedValue(undefined);

      await editLessonUseCase.execute({
        id: 'lesson-1',
        title: 'Updated',
        teacherIds: ['teacher-1'],
        pupilIds: ['pupil-1'],
        startDate: baseStartDate,
        endDate: baseEndDate,
      });

      expect(
        mockLessonExceptionRepository.deleteByLessonId
      ).toHaveBeenCalledWith('lesson-1');
    });

    it('should not clear exceptions when both patterns undefined', async () => {
      const lesson = createLesson();

      vi.mocked(mockLessonRepository.findById).mockResolvedValue(lesson);
      vi.mocked(mockLessonRepository.save).mockResolvedValue(undefined);

      await editLessonUseCase.execute({
        id: 'lesson-1',
        title: 'Updated',
        teacherIds: ['teacher-1'],
        pupilIds: ['pupil-1'],
        startDate: baseStartDate,
        endDate: baseEndDate,
      });

      expect(
        mockLessonExceptionRepository.deleteByLessonId
      ).not.toHaveBeenCalled();
    });
  });

  describe('Orchestration Order', () => {
    it('should find → edit → clear exceptions → save → map', async () => {
      const oldPattern = RecurringPattern.daily(
        1,
        undefined,
        undefined,
        baseStartDate
      );
      const lesson = createLesson({ recurringPattern: oldPattern });
      const callOrder: string[] = [];

      vi.mocked(mockLessonRepository.findById).mockImplementation(async () => {
        callOrder.push('findById');
        return lesson;
      });

      vi.mocked(
        mockLessonExceptionRepository.deleteByLessonId
      ).mockImplementation(async () => {
        callOrder.push('deleteExceptions');
      });

      vi.mocked(mockLessonRepository.save).mockImplementation(async () => {
        callOrder.push('save');
      });

      vi.mocked(mockLessonMapper.toDTO).mockImplementation(() => {
        callOrder.push('toDTO');
        return {} as ReturnType<LessonMapperPort['toDTO']>;
      });

      await editLessonUseCase.execute({
        id: 'lesson-1',
        title: 'Updated',
        teacherIds: ['teacher-1'],
        pupilIds: ['pupil-1'],
        startDate: baseStartDate,
        endDate: baseEndDate,
        recurringPattern: {
          frequency: RecurringFrequency.WEEKLY,
          interval: 1,
          daysOfWeek: [DayOfWeek.MONDAY],
        },
      });

      expect(callOrder).toEqual([
        'findById',
        'deleteExceptions',
        'save',
        'toDTO',
      ]);
    });
  });
});
