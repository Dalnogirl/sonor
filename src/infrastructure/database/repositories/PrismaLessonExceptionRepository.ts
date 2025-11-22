import {
  LessonException,
  ExceptionType,
  LessonModifications,
} from '@/domain/models/LessonException';
import { LessonExceptionRepository } from '@/domain/ports/repositories/LessonExceptionRepository';
import { PrismaClient, Prisma } from '@prisma/client';

/**
 * PrismaLessonExceptionRepository
 *
 * Maps between domain LessonException and Prisma persistence model.
 * Handles serialization of modifications JSON.
 *
 * **Design Principles:**
 * - Dependency Inversion: Implements domain port
 * - Single Responsibility: Only persistence mapping
 * - Information Expert: Knows how to map domain ↔ persistence
 */
export class PrismaLessonExceptionRepository
  implements LessonExceptionRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  async findByLessonId(lessonId: string): Promise<LessonException[]> {
    const prismaExceptions = await this.prisma.lessonException.findMany({
      where: { lessonId },
      orderBy: { originalDate: 'asc' },
    });

    return prismaExceptions.map((e) => this.toDomain(e));
  }

  async findByLessonAndDate(
    lessonId: string,
    originalDate: Date
  ): Promise<LessonException | null> {
    const prismaException = await this.prisma.lessonException.findUnique({
      where: {
        lessonId_originalDate: {
          lessonId,
          originalDate,
        },
      },
    });

    return prismaException ? this.toDomain(prismaException) : null;
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<LessonException[]> {
    const prismaExceptions = await this.prisma.lessonException.findMany({
      where: {
        originalDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { originalDate: 'asc' },
    });

    return prismaExceptions.map((e) => this.toDomain(e));
  }

  async findByLessonIdsAndDateRange(
    lessonIds: string[],
    startDate: Date,
    endDate: Date
  ): Promise<LessonException[]> {
    if (lessonIds.length === 0) {
      return [];
    }

    const prismaExceptions = await this.prisma.lessonException.findMany({
      where: {
        lessonId: {
          in: lessonIds,
        },
        originalDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { originalDate: 'asc' },
    });

    return prismaExceptions.map((e) => this.toDomain(e));
  }

  async create(exception: LessonException): Promise<LessonException> {
    await this.prisma.lessonException.create({
      data: this.toPersistence(exception),
    });

    return exception;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.lessonException.delete({
      where: { id },
    });
  }

  async exists(lessonId: string, originalDate: Date): Promise<boolean> {
    const count = await this.prisma.lessonException.count({
      where: {
        lessonId,
        originalDate,
      },
    });

    return count > 0;
  }

  private toDomain(prismaException: {
    id: string;
    lessonId: string;
    originalDate: Date;
    type: string;
    newDate: Date | null;
    modifications: unknown;
    createdAt: Date;
  }): LessonException {
    const type = this.parseExceptionType(prismaException.type);
    const modifications = this.parseModifications(
      prismaException.modifications
    );

    return new LessonException(
      prismaException.id,
      prismaException.lessonId,
      prismaException.originalDate,
      type,
      prismaException.newDate,
      modifications,
      prismaException.createdAt
    );
  }

  private toPersistence(exception: LessonException) {
    return {
      id: exception.id,
      lessonId: exception.lessonId,
      originalDate: exception.originalDate,
      type: exception.type,
      newDate: exception.newDate,
      modifications: exception.modifications
        ? this.serializeModifications(exception.modifications)
        : Prisma.DbNull,
      createdAt: exception.createdAt,
    };
  }

  private parseExceptionType(type: string): ExceptionType {
    switch (type) {
      case 'SKIP':
        return ExceptionType.SKIP;
      case 'RESCHEDULE':
        return ExceptionType.RESCHEDULE;
      case 'MODIFY':
        return ExceptionType.MODIFY;
      default:
        throw new Error(`Unknown exception type: ${type}`);
    }
  }

  private parseModifications(
    json: unknown
  ): LessonModifications | null {
    if (!json || typeof json !== 'object') {
      return null;
    }

    const data = json as Record<string, unknown>;

    return {
      title: data.title as string | undefined,
      description: data.description as string | undefined,
      startDate: data.startDate
        ? new Date(data.startDate as string)
        : undefined,
      endDate: data.endDate ? new Date(data.endDate as string) : undefined,
      teacherIds: data.teacherIds as string[] | undefined,
      pupilIds: data.pupilIds as string[] | undefined,
    };
  }

  private serializeModifications(modifications: LessonModifications) {
    return {
      title: modifications.title,
      description: modifications.description,
      startDate: modifications.startDate?.toISOString(),
      endDate: modifications.endDate?.toISOString(),
      teacherIds: modifications.teacherIds,
      pupilIds: modifications.pupilIds,
    };
  }
}
