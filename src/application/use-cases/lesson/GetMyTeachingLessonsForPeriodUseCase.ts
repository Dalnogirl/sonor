import { GetMyTeachingLessonsForPeriodRequestDTO } from '@/application/dto/lesson/GetMyTeachingLessonsForPeriodRequestDTO';
import { LessonListResponseDTO } from '@/application/dto/lesson/LessonListResponseDTO';
import { LessonPermissions } from '@/application/dto/lesson/LessonPermissions';
import { LessonMapperPort } from '@/application/ports/mappers/LessonMapperPort';
import { LessonException } from '@/domain/models/LessonException';
import { Lesson } from '@/domain/models/Lesson';
import { User } from '@/domain/models/User';
import { LessonRepository } from '@/domain/ports/repositories/LessonRepository';
import { LessonExceptionRepository } from '@/domain/ports/repositories/LessonExceptionRepository';
import { UserRepository } from '@/domain/ports/repositories/UserRepository';
import { UserNotFoundError } from '@/domain/errors/UserErrors';
import { OccurrenceGeneratorService } from '@/domain/services/OccurrenceGeneratorService';
import { LessonAuthorizationService } from '@/domain/services/LessonAuthorizationService';

export class GetMyTeachingLessonsForPeriodUseCase {
  constructor(
    private repository: LessonRepository,
    private exceptionRepository: LessonExceptionRepository,
    private occurrenceGenerator: OccurrenceGeneratorService,
    private lessonMapper: LessonMapperPort,
    private userRepository: UserRepository,
    private authService: LessonAuthorizationService
  ) {}

  async execute(
    lessonDTO: GetMyTeachingLessonsForPeriodRequestDTO & { userId: string }
  ): Promise<LessonListResponseDTO> {
    const user = await this.userRepository.findById(lessonDTO.userId);
    if (!user) throw new UserNotFoundError(lessonDTO.userId);

    const baseLessons = await this.repository.findMyTeachingLessonsForPeriod(
      lessonDTO.userId,
      lessonDTO.startDate,
      lessonDTO.endDate
    );

    if (baseLessons.length === 0) {
      return {
        lessons: [],
        canCreate: this.authService.canCreate(user),
      };
    }

    const lessonIds = baseLessons.map((lesson) => lesson.id);
    const exceptions =
      await this.exceptionRepository.findByLessonIdsAndDateRange(
        lessonIds,
        lessonDTO.startDate,
        lessonDTO.endDate
      );

    const lessonIdExceptionMap = this.groupExceptionsByLessonId(exceptions);

    const allOccurrences = baseLessons.flatMap((lesson) => {
      const lessonExceptions = lessonIdExceptionMap.get(lesson.id) || [];
      return this.occurrenceGenerator.generateOccurrencesForPeriod(
        lesson,
        lessonExceptions,
        lessonDTO.startDate,
        lessonDTO.endDate
      );
    });

    const sorted = allOccurrences.sort(
      (a, b) => a.startDate.getTime() - b.startDate.getTime()
    );

    const lessons = sorted.map((lesson) => ({
      ...this.lessonMapper.toDTO(lesson),
      permissions: this.buildPermissions(user, lesson),
    }));

    return {
      lessons,
      canCreate: this.authService.canCreate(user),
    };
  }

  private buildPermissions(user: User, lesson: Lesson): LessonPermissions {
    return {
      canEdit: this.authService.canEdit(user, lesson),
      canDelete: this.authService.canDelete(user, lesson),
      canSkip: this.authService.canSkip(user, lesson),
    };
  }

  private groupExceptionsByLessonId(
    exceptions: LessonException[]
  ): Map<string, LessonException[]> {
    const map = new Map<string, LessonException[]>();
    for (const exception of exceptions) {
      const existing = map.get(exception.lessonId) || [];
      existing.push(exception);
      map.set(exception.lessonId, existing);
    }
    return map;
  }
}
