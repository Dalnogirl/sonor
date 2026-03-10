import { describe, it, expect } from 'vitest';
import {
  PrismaUserMapper,
  PrismaUserRecord,
} from '@/infrastructure/mappers/PrismaUserMapper';
import { User } from '@/domain/models/User';
import { UserRole } from '@/domain/models/UserRole';

const makePrismaUser = (overrides?: Partial<PrismaUserRecord>): PrismaUserRecord => ({
  id: 'user-123',
  name: 'John Doe',
  email: 'john@example.com',
  password: 'hashed_password_123',
  isEmailVerified: true,
  role: 'PUPIL',
  createdAt: new Date('2025-01-01T00:00:00Z'),
  updatedAt: new Date('2025-01-02T00:00:00Z'),
  ...overrides,
});

describe('PrismaUserMapper', () => {
  describe('toDomain', () => {
    it('should map Prisma user record to User domain entity', () => {
      const prismaUser = makePrismaUser();

      const user = PrismaUserMapper.toDomain(prismaUser);

      expect(user).toBeInstanceOf(User);
      expect(user.id).toBe(prismaUser.id);
      expect(user.name).toBe(prismaUser.name);
      expect(user.email).toBe(prismaUser.email);
      expect(user.password).toBe(prismaUser.password);
      expect(user.isEmailVerified).toBe(prismaUser.isEmailVerified);
      expect(user.role).toBe(UserRole.PUPIL);
      expect(user.createdAt).toEqual(prismaUser.createdAt);
      expect(user.updatedAt).toEqual(prismaUser.updatedAt);
    });

    it('should map role correctly', () => {
      const prismaUser = makePrismaUser({ role: 'ADMIN' });

      const user = PrismaUserMapper.toDomain(prismaUser);

      expect(user.role).toBe(UserRole.ADMIN);
    });

    it('should map unverified user correctly', () => {
      const prismaUser = makePrismaUser({ id: 'user-456', isEmailVerified: false });

      const user = PrismaUserMapper.toDomain(prismaUser);

      expect(user.isEmailVerified).toBe(false);
      expect(user).toBeInstanceOf(User);
    });

    it('should preserve exact Date objects', () => {
      const now = new Date();
      const prismaUser = makePrismaUser({ id: 'user-789', createdAt: now, updatedAt: now });

      const user = PrismaUserMapper.toDomain(prismaUser);

      expect(user.createdAt).toBe(now);
      expect(user.updatedAt).toBe(now);
    });

    it('should handle special characters in name and email', () => {
      const prismaUser = makePrismaUser({
        id: 'user-special',
        name: "O'Brien-Smith",
        email: 'test+tag@example.co.uk',
      });

      const user = PrismaUserMapper.toDomain(prismaUser);

      expect(user.name).toBe("O'Brien-Smith");
      expect(user.email).toBe('test+tag@example.co.uk');
    });
  });

  describe('toDomainArray', () => {
    it('should map array of Prisma users to User entities', () => {
      const prismaUsers: PrismaUserRecord[] = [
        makePrismaUser({ id: 'user-1', email: 'user1@example.com' }),
        makePrismaUser({ id: 'user-2', email: 'user2@example.com', isEmailVerified: false }),
        makePrismaUser({ id: 'user-3', email: 'user3@example.com' }),
      ];

      const users = PrismaUserMapper.toDomainArray(prismaUsers);

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
      const users = PrismaUserMapper.toDomainArray([]);

      expect(users).toEqual([]);
      expect(users).toHaveLength(0);
    });

    it('should map single-item array correctly', () => {
      const prismaUsers = [makePrismaUser({ id: 'user-single' })];

      const users = PrismaUserMapper.toDomainArray(prismaUsers);

      expect(users).toHaveLength(1);
      expect(users[0]).toBeInstanceOf(User);
      expect(users[0].id).toBe('user-single');
    });

    it('should maintain order of users in array', () => {
      const prismaUsers = [
        makePrismaUser({ id: 'user-z' }),
        makePrismaUser({ id: 'user-a' }),
        makePrismaUser({ id: 'user-m' }),
      ];

      const users = PrismaUserMapper.toDomainArray(prismaUsers);

      expect(users[0].id).toBe('user-z');
      expect(users[1].id).toBe('user-a');
      expect(users[2].id).toBe('user-m');
    });
  });

  describe('edge cases', () => {
    it('should handle user with very long password hash', () => {
      const longHash = 'a'.repeat(500);
      const prismaUser = makePrismaUser({ id: 'user-long-hash', password: longHash });

      const user = PrismaUserMapper.toDomain(prismaUser);

      expect(user.password).toBe(longHash);
      expect(user.password).toHaveLength(500);
    });

    it('should handle user with very long name', () => {
      const longName = 'A'.repeat(255);
      const prismaUser = makePrismaUser({ id: 'user-long-name', name: longName });

      const user = PrismaUserMapper.toDomain(prismaUser);

      expect(user.name).toBe(longName);
      expect(user.name).toHaveLength(255);
    });

    it('should handle dates at epoch boundaries', () => {
      const epochStart = new Date(0);
      const farFuture = new Date(8640000000000000);
      const prismaUser = makePrismaUser({
        id: 'user-epoch',
        createdAt: epochStart,
        updatedAt: farFuture,
      });

      const user = PrismaUserMapper.toDomain(prismaUser);

      expect(user.createdAt).toEqual(epochStart);
      expect(user.updatedAt).toEqual(farFuture);
    });
  });
});
