import { describe, it, expect } from 'vitest';
import { LessonAuthorizationService } from '@/domain/services/LessonAuthorizationService';
import { User } from '@/domain/models/User';
import { UserRole } from '@/domain/models/UserRole';
import { Lesson } from '@/domain/models/Lesson';
import { UnauthorizedError } from '@/domain/errors/AuthorizationErrors';

describe('LessonAuthorizationService', () => {
  const authService = new LessonAuthorizationService();

  const createUser = (role: UserRole, id = 'user-1') =>
    User.createWithDefaults(id, 'Test', 'test@test.com', 'Pass123!', role);

  const createLesson = (teacherIds: string[] = ['teacher-1']) =>
    new Lesson({
      id: 'lesson-1',
      title: 'Math',
      teacherIds,
      pupilIds: ['pupil-1'],
      startDate: new Date('2025-11-10T10:00:00Z'),
      endDate: new Date('2025-11-10T11:00:00Z'),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

  describe('canCreate', () => {
    it('should return true for ADMIN', () => {
      expect(authService.canCreate(createUser(UserRole.ADMIN))).toBe(true);
    });

    it('should return true for TEACHER', () => {
      expect(authService.canCreate(createUser(UserRole.TEACHER))).toBe(true);
    });

    it('should return false for PUPIL', () => {
      expect(authService.canCreate(createUser(UserRole.PUPIL))).toBe(false);
    });
  });

  describe('canEdit', () => {
    it('should return true for ADMIN regardless of ownership', () => {
      expect(authService.canEdit(createUser(UserRole.ADMIN, 'admin-1'), createLesson())).toBe(true);
    });

    it('should return true for owning teacher', () => {
      expect(authService.canEdit(createUser(UserRole.TEACHER, 'teacher-1'), createLesson())).toBe(true);
    });

    it('should return false for non-owning teacher', () => {
      expect(authService.canEdit(createUser(UserRole.TEACHER, 'teacher-2'), createLesson())).toBe(false);
    });

    it('should return false for PUPIL', () => {
      expect(authService.canEdit(createUser(UserRole.PUPIL), createLesson())).toBe(false);
    });
  });

  describe('canDelete', () => {
    it('should return true for ADMIN', () => {
      expect(authService.canDelete(createUser(UserRole.ADMIN, 'admin-1'), createLesson())).toBe(true);
    });

    it('should return true for owning teacher', () => {
      expect(authService.canDelete(createUser(UserRole.TEACHER, 'teacher-1'), createLesson())).toBe(true);
    });

    it('should return false for non-owning teacher', () => {
      expect(authService.canDelete(createUser(UserRole.TEACHER, 'teacher-2'), createLesson())).toBe(false);
    });

    it('should return false for PUPIL', () => {
      expect(authService.canDelete(createUser(UserRole.PUPIL), createLesson())).toBe(false);
    });
  });

  describe('canSkip', () => {
    it('should return true for ADMIN', () => {
      expect(authService.canSkip(createUser(UserRole.ADMIN, 'admin-1'), createLesson())).toBe(true);
    });

    it('should return true for owning teacher', () => {
      expect(authService.canSkip(createUser(UserRole.TEACHER, 'teacher-1'), createLesson())).toBe(true);
    });

    it('should return false for non-owning teacher', () => {
      expect(authService.canSkip(createUser(UserRole.TEACHER, 'teacher-2'), createLesson())).toBe(false);
    });

    it('should return false for PUPIL', () => {
      expect(authService.canSkip(createUser(UserRole.PUPIL), createLesson())).toBe(false);
    });
  });

  describe('assertCanCreate', () => {
    it('should allow ADMIN', () => {
      expect(() => authService.assertCanCreate(createUser(UserRole.ADMIN))).not.toThrow();
    });

    it('should allow TEACHER', () => {
      expect(() => authService.assertCanCreate(createUser(UserRole.TEACHER))).not.toThrow();
    });

    it('should reject PUPIL', () => {
      expect(() => authService.assertCanCreate(createUser(UserRole.PUPIL))).toThrow(UnauthorizedError);
    });
  });

  describe('assertCanEdit', () => {
    it('should allow ADMIN regardless of ownership', () => {
      const admin = createUser(UserRole.ADMIN, 'admin-1');
      const lesson = createLesson(['teacher-1']);
      expect(() => authService.assertCanEdit(admin, lesson)).not.toThrow();
    });

    it('should allow teacher who owns the lesson', () => {
      const teacher = createUser(UserRole.TEACHER, 'teacher-1');
      const lesson = createLesson(['teacher-1']);
      expect(() => authService.assertCanEdit(teacher, lesson)).not.toThrow();
    });

    it('should reject teacher who does not own the lesson', () => {
      const teacher = createUser(UserRole.TEACHER, 'teacher-2');
      const lesson = createLesson(['teacher-1']);
      expect(() => authService.assertCanEdit(teacher, lesson)).toThrow(UnauthorizedError);
    });

    it('should reject PUPIL', () => {
      const pupil = createUser(UserRole.PUPIL, 'pupil-1');
      const lesson = createLesson(['teacher-1']);
      expect(() => authService.assertCanEdit(pupil, lesson)).toThrow(UnauthorizedError);
    });
  });

  describe('assertCanDelete', () => {
    it('should allow ADMIN regardless of ownership', () => {
      const admin = createUser(UserRole.ADMIN, 'admin-1');
      const lesson = createLesson(['teacher-1']);
      expect(() => authService.assertCanDelete(admin, lesson)).not.toThrow();
    });

    it('should allow owning teacher', () => {
      const teacher = createUser(UserRole.TEACHER, 'teacher-1');
      const lesson = createLesson(['teacher-1']);
      expect(() => authService.assertCanDelete(teacher, lesson)).not.toThrow();
    });

    it('should reject non-owning teacher', () => {
      const teacher = createUser(UserRole.TEACHER, 'teacher-2');
      const lesson = createLesson(['teacher-1']);
      expect(() => authService.assertCanDelete(teacher, lesson)).toThrow(UnauthorizedError);
    });

    it('should reject PUPIL', () => {
      const pupil = createUser(UserRole.PUPIL);
      const lesson = createLesson(['teacher-1']);
      expect(() => authService.assertCanDelete(pupil, lesson)).toThrow(UnauthorizedError);
    });
  });

  describe('assertCanSkip', () => {
    it('should allow ADMIN regardless of ownership', () => {
      const admin = createUser(UserRole.ADMIN, 'admin-1');
      const lesson = createLesson(['teacher-1']);
      expect(() => authService.assertCanSkip(admin, lesson)).not.toThrow();
    });

    it('should allow owning teacher', () => {
      const teacher = createUser(UserRole.TEACHER, 'teacher-1');
      const lesson = createLesson(['teacher-1']);
      expect(() => authService.assertCanSkip(teacher, lesson)).not.toThrow();
    });

    it('should reject non-owning teacher', () => {
      const teacher = createUser(UserRole.TEACHER, 'teacher-2');
      const lesson = createLesson(['teacher-1']);
      expect(() => authService.assertCanSkip(teacher, lesson)).toThrow(UnauthorizedError);
    });

    it('should reject PUPIL', () => {
      const pupil = createUser(UserRole.PUPIL);
      const lesson = createLesson(['teacher-1']);
      expect(() => authService.assertCanSkip(pupil, lesson)).toThrow(UnauthorizedError);
    });
  });
});
