import { CreateLessonRequestDTO } from '@/application/dto/lesson/CreateLessonRequestDTO';
import { CreateLessonFormValues } from '@/adapters/ui/validation/lesson-form.schema';

/**
 * Maps UI form data to application DTO
 *
 * **Architectural Role:** Adapter layer mapper
 * - Shields application layer from UI-specific data structures
 * - Combines separate date + time inputs into Date objects
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
   * @param formValues - Form data from UI (separate day, startTime, endTime)
   * @returns DTO with combined startDate and endDate
   */
  static toCreateDTO(
    formValues: CreateLessonFormValues
  ): CreateLessonRequestDTO {
    const { day, startTime, endTime, title, description, teacherIds, pupilIds } =
      formValues;

    // Combine day + time strings into Date objects
    const startDate = this.combineDateAndTime(day, startTime);
    const endDate = this.combineDateAndTime(day, endTime);

    return {
      title,
      description,
      teacherIds,
      pupilIds,
      startDate,
      endDate,
      recurringPattern: undefined, // Not supported in form yet
    };
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
