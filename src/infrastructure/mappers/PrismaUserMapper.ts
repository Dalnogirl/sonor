import { User } from '@/domain/models/User';

/**
 * Type representing a Prisma user record structure.
 * Used across all repositories that need to map Prisma users to domain entities.
 */
export type PrismaUserRecord = {
  id: string;
  name: string;
  email: string;
  password: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * PrismaUserMapper - Infrastructure Mapper
 *
 * Single source of truth for mapping Prisma user records to User domain entities.
 *
 * **Architecture Pattern: Mapper Pattern**
 * - Centralizes Prisma → Domain conversion logic
 * - Prevents duplication across repositories (DRY principle)
 * - Single place to update if User construction changes
 *
 * **Why Static Methods?**
 * - No state needed - pure transformation
 * - Easy to use across repositories without DI
 * - Performance - no instance creation overhead
 * - Consistent with other infrastructure mappers
 *
 * **Usage:**
 * ```typescript
 * const user = PrismaUserMapper.toDomain(prismaUser);
 * const users = PrismaUserMapper.toDomainArray(prismaUsers);
 * ```
 *
 * **Note on Performance:**
 * This mapper is used in repositories that join User data with other entities
 * (e.g., LessonRepository). While this creates coupling, it's a pragmatic trade-off
 * for performance in a monolith with local database.
 *
 * In a microservices architecture, repositories would return entity data with
 * user IDs only, and use cases would hydrate users via service calls.
 */
export class PrismaUserMapper {
  /**
   * Maps a single Prisma user record to User domain entity.
   *
   * @param prismaUser - Prisma user record from database
   * @returns User domain entity
   *
   * @example
   * ```typescript
   * const prismaUser = await prisma.user.findUnique({ where: { id } });
   * const user = PrismaUserMapper.toDomain(prismaUser);
   * ```
   */
  static toDomain(prismaUser: PrismaUserRecord): User {
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

  /**
   * Maps an array of Prisma user records to User domain entities.
   *
   * @param prismaUsers - Array of Prisma user records
   * @returns Array of User domain entities
   *
   * @example
   * ```typescript
   * const prismaUsers = await prisma.user.findMany();
   * const users = PrismaUserMapper.toDomainArray(prismaUsers);
   * ```
   */
  static toDomainArray(prismaUsers: PrismaUserRecord[]): User[] {
    return prismaUsers.map((prismaUser) => this.toDomain(prismaUser));
  }
}
