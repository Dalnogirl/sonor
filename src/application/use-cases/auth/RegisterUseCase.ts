import { RegisterDTO } from '@/application/dto/RegisterDTO';
import { UserResponseDTO } from '@/application/dto/UserResponseDTO';
import { EmailAlreadyExistsError } from '@/domain/errors';
import { User } from '@/domain/models/User';
import { UserRepository } from '@/domain/ports/repositories/UserRepository';
import { PasswordHasher } from '@/domain/ports/services/PasswordHasher';
import { UserMapperPort } from '@/domain/ports/mappers/UserMapperPort';

export class RegisterUseCase {
  constructor(
    private userRepository: UserRepository,
    private passwordHasher: PasswordHasher,
    private userMapper: UserMapperPort
  ) {}

  async execute(data: RegisterDTO): Promise<UserResponseDTO> {
    // Business Rule: Check if user with provided email already exists
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new EmailAlreadyExistsError(data.email);
    }

    // Hash password (infrastructure concern, but orchestrated here)
    const hashedPassword = await this.passwordHasher.hash(data.password);

    // Create domain entity
    const user = User.createWithDefaults(
      crypto.randomUUID(),
      data.name,
      data.email,
      hashedPassword
    );

    // Persist user
    await this.userRepository.create(user);

    // Return safe DTO using injected mapper (DRY + Dependency Inversion)
    return this.userMapper.toResponseDTO(user);
  }
}
