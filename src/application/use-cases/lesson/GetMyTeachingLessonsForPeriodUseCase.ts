import { GetMyTeachingLessonsForPeriodRequestDTO } from '@/application/dto/lesson/GetMyTeachingLessonsForPeriodRequestDTO';
import { LessonResponseDTO } from '@/application/dto/lesson/LessonResponseDTO';
import { LessonMapperPort } from '@/application/ports/mappers/LessonMapperPort';
import { LessonException } from '@/domain/models/LessonException';
import { LessonRepository } from '@/domain/ports/repositories/LessonRepository';
import { LessonExceptionRepository } from '@/domain/ports/repositories/LessonExceptionRepository';
import { OccurrenceGeneratorService } from '@/domain/services/OccurrenceGeneratorService';

export class GetMyTeachingLessonsForPeriodUseCase {
  constructor(
    private repository: LessonRepository,
    private exceptionRepository: LessonExceptionRepository,
    private occurrenceGenerator: OccurrenceGeneratorService,
    private lessonMapper: LessonMapperPort
  ) {}

  async execute(
    lessonDTO: GetMyTeachingLessonsForPeriodRequestDTO & { userId: string }
  ): Promise<LessonResponseDTO[]> {
    const baseLessons = await this.repository.findMyTeachingLessonsForPeriod(
      lessonDTO.userId,
      lessonDTO.startDate,
      lessonDTO.endDate
    );

    if (baseLessons.length === 0) {
      return [];
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

    return sorted.map((lesson) => this.lessonMapper.toDTO(lesson));
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
