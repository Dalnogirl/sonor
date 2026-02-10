import {
  CreateLessonRequestDTO,
  RecurringPatternInput,
} from '@/application/dto/lesson/CreateLessonRequestDTO';
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
