import { PasswordHasher } from '@/domain/ports/services/PasswordHasher';
import bcrypt from 'bcryptjs';

export class BcryptPasswordHasher implements PasswordHasher {
  private saltRounds: number;
  constructor(saltRounds?: number) {
    this.saltRounds = saltRounds || 10;
  }

  async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.saltRounds);
    return await bcrypt.hash(password, salt);
  }

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}
