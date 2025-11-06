import { Lesson } from '@/domain/models/Lesson';
import {
  RecurringPattern,
  RecurringFrequency,
} from '@/domain/models/RecurringPattern';
import { LessonRepository } from '@/domain/ports/repositories/LessonRepository';
import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaUserMapper } from '@/infrastructure/mappers/PrismaUserMapper';

type PrismaLessonWithRelations = Prisma.LessonGetPayload<{
  include: {
    teachers: {
      include: {
        user: true;
      };
    };
    pupils: {
      include: {
        user: true;
      };
    };
  };
}>;

export class PrismaLessonRepository implements LessonRepository {
  constructor(private readonly prisma: PrismaClient) {}

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
          include: {
            user: true,
          },
        },
        pupils: {
          include: {
            user: true,
          },
        },
      },
    });

    return prismaLessons.map((lesson) => this.toDomain(lesson));
  }

  async createLesson(data: Lesson): Promise<Lesson> {
    const prismaLesson = await this.prisma.lesson.create({
      data: {
        id: data.id,
        title: data.title,
        startDate: data.startDate,
        endDate: data.endDate,
        description: data.description,
        teachers: {
          create: data.teachers.map((teacher) => ({
            user: {
              connect: { id: teacher.id },
            },
          })),
        },
        pupils: {
          create: data.pupils.map((pupil) => ({
            user: {
              connect: { id: pupil.id },
            },
          })),
        },
      },
    });

    return this.toDomain(prismaLesson);
  }

  private toDomain(prismaLesson: PrismaLessonWithRelations): Lesson {
    const teachers = prismaLesson.teachers.map((lt) =>
      PrismaUserMapper.toDomain(lt.user)
    );
    const pupils = prismaLesson.pupils.map((lp) =>
      PrismaUserMapper.toDomain(lp.user)
    );
    const recurringPattern = this.parseRecurringPattern(
      prismaLesson.recurringPattern
    );

    return new Lesson(
      prismaLesson.id,
      prismaLesson.title,
      teachers,
      prismaLesson.createdAt,
      prismaLesson.updatedAt,
      pupils,
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
}
