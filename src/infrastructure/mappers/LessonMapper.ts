import { LessonResponseDTO } from '@/application/dto/lesson/LessonResponseDTO';
import { LessonWithUsersResponseDTO } from '@/application/dto/lesson/LessonWithUsersResponseDTO';
import { RecurringPatternDTO } from '@/application/dto/lesson/RecurringPatternDTO';
import { Lesson } from '@/domain/models/Lesson';
import { RecurringPattern } from '@/domain/models/RecurringPattern';
import { User } from '@/domain/models/User';
import { LessonMapperPort } from '@/domain/ports/mappers/LessonMapperPort';
import { UserMapperPort } from '@/domain/ports/mappers/UserMapperPort';

export class LessonMapper implements LessonMapperPort {
  constructor(private readonly userMapper: UserMapperPort) {}

  toDTO(domainLesson: Lesson): LessonResponseDTO {
    return {
      id: domainLesson.id,
      title: domainLesson.title,
      description: domainLesson.description,
      startDate: domainLesson.startDate,
      endDate: domainLesson.endDate,
      recurringPattern: domainLesson.recurringPattern,
      teacherIds: domainLesson.teacherIds,
      pupilIds: domainLesson.pupilIds,
    };
  }

  toDTOWithUsers(
    lesson: Lesson,
    teachers: User[],
    pupils: User[]
  ): LessonWithUsersResponseDTO {
    const teachersSummaries = teachers.map(this.userMapper.toSummaryDTO);
    const pupilsSummaries = pupils.map(this.userMapper.toSummaryDTO);

    return {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      startDate: lesson.startDate.toISOString(),
      endDate: lesson.endDate.toISOString(),
      recurringPattern: this.recurringPatternToDTO(lesson.recurringPattern),
      teachers: teachersSummaries,
      pupils: pupilsSummaries,
    };
  }

  private recurringPatternToDTO(
    pattern?: RecurringPattern
  ): RecurringPatternDTO | undefined {
    if (!pattern) return undefined;
    return {
      frequency: pattern.frequency,
      interval: pattern.interval,
      daysOfWeek: pattern.daysOfWeek,
      endDate: pattern.endDate?.toISOString() ?? null,
      occurrences: pattern.occurrences,
    };
  }
}
