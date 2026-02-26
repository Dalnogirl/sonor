import { EditLessonRequestDTO } from '@/application/dto/lesson/EditLessonRequestDTO.schema';
import { LessonMapperPort } from '@/application/ports/mappers/LessonMapperPort';
import { LessonNotFoundError } from '@/domain/errors';
import { DayOfWeek, RecurringPattern } from '@/domain/models/RecurringPattern';
import { LessonRepository } from '@/domain/ports/repositories/LessonRepository';
import { LessonExceptionRepository } from '@/domain/ports/repositories/LessonExceptionRepository';

export class EditLessonUseCase {
  constructor(
    private lessonRepository: LessonRepository,
    private lessonExceptionRepository: LessonExceptionRepository,
    private lessonMapper: LessonMapperPort
  ) {}

  async execute(lessonData: EditLessonRequestDTO) {
    const existingLesson = await this.lessonRepository.findById(lessonData.id);

    if (!existingLesson) throw new LessonNotFoundError(lessonData.id);

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

    return this.lessonMapper.toDTO(existingLesson);
  }
}
