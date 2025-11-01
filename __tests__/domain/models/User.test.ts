import { describe, it, expect, beforeEach } from 'vitest';
import { User } from '@/domain/models/User';
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
    // Arrange - Setup test data before each test
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
      // Act
      const user = new User(
        validUserData.id,
        validUserData.name,
        validUserData.email,
        validUserData.createdAt,
        validUserData.updatedAt,
        validUserData.password,
        validUserData.isEmailVerified
      );

      // Assert
      expect(user.id).toBe(validUserData.id);
      expect(user.name).toBe(validUserData.name);
      expect(user.email).toBe(validUserData.email);
      expect(user.password).toBe(validUserData.password);
      expect(user.isEmailVerified).toBe(false);
    });
  });

  describe('Factory Method - createWithDefaults', () => {
    it('should create user with default values', () => {
      // Arrange
      const id = 'user-456';
      const name = 'Jane Doe';
      const email = 'jane@example.com';
      const password = 'hashedPass123!';

      // Act
      const user = User.createWithDefaults(id, name, email, password);

      // Assert
      expect(user.id).toBe(id);
      expect(user.name).toBe(name);
      expect(user.email).toBe(email);
      expect(user.password).toBe(password);
      expect(user.isEmailVerified).toBe(false);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should set createdAt and updatedAt to the same value', () => {
      // Act
      const user = User.createWithDefaults(
        'id',
        'name',
        'test@example.com',
        'pass123!A'
      );

      // Assert
      expect(user.createdAt.getTime()).toBe(user.updatedAt.getTime());
    });
  });

  describe('Email Validation', () => {
    it('should validate correct email format', () => {
      // Arrange
      const user = new User(
        'id',
        'name',
        'valid@example.com',
        new Date(),
        new Date(),
        'pass',
        false
      );

      // Act & Assert
      expect(user.isEmailValid()).toBe(true);
    });

    it('should reject email without @', () => {
      // Arrange
      const user = new User(
        'id',
        'name',
        'invalidemail.com',
        new Date(),
        new Date(),
        'pass',
        false
      );

      // Act & Assert
      expect(user.isEmailValid()).toBe(false);
    });

    it('should reject email without domain', () => {
      // Arrange
      const user = new User(
        'id',
        'name',
        'invalid@',
        new Date(),
        new Date(),
        'pass',
        false
      );

      // Act & Assert
      expect(user.isEmailValid()).toBe(false);
    });

    it('should reject empty email', () => {
      // Arrange
      const user = new User(
        'id',
        'name',
        '',
        new Date(),
        new Date(),
        'pass',
        false
      );

      // Act & Assert
      expect(user.isEmailValid()).toBe(false);
    });
  });

  describe('Password Validation', () => {
    it('should accept valid password (8+ chars, number, special char)', () => {
      // Act & Assert
      expect(User.validatePassword('Password1!')).toBe(true);
      expect(User.validatePassword('MyP@ssw0rd')).toBe(true);
      expect(User.validatePassword('Test123#')).toBe(true);
    });

    it('should reject password shorter than 8 characters', () => {
      // Act & Assert
      expect(User.validatePassword('Pass1!')).toBe(false);
    });

    it('should reject password without numbers', () => {
      // Act & Assert
      expect(User.validatePassword('Password!')).toBe(false);
    });

    it('should reject password without special characters', () => {
      // Act & Assert
      expect(User.validatePassword('Password123')).toBe(false);
    });

    it('should reject password without letters', () => {
      // Act & Assert
      expect(User.validatePassword('12345678!')).toBe(false);
    });
  });

  describe('Email Verification', () => {
    it('should verify email successfully', () => {
      // Arrange
      const user = User.createWithDefaults(
        'id',
        'name',
        'test@example.com',
        'pass'
      );
      expect(user.isEmailVerified).toBe(false);

      // Act - Command that modifies state, returns void
      user.verifyEmail();

      // Assert
      expect(user.isEmailVerified).toBe(true);
    });

    it('should update updatedAt timestamp when verifying email', () => {
      // Arrange
      const user = User.createWithDefaults(
        'id',
        'name',
        'test@example.com',
        'pass'
      );
      const originalUpdatedAt = user.updatedAt;

      // Wait a bit to ensure different timestamp
      const delay = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));

      // Act
      return delay(10).then(() => {
        user.verifyEmail();

        // Assert
        expect(user.updatedAt.getTime()).toBeGreaterThan(
          originalUpdatedAt.getTime()
        );
      });
    });

    it('should throw EmailIsAlreadyVerified when email is already verified', () => {
      // Arrange
      const user = User.createWithDefaults(
        'id',
        'name',
        'test@example.com',
        'pass'
      );
      user.verifyEmail(); // First verification

      // Act & Assert
      expect(() => user.verifyEmail()).toThrow(EmailIsAlreadyVerified);
      expect(() => user.verifyEmail()).toThrow(
        'Email test@example.com is already verified'
      );
    });
  });
});
