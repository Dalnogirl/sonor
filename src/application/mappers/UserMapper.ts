import { User } from '@/domain/models/User';
import { UserResponseDTO } from '@/application/dto/UserResponseDTO';
import { UserMapperPort } from '@/domain/ports/mappers/UserMapperPort';

/**
 * UserMapper - Infrastructure Implementation
 *
 * Implements UserMapperPort interface for transforming User entities to DTOs
 *
 * Architecture Pattern: Ports & Adapters (Hexagonal Architecture)
 * - Port: UserMapperPort (interface in domain/ports)
 * - Adapter: UserMapper (implementation in infrastructure)
 *
 * Why Dependency Injection instead of static methods?
 * 1. Dependency Inversion Principle - Use cases depend on interface, not implementation
 * 2. Testability - Can mock mapper in use case tests
 * 3. Flexibility - Can swap implementations (e.g., different DTO formats per context)
 * 4. Consistency - Same pattern as PasswordHasher, repositories, etc.
 *
 * This follows the Mapper Pattern (Martin Fowler's PoEAA):
 * - Keeps domain models clean from presentation concerns
 * - Centralizes mapping logic (DRY principle)
 * - Easy to test in isolation
 * - Supports multiple DTO representations for different contexts
 */
export class UserMapper implements UserMapperPort {
  /**
   * Convert domain User entity to safe UserResponseDTO
   * Removes sensitive data like password
   *
   * @param user - Domain User entity
   * @returns UserResponseDTO safe for external exposure
   */
  toResponseDTO(user: User): UserResponseDTO {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Convert array of Users to array of DTOs
   * Useful for list operations
   */
  toResponseDTOArray(users: User[]): UserResponseDTO[] {
    return users.map((user) => this.toResponseDTO(user));
  }

  /**
   * Example: You might need different representations for different contexts
   *
   * For admin dashboard - might include more fields
   * For public profile - might include less fields
   * For summary cards - might include minimal fields
   */

  // Example: Minimal DTO for user cards/lists
  toSummaryDTO(user: User): Pick<UserResponseDTO, 'id' | 'name' | 'email'> {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }

  // Example: Extended DTO for admin users (future use)
  // toAdminDTO(user: User): AdminUserResponseDTO {
  //   return {
  //     ...this.toResponseDTO(user),
  //     password: user.password, // Only for admin context!
  //     loginAttempts: user.loginAttempts,
  //     // ... other admin-only fields
  //   };
  // }
}
