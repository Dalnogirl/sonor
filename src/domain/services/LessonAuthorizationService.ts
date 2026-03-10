import { UnauthorizedError } from '@/domain/errors/AuthorizationErrors';
import { Lesson } from '@/domain/models/Lesson';
import { User } from '@/domain/models/User';

/**
 * LessonAuthorizationService — pure domain service (no ports needed).
 *
 * ISP: only lesson-related auth rules, not a god authorization service.
 * Protected Variations: when migrating to full RBAC, only this class changes.
 * DRY: shared "isAdmin OR isOwner" logic lives here, not scattered across use cases.
 * CQS: canX = pure query (boolean), assertCanX = command (throws).
 */
export class LessonAuthorizationService {
  canCreate(user: User): boolean {
    return user.isAdmin() || user.isTeacher();
  }

  canEdit(user: User, lesson: Lesson): boolean {
    return user.isAdmin() || lesson.hasTeacher(user.id);
  }

  canDelete(user: User, lesson: Lesson): boolean {
    return user.isAdmin() || lesson.hasTeacher(user.id);
  }

  canSkip(user: User, lesson: Lesson): boolean {
    return user.isAdmin() || lesson.hasTeacher(user.id);
  }

  assertCanCreate(user: User): void {
    if (!this.canCreate(user))
      throw new UnauthorizedError('Only admins and teachers can create lessons');
  }

  assertCanEdit(user: User, lesson: Lesson): void {
    if (!this.canEdit(user, lesson))
      throw new UnauthorizedError(
        'Only admins and lesson teachers can edit lessons'
      );
  }

  assertCanDelete(user: User, lesson: Lesson): void {
    if (!this.canDelete(user, lesson))
      throw new UnauthorizedError(
        'Only admins and lesson teachers can delete lessons'
      );
  }

  assertCanSkip(user: User, lesson: Lesson): void {
    if (!this.canSkip(user, lesson))
      throw new UnauthorizedError(
        'Only admins and lesson teachers can skip occurrences'
      );
  }
}
