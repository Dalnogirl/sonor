import { describe, it, expect } from 'vitest';
import { getLessonRequestSchema } from '@/application/dto/lesson/GetLessonRequestDTO.schema';
import { getMyTeachingLessonsForPeriodRequestSchema } from '@/application/dto/lesson/GetMyTeachingLessonsForPeriodRequestDTO.schema';
import { createLessonRequestSchema } from '@/application/dto/lesson/CreateLessonRequestDTO.schema';

describe('Lesson Validation Schemas', () => {
  describe('getLessonRequestSchema', () => {
    it('should validate valid UUID lesson ID', () => {
      // Arrange
      const validInput = {
        lessonId: '550e8400-e29b-41d4-a716-446655440000',
      };

      // Act
      const result = getLessonRequestSchema.safeParse(validInput);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should reject invalid UUID format', () => {
      // Arrange
      const invalidInput = {
        lessonId: 'not-a-valid-uuid',
      };

      // Act
      const result = getLessonRequestSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid');
      }
    });

    it('should reject empty string', () => {
      // Arrange
      const invalidInput = {
        lessonId: '',
      };

      // Act
      const result = getLessonRequestSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
    });

    it('should reject missing lessonId field', () => {
      // Arrange
      const invalidInput = {};

      // Act
      const result = getLessonRequestSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe('getMyTeachingLessonsForPeriodRequestSchema', () => {
    it('should validate valid date range', () => {
      // Arrange
      const validInput = {
        startDate: new Date('2025-11-01'),
        endDate: new Date('2025-11-30'),
      };

      // Act
      const result = getMyTeachingLessonsForPeriodRequestSchema.safeParse(validInput);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.startDate).toBeInstanceOf(Date);
        expect(result.data.endDate).toBeInstanceOf(Date);
      }
    });

    it('should coerce ISO string to Date object', () => {
      // Arrange - ISO strings from frontend
      const validInput = {
        startDate: '2025-11-01T00:00:00.000Z',
        endDate: '2025-11-30T23:59:59.999Z',
      };

      // Act
      const result = getMyTeachingLessonsForPeriodRequestSchema.safeParse(validInput);

      // Assert - Should coerce to Date objects (z.coerce.date())
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.startDate).toBeInstanceOf(Date);
        expect(result.data.endDate).toBeInstanceOf(Date);
        expect(result.data.startDate.toISOString()).toBe('2025-11-01T00:00:00.000Z');
      }
    });

    it('should coerce timestamp number to Date', () => {
      // Arrange
      const validInput = {
        startDate: 1704067200000, // 2024-01-01 in milliseconds
        endDate: 1735689599999,   // 2024-12-31 in milliseconds
      };

      // Act
      const result = getMyTeachingLessonsForPeriodRequestSchema.safeParse(validInput);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.startDate).toBeInstanceOf(Date);
        expect(result.data.endDate).toBeInstanceOf(Date);
      }
    });

    it('should reject invalid date format', () => {
      // Arrange
      const invalidInput = {
        startDate: 'not-a-date',
        endDate: '2025-11-30',
      };

      // Act
      const result = getMyTeachingLessonsForPeriodRequestSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
    });

    it('should reject missing required fields', () => {
      // Arrange
      const invalidInput = {
        startDate: new Date('2025-11-01'),
        // Missing endDate
      };

      // Act
      const result = getMyTeachingLessonsForPeriodRequestSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe('createLessonRequestSchema', () => {
    it('should validate complete valid lesson data', () => {
      // Arrange
      const validInput = {
        title: 'Introduction to TypeScript',
        description: 'Learn TypeScript basics',
        teacherIds: ['550e8400-e29b-41d4-a716-446655440000'],
        pupilIds: ['660e8400-e29b-41d4-a716-446655440001'],
        startDate: new Date('2025-11-10T10:00:00Z'),
        endDate: new Date('2025-11-10T12:00:00Z'),
      };

      // Act
      const result = createLessonRequestSchema.safeParse(validInput);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe(validInput.title);
        expect(result.data.teacherIds).toHaveLength(1);
      }
    });

    it('should validate lesson with multiple teachers and pupils', () => {
      // Arrange
      const validInput = {
        title: 'Advanced TypeScript',
        teacherIds: ['teacher-1', 'teacher-2', 'teacher-3'],
        pupilIds: ['pupil-1', 'pupil-2'],
        startDate: new Date('2025-11-15T10:00:00Z'),
        endDate: new Date('2025-11-15T12:00:00Z'),
      };

      // Act
      const result = createLessonRequestSchema.safeParse(validInput);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.teacherIds).toHaveLength(3);
        expect(result.data.pupilIds).toHaveLength(2);
      }
    });

    it('should accept optional description', () => {
      // Arrange
      const validInput = {
        title: 'Quick Lesson',
        teacherIds: ['teacher-1'],
        pupilIds: ['pupil-1'],
        startDate: new Date('2025-11-20T10:00:00Z'),
        endDate: new Date('2025-11-20T11:00:00Z'),
        // No description
      };

      // Act
      const result = createLessonRequestSchema.safeParse(validInput);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBeUndefined();
      }
    });

    it('should reject empty title', () => {
      // Arrange
      const invalidInput = {
        title: '',
        teacherIds: ['teacher-1'],
        pupilIds: ['pupil-1'],
        startDate: new Date('2025-11-10T10:00:00Z'),
        endDate: new Date('2025-11-10T12:00:00Z'),
      };

      // Act
      const result = createLessonRequestSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('required');
      }
    });

    it('should reject empty teacherIds array', () => {
      // Arrange - Business rule: at least one teacher required
      const invalidInput = {
        title: 'No Teachers Lesson',
        teacherIds: [], // Empty array
        pupilIds: ['pupil-1'],
        startDate: new Date('2025-11-10T10:00:00Z'),
        endDate: new Date('2025-11-10T12:00:00Z'),
      };

      // Act
      const result = createLessonRequestSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('At least one teacher');
      }
    });

    it('should reject empty pupilIds array', () => {
      // Arrange - Business rule: at least one pupil required
      const invalidInput = {
        title: 'No Pupils Lesson',
        teacherIds: ['teacher-1'],
        pupilIds: [], // Empty array
        startDate: new Date('2025-11-10T10:00:00Z'),
        endDate: new Date('2025-11-10T12:00:00Z'),
      };

      // Act
      const result = createLessonRequestSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('At least one pupil');
      }
    });

    it('should coerce date strings to Date objects', () => {
      // Arrange - Frontend sends ISO strings
      const validInput = {
        title: 'Test Lesson',
        teacherIds: ['teacher-1'],
        pupilIds: ['pupil-1'],
        startDate: '2025-11-10T10:00:00.000Z',
        endDate: '2025-11-10T12:00:00.000Z',
      };

      // Act
      const result = createLessonRequestSchema.safeParse(validInput);

      // Assert - z.coerce.date() converts strings to Date
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.startDate).toBeInstanceOf(Date);
        expect(result.data.endDate).toBeInstanceOf(Date);
      }
    });

    it('should reject missing required fields', () => {
      // Arrange
      const invalidInput = {
        title: 'Incomplete Lesson',
        // Missing teacherIds, pupilIds, dates
      };

      // Act
      const result = createLessonRequestSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it('should accept valid recurringPattern', () => {
      const validInput = {
        title: 'Recurring Lesson',
        teacherIds: ['teacher-1'],
        pupilIds: ['pupil-1'],
        startDate: new Date('2025-11-10T10:00:00Z'),
        endDate: new Date('2025-11-10T12:00:00Z'),
        recurringPattern: {
          frequency: 'WEEKLY',
          interval: 1,
          endDate: new Date('2025-12-31'),
          daysOfWeek: [1, 3, 5],
        },
      };

      const result = createLessonRequestSchema.safeParse(validInput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.recurringPattern).toBeDefined();
        expect(result.data.recurringPattern!.frequency).toBe('WEEKLY');
        expect(result.data.recurringPattern!.interval).toBe(1);
      }
    });

    it('should reject recurringPattern with invalid frequency', () => {
      const invalidInput = {
        title: 'Bad Frequency',
        teacherIds: ['teacher-1'],
        pupilIds: ['pupil-1'],
        startDate: new Date('2025-11-10T10:00:00Z'),
        endDate: new Date('2025-11-10T12:00:00Z'),
        recurringPattern: {
          frequency: 'BIWEEKLY',
          interval: 1,
        },
      };

      const result = createLessonRequestSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject recurringPattern with interval < 1', () => {
      const invalidInput = {
        title: 'Bad Interval',
        teacherIds: ['teacher-1'],
        pupilIds: ['pupil-1'],
        startDate: new Date('2025-11-10T10:00:00Z'),
        endDate: new Date('2025-11-10T12:00:00Z'),
        recurringPattern: {
          frequency: 'DAILY',
          interval: 0,
        },
      };

      const result = createLessonRequestSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject recurringPattern with invalid daysOfWeek values', () => {
      const invalidInput = {
        title: 'Bad Days',
        teacherIds: ['teacher-1'],
        pupilIds: ['pupil-1'],
        startDate: new Date('2025-11-10T10:00:00Z'),
        endDate: new Date('2025-11-10T12:00:00Z'),
        recurringPattern: {
          frequency: 'WEEKLY',
          interval: 1,
          daysOfWeek: [7],
        },
      };

      const result = createLessonRequestSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe('Schema Type Safety', () => {
    it('should enforce type safety via satisfies (compile-time test)', () => {
      // This test verifies TypeScript compilation, not runtime behavior
      // If schemas don't match DTOs, TypeScript will error at build time

      const validGetLessonInput = {
        lessonId: '550e8400-e29b-41d4-a716-446655440000',
      };

      const validPeriodInput = {
        startDate: new Date('2025-11-01'),
        endDate: new Date('2025-11-30'),
      };

      const validCreateInput = {
        title: 'Test',
        teacherIds: ['t1'],
        pupilIds: ['p1'],
        startDate: new Date(),
        endDate: new Date(),
      };

      // Act & Assert - If types don't match, this won't compile
      expect(getLessonRequestSchema.parse(validGetLessonInput)).toBeDefined();
      expect(getMyTeachingLessonsForPeriodRequestSchema.parse(validPeriodInput)).toBeDefined();
      expect(createLessonRequestSchema.parse(validCreateInput)).toBeDefined();
    });
  });

  describe('Schema Error Messages', () => {
    it('should provide clear error messages for validation failures', () => {
      // Arrange
      const invalidInput = {
        lessonId: 'invalid-uuid',
      };

      // Act
      const result = getLessonRequestSchema.safeParse(invalidInput);

      // Assert - User-friendly error messages
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessage = result.error.issues[0].message;
        expect(errorMessage).toBeTruthy();
        expect(errorMessage.length).toBeGreaterThan(0);
      }
    });
  });
});
