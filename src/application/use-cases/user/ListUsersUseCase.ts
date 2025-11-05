import { UserRepository } from '@/domain/ports/repositories/UserRepository';
import { UserResponseDTO } from '@/application/dto/UserResponseDTO';
import { UserMapperPort } from '@/domain/ports/mappers/UserMapperPort';

/**
 * ListUsersUseCase
 *
 * Returns safe user data without sensitive fields
 * Uses injected UserMapper to transform domain entities to DTOs
 *
 * Dependency Inversion Principle:
 * - Depends on UserMapperPort interface, not concrete implementation
 * - Allows mocking mapper in tests
 * - Consistent with PasswordHasher, repositories, etc.
 */
export class ListUsersUseCase {
  constructor(
    private userRepository: UserRepository,
    private userMapper: UserMapperPort
  ) {}

  async execute(): Promise<UserResponseDTO[]> {
    const users = await this.userRepository.findAll();
    return this.userMapper.toResponseDTOArray(users);
  }
}
