import { ListUsersUseCase } from '@/application/use-cases/user/ListUsersUseCase';
import { RegisterUseCase } from '@/application/use-cases/auth/RegisterUseCase';
import { LoginUseCase } from '@/application/use-cases/auth/LoginUseCase';
import { GetCurrentUserUseCase } from '@/application/use-cases/auth/GetCurrentUserUseCase';
import { BcryptPasswordHasher } from '@/infrastructure/services/BcryptPasswordHasher';
import { DayjsDateService } from '@/infrastructure/services/DayjsDateService';
import { RecurrenceService } from '@/domain/services/RecurrenceService';
import { OccurrenceGeneratorService } from '@/domain/services/OccurrenceGeneratorService';
import { LessonAuthorizationService } from '@/domain/services/LessonAuthorizationService';
import { UserMapper } from '@/infrastructure/mappers/UserMapper';
import { Repositories } from './create-repositories';
import { GetMyTeachingLessonsForPeriodUseCase } from '@/application/use-cases/lesson/GetMyTeachingLessonsForPeriodUseCase';
import { CreateLessonUseCase } from '@/application/use-cases/lesson/CreateLessonUseCase';
import { GetLessonUseCase } from '@/application/use-cases/lesson/GetLessonUseCase';
import { SkipLessonOccurrenceUseCase } from '@/application/use-cases/lesson/SkipLessonOccurrenceUseCase';
import { LessonMapper } from '../mappers/LessonMapper';
import { DeleteLessonUseCase } from '@/application/use-cases/lesson/DeleteLessonUseCase';
import { ConsoleLogger } from '../services/Logger';
import { EditLessonUseCase } from '@/application/use-cases/lesson/EditLessonUseCase';

export const createUseCases = (repositories: Repositories) => {
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
  const lessonAuthService = new LessonAuthorizationService();

  return {
    user: {
      listUsersUseCase: new ListUsersUseCase(
        repositories.userRepository,
        userMapper
      ),
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
      getMyTeachingLessonsForPeriod: new GetMyTeachingLessonsForPeriodUseCase(
        repositories.lessonRepository,
        repositories.lessonExceptionRepository,
        occurrenceGeneratorService,
        lessonMapper,
        repositories.userRepository,
        lessonAuthService
      ),
      createLesson: new CreateLessonUseCase(
        repositories.lessonRepository,
        lessonMapper,
        repositories.userRepository,
        lessonAuthService
      ),
      getLesson: new GetLessonUseCase(
        repositories.lessonRepository,
        repositories.userRepository,
        lessonMapper,
        lessonAuthService
      ),
      deleteLesson: new DeleteLessonUseCase(
        repositories.lessonRepository,
        logger,
        repositories.userRepository,
        lessonAuthService
      ),
      editLesson: new EditLessonUseCase(
        repositories.lessonRepository,
        repositories.lessonExceptionRepository,
        lessonMapper,
        repositories.userRepository,
        lessonAuthService
      ),
      skipOccurrence: new SkipLessonOccurrenceUseCase(
        repositories.lessonRepository,
        repositories.lessonExceptionRepository,
        repositories.userRepository,
        lessonAuthService
      ),
    },
    services: {
      dateService,
      recurrenceService,
    },
  };
};
