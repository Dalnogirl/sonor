import { RegisterDTO } from '@/application/dto/RegisterDTO';
import {
  EmailAlreadyExistsError,
  InvalidEmailError,
  InvalidPasswordError,
} from '@/domain/errors';
import { User } from '@/domain/models/User';
import { UserRepository } from '@/domain/ports/repositories/UserRepository';
import { PasswordHasher } from '@/domain/ports/services/PasswordHasher';

export class RegisterUseCase {
  constructor(
    private userRepository: UserRepository,
    private passwordHasher: PasswordHasher
  ) {}

  async execute(data: RegisterDTO): Promise<User> {
    // Validating email
    if (!User.validateEmail(data.email)) {
      throw new InvalidEmailError(data.email);
    }

    // Checking if user with provided email already exists
    const userWithProvidedEmail = await this.userRepository.findByEmail(
      data.email
    );

    if (userWithProvidedEmail) throw new EmailAlreadyExistsError(data.email);

    // Validating password
    if (!User.validatePassword(data.password)) {
      throw new InvalidPasswordError();
    }
    const hashedPassword = await this.passwordHasher.hash(data.password);

    const user = User.createWithDefaults(
      crypto.randomUUID(),
      data.name,
      data.email,
      hashedPassword
    );

    await this.userRepository.create(user);

    return user;
  }
}
