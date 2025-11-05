import { User } from '@/domain/models/User';
import { UserResponseDTO } from '@/application/dto/UserResponseDTO';

/**
 * UserMapperPort - Domain Port (Interface)
 *
 * Defines the contract for mapping User entities to DTOs
 *
 * Why a port/interface?
 * - Dependency Inversion Principle - Use cases depend on abstraction
 * - Testability - Can mock mapper in use case tests
 * - Flexibility - Can swap implementations (e.g., different DTO formats)
 *
 * Note: This lives in domain/ports because it defines a contract
 * that the application layer needs, following the Ports & Adapters pattern.
 */
export interface UserMapperPort {
  /**
   * Convert domain User entity to safe UserResponseDTO
   * Removes sensitive data like password
   */
  toResponseDTO(user: User): UserResponseDTO;

  /**
   * Convert array of Users to array of DTOs
   * Useful for list operations
   */
  toResponseDTOArray(users: User[]): UserResponseDTO[];

  /**
   * Convert User to minimal summary DTO
   * For use in lists, cards, or other condensed views
   */
  toSummaryDTO(user: User): Pick<UserResponseDTO, 'id' | 'name' | 'email'>;
}
