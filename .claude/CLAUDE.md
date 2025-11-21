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

**Pragmatic Decision:** `src/app/` follows Next.js conventions (not nested under `adapters/ui/app/`), but still considered part of Adapter Layer. Maintains framework ergonomics while preserving hexagonal principles.

```
src/
├── app/                           # Next.js App Router (UI Adapter - follows framework conventions)
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Home page
│   ├── (auth)/                    # Route groups for organization
│   ├── (dashboard)/
│   └── api/trpc/[trpc]/route.ts   # tRPC HTTP handler
├── domain/                        # Pure business logic (no external deps)
│   ├── models/                    # Entities & Value Objects with business rules
│   ├── services/                  # Domain services (complex multi-entity rules)
│   ├── errors/                    # Domain-specific errors
│   └── ports/                     # Interfaces (repositories, services, utils)
│       ├── repositories/
│       ├── services/
│       └── utils/
├── application/                   # Use Cases (application orchestration)
│   ├── use-cases/                 # Organized by domain context
│   │   ├── user/
│   │   ├── post/
│   │   └── auth/
│   └── dto/                       # Data Transfer Objects
├── infrastructure/                # Framework & external implementations
│   ├── database/
│   │   ├── prisma/
│   │   └── repositories/          # Implement domain/ports, map domain↔persistence
│   ├── email/
│   ├── storage/
│   └── factories/                 # Dependency wiring (Creator pattern)
│       ├── create-repositories.ts
│       └── create-use-cases.ts
└── adapters/
    ├── trpc/                      # tRPC adapters (API layer)
    │   ├── context.ts             # Wire dependencies here
    │   ├── routers/
    │   ├── procedures/
    │   └── init.ts
    └── ui/                        # Reusable UI logic (separate from app/)
        ├── components/
        ├── hooks/
        └── actions/               # Server Actions
```

## Layer Rules

### Domain Layer (`domain/`)
**Contains:** Entities (identity), Value Objects (immutable), Domain Services (multi-entity rules), Ports (interfaces)

- ✅ Pure TypeScript classes/interfaces
- ✅ Business rules INSIDE entities (e.g., `post.publish()` enforces rules)
- ✅ Testable with zero mocking
- ❌ NO imports from `infrastructure/`, `adapters/`, `application/`
- ❌ NO framework dependencies (Next.js, tRPC, Prisma, React)
- ❌ NO persistence logic in entities

**Example:**
```typescript
// domain/models/Post.ts - Business rules in entity
export class Post {
  publish(): void {
    if (this.content.length < 100) throw new Error('Min 100 chars');
    if (this.status === PostStatus.PUBLISHED) throw new Error('Already published');
    this.status = PostStatus.PUBLISHED;
    this.updatedAt = new Date();
  }

  canBeEditedBy(userId: string): boolean {
    return this.authorId === userId && this.status !== PostStatus.ARCHIVED;
  }
}
```

### Application Layer (`application/`)
**Contains:** Use Cases (workflows), DTOs (input/output structures)

- ✅ Orchestrate business workflows (use cases)
- ✅ Depend on domain layer (models, ports)
- ✅ Define transaction boundaries
- ❌ NO dependencies on infrastructure/adapters
- ❌ NO framework-specific code

**Example:**
```typescript
// application/use-cases/post/PublishPostUseCase.ts
export class PublishPostUseCase {
  constructor(
    private postRepository: PostRepository,
    private emailService: EmailService,
  ) {}

  async execute(postId: string, userId: string): Promise<Post> {
    const post = await this.postRepository.findById(postId);
    if (!post) throw new NotFoundError('Post not found');

    if (!post.canBeEditedBy(userId)) throw new UnauthorizedError('Cannot publish');

    post.publish(); // Domain method enforces rules

    await this.postRepository.save(post);
    await this.emailService.sendPostPublishedNotification(post);

    return post;
  }
}
```

### Infrastructure Layer (`infrastructure/`)
**Contains:** Repository implementations, External service clients, Factories

- ✅ Implement interfaces from `domain/ports/`
- ✅ Handle tech-specific concerns (SQL, HTTP, file system)
- ✅ Map between domain models ↔ persistence models (toDomain/toPersistence methods)

**Repository Pattern:**
```typescript
// infrastructure/database/repositories/PrismaPostRepository.ts
export class PrismaPostRepository implements PostRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Post | null> {
    const record = await this.prisma.post.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async save(post: Post): Promise<void> {
    await this.prisma.post.upsert({
      where: { id: post.id },
      create: this.toPersistence(post),
      update: this.toPersistence(post),
    });
  }

  private toDomain(record: any): Post {
    return new Post(record.id, record.title, record.content, /*...*/);
  }

  private toPersistence(post: Post) {
    return { id: post.id, title: post.title, content: post.content, /*...*/ };
  }
}
```

### Adapters Layer (`adapters/`)
**Contains:** tRPC routers, UI components, Server Actions

- ✅ Connect external world to business logic
- ✅ tRPC routers: thin layer calling use cases, map domain errors to tRPC errors
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

