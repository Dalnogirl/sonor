import { Logger as LoggerPort } from '@/domain/ports/services/Logger';

export class ConsoleLogger implements LoggerPort {
  info(message: string): void {
    console.log(`${message}`);
  }
  error(message: string): void {
    console.error(`${message}`);
  }
}
