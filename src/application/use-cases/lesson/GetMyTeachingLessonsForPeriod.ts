import { GetMyTeachingLessonsForPeriodRequestDTO } from '@/application/dto/lesson/GetMyTeachingLessonsForPeriodRequestDTO';
import { Lesson } from '@/domain/models/Lesson';
import { LessonException } from '@/domain/models/LessonException';
import { LessonRepository } from '@/domain/ports/repositories/LessonRepository';
import { LessonExceptionRepository } from '@/domain/ports/repositories/LessonExceptionRepository';
import { OccurrenceGeneratorService } from '@/domain/services/OccurrenceGeneratorService';

export class GetMyTeachingLessonsForPeriod {
  constructor(
    private repository: LessonRepository,
    private exceptionRepository: LessonExceptionRepository,
    private occurrenceGenerator: OccurrenceGeneratorService
  ) {}

  async execute(
    lessonDTO: GetMyTeachingLessonsForPeriodRequestDTO & { userId: string }
  ): Promise<Lesson[]> {
    console.log('Getting lessons for DTO:', lessonDTO);

    const baseLessons = await this.repository.findMyTeachingLessonsForPeriod(
      lessonDTO.userId,
      lessonDTO.startDate,
      lessonDTO.endDate
    );

    console.log(baseLessons)

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

    return allOccurrences.sort(
      (a, b) => a.startDate.getTime() - b.startDate.getTime()
    );
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
