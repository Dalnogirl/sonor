import { EmailIsAlreadyVerified } from '../errors';

export class User {
  public readonly id: string;
  public name: string;
  public email: string;
  public readonly createdAt: Date;
  public updatedAt: Date;
  private _password: string;
  public isEmailVerified: boolean;

  constructor(
    id: string,
    name: string,
    email: string,
    createdAt: Date,
    updatedAt: Date,
    password: string,
    isEmailVerified: boolean
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this._password = password;
    this.isEmailVerified = isEmailVerified;
  }

  get password(): string {
    return this._password;
  }

  static validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  isEmailValid(): boolean {
    return User.validateEmail(this.email);
  }

  static validatePassword(password: string): boolean {
    // Password must be at least 8 characters long and contain at least one letter, one number and one special character
    // Using positive lookaheads to ensure all required character types are present
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;

    return passwordRegex.test(password);
  }

  verifyEmail() {
    if (this.isEmailVerified) {
      throw new EmailIsAlreadyVerified(this.email);
    }

    this.isEmailVerified = true;
    this.updatedAt = new Date();
  }

  static createWithDefaults(
    id: string,
    name: string,
    email: string,
    password: string
  ): User {
    const now = new Date();
    return new User(id, name, email, now, now, password, false);
  }
}
