# Architecture Documentation

## Overview

Hexagonal Architecture (Ports & Adapters) with Next.js 15 + tRPC v11.

**Core Principle:** Business logic is framework-agnostic. Domain/Application layers have zero dependencies on Next.js, tRPC, Prisma, or React.

```
src/
├── domain/          # Pure business logic (zero external deps)
├── application/     # Use cases & DTOs
├── infrastructure/  # Repository implementations & services
├── adapters/        # tRPC routers & UI components
├── app/             # Next.js App Router (UI adapter)
├── config/          # Constants & environment
└── lib/             # Shared utilities
```

**Dependency Flow:**
```
UI → tRPC Routers → Use Cases → Domain + Ports ← Infrastructure
                                    ↑
                        Dependencies point INWARD
```

---

## 1. Domain Layer

**Location:** `src/domain/`

**Responsibility:** Pure business logic, framework-agnostic, testable without mocking.

### 1.1 Domain Models (Entities)

| File | Purpose |
|------|---------|
| `models/Lesson.ts` | Core entity with business rules: `hasTeacher()`, `delete()`, `restore()` |
| `models/User.ts` | User entity: `validateEmail()`, `validatePassword()`, `verifyEmail()` |
| `models/RecurringPattern.ts` | Value Object: `RecurringFrequency`, factory methods |
| `models/LessonException.ts` | Value Object: skip/reschedule/modify occurrences |
| `models/PaginationParams.ts` | Value Object for pagination |

**Design Decisions:**
- **IDs-only approach**: `Lesson` stores `teacherIds: string[]`, not `teachers: User[]`
- Rationale: Avoids cross-aggregate coupling, simpler persistence, microservice-ready
- Trade-off: User data fetched separately when needed

**Pattern Applied:** Information Expert (GRASP) - entities validate their own invariants

### 1.2 Domain Services

| File | Purpose |
|------|---------|
| `services/OccurrenceGeneratorService.ts` | Generates lesson occurrences from patterns, applies exceptions |
| `services/RecurrenceService.ts` | Daily/weekly/monthly date generation logic |

**When to use:** Complex multi-entity business logic that doesn't belong to a single entity.

### 1.3 Domain Ports (Interfaces)

**Repositories:**
- `ports/repositories/UserRepository.ts`
- `ports/repositories/LessonRepository.ts`
- `ports/repositories/LessonExceptionRepository.ts`

**Services:**
- `ports/services/DateService.ts` - Date operations interface
- `ports/services/PasswordHasher.ts` - `hash()`, `verify()`
- `ports/services/Logger.ts` - Logging abstraction

**Mappers:**
- `ports/mappers/UserMapperPort.ts`
- `ports/mappers/LessonMapperPort.ts`

**Pattern Applied:** Dependency Inversion Principle - domain defines contracts, infrastructure implements.

### 1.4 Domain Errors

```typescript
// domain/errors/DomainError.ts
export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}
```

| Error | Location |
|-------|----------|
| `LessonNotFoundError` | `errors/LessonErrors.ts` |
| `EmailAlreadyExistsError`, `InvalidCredentialsError` | `errors/UserErrors.ts` |
| `UnauthorizedError` | `errors/AuthorizationErrors.ts` |

---

## 2. Application Layer

**Location:** `src/application/`

**Responsibility:** Orchestrate workflows, coordinate domain + infrastructure via ports.

### 2.1 Use Cases

**Auth:**
- `use-cases/auth/RegisterUseCase.ts` - Check duplicate email → hash password → create User → persist
- `use-cases/auth/LoginUseCase.ts` - Validate credentials (timing-attack safe)

**Lesson:**
- `use-cases/lesson/CreateLesson.ts` - Call `Lesson.create()` → persist
- `use-cases/lesson/DeleteLesson.ts` - Authorization check → soft delete
- `use-cases/lesson/GetMyTeachingLessonsForPeriod.ts` - Fetch + generate occurrences
- `use-cases/lesson/SkipLessonOccurrence.ts` - Create SKIP exception
- `use-cases/lesson/RescheduleLessonOccurrence.ts` - Create RESCHEDULE exception

**Pattern Applied:** Controller (GRASP) - use cases coordinate workflows without containing business rules.

### 2.2 DTOs

**Structure:**
```
dto/
├── lesson/
│   ├── CreateLessonRequestDTO.ts        # Type definition
│   ├── CreateLessonRequestDTO.schema.ts # Zod validation
│   ├── LessonResponseDTO.ts
│   └── ...
├── user/
│   ├── ListUserRequestDTO.ts
│   └── UserSummaryDTO.ts
└── auth/
    ├── RegisterDTO.ts
    └── LoginDTO.ts
```

**Zod Schema Co-location:**
```typescript
// CreateLessonRequestDTO.schema.ts
export const createLessonRequestSchema = z.object({
  title: z.string().min(1),
  teacherIds: z.array(z.string()).min(1),
  // ...
}) satisfies z.ZodType<CreateLessonRequestDTO>;

// Type assertion prevents schema-DTO drift
```

---

## 3. Infrastructure Layer

**Location:** `src/infrastructure/`

**Responsibility:** Implement domain ports with concrete technologies.

