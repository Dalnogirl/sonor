import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserRepository } from '@/domain/ports/repositories/UserRepository';
import { PasswordHasher } from '@/domain/ports/services/PasswordHasher';
import { UserMapperPort } from '@/application/ports/mappers/UserMapperPort';
import { User } from '@/domain/models/User';
import { InvalidCredentialsError } from '@/domain/errors';
import { LoginUseCase } from '@/application/use-cases/auth/LoginUseCase';

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;
  let mockUserRepository: UserRepository;
  let mockPasswordHasher: PasswordHasher;
  let mockUserMapper: UserMapperPort;

  beforeEach(() => {
    // Create mocks
    mockUserRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findByEmail: vi.fn(),
      findByIds: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    mockPasswordHasher = {
      hash: vi.fn(),
      compare: vi.fn(),
    };

    mockUserMapper = {
      toResponseDTO: vi.fn((user: User) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
      toResponseDTOArray: vi.fn(),
      toSummaryDTO: vi.fn(),
    };

    // Inject mocks into use case (Dependency Injection)
    loginUseCase = new LoginUseCase(
      mockUserRepository,
      mockPasswordHasher,
      mockUserMapper
    );
  });

  describe('Successful Login', () => {
    it('should login user with correct credentials and return UserResponseDTO', async () => {
      // Arrange
      const email = 'john@example.com';
      const password = 'Password123!';
      const hashedPassword = 'hashed_password_123';

      const existingUser = User.createWithDefaults(
        crypto.randomUUID(),
        'John Doe',
        email,
        hashedPassword
      );

      // Mock: user exists
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(existingUser);

      // Mock: password matches
      vi.mocked(mockPasswordHasher.compare).mockResolvedValue(true);

      // Act
      const result = await loginUseCase.execute({ email, password });

      // Assert - Returns UserResponseDTO (no password!)
      expect(result.email).toBe(email);
      expect(result.name).toBe('John Doe');
      expect('password' in result).toBe(false); // Password should NOT be in response
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(mockPasswordHasher.compare).toHaveBeenCalledWith(
        password,
        hashedPassword
      );
    });
  });

  describe('Authentication Errors', () => {
    it('should throw InvalidCredentialsError when user does not exist', async () => {
      // Arrange
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);

      // Act & Assert - Now throws InvalidCredentialsError (generic, secure)
      await expect(
        loginUseCase.execute({
          email: 'nonexistent@example.com',
          password: 'Password123!',
        })
      ).rejects.toThrow(InvalidCredentialsError);
    });

    it('should throw InvalidCredentialsError when password is wrong', async () => {
      // Arrange
      const existingUser = User.createWithDefaults(
        crypto.randomUUID(),
        'John Doe',
        'john@example.com',
        'hashed_password'
      );

      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(existingUser);
      vi.mocked(mockPasswordHasher.compare).mockResolvedValue(false); // Wrong password

      // Act & Assert
      await expect(
        loginUseCase.execute({
          email: 'john@example.com',
          password: 'WrongPassword!',
        })
      ).rejects.toThrow(InvalidCredentialsError);
    });
  });

  describe('Security', () => {
    it('should not leak information about whether user exists', async () => {
      // Security: Use same generic error for both "user not found" and "wrong password"
      // This prevents email enumeration attacks

      // Arrange - User doesn't exist
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);

      // Act & Assert - Generic InvalidCredentialsError
      await expect(
        loginUseCase.execute({
          email: 'unknown@example.com',
          password: 'Password123!',
        })
      ).rejects.toThrow(InvalidCredentialsError);

      // The error is generic - attackers can't tell if email exists or not
    });
  });
});
