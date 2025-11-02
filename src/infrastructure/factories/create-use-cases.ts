import { ListUsersUseCase } from '@/application/use-cases/user/ListUsersUseCase';
import { RegisterUseCase } from '@/application/use-cases/auth/RegisterUseCase';
import { LoginUseCase } from '@/application/use-cases/auth/LoginUseCase';
import { BcryptPasswordHasher } from '@/infrastructure/services/BcryptPasswordHasher';
import { Repositories } from './create-repositories';

export const createUseCases = (repositories: Repositories) => {
  const passwordHasher = new BcryptPasswordHasher();

  return {
    user: {
      listUsersUseCase: new ListUsersUseCase(repositories.userRepository),
      // Future: createUserUseCase, updateUserUseCase, deleteUserUseCase, etc.
    },
    auth: {
      register: new RegisterUseCase(
        repositories.userRepository,
        passwordHasher
      ),
      login: new LoginUseCase(repositories.userRepository, passwordHasher),
    },
  };
};
