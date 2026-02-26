import { describe, it, expect } from 'vitest';
import { LessonException } from '@/domain/models/LessonException';

describe('LessonException', () => {
  const lessonId = 'lesson-123';
  const originalDate = new Date('2025-01-15');

  describe('skip factory', () => {
    it('should create SKIP exception', () => {
      const exception = LessonException.skip(lessonId, originalDate);

      expect(exception.lessonId).toBe(lessonId);
      expect(exception.originalDate).toEqual(originalDate);
    });

    it('should generate unique IDs', () => {
      const exception1 = LessonException.skip(lessonId, originalDate);
      const exception2 = LessonException.skip(lessonId, originalDate);

      expect(exception1.id).not.toBe(exception2.id);
    });
  });

  describe('appliesTo', () => {
    it('should return true for matching date', () => {
      const exception = LessonException.skip(lessonId, originalDate);
      const sameDate = new Date('2025-01-15');

      expect(exception.appliesTo(sameDate)).toBe(true);
    });

    it('should return false for different date', () => {
      const exception = LessonException.skip(lessonId, originalDate);
      const differentDate = new Date('2025-01-16');

      expect(exception.appliesTo(differentDate)).toBe(false);
    });

    it('should use exact timestamp comparison', () => {
      const dateWithTime = new Date('2025-01-15T10:30:00');
      const exception = LessonException.skip(lessonId, dateWithTime);

      expect(exception.appliesTo(new Date('2025-01-15T10:30:00'))).toBe(true);
      expect(exception.appliesTo(new Date('2025-01-15T10:31:00'))).toBe(false);
    });
  });
});
