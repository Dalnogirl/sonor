import { CreateLessonRequestDTO } from '@/application/dto/lesson/CreateLessonRequestDTO';
import { LessonResponseDTO } from '@/application/dto/lesson/LessonResponseDTO';
import { LessonMapperPort } from '@/application/ports/mappers/LessonMapperPort';
import { Lesson } from '@/domain/models/Lesson';
import {
  RecurringPattern,
  DayOfWeek,
} from '@/domain/models/RecurringPattern';
import { LessonRepository } from '@/domain/ports/repositories/LessonRepository';

export class CreateLessonUseCase {
  constructor(
    private lessonRepository: LessonRepository,
    private lessonMapper: LessonMapperPort
  ) {}

  async execute(lessonData: CreateLessonRequestDTO): Promise<LessonResponseDTO> {
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

    const lesson = Lesson.create(
      lessonData.title,
      lessonData.teacherIds,
      lessonData.pupilIds,
      lessonData.startDate,
      lessonData.endDate,
      lessonData.description,
      recurringPattern
    );

    await this.lessonRepository.create(lesson);

    return this.lessonMapper.toDTO(lesson);
  }
}
