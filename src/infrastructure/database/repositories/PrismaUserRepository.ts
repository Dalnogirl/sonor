import { PaginationParams } from '@/domain/models/PaginationParams';
import { User } from '@/domain/models/User';
import { UserRepository } from '@/domain/ports/repositories/UserRepository';
import { PrismaClient } from '@prisma/client';
import { PrismaUserMapper } from '@/infrastructure/mappers/PrismaUserMapper';

export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(paginationParams: PaginationParams): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      ...paginationParams.toPrisma(),
    });
    return PrismaUserMapper.toDomainArray(users);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? PrismaUserMapper.toDomain(user) : null;
  }

  async create(user: User): Promise<User> {
    const created = await this.prisma.user.create({
      data: PrismaUserMapper.toPrisma(user),
    });
    return PrismaUserMapper.toDomain(created);
  }

  async update(user: User): Promise<User> {
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: PrismaUserMapper.toPrisma(user),
    });
    return PrismaUserMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? PrismaUserMapper.toDomain(user) : null;
  }

  async findByIds(ids: string[]): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: { id: { in: ids } },
    });
    return PrismaUserMapper.toDomainArray(users);
  }
}
