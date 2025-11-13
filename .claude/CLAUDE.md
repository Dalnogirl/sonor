# Project: Hexagonal Architecture Next.js + tRPC Application

**Framework:** Next.js 15 (App Router) + tRPC v11

## Communication Style
- Be critical, sacrifice grammar for clarity/conciseness
- Use GRASP, SOLID, patterns, best-practices - **always mention them explicitly**
- Educate on architectural/code quality topics, not just implement
- Guide user to solutions instead of just providing them
- Encourage TDD when possible, provide test code
- Only add comments when absolutely necessary

## Architectural Principles

### Core Principles
1. **Business logic is framework-agnostic** - Domain/application layers don't depend on Next.js/tRPC
2. **Depend on interfaces, not implementations** (Dependency Inversion Principle)
3. **Adapters handle framework concerns** - tRPC routers, API routes, React components are adapters
4. **Inversion of control** - Business logic doesn't know about HTTP, databases, UI

### Project Structure

```
src/
├── app/                    # Next.js App Router (UI Adapter - framework conventions)
├── domain/                 # Pure business logic (no external deps)
│   ├── models/            # Entities & Value Objects
│   ├── services/          # Domain services
│   └── ports/             # Interfaces (repositories, services)
├── application/           # Use Cases (application orchestration)
│   ├── use-cases/
│   └── dto/
├── infrastructure/        # Framework & external implementations
│   ├── database/
│   │   └── repositories/
│   ├── email/
│   └── factories/         # Dependency wiring
└── adapters/
    ├── trpc/              # tRPC adapters (API layer)
    └── ui/                # Reusable UI components/hooks
```

## Layer Rules

### Domain Layer (`domain/`)
- ✅ Pure TypeScript classes/interfaces
- ✅ Testable with zero mocking
- ❌ NO imports from `infrastructure/`, `adapters/`, `application/`
- ❌ NO framework dependencies (Next.js, tRPC, Prisma, React)

### Application Layer (`application/`)
- ✅ Orchestrate business workflows (use cases)
- ✅ Depend on domain layer (models, ports)
- ❌ NO dependencies on infrastructure/adapters
- ❌ NO framework-specific code

### Infrastructure Layer (`infrastructure/`)
- ✅ Implement interfaces from `domain/ports/`
- ✅ Handle tech-specific concerns (SQL, HTTP, file system)
- ✅ Map between domain models and persistence models

### Adapters Layer (`adapters/`)
- ✅ Connect external world to business logic
- ✅ tRPC routers: thin layer calling use cases
- ✅ UI components: presentation logic only
- ❌ NO business logic in routers/components

## Dependency Flow
UI → tRPC Routers → Use Cases → Domain + Ports ← Infrastructure

**Key:** Arrows point inward (Dependency Inversion Principle)

## Dependency Injection & Wiring

### Factory Pattern (Recommended)

**Infrastructure factories create & wire dependencies:**

```typescript
// infrastructure/factories/create-repositories.ts
export function createRepositories(prisma: PrismaClient) {
  return {
    userRepository: new PrismaUserRepository(prisma),
    postRepository: new PrismaPostRepository(prisma),
  };
}

// infrastructure/factories/create-use-cases.ts
export function createPostUseCases(repositories: ReturnType<typeof createRepositories>) {
  return {
    createPost: new CreatePostUseCase(repositories.postRepository),
    publishPost: new PublishPostUseCase(
      repositories.postRepository,
      new ResendEmailService(),
    ),
  };
}
```

**Applies:** Creator pattern (factory creates related objects), Low Coupling (centralized wiring)

### tRPC Context Creation

**Wire dependencies in tRPC context:**

```typescript
// adapters/trpc/context.ts
import { createRepositories } from '@/infrastructure/factories/create-repositories';
import { createPostUseCases } from '@/infrastructure/factories/create-use-cases';

export async function createTRPCContext(opts: FetchCreateContextFnOptions) {
  const session = await getServerSession();
  const prisma = new PrismaClient();

  // Wire dependencies
  const repositories = createRepositories(prisma);
  const postUseCases = createPostUseCases(repositories);

  return {
    session,
    repositories,
    useCases: { post: postUseCases },
  };
}

export type Context = inferAsyncReturnType<typeof createTRPCContext>;
```

**Applies:** Dependency Inversion (context depends on abstractions), Indirection (factories hide wiring complexity)

## Error Handling Strategy

**Domain throws domain-specific errors, adapters map to framework errors:**

### Domain Errors

```typescript
// domain/errors/UnauthorizedError.ts
export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

// domain/errors/ValidationError.ts
export class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

### tRPC Error Mapping

```typescript
// adapters/trpc/routers/post.router.ts
import { TRPCError } from '@trpc/server';

export const postRouter = router({
  publish: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.useCases.post.publishPost.execute(
          input.postId,
          ctx.session.user.id
        );
      } catch (error) {
        // Map domain errors to tRPC errors
        if (error instanceof UnauthorizedError) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: error.message });
        }
        if (error instanceof ValidationError) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: error.message });
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Unknown error' });
      }
    }),
});
```

**Applies:** Protected Variations (shield UI from domain error changes), Single Responsibility (domain defines errors, adapters map them)

## Common Anti-Patterns to Avoid

❌ **Domain entities importing Prisma**
❌ **Use cases depending on tRPC/Next.js**
❌ **Business logic in tRPC routers**
❌ **Business logic in React components/hooks**

✅ **Use repositories for persistence**
✅ **Use cases throw domain errors**
✅ **Routers delegate to use cases**
✅ **Components call use cases via tRPC**

## Testing Strategy
1. **Domain Layer:** Pure unit tests, no mocking
2. **Use Cases:** Integration tests with mocked repositories (ports)
3. **tRPC Routers:** E2E-style tests
4. **Components:** React Testing Library with mocked tRPC

## Patterns to Apply

### Query vs Command Separation (CQRS-lite)
- Queries: read operations (simpler)
- Commands: write operations (full use case pattern)

### Domain Events
- Use EventBus for cross-module communication
- Keep modules decoupled

### Server Actions Integration
- Server actions can call use cases directly
- Revalidate paths after mutations

## Code Quality Principles

**SOLID:**
- Single Responsibility: Each class/function one reason to change
- Open/Closed: Open for extension, closed for modification
- Liskov Substitution: Interfaces are contracts
- Interface Segregation: Small, focused interfaces
- Dependency Inversion: Depend on abstractions, not concretions

**GRASP:**
- Information Expert: Assign responsibility to class with info
- Creator: A creates B if A contains/aggregates B
- Controller: Coordinate use case workflows
- Low Coupling: Minimize dependencies
- High Cohesion: Related responsibilities together
- Polymorphism: Use interfaces for varying behavior
- Pure Fabrication: Create service classes when needed
- Indirection: Use intermediary to reduce coupling
- Protected Variations: Shield from variations with interfaces

## When Implementing Features

1. Start with domain models (entities, value objects)
2. Define ports (interfaces) for external dependencies
3. Implement use cases using ports
4. Create infrastructure implementations
5. Wire dependencies in factories
6. Add tRPC procedures calling use cases
7. Build UI components using tRPC hooks
8. Write tests at each layer
**Remember:** Keep business logic in domain, orchestration in use cases, framework concerns in adapters.