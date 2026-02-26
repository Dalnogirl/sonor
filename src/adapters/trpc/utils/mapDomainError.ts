import { TRPCError, type TRPC_ERROR_CODE_KEY } from '@trpc/server';
import { DomainError } from '@/domain/errors';
import {
  LessonNotFoundError,
  LessonNotRecurringError,
  LessonExceptionAlreadyExistsError,
  InvalidLessonExceptionError,
} from '@/domain/errors/LessonErrors';
import {
  UserNotFoundError,
  EmailAlreadyExistsError,
  InvalidCredentialsError,
} from '@/domain/errors/UserErrors';
import { UnauthorizedError } from '@/domain/errors/AuthorizationErrors';

type DomainErrorConstructor = new (...args: never[]) => DomainError;

/**
 * Declarative domain-error → tRPC-error-code mapping.
 * Adding a new domain error = one line here (OCP).
 */
const ERROR_MAP = new Map<DomainErrorConstructor, TRPC_ERROR_CODE_KEY>([
  [LessonNotFoundError, 'NOT_FOUND'],
  [UserNotFoundError, 'NOT_FOUND'],
  [UnauthorizedError, 'FORBIDDEN'],
  [InvalidCredentialsError, 'FORBIDDEN'],
  [EmailAlreadyExistsError, 'CONFLICT'],
  [LessonExceptionAlreadyExistsError, 'CONFLICT'],
  [LessonNotRecurringError, 'BAD_REQUEST'],
  [InvalidLessonExceptionError, 'BAD_REQUEST'],
]);

/**
 * Maps domain errors to TRPCError.
 *
 * Single source of truth for error mapping (DRY, OCP).
 *
 * Usage:
 *   catch (error) { throw mapDomainError(error); }
 */
export function mapDomainError(error: unknown): TRPCError {
  if (error instanceof DomainError) {
    const code =
      ERROR_MAP.get(error.constructor as DomainErrorConstructor) ?? 'BAD_REQUEST';
    return new TRPCError({ code, message: error.message });
  }

  return new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred.',
  });
}
