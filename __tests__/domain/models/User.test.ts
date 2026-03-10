import { describe, it, expect, beforeEach } from 'vitest';
import { User } from '@/domain/models/User';
import { UserRole } from '@/domain/models/UserRole';
import { EmailIsAlreadyVerified } from '@/domain/errors';

describe('User Domain Model', () => {
  let validUserData: {
    id: string;
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    isEmailVerified: boolean;
  };

  beforeEach(() => {
    validUserData = {
      id: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashedPassword123!',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      isEmailVerified: false,
    };
  });

  describe('Constructor', () => {
    it('should create a user with valid data', () => {
      const user = new User(
        validUserData.id,
        validUserData.name,
        validUserData.email,
        validUserData.createdAt,
        validUserData.updatedAt,
        validUserData.password,
        validUserData.isEmailVerified
      );

      expect(user.id).toBe(validUserData.id);
      expect(user.name).toBe(validUserData.name);
      expect(user.email).toBe(validUserData.email);
      expect(user.password).toBe(validUserData.password);
      expect(user.isEmailVerified).toBe(false);
      expect(user.role).toBe(UserRole.PUPIL);
    });

    it('should accept explicit role', () => {
      const user = new User(
        validUserData.id,
        validUserData.name,
        validUserData.email,
        validUserData.createdAt,
        validUserData.updatedAt,
        validUserData.password,
        validUserData.isEmailVerified,
        UserRole.ADMIN
      );

      expect(user.role).toBe(UserRole.ADMIN);
    });
  });

  describe('Role Methods', () => {
    it('isAdmin() returns true only for ADMIN', () => {
      const admin = User.createWithDefaults('id', 'n', 'e@e.com', 'p', UserRole.ADMIN);
      const teacher = User.createWithDefaults('id', 'n', 'e@e.com', 'p', UserRole.TEACHER);

      expect(admin.isAdmin()).toBe(true);
      expect(teacher.isAdmin()).toBe(false);
    });

    it('isTeacher() returns true only for TEACHER', () => {
      const teacher = User.createWithDefaults('id', 'n', 'e@e.com', 'p', UserRole.TEACHER);
      const pupil = User.createWithDefaults('id', 'n', 'e@e.com', 'p', UserRole.PUPIL);

      expect(teacher.isTeacher()).toBe(true);
      expect(pupil.isTeacher()).toBe(false);
    });

    it('isPupil() returns true only for PUPIL', () => {
      const pupil = User.createWithDefaults('id', 'n', 'e@e.com', 'p', UserRole.PUPIL);
      const admin = User.createWithDefaults('id', 'n', 'e@e.com', 'p', UserRole.ADMIN);

      expect(pupil.isPupil()).toBe(true);
      expect(admin.isPupil()).toBe(false);
    });
  });

  describe('Factory Method - createWithDefaults', () => {
    it('should create user with default values', () => {
      const id = 'user-456';
      const name = 'Jane Doe';
      const email = 'jane@example.com';
      const password = 'hashedPass123!';

      const user = User.createWithDefaults(id, name, email, password);

      expect(user.id).toBe(id);
      expect(user.name).toBe(name);
      expect(user.email).toBe(email);
      expect(user.password).toBe(password);
      expect(user.isEmailVerified).toBe(false);
      expect(user.role).toBe(UserRole.PUPIL);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should accept explicit role', () => {
      const user = User.createWithDefaults('id', 'n', 'e@e.com', 'p', UserRole.TEACHER);
      expect(user.role).toBe(UserRole.TEACHER);
    });

    it('should set createdAt and updatedAt to the same value', () => {
      const user = User.createWithDefaults(
        'id',
        'name',
        'test@example.com',
        'pass123!A'
      );

      expect(user.createdAt.getTime()).toBe(user.updatedAt.getTime());
    });
  });

  describe('Email Validation', () => {
    it('should validate correct email format', () => {
      const user = new User(
        'id',
        'name',
        'valid@example.com',
        new Date(),
        new Date(),
        'pass',
        false
      );

      expect(user.isEmailValid()).toBe(true);
    });

    it('should reject email without @', () => {
      const user = new User(
        'id',
        'name',
        'invalidemail.com',
        new Date(),
        new Date(),
        'pass',
        false
      );

      expect(user.isEmailValid()).toBe(false);
    });

    it('should reject email without domain', () => {
      const user = new User(
        'id',
        'name',
        'invalid@',
        new Date(),
        new Date(),
        'pass',
        false
      );

      expect(user.isEmailValid()).toBe(false);
    });

    it('should reject empty email', () => {
      const user = new User(
        'id',
        'name',
        '',
        new Date(),
        new Date(),
        'pass',
        false
      );

      expect(user.isEmailValid()).toBe(false);
    });
  });

  describe('Password Validation', () => {
    it('should accept valid password (8+ chars, number, special char)', () => {
      expect(User.validatePassword('Password1!')).toBe(true);
      expect(User.validatePassword('MyP@ssw0rd')).toBe(true);
      expect(User.validatePassword('Test123#')).toBe(true);
    });

    it('should reject password shorter than 8 characters', () => {
      expect(User.validatePassword('Pass1!')).toBe(false);
    });

    it('should reject password without numbers', () => {
      expect(User.validatePassword('Password!')).toBe(false);
    });

    it('should reject password without special characters', () => {
      expect(User.validatePassword('Password123')).toBe(false);
    });

    it('should reject password without letters', () => {
      expect(User.validatePassword('12345678!')).toBe(false);
    });
  });

  describe('Email Verification', () => {
    it('should verify email successfully', () => {
      const user = User.createWithDefaults(
        'id',
        'name',
        'test@example.com',
        'pass'
      );
      expect(user.isEmailVerified).toBe(false);

      user.verifyEmail();

      expect(user.isEmailVerified).toBe(true);
    });

    it('should update updatedAt timestamp when verifying email', () => {
      const user = User.createWithDefaults(
        'id',
        'name',
        'test@example.com',
        'pass'
      );
      const originalUpdatedAt = user.updatedAt;

      const delay = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));

      return delay(10).then(() => {
        user.verifyEmail();

        expect(user.updatedAt.getTime()).toBeGreaterThan(
          originalUpdatedAt.getTime()
        );
      });
    });

    it('should throw EmailIsAlreadyVerified when email is already verified', () => {
      const user = User.createWithDefaults(
        'id',
        'name',
        'test@example.com',
        'pass'
      );
      user.verifyEmail();

      expect(() => user.verifyEmail()).toThrow(EmailIsAlreadyVerified);
      expect(() => user.verifyEmail()).toThrow(
        'Email test@example.com is already verified'
      );
    });
  });
});
