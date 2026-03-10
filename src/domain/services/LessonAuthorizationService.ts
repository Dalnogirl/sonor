import { UnauthorizedError } from '@/domain/errors/AuthorizationErrors';
import { Lesson } from '@/domain/models/Lesson';
import { User } from '@/domain/models/User';

/**
 * LessonAuthorizationService — pure domain service (no ports needed).
 *
 * ISP: only lesson-related auth rules, not a god authorization service.
 * Protected Variations: when migrating to full RBAC, only this class changes.
 * DRY: shared "isAdmin OR isOwner" logic lives here, not scattered across use cases.
 */
export class LessonAuthorizationService {
  assertCanCreate(user: User): void {
    if (user.isAdmin() || user.isTeacher()) return;
    throw new UnauthorizedError('Only admins and teachers can create lessons');
  }

  assertCanEdit(user: User, lesson: Lesson): void {
    if (user.isAdmin() || lesson.hasTeacher(user.id)) return;
    throw new UnauthorizedError('Only admins and lesson teachers can edit lessons');
  }

  assertCanDelete(user: User, lesson: Lesson): void {
    if (user.isAdmin() || lesson.hasTeacher(user.id)) return;
    throw new UnauthorizedError('Only admins and lesson teachers can delete lessons');
  }

  assertCanSkip(user: User, lesson: Lesson): void {
    if (user.isAdmin() || lesson.hasTeacher(user.id)) return;
    throw new UnauthorizedError('Only admins and lesson teachers can skip occurrences');
  }
}
