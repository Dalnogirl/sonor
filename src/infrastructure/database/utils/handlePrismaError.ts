import { Prisma } from '@prisma/client';
import { DomainError } from '@/domain/errors';
import { UserNotFoundError, EmailAlreadyExistsError } from '@/domain/errors/UserErrors';
import { LessonNotFoundError } from '@/domain/errors/LessonErrors';

interface ErrorContext {
  entity: 'user' | 'lesson' | 'lessonException';
  id?: string;
}

/**
 * Translates Prisma errors to domain errors at the repository boundary.
 * (Protected Variations — shields upper layers from infrastructure details)
 *
 * Usage:
 *   catch (error) { throw handlePrismaError(error, { entity: 'user', id }); }
 */
export function handlePrismaError(error: unknown, ctx: ErrorContext): DomainError | unknown {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return error;
  }

  switch (error.code) {
    case 'P2025': // Record not found (update/delete on nonexistent)
      if (ctx.entity === 'user') return new UserNotFoundError(ctx.id ?? 'unknown');
      if (ctx.entity === 'lesson') return new LessonNotFoundError(ctx.id ?? 'unknown');
      break;

    case 'P2002': { // Unique constraint violation
      const target = (error.meta?.target as string[]) ?? [];
      if (ctx.entity === 'user' && target.includes('email')) {
        return new EmailAlreadyExistsError(ctx.id ?? 'unknown');
      }
      break;
    }

    case 'P2003': // Foreign key constraint
      break;
  }

  return error;
}
