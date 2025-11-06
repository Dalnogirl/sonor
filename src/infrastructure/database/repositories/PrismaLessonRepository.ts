import { Lesson } from '@/domain/models/Lesson';
import {
  RecurringPattern,
  RecurringFrequency,
} from '@/domain/models/RecurringPattern';
import { LessonRepository } from '@/domain/ports/repositories/LessonRepository';
import { PrismaClient, Prisma } from '@prisma/client';

/**
 * PrismaLessonRepository
 *
 * **IDs-Only Approach**
 * - Works with user IDs directly, no User object hydration
 * - Simpler mapping - just IDs from join tables
 * - Microservice-ready pattern
 * - More queries, but clearer aggregate boundaries
 */
export class PrismaLessonRepository implements LessonRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Lesson | null> {
    const prismaLesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        teachers: {
          select: {
            userId: true,
          },
        },
        pupils: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!prismaLesson) {
      return null;
    }

    return this.toDomain(prismaLesson);
  }

  async findMyTeachingLessonsForPeriod(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Lesson[]> {
    const prismaLessons = await this.prisma.lesson.findMany({
      where: {
        AND: [
          { teachers: { some: { userId } } },
          { startDate: { gte: startDate } },
          { endDate: { lte: endDate } },
        ],
      },
      include: {
        teachers: {
          select: {
            userId: true,
          },
        },
        pupils: {
          select: {
            userId: true,
          },
        },
      },
    });

    return prismaLessons.map((lesson) => this.toDomain(lesson));
  }

  async create(lesson: Lesson): Promise<Lesson> {
    await this.prisma.lesson.create({
      data: {
        id: lesson.id,
        title: lesson.title,
        startDate: lesson.startDate,
        endDate: lesson.endDate,
        description: lesson.description,
        recurringPattern: lesson.recurringPattern
          ? this.serializeRecurringPattern(lesson.recurringPattern)
          : Prisma.DbNull,
        teachers: {
          create: lesson.teacherIds.map((teacherId) => ({
            user: {
              connect: { id: teacherId },
            },
          })),
        },
        pupils: {
          create: lesson.pupilIds.map((pupilId) => ({
            user: {
              connect: { id: pupilId },
            },
          })),
        },
      },
    });

    return lesson;
  }

  private toDomain(prismaLesson: {
    id: string;
    title: string;
    startDate: Date;
    endDate: Date;
    description: string | null;
    recurringPattern: unknown;
    createdAt: Date;
    updatedAt: Date;
    teachers: Array<{ userId: string }>;
    pupils: Array<{ userId: string }>;
  }): Lesson {
    const teacherIds = prismaLesson.teachers.map((t) => t.userId);
    const pupilIds = prismaLesson.pupils.map((p) => p.userId);
    const recurringPattern = this.parseRecurringPattern(
      prismaLesson.recurringPattern
    );

    return new Lesson(
      prismaLesson.id,
      prismaLesson.title,
      teacherIds,
      prismaLesson.createdAt,
      prismaLesson.updatedAt,
      pupilIds,
      prismaLesson.startDate,
      prismaLesson.endDate,
      prismaLesson.description ?? undefined,
      recurringPattern
    );
  }

  private parseRecurringPattern(json: unknown): RecurringPattern | undefined {
    if (!json || typeof json !== 'object') {
      return undefined;
    }

    const data = json as {
      frequency: RecurringFrequency;
      interval: number;
      daysOfWeek?: number[];
      endDate?: string;
      occurrences?: number;
    };

    return new RecurringPattern(
      data.frequency,
      data.interval,
      data.daysOfWeek,
      data.endDate ? new Date(data.endDate) : null,
      data.occurrences ?? null
    );
  }

  private serializeRecurringPattern(pattern: RecurringPattern) {
    return {
      frequency: pattern.frequency,
      interval: pattern.interval,
      daysOfWeek: pattern.daysOfWeek,
      endDate: pattern.endDate?.toISOString(),
      occurrences: pattern.occurrences,
    };
  }
}