### ❌ Domain entities importing framework code
```typescript
// BAD - Domain importing Prisma
import { PrismaClient } from '@prisma/client';
export class Post {
  async save() {
    const prisma = new PrismaClient();
    await prisma.post.create({ data: this });
  }
}
```
✅ **Use repositories:** Persistence via `PostRepository` port, implemented by `PrismaPostRepository` in infrastructure

### ❌ Use cases importing tRPC/Next.js
```typescript
// BAD - Use case throwing tRPC error
import { TRPCError } from '@trpc/server';
export class CreatePostUseCase {
  async execute() {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
}
```
✅ **Throw domain errors:** Use case throws `UnauthorizedError`, tRPC router maps to `TRPCError`

### ❌ Business logic in tRPC routers
```typescript
// BAD - Logic in router
export const postRouter = router({
  create: protectedProcedure.mutation(async ({ ctx, input }) => {
    if (input.title.length < 3) throw new Error('Title too short');
    const post = await ctx.prisma.post.create({ data: input });
    await sendEmail(post.authorId);
    return post;
  }),
});
```
✅ **Delegate to use cases:** Router validates input (Zod), calls `ctx.useCases.post.createPost.execute()`

### ❌ Business rules in React components/hooks
```typescript
// BAD - Business logic in component
function PublishButton({ post }: { post: Post }) {
  const handlePublish = async () => {
    if (post.content.length < 100) {
      alert('Post too short');
      return;
    }
    await trpc.post.publish.mutate({ postId: post.id });
  };
  return <button onClick={handlePublish}>Publish</button>;
}
```
✅ **Logic in domain/use cases:** Component calls `trpc.post.publish.mutate()`, use case validates via `post.publish()`

## Testing Strategy
1. **Domain Layer:** Pure unit tests, no mocking
2. **Use Cases:** Integration tests with mocked repositories (ports)
3. **tRPC Routers:** E2E-style tests
4. **Components:** React Testing Library with mocked tRPC

## Patterns to Apply

### Query vs Command Separation (CQRS-lite)
**Queries:** Simple read operations, can bypass use case ceremony
```typescript
// application/queries/ListPostsQuery.ts
export class ListPostsQuery {
  constructor(private postRepository: PostRepository) {}

  async execute(filters: PostFilters): Promise<Post[]> {
    return this.postRepository.findPublished(filters);
  }
}
```

**Commands:** Write operations, full use case with orchestration
```typescript
// application/use-cases/post/PublishPostCommand.ts
export class PublishPostCommand {
  constructor(
    private postRepository: PostRepository,
    private emailService: EmailService,
  ) {}

  async execute(postId: string, userId: string): Promise<void> {
    // Complex orchestration, side effects, events
  }
}
```

### Domain Events (for decoupling modules)
```typescript
// domain/events/PostPublishedEvent.ts
export class PostPublishedEvent {
  constructor(
    public readonly postId: string,
    public readonly authorId: string,
    public readonly publishedAt: Date,
  ) {}
}

// Use case emits event
await this.postRepository.save(post);
this.eventBus.publish(new PostPublishedEvent(post.id, post.authorId, new Date()));
```

### Server Actions Integration
```typescript
// adapters/ui/actions/post.actions.ts
'use server';
import { createAppDependencies } from '@/config/dependencies';
import { revalidatePath } from 'next/cache';

export async function publishPostAction(postId: string) {
  const { useCases } = createAppDependencies();
  const session = await getServerSession();

  if (!session?.user?.id) throw new Error('Unauthorized');

  await useCases.post.publishPost.execute(postId, session.user.id);
  revalidatePath('/posts');
}

// Usage in component
<form action={() => publishPostAction(postId)}>
  <button type="submit">Publish</button>
</form>
```

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

## Feature Implementation Workflow

**Always follow this order (Dependency Inversion - build from inside out):**

1. **Domain First:** Create/update entities with business rules, define ports (interfaces)
2. **Use Cases:** Implement application workflows using domain models + ports
3. **Infrastructure:** Implement ports (repositories, services) with real tech (Prisma, etc.)
4. **Wire Dependencies:** Update factories (`create-repositories.ts`, `create-use-cases.ts`)
5. **tRPC Adapter:** Add thin procedures calling use cases, map domain errors to tRPC errors
6. **UI Adapter:** Build components/hooks consuming tRPC endpoints
7. **Tests:** Unit (domain) → Integration (use cases) → E2E (tRPC) → Component (UI)

**Critical Rules:**
- Business logic ONLY in domain/application layers
- Repositories map domain ↔ persistence (toDomain/toPersistence)
- Use cases orchestrate, entities enforce rules
- Adapters (tRPC/UI) are thin - just delegation + error mapping
- Dependencies point inward: UI → tRPC → Use Cases → Domain ← Infrastructure

**When uncertain about layer placement, ask:** "If I swap Prisma for Drizzle, does this change?" If yes → infrastructure. "If I swap tRPC for REST?" If yes → adapter. "Is this a business rule?" If yes → domain.