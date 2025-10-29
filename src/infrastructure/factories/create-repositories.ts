import { MockUserRepository } from "../database/repositories/MockUserRepository";

export const createRepositories = () => {
    return {
        userRepository: new MockUserRepository(),
        // Future: postRepository, commentRepository, etc.
    };
}

export type Repositories = ReturnType<typeof createRepositories>;