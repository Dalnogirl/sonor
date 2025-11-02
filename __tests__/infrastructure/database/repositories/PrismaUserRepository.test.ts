import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { PrismaUserRepository } from '@/infrastructure/database/repositories/PrismaUserRepository';
import { User } from '@/domain/models/User';

/**
 * Integration tests for PrismaUserRepository
 * These tests run against a real database
 *
 * Setup required:
 * - Test database running (Docker)
 * - DATABASE_URL pointing to test DB
 */
describe('PrismaUserRepository Integration Tests', () => {
  let prisma: PrismaClient;
  let repository: PrismaUserRepository;

  beforeAll(async () => {
    // Setup: Connect to test database
    prisma = new PrismaClient();
    repository = new PrismaUserRepository(prisma);

    // Ensure database is clean
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    // Cleanup: Disconnect
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean database before each test for isolation
    await prisma.user.deleteMany();
  });

  describe('create', () => {
    it('should create a user in the database', async () => {
      // Arrange
      const user = User.createWithDefaults(
        crypto.randomUUID(),
        'John Doe',
        'john@example.com',
        'hashed_password_123'
      );

      // Act
      const created = await repository.create(user);

      // Assert
      expect(created.id).toBe(user.id);
      expect(created.name).toBe('John Doe');
      expect(created.email).toBe('john@example.com');
      expect(created.password).toBe('hashed_password_123');
      expect(created.isEmailVerified).toBe(false);

      // Verify it's actually in the database
      const found = await prisma.user.findUnique({
        where: { id: user.id },
      });
      expect(found).not.toBeNull();
      expect(found?.email).toBe('john@example.com');
    });
  });

  describe('findById', () => {
    it('should find a user by id', async () => {
      // Arrange - Create a user directly with Prisma
      const createdUser = await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'hashed',
          isEmailVerified: false,
        },
      });

      // Act
      const found = await repository.findById(createdUser.id);

      // Assert
      expect(found).not.toBeNull();
      expect(found?.id).toBe(createdUser.id);
      expect(found?.email).toBe('jane@example.com');
      expect(found).toBeInstanceOf(User); // Verify it's domain model
    });

    it('should return null when user not found', async () => {
      // Act
      const found = await repository.findById('non-existent-id');

      // Assert
      expect(found).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      // Arrange
      await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          name: 'Bob Smith',
          email: 'bob@example.com',
          password: 'hashed',
          isEmailVerified: true,
        },
      });

      // Act
      const found = await repository.findByEmail('bob@example.com');

      // Assert
      expect(found).not.toBeNull();
      expect(found?.email).toBe('bob@example.com');
      expect(found?.name).toBe('Bob Smith');
      expect(found?.isEmailVerified).toBe(true);
    });

    it('should return null when email not found', async () => {
      // Act
      const found = await repository.findByEmail('notfound@example.com');

      // Assert
      expect(found).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      // Arrange - Create multiple users
      await prisma.user.createMany({
        data: [
          {
            id: crypto.randomUUID(),
            name: 'User 1',
            email: 'user1@example.com',
            password: 'hash1',
            isEmailVerified: false,
          },
          {
            id: crypto.randomUUID(),
            name: 'User 2',
            email: 'user2@example.com',
            password: 'hash2',
            isEmailVerified: true,
          },
        ],
      });

      // Act
      const users = await repository.findAll();

      // Assert
      expect(users).toHaveLength(2);
      expect(users[0]).toBeInstanceOf(User);
      expect(users[1]).toBeInstanceOf(User);
    });

    it('should return empty array when no users exist', async () => {
      // Act
      const users = await repository.findAll();

      // Assert
      expect(users).toHaveLength(0);
    });
  });

  describe('update', () => {
    it('should update an existing user', async () => {
      // Arrange
      const created = await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          name: 'Original Name',
          email: 'original@example.com',
          password: 'hash',
          isEmailVerified: false,
        },
      });

      const user = await repository.findById(created.id);
      if (!user) throw new Error('User not found');

      // Modify domain object
      user.name = 'Updated Name';
      user.isEmailVerified = true;

      // Act
      const updated = await repository.update(user);

      // Assert
      expect(updated.name).toBe('Updated Name');
      expect(updated.isEmailVerified).toBe(true);

      // Verify in database
      const fromDb = await prisma.user.findUnique({
        where: { id: created.id },
      });
      expect(fromDb?.name).toBe('Updated Name');
      expect(fromDb?.isEmailVerified).toBe(true);
    });
  });

  describe('delete', () => {
    it('should delete a user from database', async () => {
      // Arrange
      const created = await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          name: 'To Delete',
          email: 'delete@example.com',
          password: 'hash',
          isEmailVerified: false,
        },
      });

      // Act
      await repository.delete(created.id);

      // Assert
      const found = await prisma.user.findUnique({
        where: { id: created.id },
      });
      expect(found).toBeNull();
    });
  });
});
