import { GetLessonRequestDTO } from '@/application/dto/lesson/GetLessonRequestDTO';
import { LessonWithUsersResponseDTO } from '@/application/dto/lesson/LessonWithUsersResponseDTO';
import { LessonNotFoundError } from '@/domain/errors/LessonErrors';
import { LessonMapperPort } from '@/application/ports/mappers/LessonMapperPort';
import { LessonRepository } from '@/domain/ports/repositories/LessonRepository';
import { UserRepository } from '@/domain/ports/repositories/UserRepository';

export class GetLessonUseCase {
  constructor(
    private lessonRepository: LessonRepository,
    private userRepository: UserRepository,
    private lessonMapper: LessonMapperPort
  ) {}

  async execute(
    getLessonRequestDTO: GetLessonRequestDTO
  ): Promise<LessonWithUsersResponseDTO> {
    const lesson = await this.lessonRepository.findById(
      getLessonRequestDTO.lessonId
    );

    if (!lesson) {
      throw new LessonNotFoundError(getLessonRequestDTO.lessonId);
    }

    const teachers = await this.userRepository.findByIds(lesson.teacherIds);
    const pupils = await this.userRepository.findByIds(lesson.pupilIds);

    return this.lessonMapper.toDTOWithUsers(lesson, teachers, pupils);
  }
}
