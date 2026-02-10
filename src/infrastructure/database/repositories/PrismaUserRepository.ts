import { PaginationParams } from '@/domain/models/PaginationParams';
import { User } from '@/domain/models/User';
import { UserRepository } from '@/domain/ports/repositories/UserRepository';
import { PrismaClient } from '@prisma/client';
import { PrismaUserMapper } from '@/infrastructure/mappers/PrismaUserMapper';
import { handlePrismaError } from '../utils/handlePrismaError';

export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(paginationParams: PaginationParams): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      skip: paginationParams.offset,
      take: paginationParams.limit,
    });
    return PrismaUserMapper.toDomainArray(users);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? PrismaUserMapper.toDomain(user) : null;
  }

  async create(user: User): Promise<User> {
    try {
      const created = await this.prisma.user.create({
        data: PrismaUserMapper.toPrisma(user),
      });
      return PrismaUserMapper.toDomain(created);
    } catch (error) {
      throw handlePrismaError(error, { entity: 'user', id: user.email });
    }
  }

  async update(user: User): Promise<User> {
    try {
      const updated = await this.prisma.user.update({
        where: { id: user.id },
        data: PrismaUserMapper.toPrisma(user),
      });
      return PrismaUserMapper.toDomain(updated);
    } catch (error) {
      throw handlePrismaError(error, { entity: 'user', id: user.id });
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      throw handlePrismaError(error, { entity: 'user', id });
    }
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
