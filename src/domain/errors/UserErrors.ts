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
