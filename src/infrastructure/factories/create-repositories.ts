import { prisma } from '../database/prisma/client';
import { PrismaLessonRepository } from '../database/repositories/PrismaLessonRepository';
import { PrismaUserRepository } from '../database/repositories/PrismaUserRepository';

export const createRepositories = () => {
  return {
    userRepository: new PrismaUserRepository(prisma),
    lessonRepository: new PrismaLessonRepository(prisma),
  };
};

export type Repositories = ReturnType<typeof createRepositories>;
