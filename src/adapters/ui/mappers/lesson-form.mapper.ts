import { CreateLessonRequestDTO } from '@/application/dto/lesson/CreateLessonRequestDTO';
import { EditLessonRequestDTO } from '@/application/dto/lesson/EditLessonRequestDTO.schema';
import { RecurringPatternInput } from '@/application/dto/lesson/ReccurringPatternInput.schema';
import { LessonWithUsersResponseDTO } from '@/application/dto/lesson/LessonWithUsersResponseDTO';
import { CreateLessonFormValues } from '@/adapters/ui/validation/lesson-form.schema';
import { RecurringFrequency } from '@/domain/models/RecurringPattern';

export class LessonFormMapper {
  static toCreateDTO(
    formValues: CreateLessonFormValues
  ): CreateLessonRequestDTO {
    const {
      day,
      startTime,
      endTime,
      title,
      description,
      teacherIds,
      pupilIds,
      isRecurring,
      frequency,
      interval,
      daysOfWeek,
      endType,
      endDate: recurringEndDate,
      occurrences,
    } = formValues;

    const lessonStartDate = this.combineDateAndTime(day, startTime);
    const lessonEndDate = this.combineDateAndTime(day, endTime);

    const recurringPattern = isRecurring
      ? this.buildRecurringPatternInput(
          frequency!,
          interval!,
          daysOfWeek,
          endType,
          recurringEndDate,
          occurrences
        )
      : undefined;

    return {
      title,
      description,
      teacherIds,
      pupilIds,
      startDate: lessonStartDate,
      endDate: lessonEndDate,
      recurringPattern,
    };
  }

  static toEditDTO(
    lessonId: string,
    formValues: CreateLessonFormValues
  ): EditLessonRequestDTO {
    return {
      id: lessonId,
      ...this.toCreateDTO(formValues),
    };
  }

  static fromLessonToFormValues(
    lesson: LessonWithUsersResponseDTO
  ): CreateLessonFormValues {
    const startDate = new Date(lesson.startDate);
    const endDate = new Date(lesson.endDate);
    const rp = lesson.recurringPattern;

    return {
      title: lesson.title,
      description: lesson.description ?? '',
      teacherIds: lesson.teachers.map((t) => t.id),
      pupilIds: lesson.pupils.map((p) => p.id),
      day: startDate,
      startTime: this.formatTime(startDate),
      endTime: this.formatTime(endDate),
      isRecurring: !!rp,
      frequency: rp?.frequency,
      interval: rp?.interval ?? 1,
      daysOfWeek: rp?.daysOfWeek ?? [],
      endType: rp?.endDate ? 'date' : rp?.occurrences ? 'occurrences' : 'never',
      endDate: rp?.endDate ? new Date(rp.endDate) : null,
      occurrences: rp?.occurrences ?? null,
    };
  }

  private static formatTime(date: Date): string {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }

  private static buildRecurringPatternInput(
    frequency: RecurringFrequency,
    interval: number,
    daysOfWeek: number[],
    endType: 'never' | 'date' | 'occurrences',
    endDate: Date | null | undefined,
    occurrences: number | null | undefined
  ): RecurringPatternInput {
    return {
      frequency,
      interval,
      daysOfWeek: daysOfWeek.length > 0 ? daysOfWeek : undefined,
      endDate: endType === 'date' && endDate ? endDate : undefined,
      occurrences:
        endType === 'occurrences' && occurrences ? occurrences : undefined,
    };
  }

  private static combineDateAndTime(date: Date, timeStr: string): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const combined = new Date(date);
    combined.setHours(hours, minutes, 0, 0);
    return combined;
  }
}