### 3.1 Repository Implementations

| Implementation | Port | Technology |
|----------------|------|------------|
| `PrismaUserRepository` | `UserRepository` | Prisma |
| `PrismaLessonRepository` | `LessonRepository` | Prisma |
| `PrismaLessonExceptionRepository` | `LessonExceptionRepository` | Prisma |

**Data Mapping Pattern:**
```typescript
// PrismaLessonRepository.ts
private toDomain(prismaLesson: {...}): Lesson {
  // Map join tables to ID arrays
  const teacherIds = prismaLesson.teachers.map(t => t.userId);
  return new Lesson(prismaLesson.id, ..., teacherIds, ...);
}

async create(lesson: Lesson): Promise<Lesson> {
  await this.prisma.lesson.create({
    data: {
      teachers: {
        create: lesson.teacherIds.map(id => ({
          user: { connect: { id } }
        }))
      }
    }
  });
}
```

### 3.2 Service Implementations

| Implementation | Port |
|----------------|------|
| `BcryptPasswordHasher` | `PasswordHasher` |
| `DayjsDateService` | `DateService` |
| `Logger` | `Logger` |

### 3.3 Factories (Composition Root)

**`factories/create-repositories.ts`:**
```typescript
export const createRepositories = () => ({
  userRepository: new PrismaUserRepository(prisma),
  lessonRepository: new PrismaLessonRepository(prisma),
  lessonExceptionRepository: new PrismaLessonExceptionRepository(prisma),
});
```

**`factories/create-use-cases.ts`:**
```typescript
export const createUseCases = (repositories: Repositories) => {
  const dateService = new DayjsDateService();
  const recurrenceService = new RecurrenceService(dateService);

  return {
    lesson: {
      createLesson: new CreateLesson(repositories.lessonRepository),
      deleteLesson: new DeleteLesson(repositories.lessonRepository, logger),
      // ...
    }
  };
};
```

**Pattern Applied:** Creator (GRASP) - factories encapsulate object composition.

---

## 4. Adapters Layer

**Location:** `src/adapters/`

**Responsibility:** Connect external world to business logic. Thin layer - no business rules.

### 4.1 tRPC Adapter

**Setup:**
- `trpc/init.ts` - tRPC initialization
- `trpc/context.ts` - Request context with DI
- `trpc/procedures/public.ts` - No auth required
- `trpc/procedures/protected.ts` - Session required

**Routers:**
- `routers/_app.ts` - Main router (combines all)
- `routers/auth.router.ts` - `register`, `login`
- `routers/lesson.router.ts` - All lesson operations

**Context Wiring:**
```typescript
// context.ts
export const createTRPCContext = async () => {
  const repositories = createRepositories();
  const useCases = createUseCases(repositories);
  const session = await getServerSession(authOptions);

  return { session, useCases, repositories };
};
```

**Router Pattern:**
```typescript
// lesson.router.ts - THIN delegation
create: protectedProcedure
  .input(createLessonRequestSchema)
  .mutation(({ ctx, input }) =>
    ctx.useCases.lesson.createLesson.execute(input)
  ),
```

### 4.2 UI Adapter

**Hooks (Feature-organized):**
```
adapters/ui/
├── hooks/
│   ├── useUsers.ts
│   └── useIsMobile.ts
└── features/lessons/hooks/
    ├── useCreateLessonForm.ts
    ├── useDailyLessons.ts
    └── useLessonsViewState.ts
```

**Components:**
```
adapters/ui/components/
├── lessons/
│   ├── CreateLessonModal.tsx
│   ├── fields/              # Modular form fields
│   │   ├── LessonBasicFields.tsx
│   │   └── RecurringPatternFields.tsx
│   └── DailyLessonsView.tsx
├── shared/
│   ├── Navbar.tsx
│   └── withPrivatePage.tsx  # HOC for protected routes
└── users/
    └── UserList.tsx
```

**Form Mapper:**
```typescript
// mappers/lesson-form.mapper.ts
// Transforms UI form values → Application DTO
LessonFormMapper.toCreateDTO(formValues): CreateLessonRequestDTO
```

---

## 5. Next.js App Layer

**Location:** `src/app/`

**Note:** Follows Next.js conventions but conceptually part of Adapter layer.

```
app/
├── layout.tsx
├── page.tsx
├── api/
│   ├── trpc/[trpc]/route.ts  # tRPC HTTP handler
│   └── auth/[...nextauth]/route.ts
└── (routes)/
```

---

## Layer Test Strategy

| Layer | Test Type | Dependencies |
|-------|-----------|--------------|
| Domain | Unit | None (pure functions) |
| Application | Integration | Mocked repositories |
| Infrastructure | Integration | Real DB or in-memory |
| tRPC | E2E-style | Full stack |
| UI | Component | Mocked tRPC |

---

## Anti-Patterns Avoided

| Anti-Pattern | Solution |
|--------------|----------|
| Domain importing Prisma | Repository pattern via ports |
| Use case throwing `TRPCError` | Throw domain error, map in router |
| Business logic in tRPC router | Delegate to use case |
| Business rules in React component | Call tRPC, let use case validate |
