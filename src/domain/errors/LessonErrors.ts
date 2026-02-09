import { DomainError } from './DomainError';

export class LessonNotFoundError extends DomainError {
  constructor(lessonId: string) {
    super(`Lesson with ID ${lessonId} not found.`);
  }
}

export class LessonNotRecurringError extends DomainError {
  constructor(lessonId: string) {
    super(`Lesson ${lessonId} is not recurring.`);
  }
}

export class LessonExceptionAlreadyExistsError extends DomainError {
  constructor(lessonId: string, date: Date) {
    super(
      `Exception already exists for lesson ${lessonId} on ${date.toISOString()}.`
    );
  }
}

export class SameDateRescheduleError extends DomainError {
  constructor() {
    super('Cannot reschedule to the same date.');
  }
}

export class InvalidLessonExceptionError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}
