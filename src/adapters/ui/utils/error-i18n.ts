/**
 * Client-side error i18n utility
 *
 * Maps domain error codes (from TRPCError cause) to translation keys.
 * Domain stays pure English — adapter translates via error codes.
 *
 * **Applies:**
 * - OCP: New error = 1 entry here + 1 translation per locale
 * - DIP: Domain doesn't know about i18n
 * - Protected Variations: UI shielded from domain error message changes
 */

const ERROR_CODE_TO_KEY: Record<string, string> = {
  LessonNotFoundError: 'errors.LessonNotFoundError',
  UserNotFoundError: 'errors.UserNotFoundError',
  UnauthorizedError: 'errors.UnauthorizedError',
  InvalidCredentialsError: 'errors.InvalidCredentialsError',
  EmailAlreadyExistsError: 'errors.EmailAlreadyExistsError',
  LessonNotRecurringError: 'errors.LessonNotRecurringError',
  LessonExceptionAlreadyExistsError: 'errors.LessonExceptionAlreadyExistsError',
  InvalidLessonExceptionError: 'errors.InvalidLessonExceptionError',
};

export function getErrorTranslationKey(error: { data?: unknown }): string {
  const data = error.data as Record<string, unknown> | undefined;
  const cause = data?.cause as Record<string, unknown> | undefined;
  const errorCode = cause?.errorCode as string | undefined;

  if (errorCode && errorCode in ERROR_CODE_TO_KEY) {
    return ERROR_CODE_TO_KEY[errorCode];
  }

  return 'errors.unexpected';
}
