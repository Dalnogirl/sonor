import { ListUsersUseCase } from '@/application/use-cases/user/ListUsersUseCase';
import { RegisterUseCase } from '@/application/use-cases/auth/RegisterUseCase';
import { LoginUseCase } from '@/application/use-cases/auth/LoginUseCase';
import { GetCurrentUserUseCase } from '@/application/use-cases/auth/GetCurrentUserUseCase';
import { BcryptPasswordHasher } from '@/infrastructure/services/BcryptPasswordHasher';
import { DayjsDateService } from '@/infrastructure/services/DayjsDateService';
import { RecurrenceService } from '@/domain/services/RecurrenceService';
import { OccurrenceGeneratorService } from '@/domain/services/OccurrenceGeneratorService';
import { UserMapper } from '@/infrastructure/mappers/UserMapper';
import { Repositories } from './create-repositories';
import { GetMyTeachingLessonsForPeriod } from '@/application/use-cases/lesson/GetMyTeachingLessonsForPeriod';
import { CreateLesson } from '@/application/use-cases/lesson/CreateLesson';
import { GetLessonUseCase } from '@/application/use-cases/lesson/GetLesson';
import { SkipLessonOccurrence } from '@/application/use-cases/lesson/SkipLessonOccurrence';
import { RescheduleLessonOccurrence } from '@/application/use-cases/lesson/RescheduleLessonOccurrence';
import { LessonMapper } from '../mappers/LessonMapper';
import { DeleteLessonUseCase } from '@/application/use-cases/lesson/DeleteLesson';
import { ConsoleLogger } from '../services/Logger';

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
  const dateService = new DayjsDateService();
  const userMapper = new UserMapper();
  const lessonMapper = new LessonMapper(userMapper);
  const logger = new ConsoleLogger();

  // Domain services
  const recurrenceService = new RecurrenceService(dateService);
  const occurrenceGeneratorService = new OccurrenceGeneratorService(
    recurrenceService,
    dateService
  );

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
      getCurrentUser: new GetCurrentUserUseCase(
        repositories.userRepository,
        userMapper
      ),
    },
    lesson: {
      getMyTeachingLessonsForPeriod: new GetMyTeachingLessonsForPeriod(
        repositories.lessonRepository,
        repositories.lessonExceptionRepository,
        occurrenceGeneratorService,
        lessonMapper
      ),
      createLesson: new CreateLesson(
        repositories.lessonRepository,
        lessonMapper
      ),
      getLesson: new GetLessonUseCase(
        repositories.lessonRepository,
        repositories.userRepository,
        lessonMapper
      ),
      deleteLesson: new DeleteLessonUseCase(
        repositories.lessonRepository,
        logger
      ),
      skipOccurrence: new SkipLessonOccurrence(
        repositories.lessonRepository,
        repositories.lessonExceptionRepository
      ),
      rescheduleOccurrence: new RescheduleLessonOccurrence(
        repositories.lessonRepository,
        repositories.lessonExceptionRepository
      ),
    },
    services: {
      dateService,
      recurrenceService,
    },
  };
};
