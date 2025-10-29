import { User } from "@/domain/models/User";
import { UserRepository } from "@/domain/ports/repositories/UserRepository";

export class ListUsersUseCase {
    constructor(private userRepository: UserRepository) {}

    async execute(): Promise<User[]> {
        console.log("Listing all users...");
        return this.userRepository.findAll();
    }
}