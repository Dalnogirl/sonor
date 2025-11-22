import { ListUsersUseCase } from '@/application/use-cases/user/ListUsersUseCase';
import { RegisterUseCase } from '@/application/use-cases/auth/RegisterUseCase';
import { LoginUseCase } from '@/application/use-cases/auth/LoginUseCase';
import { BcryptPasswordHasher } from '@/infrastructure/services/BcryptPasswordHasher';
import { UserMapper } from '@/infrastructure/mappers/UserMapper';
import { Repositories } from './create-repositories';
import { GetMyTeachingLessonsForPeriod } from '@/application/use-cases/lesson/GetMyTeachingLessonsForPeriod';
import { CreateLesson } from '@/application/use-cases/lesson/CreateLesson';
import { GetLessonUseCase } from '@/application/use-cases/lesson/GetLesson';
import { LessonMapper } from '../mappers/LessonMapper';

/**
 * Dependency Injection Factory
 *
 * Wires up all infrastructure implementations and injects them into use cases
 *
 * Following Dependency Inversion Principle:
 * - Use cases depend on interfaces (ports)
 * - Infrastructure provides concrete implementations (adapters)
 * - Factory wires them together (composition root)
 */
export const createUseCases = (repositories: Repositories) => {
  // Infrastructure implementations
  const passwordHasher = new BcryptPasswordHasher();
  const userMapper = new UserMapper();
  const lessonMapper = new LessonMapper(userMapper);

  return {
    user: {
      listUsersUseCase: new ListUsersUseCase(
        repositories.userRepository,
        userMapper
      ),
      // Future: createUserUseCase, updateUserUseCase, deleteUserUseCase, etc.
    },
    auth: {
      register: new RegisterUseCase(
        repositories.userRepository,
        passwordHasher,
        userMapper
      ),
      login: new LoginUseCase(
        repositories.userRepository,
        passwordHasher,
        userMapper
      ),
    },
    lesson: {
      getMyTeachingLessonsForPeriod: new GetMyTeachingLessonsForPeriod(
        repositories.lessonRepository
      ),
      createLesson: new CreateLesson(repositories.lessonRepository),
      getLesson: new GetLessonUseCase(
        repositories.lessonRepository,
        repositories.userRepository,
        lessonMapper
      ),
    },
  };
};
