import { LessonResponseDTO } from '@/application/dto/lesson/LessonResponseDTO';
import { LessonWithUsersResponseDTO } from '@/application/dto/lesson/LessonWithUsersResponseDTO';
import { Lesson } from '@/domain/models/Lesson';
import { User } from '@/domain/models/User';

export interface LessonMapperPort {
  toDTO(domainLesson: Lesson): LessonResponseDTO;
  toDTOWithUsers(
    domainLesson: Lesson,
    teachers: User[],
    pupils: User[]
  ): LessonWithUsersResponseDTO;
}
