import { User } from "@/domain/models/User";
import { UserRepository } from "@/domain/ports/repositories/UserRepository";

export class MockUserRepository implements UserRepository {
    private users: User[] = [
        new User("1", "Alice", "alice@example.com", new Date(), new Date()),
        new User("2", "Bob", "bob@example.com", new Date(), new Date()),
        new User("3", "Charlie", "charlie@example.com", new Date(), new Date()),
    ];

    async findAll(): Promise<User[]> {
        await this.simulateDelay(100);
        return Promise.resolve(this.users);
    }

    async findById(id: string): Promise<User | null> {
        await this.simulateDelay(100);
        const user = this.users.find(user => user.id === id);
        return Promise.resolve(user ? user : null);
    }


    private async simulateDelay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}