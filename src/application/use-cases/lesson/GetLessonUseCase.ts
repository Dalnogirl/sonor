import { GetLessonRequestDTO } from '@/application/dto/lesson/GetLessonRequestDTO';
import { LessonDetailResponseDTO } from '@/application/dto/lesson/LessonDetailResponseDTO';
import { LessonNotFoundError } from '@/domain/errors/LessonErrors';
import { UserNotFoundError } from '@/domain/errors/UserErrors';
import { LessonMapperPort } from '@/application/ports/mappers/LessonMapperPort';
import { LessonRepository } from '@/domain/ports/repositories/LessonRepository';
import { UserRepository } from '@/domain/ports/repositories/UserRepository';
import { LessonAuthorizationService } from '@/domain/services/LessonAuthorizationService';

export class GetLessonUseCase {
  constructor(
    private lessonRepository: LessonRepository,
    private userRepository: UserRepository,
    private lessonMapper: LessonMapperPort,
    private authService: LessonAuthorizationService
  ) {}

  async execute(
    getLessonRequestDTO: GetLessonRequestDTO,
    userId: string
  ): Promise<LessonDetailResponseDTO> {
    const [lesson, user] = await Promise.all([
      this.lessonRepository.findById(getLessonRequestDTO.lessonId),
      this.userRepository.findById(userId),
    ]);

    if (!lesson) {
      throw new LessonNotFoundError(getLessonRequestDTO.lessonId);
    }
    if (!user) {
      throw new UserNotFoundError(userId);
    }

    const teachers = await this.userRepository.findByIds(lesson.teacherIds);
    const pupils = await this.userRepository.findByIds(lesson.pupilIds);

    const dto = this.lessonMapper.toDTOWithUsers(lesson, teachers, pupils);

    return {
      ...dto,
      permissions: {
        canEdit: this.authService.canEdit(user, lesson),
        canDelete: this.authService.canDelete(user, lesson),
        canSkip: this.authService.canSkip(user, lesson),
      },
    };
  }
}
