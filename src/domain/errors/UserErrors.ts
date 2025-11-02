import { DomainError } from './DomainError';

export class EmailIsAlreadyVerified extends DomainError {
  constructor(email: string) {
    super(`Email ${email} is already verified`);
  }
}

export class InvalidPasswordError extends DomainError {
  constructor() {
    super('The provided password does not meet the required criteria.');
  }
}

export class EmailAlreadyExistsError extends DomainError {
  constructor(email: string) {
    super(`The email ${email} is already registered.`);
  }
}

export class InvalidEmailError extends DomainError {
  constructor(email: string) {
    super(`The email ${email} is not a valid email address.`);
  }
}

export class UserNotFoundError extends DomainError {
  constructor(identifier: string) {
    super(`User not found: ${identifier}`);
  }
}

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super('Invalid email or password');
    // Generic message to prevent email enumeration attacks
  }
}
