import { DomainError } from './DomainError';

export class LessonNotFoundError extends DomainError {
  constructor(lessonId: string) {
    super(`Lesson with ID ${lessonId} not found.`);
  }
}
