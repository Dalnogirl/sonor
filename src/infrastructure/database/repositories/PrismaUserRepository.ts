import { User } from '@/domain/models/User';
import { UserRepository } from '@/domain/ports/repositories/UserRepository';
import { PrismaClient } from '@prisma/client';

export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaClient) {}

  findAll(): Promise<User[]> {
    return this.prisma.user
      .findMany()
      .then((users) =>
        users.map(
          (user) =>
            new User(
              user.id,
              user.name,
              user.email,
              user.createdAt,
              user.updatedAt
            )
        )
      );
  }
  findById(id: string): Promise<User | null> {
    throw new Error('Method not implemented.');
  }
}
