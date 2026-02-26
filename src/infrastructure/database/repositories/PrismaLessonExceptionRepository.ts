import { LessonException } from '@/domain/models/LessonException';
import { LessonExceptionRepository } from '@/domain/ports/repositories/LessonExceptionRepository';
import { PrismaClient } from '@prisma/client';
import { handlePrismaError } from '../utils/handlePrismaError';

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
    try {
      await this.prisma.lessonException.create({
        data: {
          id: exception.id,
          lessonId: exception.lessonId,
          originalDate: exception.originalDate,
          type: 'SKIP',
          createdAt: exception.createdAt,
        },
      });
      return exception;
    } catch (error) {
      throw handlePrismaError(error, { entity: 'lessonException', id: exception.id });
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.lessonException.delete({
        where: { id },
      });
    } catch (error) {
      throw handlePrismaError(error, { entity: 'lessonException', id });
    }
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
    createdAt: Date;
  }): LessonException {
    return new LessonException(
      prismaException.id,
      prismaException.lessonId,
      prismaException.originalDate,
      prismaException.createdAt
    );
  }
}
