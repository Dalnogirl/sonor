# Repository Integration Tests

## Overview

This directory contains **integration tests** for repository implementations. These tests run against a **real PostgreSQL database** to ensure that:

1. Repository implementations correctly interact with Prisma ORM
2. Database constraints are properly enforced
3. Complex queries (joins, filters, pagination) work as expected
4. Domain entity mapping is accurate

---

## Architecture Decision: Integration Tests vs. Unit Tests with Mocks

### Why Integration Tests?

Following **hexagonal architecture** principles, we use **real database integration tests** for repositories instead of mocks:

#### ✅ Advantages of Integration Tests:
- **Catch real database issues** - Type mismatches, constraint violations, migration problems
- **Test actual Prisma behavior** - Including JSON parsing, relations, transactions
- **Confidence in production** - If tests pass, code works with real database
- **No brittle mocks** - Don't break when Prisma internals change
- **Test complex queries** - Joins, aggregations, raw SQL
- **Verify schema migrations** - Ensures Prisma schema matches database

#### ❌ Why Not Mock?
- Repositories are **infrastructure adapters** - their job is to talk to the database
- Mocking Prisma creates **test theater** - tests pass but production might fail
- Mocks don't catch **foreign key issues, constraint violations, or type mismatches**
- **Single Responsibility Principle** - repositories have one job (database interaction), test that job directly

### When to Mock vs. When to Use Real Database

| Layer | Approach | Reason |
|-------|----------|--------|
| **Domain Models** | Pure unit tests (no mocks) | No external dependencies |
| **Use Cases** | Mock repositories (test business logic) | Focus on orchestration, not infrastructure |
| **Repositories** | Real database (integration tests) | Infrastructure layer - test real integration |
| **tRPC Routers** | Mock use cases | Test HTTP layer, not business logic |

---

## Test Database Setup

### Prerequisites

1. **PostgreSQL running** - Use Docker for test database:
   ```bash
   docker-compose up -d postgres
   ```

2. **Environment variables** - Ensure `.env` has test database URL:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/test_db"
   ```

3. **Migrations applied**:
   ```bash
   npx prisma migrate dev
   ```

---

## Test Structure Pattern

All repository tests follow this structure:

```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { cleanDatabase } from './test-helpers';
import { YourRepository } from '@/infrastructure/database/repositories/YourRepository';

describe('YourRepository Integration Tests', () => {
  let prisma: PrismaClient;
  let repository: YourRepository;

  beforeAll(async () => {
    // Setup: Connect to test database
    prisma = new PrismaClient();
    repository = new YourRepository(prisma);

    // Clean database once at start
    await cleanDatabase(prisma);
  });

  afterAll(async () => {
    // Cleanup: Disconnect from database
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Isolate tests: Clean database before each test
    await cleanDatabase(prisma);
  });

  describe('create', () => {
    it('should create an entity in the database', async () => {
      // Arrange
      const entity = createTestEntity();

      // Act
      const created = await repository.create(entity);

      // Assert
      expect(created).toBeDefined();
      expect(created.id).toBe(entity.id);
    });
  });
});
```

---

## Test Helpers

### `cleanDatabase(prisma: PrismaClient)`

**Purpose:** Dynamically truncates all tables in the database.

**How it works:**
1. Queries PostgreSQL system catalog for all table names in `public` schema
2. Builds a `TRUNCATE TABLE ... CASCADE` statement
3. Executes raw SQL to wipe all data

**Why this approach?**
- ✅ **Schema-agnostic** - No need to manually list tables
- ✅ **Future-proof** - Automatically handles new tables
- ✅ **Handles foreign keys** - `CASCADE` prevents constraint errors
- ✅ **Single source of truth** - One helper for all test cleanup

**Usage:**
```typescript
beforeAll(async () => {
  await cleanDatabase(prisma);
});

beforeEach(async () => {
  await cleanDatabase(prisma);
});
```

---

## Best Practices

### 1. Test Isolation
- **Always clean database** in `beforeEach()` to prevent test pollution
- Each test should be **runnable independently**
- Don't rely on execution order

### 2. Unique Test Data
Use `crypto.randomUUID()` and timestamps for unique values:
```typescript
const user = await prisma.user.create({
  data: {
    id: crypto.randomUUID(),
    email: `test-${Date.now()}@example.com`,
    name: 'Test User',
  },
});
```

### 3. Arrange-Act-Assert Pattern
```typescript
it('should do something', async () => {
  // Arrange - Set up test data
  const input = createTestData();

  // Act - Execute the operation
  const result = await repository.operation(input);

  // Assert - Verify expectations
  expect(result).toBe(expected);
});
```

### 4. Test Domain Mapping
Verify that Prisma records are correctly mapped to domain entities:
```typescript
const created = await repository.create(domainEntity);

expect(created).toBeInstanceOf(DomainEntity);
expect(created.id).toBe(domainEntity.id);
expect(created.someValueObject).toEqual(domainEntity.someValueObject);
```

### 5. Test Foreign Key Constraints
Verify that database constraints are enforced:
```typescript
it('should enforce foreign key constraint', async () => {
  await expect(
    repository.create(entityWithInvalidForeignKey)
  ).rejects.toThrow();
});
```

---

## Running Tests

### Run all repository tests:
```bash
npm test infrastructure/database/repositories
```

### Run specific repository:
```bash
npm test PrismaUserRepository
```

### Watch mode:
```bash
npm test PrismaUserRepository -- --watch
```

---

## Common Patterns

### Testing Pagination
```typescript
it('should paginate results', async () => {
  // Create test data
  await createMultipleEntities(15);

  // Test pagination
  const page1 = await repository.findAll(new PaginationParams(1, 10));
  const page2 = await repository.findAll(new PaginationParams(2, 10));

  expect(page1).toHaveLength(10);
  expect(page2).toHaveLength(5);
});
```

### Testing Relations
```typescript
it('should load related entities', async () => {
  const parent = await createParent();
  const child = await createChild(parent.id);

  const loaded = await repository.findWithRelations(parent.id);

  expect(loaded.children).toHaveLength(1);
  expect(loaded.children[0].id).toBe(child.id);
});
```

### Testing JSON Fields (Value Objects)
```typescript
it('should serialize and deserialize JSON value objects', async () => {
  const entity = new Entity(
    'id',
    new RecurringPattern(RecurringFrequency.WEEKLY, 1, [DayOfWeek.MONDAY])
  );

  await repository.save(entity);
  const loaded = await repository.findById('id');

  expect(loaded.recurringPattern).toBeInstanceOf(RecurringPattern);
  expect(loaded.recurringPattern.frequency).toBe(RecurringFrequency.WEEKLY);
});
```

---

## Troubleshooting

### "Table does not exist"
**Solution:** Run migrations:
```bash
npx prisma migrate dev
```

### "Foreign key constraint violation"
**Solution:** Ensure `cleanDatabase()` is called in `beforeEach()` and uses `CASCADE`

### Tests are slow
**Solution:** 
- Use `beforeAll()` for one-time setup (connection)
- Consider using in-memory SQLite for faster tests (trade-off: less production-like)

### Tests interfere with each other
**Solution:** Ensure `cleanDatabase()` is called in `beforeEach()`

---

## References

- [Hexagonal Architecture](./../../../docs/architecture-decisions/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Testing Best Practices](https://testingjavascript.com/)
