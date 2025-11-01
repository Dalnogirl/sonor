import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserRepository } from '@/domain/ports/repositories/UserRepository';
import { PasswordHasher } from '@/domain/ports/services/PasswordHasher';
import { User } from '@/domain/models/User';
import { EmailAlreadyExistsError, InvalidPasswordError } from '@/domain/errors';
import { RegisterUseCase } from '@/application/use-cases/auth/RegisterUseCase';

describe('RegisterUseCase', () => {
  let registerUseCase: RegisterUseCase;
  let mockUserRepository: UserRepository;
  let mockPasswordHasher: PasswordHasher;

  beforeEach(() => {
    // Create mocks (test doubles)
    mockUserRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findByEmail: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    mockPasswordHasher = {
      hash: vi.fn(),
      compare: vi.fn(),
    };

    // Inject mocks into use case
    registerUseCase = new RegisterUseCase(
      mockUserRepository,
      mockPasswordHasher
    );
  });

  describe('Successful Registration', () => {
    it('should register a new user with valid data', async () => {
      // Arrange
      const registrationData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
      };

      // Mock: email doesn't exist
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);

      // Mock: password gets hashed
      vi.mocked(mockPasswordHasher.hash).mockResolvedValue(
        'hashed_password_123'
      );

      // Mock: user gets created
      vi.mocked(mockUserRepository.create).mockImplementation(
        async (user) => user
      );

      // Act - Direct parameters, no DTO!
      const result = await registerUseCase.execute(registrationData);

      // Assert
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
      expect(result.password).toBe('hashed_password_123');
      expect(result.isEmailVerified).toBe(false);

      // Verify interactions
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        'john@example.com'
      );
      expect(mockPasswordHasher.hash).toHaveBeenCalledWith('Password123!');
      expect(mockUserRepository.create).toHaveBeenCalled();
    });
  });

  describe('Validation Errors', () => {
    it('should throw EmailAlreadyExistsError when email is taken', async () => {
      // Arrange
      const existingUser = User.createWithDefaults(
        'user-1',
        'Existing User',
        'taken@example.com',
        'hashedpass'
      );

      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(existingUser);

      // Act & Assert - Using DTO
      await expect(
        registerUseCase.execute({
          name: 'New User',
          email: 'taken@example.com',
          password: 'Password123!',
        })
      ).rejects.toThrow(EmailAlreadyExistsError);

      // Should not try to create user
      expect(mockPasswordHasher.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('should throw InvalidPasswordError for weak password', async () => {
      // Arrange
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);

      // Act & Assert - Using DTO
      await expect(
        registerUseCase.execute({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'weak', // Too short, no special char
        })
      ).rejects.toThrow(InvalidPasswordError);

      // Should not hash or save
      expect(mockPasswordHasher.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });
});
