import { prisma } from "../database/prisma/client";
import { PrismaUserRepository } from "../database/repositories/PrismaUserRepository";

export const createRepositories = () => {
    return {
        userRepository: new PrismaUserRepository(prisma),
        // Future: postRepository, commentRepository, etc.
    };
}

export type Repositories = ReturnType<typeof createRepositories>;