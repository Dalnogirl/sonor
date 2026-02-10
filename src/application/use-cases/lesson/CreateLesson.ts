import { CreateLessonRequestDTO } from '@/application/dto/lesson/CreateLessonRequestDTO';
import { LessonResponseDTO } from '@/application/dto/lesson/LessonResponseDTO';
import { LessonMapperPort } from '@/application/ports/mappers/LessonMapperPort';
import { Lesson } from '@/domain/models/Lesson';
import { LessonRepository } from '@/domain/ports/repositories/LessonRepository';

export class CreateLesson {
  constructor(
    private lessonRepository: LessonRepository,
    private lessonMapper: LessonMapperPort
  ) {}

  async execute(lessonData: CreateLessonRequestDTO): Promise<LessonResponseDTO> {
    const lesson = Lesson.create(
      lessonData.title,
      lessonData.teacherIds,
      lessonData.pupilIds,
      lessonData.startDate,
      lessonData.endDate,
      lessonData.description,
      lessonData.recurringPattern
    );

    await this.lessonRepository.create(lesson);

    return this.lessonMapper.toDTO(lesson);
  }
}
