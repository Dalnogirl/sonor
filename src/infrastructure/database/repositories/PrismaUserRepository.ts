import { PaginationParams } from '@/domain/models/PaginationParams';
import { User } from '@/domain/models/User';
import { UserRepository } from '@/domain/ports/repositories/UserRepository';
import { PrismaClient, User as PrismaUser } from '@prisma/client';

export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(paginationParams: PaginationParams): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      ...paginationParams.toPrisma(),
    });
    return users.map((user) => this.toDomainEntity(user));
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return this.toDomainOrNull(user);
  }

  async create(user: User): Promise<User> {
    const created = await this.prisma.user.create({ data: user });
    return this.toDomainEntity(created);
  }

  async update(user: User): Promise<User> {
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: user,
    });
    return this.toDomainEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return this.toDomainOrNull(user);
  }

  private toDomainOrNull(prismaUser: PrismaUser | null): User | null {
    if (!prismaUser) return null;
    return this.toDomainEntity(prismaUser);
  }

  private toDomainEntity(prismaUser: PrismaUser): User {
    return new User(
      prismaUser.id,
      prismaUser.name,
      prismaUser.email,
      prismaUser.createdAt,
      prismaUser.updatedAt,
      prismaUser.password,
      prismaUser.isEmailVerified
    );
  }
}
