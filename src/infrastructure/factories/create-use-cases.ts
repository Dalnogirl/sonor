import { ListUsersUseCase } from "@/application/use-cases/user/ListUsersUseCase";
import { Repositories } from "./create-repositories";

export const createUseCases = (repositories: Repositories) => {
    return {
        user: {
            listUsersUseCase: new ListUsersUseCase(repositories.userRepository),
            // Future: createUserUseCase, updateUserUseCase, deleteUserUseCase, etc.
        }
    };
}