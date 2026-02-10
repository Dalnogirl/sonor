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
      where: { id, deletedAt: null },
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
          { deletedAt: null },
          { teachers: { some: { userId } } },
          {
            OR: [
              // Non-recurring lessons: startDate within period
              {
                recurringPattern: { equals: Prisma.DbNull },
                startDate: { gte: startDate, lte: endDate },
              },
              // Recurring lessons: started before period ends
              // (OccurrenceGeneratorService will filter by recurringPattern.endDate)
              {
                NOT: { recurringPattern: { equals: Prisma.JsonNull } },
                startDate: { lte: endDate },
              },
            ],
          },
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

  async save(lesson: Lesson): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.lessonTeacher.deleteMany({ where: { lessonId: lesson.id } }),
      this.prisma.lessonPupil.deleteMany({ where: { lessonId: lesson.id } }),
      this.prisma.lesson.update({
        where: { id: lesson.id },
        data: {
          title: lesson.title,
          description: lesson.description,
          startDate: lesson.startDate,
          endDate: lesson.endDate,
          recurringPattern: lesson.recurringPattern
            ? this.serializeRecurringPattern(lesson.recurringPattern)
            : Prisma.DbNull,
          deletedAt: lesson.deletedAt ?? null,
          updatedAt: lesson.updatedAt,
          teachers: {
            create: lesson.teacherIds.map((teacherId) => ({
              user: { connect: { id: teacherId } },
            })),
          },
          pupils: {
            create: lesson.pupilIds.map((pupilId) => ({
              user: { connect: { id: pupilId } },
            })),
          },
        },
      }),
    ]);
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
    deletedAt: Date | null;
    teachers: Array<{ userId: string }>;
    pupils: Array<{ userId: string }>;
  }): Lesson {
    const teacherIds = prismaLesson.teachers.map((t) => t.userId);
    const pupilIds = prismaLesson.pupils.map((p) => p.userId);
    const recurringPattern = this.parseRecurringPattern(
      prismaLesson.recurringPattern
    );

    return new Lesson({
      id: prismaLesson.id,
      title: prismaLesson.title,
      teacherIds,
      pupilIds,
      startDate: prismaLesson.startDate,
      endDate: prismaLesson.endDate,
      createdAt: prismaLesson.createdAt,
      updatedAt: prismaLesson.updatedAt,
      description: prismaLesson.description ?? undefined,
      recurringPattern,
      deletedAt: prismaLesson.deletedAt ?? undefined,
    });
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
