import { CreateLessonRequestDTO } from '@/application/dto/lesson/CreateLessonRequestDTO';
import { CreateLessonFormValues } from '@/adapters/ui/validation/lesson-form.schema';
import {
  RecurringPattern,
  RecurringFrequency,
  DayOfWeek,
} from '@/domain/models/RecurringPattern';

/**
 * Maps UI form data to application DTO
 *
 * **Architectural Role:** Adapter layer mapper
 * - Shields application layer from UI-specific data structures
 * - Combines separate date + time inputs into Date objects
 * - Constructs domain RecurringPattern from form fields
 *
 * **Applies:**
 * - Single Responsibility (SOLID): Only does form → DTO mapping
 * - Information Expert (GRASP): Knows how to combine date + time strings
 * - Adapter Pattern: Converts UI representation to application format
 * - Protected Variations (GRASP): Application layer unaware of UI form structure
 */
export class LessonFormMapper {
  /**
   * Converts form values to CreateLessonRequestDTO
   *
   * @param formValues - Form data from UI (separate day, startTime, endTime, recurring fields)
   * @returns DTO with combined startDate, endDate, and optional RecurringPattern
   */
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

    // Combine day + time strings into Date objects
    const lessonStartDate = this.combineDateAndTime(day, startTime);
    const lessonEndDate = this.combineDateAndTime(day, endTime);

    // Construct RecurringPattern if recurring is enabled
    const recurringPattern = isRecurring
      ? this.buildRecurringPattern(
          frequency!,
          interval!,
          daysOfWeek,
          endType,
          recurringEndDate,
          occurrences,
          day
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

  /**
   * Builds RecurringPattern domain object from form fields
   *
   * @param frequency - Recurring frequency (DAILY, WEEKLY, MONTHLY)
   * @param interval - Interval between recurrences
   * @param daysOfWeek - Days of week (for weekly recurrence)
   * @param endType - How recurrence ends ('never', 'date', 'occurrences')
   * @param endDate - End date (if endType = 'date')
   * @param occurrences - Number of occurrences (if endType = 'occurrences')
   * @param referenceDate - Reference date for validation
   * @returns RecurringPattern domain object
   */
  private static buildRecurringPattern(
    frequency: RecurringFrequency,
    interval: number,
    daysOfWeek: number[],
    endType: 'never' | 'date' | 'occurrences',
    endDate: Date | null | undefined,
    occurrences: number | null | undefined,
    referenceDate: Date
  ): RecurringPattern {
    // Determine actual endDate and occurrences based on endType
    const actualEndDate =
      endType === 'date' && endDate ? endDate : undefined;
    const actualOccurrences =
      endType === 'occurrences' && occurrences ? occurrences : undefined;

    // Cast daysOfWeek to DayOfWeek[] (already validated by schema)
    const daysOfWeekEnum = daysOfWeek as DayOfWeek[];

    // Use factory methods for cleaner construction
    switch (frequency) {
      case RecurringFrequency.DAILY:
        return RecurringPattern.daily(
          interval,
          actualEndDate,
          actualOccurrences,
          referenceDate
        );
      case RecurringFrequency.WEEKLY:
        return RecurringPattern.weekly(
          daysOfWeekEnum,
          interval,
          actualEndDate,
          actualOccurrences,
          referenceDate
        );
      case RecurringFrequency.MONTHLY:
        return RecurringPattern.monthly(
          interval,
          actualEndDate,
          actualOccurrences,
          referenceDate
        );
      default:
        throw new Error(`Unsupported frequency: ${frequency}`);
    }
  }

  /**
   * Combines a Date and time string (HH:mm) into a single Date
   *
   * @param date - Base date
   * @param timeStr - Time in format "HH:mm" (e.g., "14:30")
   * @returns Combined Date object with date + time
   */
  private static combineDateAndTime(date: Date, timeStr: string): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);

    // Create new Date to avoid mutation
    const combined = new Date(date);
    combined.setHours(hours, minutes, 0, 0);

    return combined;
  }
}
