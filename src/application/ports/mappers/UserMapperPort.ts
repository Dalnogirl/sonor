import { User } from '@/domain/models/User';
import { UserResponseDTO } from '@/application/dto/UserResponseDTO';
import { UserSummaryDTO } from '@/application/dto/user/UserSummaryDTO';

/**
 * UserMapperPort - Application Port (Interface)
 *
 * Defines the contract for mapping User entities to DTOs.
 *
 * Lives in application/ports/ because it references application DTOs —
 * placing it in domain/ports/ would violate DIP (domain → application).
 *
 * Use cases depend on this abstraction (DIP).
 * Infrastructure provides the implementation (Ports & Adapters).
 */
export interface UserMapperPort {
  toResponseDTO(user: User): UserResponseDTO;
  toResponseDTOArray(users: User[]): UserResponseDTO[];
  toSummaryDTO(user: User): UserSummaryDTO;
}
