import { prisma } from '../database/prisma/client';
import { PrismaLessonRepository } from '../database/repositories/PrismaLessonRepository';
import { PrismaUserRepository } from '../database/repositories/PrismaUserRepository';
import { PrismaLessonExceptionRepository } from '../database/repositories/PrismaLessonExceptionRepository';

export const createRepositories = () => {
  return {
    userRepository: new PrismaUserRepository(prisma),
    lessonRepository: new PrismaLessonRepository(prisma),
    lessonExceptionRepository: new PrismaLessonExceptionRepository(prisma),
  };
};

export type Repositories = ReturnType<typeof createRepositories>;
