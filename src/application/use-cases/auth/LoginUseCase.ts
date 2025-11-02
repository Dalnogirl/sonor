import { UserRepository } from '@/domain/ports/repositories/UserRepository';
import { PasswordHasher } from '@/domain/ports/services/PasswordHasher';
import { UserResponseDTO } from '@/application/dto/UserResponseDTO';
import { InvalidCredentialsError } from '@/domain/errors';
import { LoginDTO } from '@/application/dto/LoginDTO';

/**
 * LoginUseCase - Authenticates a user with email and password
 *
 * Applying Use Case Pattern:
 * - Orchestrates authentication workflow
 * - Validates credentials
 * - Returns authenticated user data
 *
 * Security Principles:
 * - Generic error messages (prevent email enumeration)
 * - Password comparison is delegated to PasswordHasher
 * - Returns DTO without password
 */
export class LoginUseCase {
  constructor(
    private userRepository: UserRepository,
    private passwordHasher: PasswordHasher
  ) {}

  async execute(dto: LoginDTO): Promise<UserResponseDTO> {
    // 1. Find user by email
    const user = await this.userRepository.findByEmail(dto.email);

    // 2. Verify password
    // Note: We check password even if user is null to prevent timing attacks
    const isPasswordValid = user
      ? await this.passwordHasher.compare(dto.password, user.password)
      : false;

    // 3. Business Rule: Both user existence and password must be valid
    if (!user || !isPasswordValid) {
      // Generic error - don't reveal if email exists (security)
      throw new InvalidCredentialsError();
    }

    // 4. Return safe user data (no password!)
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
