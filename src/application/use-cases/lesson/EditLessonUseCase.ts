import { EditLessonRequestDTO } from '@/application/dto/lesson/EditLessonRequestDTO.schema';
import { LessonResponseWithPermissionsDTO } from '@/application/dto/lesson/LessonResponseWithPermissionsDTO';
import { LessonMapperPort } from '@/application/ports/mappers/LessonMapperPort';
import { LessonNotFoundError } from '@/domain/errors';
import { UserNotFoundError } from '@/domain/errors/UserErrors';
import { DayOfWeek, RecurringPattern } from '@/domain/models/RecurringPattern';
import { LessonRepository } from '@/domain/ports/repositories/LessonRepository';
import { LessonExceptionRepository } from '@/domain/ports/repositories/LessonExceptionRepository';
import { UserRepository } from '@/domain/ports/repositories/UserRepository';
import { LessonAuthorizationService } from '@/domain/services/LessonAuthorizationService';

export class EditLessonUseCase {
  constructor(
    private lessonRepository: LessonRepository,
    private lessonExceptionRepository: LessonExceptionRepository,
    private lessonMapper: LessonMapperPort,
    private userRepository: UserRepository,
    private authService: LessonAuthorizationService
  ) {}

  async execute(
    lessonData: EditLessonRequestDTO,
    userId: string
  ): Promise<LessonResponseWithPermissionsDTO> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UserNotFoundError(userId);

    const existingLesson = await this.lessonRepository.findById(lessonData.id);
    if (!existingLesson) throw new LessonNotFoundError(lessonData.id);

    this.authService.assertCanEdit(user, existingLesson);

    const recurringPattern = lessonData.recurringPattern
      ? new RecurringPattern(
          lessonData.recurringPattern.frequency,
          lessonData.recurringPattern.interval,
          (lessonData.recurringPattern.daysOfWeek as DayOfWeek[]) ?? [],
          lessonData.recurringPattern.endDate ?? null,
          lessonData.recurringPattern.occurrences ?? null,
          lessonData.startDate
        )
      : undefined;

    const { recurringPatternChanged } = existingLesson.edit({
      ...lessonData,
      recurringPattern,
    });

    if (recurringPatternChanged) {
      await this.lessonExceptionRepository.deleteByLessonId(existingLesson.id);
    }

    await this.lessonRepository.save(existingLesson);

    return {
      ...this.lessonMapper.toDTO(existingLesson),
      permissions: {
        canEdit: this.authService.canEdit(user, existingLesson),
        canDelete: this.authService.canDelete(user, existingLesson),
        canSkip: this.authService.canSkip(user, existingLesson),
      },
    };
  }
}
