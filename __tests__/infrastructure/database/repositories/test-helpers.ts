import { PrismaClient } from '@prisma/client';

/**
 * Cleans all tables in the database by truncating them with CASCADE.
 *
 * This dynamically queries all tables in the public schema and truncates them,
 * making it schema-agnostic and future-proof for new tables.
 *
 * **Safety:** Only runs on databases with '_test' suffix (Protected Variations).
 *
 * **Benefits:**
 * - No need to manually specify table names
 * - Automatically handles foreign key constraints with CASCADE
 * - Works regardless of schema changes
 * - Single source of truth for test cleanup
 *
 * **When to use:**
 * - In `beforeAll()` to ensure clean state at test suite start
 * - In `beforeEach()` for test isolation (each test gets fresh database)
 *
 * @param prisma - PrismaClient instance
 *
 * @example
 * ```typescript
 * beforeAll(async () => {
 *   prisma = new PrismaClient();
 *   await cleanDatabase(prisma);
 * });
 *
 * beforeEach(async () => {
 *   await cleanDatabase(prisma);
 * });
 * ```
 */
export async function cleanDatabase(prisma: PrismaClient): Promise<void> {
  const dbUrl = process.env.DATABASE_URL ?? '';
  // Allow: _test suffix, test_db (testcontainers), or localhost with test in path
  const isTestDb = dbUrl.includes('_test') || dbUrl.includes('test_db') || dbUrl.includes('/test');
  if (!isTestDb) {
    throw new Error(
      `Refusing to truncate non-test database. DATABASE_URL must contain 'test'. Got: ${dbUrl}`
    );
  }
  // Query all table names from PostgreSQL
  const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `;

  // Build comma-separated list of quoted table names
  const tableNames = tables.map((t) => `"${t.tablename}"`).join(', ');

  // Truncate all tables with CASCADE to handle foreign keys
  if (tableNames) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tableNames} CASCADE;`);
  }
}
