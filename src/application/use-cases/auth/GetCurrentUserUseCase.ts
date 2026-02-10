import { UserResponseDTO } from '@/application/dto/UserResponseDTO';
import { UserMapperPort } from '@/application/ports/mappers/UserMapperPort';
import { UserNotFoundError } from '@/domain/errors/UserErrors';
import { UserRepository } from '@/domain/ports/repositories/UserRepository';

export class GetCurrentUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private userMapper: UserMapperPort
  ) {}

  async execute(userId: string): Promise<UserResponseDTO> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError(userId);
    }
    return this.userMapper.toResponseDTO(user);
  }
}
