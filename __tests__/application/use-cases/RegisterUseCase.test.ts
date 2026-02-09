import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserRepository } from '@/domain/ports/repositories/UserRepository';
import { PasswordHasher } from '@/domain/ports/services/PasswordHasher';
import { UserMapperPort } from '@/application/ports/mappers/UserMapperPort';
import { User } from '@/domain/models/User';
import { EmailAlreadyExistsError } from '@/domain/errors';
import { RegisterUseCase } from '@/application/use-cases/auth/RegisterUseCase';

describe('RegisterUseCase', () => {
  let registerUseCase: RegisterUseCase;
  let mockUserRepository: UserRepository;
  let mockPasswordHasher: PasswordHasher;
  let mockUserMapper: UserMapperPort;

  beforeEach(() => {
    // Create mocks (test doubles)
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

    // Inject mocks into use case (Dependency Injection Pattern)
    registerUseCase = new RegisterUseCase(
      mockUserRepository,
      mockPasswordHasher,
      mockUserMapper
    );
  });

  describe('Successful Registration', () => {
    it('should register a new user with valid data and return UserResponseDTO', async () => {
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

      // Act
      const result = await registerUseCase.execute(registrationData);

      // Assert - Returns UserResponseDTO (no password!)
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
      expect(result.isEmailVerified).toBe(false);
      expect('password' in result).toBe(false); // Password should NOT be in response

      // Verify interactions
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        'john@example.com'
      );
      expect(mockPasswordHasher.hash).toHaveBeenCalledWith('Password123!');
      expect(mockUserRepository.create).toHaveBeenCalled();
    });
  });

  describe('Business Rule Validation', () => {
    it('should throw EmailAlreadyExistsError when email is taken', async () => {
      // Arrange
      const existingUser = User.createWithDefaults(
        'user-1',
        'Existing User',
        'taken@example.com',
        'hashedpass'
      );

      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(existingUser);

      // Act & Assert - Business rule enforced in use case
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

    // Note: Format validation (email format, password strength) is now
    // handled by the adapter layer (Zod schema in tRPC router)
    // Use case only handles business rules!
  });
});
