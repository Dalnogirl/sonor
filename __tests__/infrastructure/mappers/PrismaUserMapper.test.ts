import { describe, it, expect } from 'vitest';
import {
  PrismaUserMapper,
  PrismaUserRecord,
} from '@/infrastructure/mappers/PrismaUserMapper';
import { User } from '@/domain/models/User';

/**
 * Tests for PrismaUserMapper
 *
 * These are unit tests for a pure transformation function.
 * No mocking or database needed - just input/output validation.
 */
describe('PrismaUserMapper', () => {
  describe('toDomain', () => {
    it('should map Prisma user record to User domain entity', () => {
      // Arrange
      const prismaUser: PrismaUserRecord = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed_password_123',
        isEmailVerified: true,
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-02T00:00:00Z'),
      };

      // Act
      const user = PrismaUserMapper.toDomain(prismaUser);

      // Assert
      expect(user).toBeInstanceOf(User);
      expect(user.id).toBe(prismaUser.id);
      expect(user.name).toBe(prismaUser.name);
      expect(user.email).toBe(prismaUser.email);
      expect(user.password).toBe(prismaUser.password);
      expect(user.isEmailVerified).toBe(prismaUser.isEmailVerified);
      expect(user.createdAt).toEqual(prismaUser.createdAt);
      expect(user.updatedAt).toEqual(prismaUser.updatedAt);
    });

    it('should map unverified user correctly', () => {
      // Arrange
      const prismaUser: PrismaUserRecord = {
        id: 'user-456',
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'hashed_password_456',
        isEmailVerified: false,
        createdAt: new Date('2025-02-01T00:00:00Z'),
        updatedAt: new Date('2025-02-01T00:00:00Z'),
      };

      // Act
      const user = PrismaUserMapper.toDomain(prismaUser);

      // Assert
      expect(user.isEmailVerified).toBe(false);
      expect(user).toBeInstanceOf(User);
    });

    it('should preserve exact Date objects', () => {
      // Arrange
      const now = new Date();
      const prismaUser: PrismaUserRecord = {
        id: 'user-789',
        name: 'Test User',
        email: 'test@example.com',
        password: 'password',
        isEmailVerified: true,
        createdAt: now,
        updatedAt: now,
      };

      // Act
      const user = PrismaUserMapper.toDomain(prismaUser);

      // Assert
      expect(user.createdAt).toBe(now);
      expect(user.updatedAt).toBe(now);
    });

    it('should handle special characters in name and email', () => {
      // Arrange
      const prismaUser: PrismaUserRecord = {
        id: 'user-special',
        name: "O'Brien-Smith",
        email: 'test+tag@example.co.uk',
        password: 'password',
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Act
      const user = PrismaUserMapper.toDomain(prismaUser);

      // Assert
      expect(user.name).toBe("O'Brien-Smith");
      expect(user.email).toBe('test+tag@example.co.uk');
    });
  });

  describe('toDomainArray', () => {
    it('should map array of Prisma users to User entities', () => {
      // Arrange
      const prismaUsers: PrismaUserRecord[] = [
        {
          id: 'user-1',
          name: 'User One',
          email: 'user1@example.com',
          password: 'password1',
          isEmailVerified: true,
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
        },
        {
          id: 'user-2',
          name: 'User Two',
          email: 'user2@example.com',
          password: 'password2',
          isEmailVerified: false,
          createdAt: new Date('2025-01-02'),
          updatedAt: new Date('2025-01-02'),
        },
        {
          id: 'user-3',
          name: 'User Three',
          email: 'user3@example.com',
          password: 'password3',
          isEmailVerified: true,
          createdAt: new Date('2025-01-03'),
          updatedAt: new Date('2025-01-03'),
        },
      ];

      // Act
      const users = PrismaUserMapper.toDomainArray(prismaUsers);

      // Assert
      expect(users).toHaveLength(3);
      expect(users[0]).toBeInstanceOf(User);
      expect(users[1]).toBeInstanceOf(User);
      expect(users[2]).toBeInstanceOf(User);

      expect(users[0].id).toBe('user-1');
      expect(users[1].id).toBe('user-2');
      expect(users[2].id).toBe('user-3');

      expect(users[0].email).toBe('user1@example.com');
      expect(users[1].email).toBe('user2@example.com');
      expect(users[2].email).toBe('user3@example.com');
    });

    it('should return empty array when given empty array', () => {
      // Arrange
      const prismaUsers: PrismaUserRecord[] = [];

      // Act
      const users = PrismaUserMapper.toDomainArray(prismaUsers);

      // Assert
      expect(users).toEqual([]);
      expect(users).toHaveLength(0);
    });

    it('should map single-item array correctly', () => {
      // Arrange
      const prismaUsers: PrismaUserRecord[] = [
        {
          id: 'user-single',
          name: 'Single User',
          email: 'single@example.com',
          password: 'password',
          isEmailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      // Act
      const users = PrismaUserMapper.toDomainArray(prismaUsers);

      // Assert
      expect(users).toHaveLength(1);
      expect(users[0]).toBeInstanceOf(User);
      expect(users[0].id).toBe('user-single');
    });

    it('should maintain order of users in array', () => {
      // Arrange
      const prismaUsers: PrismaUserRecord[] = [
        {
          id: 'user-z',
          name: 'Z User',
          email: 'z@example.com',
          password: 'password',
          isEmailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'user-a',
          name: 'A User',
          email: 'a@example.com',
          password: 'password',
          isEmailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'user-m',
          name: 'M User',
          email: 'm@example.com',
          password: 'password',
          isEmailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      // Act
      const users = PrismaUserMapper.toDomainArray(prismaUsers);

      // Assert
      expect(users[0].id).toBe('user-z');
      expect(users[1].id).toBe('user-a');
      expect(users[2].id).toBe('user-m');
    });
  });

  describe('edge cases', () => {
    it('should handle user with very long password hash', () => {
      // Arrange
      const longHash = 'a'.repeat(500); // Bcrypt hashes can be long
      const prismaUser: PrismaUserRecord = {
        id: 'user-long-hash',
        name: 'User',
        email: 'user@example.com',
        password: longHash,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Act
      const user = PrismaUserMapper.toDomain(prismaUser);

      // Assert
      expect(user.password).toBe(longHash);
      expect(user.password).toHaveLength(500);
    });

    it('should handle user with very long name', () => {
      // Arrange
      const longName = 'A'.repeat(255);
      const prismaUser: PrismaUserRecord = {
        id: 'user-long-name',
        name: longName,
        email: 'user@example.com',
        password: 'password',
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Act
      const user = PrismaUserMapper.toDomain(prismaUser);

      // Assert
      expect(user.name).toBe(longName);
      expect(user.name).toHaveLength(255);
    });

    it('should handle dates at epoch boundaries', () => {
      // Arrange
      const epochStart = new Date(0);
      const farFuture = new Date(8640000000000000); // Max JS date
      const prismaUser: PrismaUserRecord = {
        id: 'user-epoch',
        name: 'Epoch User',
        email: 'epoch@example.com',
        password: 'password',
        isEmailVerified: true,
        createdAt: epochStart,
        updatedAt: farFuture,
      };

      // Act
      const user = PrismaUserMapper.toDomain(prismaUser);

      // Assert
      expect(user.createdAt).toEqual(epochStart);
      expect(user.updatedAt).toEqual(farFuture);
    });
  });
});
