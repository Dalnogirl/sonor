# Hexagonal Architecture for tRPC Next.js Application

**Framework:** Next.js 15 (App Router) + tRPC v11

## Note for communication
Try to use GRASP, SOLID, patterns, best-practices, and always mention them explicitly to the user. 
Your need is not only to implement the required prompts, but to educate user on architectural / code quality topics.

---

## Overview

This document outlines the architectural approach for building a Next.js application with tRPC using **Hexagonal Architecture** (Ports & Adapters) principles. The goal is to keep business logic independent from frameworks, making the codebase testable, maintainable, and adaptable.

### Core Principles

1. **Business logic is framework-agnostic** - Domain and application layers don't depend on Next.js or tRPC
2. **Depend on interfaces, not implementations** - Use ports (interfaces) to define contracts
3. **Adapters handle framework concerns** - tRPC routers, API routes, and React components are adapters
4. **Inversion of control** - Business logic doesn't know about HTTP, databases, or UI

---

## Project Structure

**Important Note - Pragmatic Architecture Decision:**  
Following **Next.js conventions** and the **principle of least surprise**, we place the `app/` directory at `src/app/` (not under `src/adapters/ui/app/`). This maintains framework ergonomics while preserving hexagonal architecture principles in the business logic layers. The `app/` directory is still considered part of the **Adapter Layer** - it adapts Next.js routing to our use cases.

This applies the **Open/Closed Principle** - we can swap frameworks without changing business logic, and **Dependency Inversion Principle** - pages depend on use cases (abstractions), not implementations.

```
src/
├── app/                             # Next.js App Router (UI Adapter - follows framework conventions)
│   ├── layout.tsx                   # Root layout with metadata
│   ├── page.tsx                     # Home page
│   ├── globals.css                  # Global styles
│   ├── (auth)/                      # Auth route group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/                 # Dashboard route group
│   │   ├── posts/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   └── profile/
│   │       └── page.tsx
│   └── api/                         # API routes
│       └── trpc/
│           └── [trpc]/
│               └── route.ts         # tRPC HTTP handler
│
├── domain/                          # Core business logic (pure TypeScript)
│   ├── models/                      # Entities & Value Objects
│   │   ├── User.ts
│   │   ├── Post.ts
│   │   └── Comment.ts
│   ├── services/                    # Domain services (complex business rules)
│   │   ├── PostPublishingService.ts
│   │   └── UserPermissionService.ts
│   └── ports/                       # Interfaces for external dependencies
│       ├── repositories/
│       │   ├── UserRepository.ts
│       │   ├── PostRepository.ts
│       │   └── CommentRepository.ts
│       ├── services/
│       │   ├── EmailService.ts
│       │   └── StorageService.ts
│       └── utils/
│           └── DateProvider.ts
│
├── application/                     # Use Cases (application orchestration)
│   ├── use-cases/
│   │   ├── user/
│   │   │   ├── CreateUserUseCase.ts
│   │   │   ├── UpdateUserProfileUseCase.ts
│   │   │   └── DeleteUserUseCase.ts
│   │   ├── post/
│   │   │   ├── CreatePostUseCase.ts
│   │   │   ├── PublishPostUseCase.ts
│   │   │   └── ListPostsUseCase.ts
│   │   └── auth/
│   │       ├── LoginUseCase.ts
│   │       └── RegisterUseCase.ts
│   └── dto/                         # Data Transfer Objects
│       ├── CreatePostDTO.ts
│       └── UpdateUserDTO.ts
│
├── infrastructure/                  # Framework & external implementations
│   ├── database/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── client.ts
│   │   └── repositories/            # Repository implementations
│   │       ├── PrismaUserRepository.ts
│   │       ├── PrismaPostRepository.ts
│   │       └── PrismaCommentRepository.ts
│   ├── email/
│   │   ├── ResendEmailService.ts
│   │   └── SendGridEmailService.ts
│   ├── storage/
│   │   ├── S3StorageService.ts
│   │   └── CloudinaryStorageService.ts
│   └── factories/                   # Dependency wiring
│       ├── create-repositories.ts
│       └── create-use-cases.ts
│
├── adapters/
│   ├── trpc/                        # tRPC adapters (API layer)
│   │   ├── context.ts               # Request context creation
│   │   ├── routers/
│   │   │   ├── user.router.ts
│   │   │   ├── post.router.ts
│   │   │   ├── comment.router.ts
│   │   │   └── _app.ts              # Root router
│   │   ├── procedures/
│   │   │   ├── protected.ts
│   │   │   └── public.ts
│   │   └── init.ts                  # tRPC initialization
│   │
│   └── ui/                          # Reusable UI utilities (separate from app/)
│       ├── components/              # React components
│       │   ├── posts/
│       │   │   ├── PostList.tsx
│       │   │   ├── PostCard.tsx
│       │   │   └── CreatePostForm.tsx
│       │   ├── users/
│       │   └── shared/
│       ├── hooks/                   # Custom React hooks
│       │   ├── useCreatePost.ts
│       │   ├── usePosts.ts
│       │   └── useCurrentUser.ts
│       └── actions/                 # Server Actions
│           ├── post.actions.ts
│           └── user.actions.ts
│
└── config/
    ├── dependencies.ts              # Dependency configuration
    ├── env.ts                       # Environment validation (t3-env)
    └── constants.ts
```

---

## Layer Responsibilities

### 1. Domain Layer (`domain/`)

**Purpose:** Pure business logic, no external dependencies.

**Contains:**
- **Entities** - Core business objects with identity (User, Post)
- **Value Objects** - Immutable objects defined by their values (Email, PostStatus)
- **Domain Services** - Complex business rules spanning multiple entities
- **Ports** - Interfaces defining contracts for external dependencies

**Rules:**
- ✅ No imports from `infrastructure/`, `adapters/`, or `application/`
- ✅ No framework dependencies (Next.js, tRPC, Prisma, React)
- ✅ Pure TypeScript classes and interfaces
- ✅ Testable with zero mocking

**Example:**

```typescript
// domain/models/Post.ts
export enum PostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export class Post {
  constructor(
    public readonly id: string,
    public title: string,
    public content: string,
    public status: PostStatus,
    public authorId: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  // Business rule: can only publish if content is valid
  publish(): void {
    if (this.content.length < 100) {
      throw new Error('Post must have at least 100 characters to publish');
    }
    if (this.status === PostStatus.PUBLISHED) {
      throw new Error('Post is already published');
    }
    this.status = PostStatus.PUBLISHED;
    this.updatedAt = new Date();
  }

  // Business rule: only author can archive
  archive(userId: string): void {
    if (this.authorId !== userId) {
      throw new Error('Only the author can archive this post');
    }
    this.status = PostStatus.ARCHIVED;
    this.updatedAt = new Date();
  }

  canBeEditedBy(userId: string): boolean {
    return this.authorId === userId && this.status !== PostStatus.ARCHIVED;
  }
}

// domain/ports/repositories/PostRepository.ts
export interface PostRepository {
  findById(id: string): Promise<Post | null>;
  findByAuthorId(authorId: string): Promise<Post[]>;
  findPublished(options: PaginationOptions): Promise<Post[]>;
  save(post: Post): Promise<void>;
  delete(id: string): Promise<void>;
}
```

---

### 2. Application Layer (`application/`)

**Purpose:** Orchestrate business workflows (use cases).

**Contains:**
- **Use Cases** - Application-specific business rules and workflows
- **DTOs** - Data structures for input/output

**Rules:**
- ✅ Depend on domain layer (models, ports)
- ✅ No dependencies on infrastructure or adapters
- ✅ No framework-specific code
- ✅ Define transaction boundaries

**Example:**

```typescript
// application/use-cases/post/CreatePostUseCase.ts
import { Post, PostStatus } from '@/domain/models/Post';
import { PostRepository } from '@/domain/ports/repositories/PostRepository';
import { CreatePostDTO } from '@/application/dto/CreatePostDTO';

export class CreatePostUseCase {
  constructor(private postRepository: PostRepository) {}

  async execute(dto: CreatePostDTO, authorId: string): Promise<Post> {
    // 1. Validate business rules
    if (dto.title.trim().length === 0) {
      throw new Error('Title cannot be empty');
    }

    // 2. Create domain entity
    const post = new Post(
      crypto.randomUUID(),
      dto.title,
      dto.content,
      PostStatus.DRAFT,
      authorId,
      new Date(),
      new Date(),
    );

    // 3. Persist via repository (port)
    await this.postRepository.save(post);

    return post;
  }
}

// application/use-cases/post/PublishPostUseCase.ts
export class PublishPostUseCase {
  constructor(
    private postRepository: PostRepository,
    private emailService: EmailService,
  ) {}

  async execute(postId: string, userId: string): Promise<Post> {
    // 1. Fetch post
    const post = await this.postRepository.findById(postId);
    if (!post) throw new Error('Post not found');

    // 2. Authorization check
    if (!post.canBeEditedBy(userId)) {
      throw new Error('You do not have permission to publish this post');
    }

    // 3. Apply domain logic
    post.publish(); // Throws if business rules violated

    // 4. Persist changes
    await this.postRepository.save(post);

    // 5. Side effects
    await this.emailService.sendPostPublishedNotification(post);

    return post;
  }
}
```

---

### 3. Infrastructure Layer (`infrastructure/`)

**Purpose:** Implement ports with concrete technologies.

**Contains:**
- **Repository Implementations** - Prisma, Drizzle, or other ORMs
- **External Service Implementations** - Email, storage, payment gateways
- **Factories** - Create and wire dependencies

**Rules:**
- ✅ Implement interfaces from `domain/ports/`
- ✅ Handle technology-specific concerns (SQL, HTTP, file system)
- ✅ Map between domain models and persistence models

**Example:**

```typescript
// infrastructure/database/repositories/PrismaPostRepository.ts
import { PrismaClient } from '@prisma/client';
import { Post, PostStatus } from '@/domain/models/Post';
import { PostRepository } from '@/domain/ports/repositories/PostRepository';

export class PrismaPostRepository implements PostRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Post | null> {
    const record = await this.prisma.post.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findByAuthorId(authorId: string): Promise<Post[]> {
    const records = await this.prisma.post.findMany({
      where: { authorId },
      orderBy: { createdAt: 'desc' },
    });
    return records.map(this.toDomain);
  }

  async save(post: Post): Promise<void> {
    await this.prisma.post.upsert({
      where: { id: post.id },
      create: this.toPersistence(post),
      update: this.toPersistence(post),
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.post.delete({ where: { id } });
  }

  // Mapping functions
  private toDomain(record: any): Post {
    return new Post(
      record.id,
      record.title,
      record.content,
      record.status as PostStatus,
      record.authorId,
      record.createdAt,
      record.updatedAt,
    );
  }

  private toPersistence(post: Post) {
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      status: post.status,
      authorId: post.authorId,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }
}

// infrastructure/factories/create-repositories.ts
import { PrismaClient } from '@prisma/client';
import { PrismaUserRepository } from '../database/repositories/PrismaUserRepository';
import { PrismaPostRepository } from '../database/repositories/PrismaPostRepository';

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
    listPosts: new ListPostsUseCase(repositories.postRepository),
  };
}
```

---

### 4. Adapters Layer (`adapters/`)

**Purpose:** Connect external world to business logic.

#### A. tRPC Adapters (`adapters/trpc/`)

**Responsibility:** HTTP API layer using tRPC.

**Example:**

```typescript
// adapters/trpc/context.ts
import { inferAsyncReturnType } from '@trpc/server';
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { getServerSession } from 'next-auth';
import { prisma } from '@/infrastructure/database/prisma/client';
import { createRepositories } from '@/infrastructure/factories/create-repositories';
import { createPostUseCases } from '@/infrastructure/factories/create-use-cases';

export async function createTRPCContext(opts: FetchCreateContextFnOptions) {
  const session = await getServerSession();
  
  // Wire up dependencies
  const repositories = createRepositories(prisma);
  const postUseCases = createPostUseCases(repositories);

  return {
    session,
    repositories,
    useCases: {
      post: postUseCases,
    },
  };
}

export type Context = inferAsyncReturnType<typeof createTRPCContext>;

// adapters/trpc/routers/post.router.ts
import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../procedures';

export const postRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Adapter calls use case
      const post = await ctx.useCases.post.createPost.execute(
        input,
        ctx.session.user.id
      );

      // Return DTO (could map to different shape if needed)
      return {
        id: post.id,
        title: post.title,
        content: post.content,
        status: post.status,
        createdAt: post.createdAt,
      };
    }),

  publish: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.useCases.post.publishPost.execute(
        input.postId,
        ctx.session.user.id
      );
      return post;
    }),

  list: publicProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.useCases.post.listPosts.execute({
        page: input.page,
        limit: input.limit,
      });
    }),
});
```

#### B. UI Adapters (`src/app/` + `adapters/ui/`)

**Responsibility:** Next.js pages (at `src/app/`) and reusable React components/hooks (at `adapters/ui/`).

**Architectural Note:** Following **Next.js conventions** and the **Adapter Pattern**, we separate:
- **`src/app/`** - Framework-specific routing (pages, layouts, route groups)
- **`adapters/ui/`** - Reusable UI logic (components, hooks, actions)

Both are part of the UI Adapter Layer, but split for **Single Responsibility** - routing vs. reusable presentation logic.

**Example:**

```typescript
// adapters/ui/hooks/useCreatePost.ts
import { trpc } from '@/lib/trpc';
import { useRouter } from 'next/navigation';

export function useCreatePost() {
  const router = useRouter();
  const utils = trpc.useUtils();

  return trpc.post.create.useMutation({
    onSuccess: (post) => {
      // Invalidate cache
      utils.post.list.invalidate();
      
      // Navigate to new post
      router.push(`/posts/${post.id}`);
    },
  });
}

// adapters/ui/components/posts/CreatePostForm.tsx
'use client';

import { useCreatePost } from '@/adapters/ui/hooks/useCreatePost';
import { useState } from 'react';

export function CreatePostForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const createPost = useCreatePost();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPost.mutateAsync({ title, content });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Post title"
        required
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Post content"
        required
      />
      <button type="submit" disabled={createPost.isPending}>
        {createPost.isPending ? 'Creating...' : 'Create Post'}
      </button>
      {createPost.error && (
        <p className="error">{createPost.error.message}</p>
      )}
    </form>
  );
}

// src/app/(dashboard)/posts/page.tsx
import { PostList } from '@/adapters/ui/components/posts/PostList';
import { CreatePostForm } from '@/adapters/ui/components/posts/CreatePostForm';

export default function PostsPage() {
  return (
    <div>
      <h1>My Posts</h1>
      <CreatePostForm />
      <PostList />
    </div>
  );
}
```

---

## Dependency Flow

```
┌─────────────────────────────────────────────────┐
│              UI Layer (Next.js)                 │
│  - Pages (App Router)                           │
│  - React Components                             │
│  - Custom Hooks                                 │
└────────────────┬────────────────────────────────┘
                 │ uses
                 ▼
┌─────────────────────────────────────────────────┐
│           tRPC Routers (Adapters)               │
│  - HTTP request/response handling               │
│  - Input validation (Zod)                       │
│  - Authentication checks                        │
└────────────────┬────────────────────────────────┘
                 │ calls
                 ▼
┌─────────────────────────────────────────────────┐
│        Application Layer (Use Cases)            │
│  - Business workflows                           │
│  - Transaction orchestration                    │
│  - Authorization logic                          │
└────────┬───────────────────────┬────────────────┘
         │ uses                  │ depends on
         ▼                       ▼
┌──────────────────┐    ┌────────────────────────┐
│  Domain Layer    │    │ Ports (Interfaces)     │
│  - Entities      │    │ - Repositories         │
│  - Value Objects │    │ - External Services    │
│  - Domain Rules  │    └─────────┬──────────────┘
└──────────────────┘              │ implemented by
                                  ▼
                    ┌──────────────────────────────┐
                    │  Infrastructure Layer        │
                    │  - Prisma Repositories       │
                    │  - Email Services            │
                    │  - Storage Services          │
                    └──────────────────────────────┘
```

**Key Points:**
- Arrows point **inward** (Dependency Inversion)
- Domain layer has **zero dependencies**
- Infrastructure implements ports defined by domain
- UI and tRPC know about use cases, but use cases don't know about them

---

## Configuration & Dependency Injection

### Option 1: Simple Factory Pattern (Recommended)

```typescript
// config/dependencies.ts
import { PrismaClient } from '@prisma/client';
import { createRepositories } from '@/infrastructure/factories/create-repositories';
import { createPostUseCases } from '@/infrastructure/factories/create-use-cases';
import { createUserUseCases } from '@/infrastructure/factories/create-user-cases';

export function createAppDependencies() {
  const prisma = new PrismaClient();
  const repositories = createRepositories(prisma);

  return {
    repositories,
    useCases: {
      post: createPostUseCases(repositories),
      user: createUserUseCases(repositories),
    },
  };
}

export type AppDependencies = ReturnType<typeof createAppDependencies>;
```

### Option 2: React Context (for client-side if needed)

```typescript
// Only if you need client-side dependency swapping
// For most tRPC apps, server-side factory is sufficient
'use client';

import { createContext, useContext, ReactNode } from 'react';
import { AppDependencies } from '@/config/dependencies';

const DependenciesContext = createContext<AppDependencies | null>(null);

export function DependenciesProvider({
  children,
  dependencies,
}: {
  children: ReactNode;
  dependencies: AppDependencies;
}) {
  return (
    <DependenciesContext.Provider value={dependencies}>
      {children}
    </DependenciesContext.Provider>
  );
}

export function useDependencies() {
  const ctx = useContext(DependenciesContext);
  if (!ctx) throw new Error('Missing DependenciesProvider');
  return ctx;
}
```

---

## Testing Strategy

### 1. Domain Layer Tests (Pure Unit Tests)

```typescript
// __tests__/domain/models/Post.test.ts
import { describe, it, expect } from 'vitest';
import { Post, PostStatus } from '@/domain/models/Post';

describe('Post', () => {
  it('should publish post with valid content', () => {
    const post = new Post(
      '1',
      'My Post',
      'a'.repeat(100), // Valid length
      PostStatus.DRAFT,
      'user-1',
      new Date(),
      new Date(),
    );

    post.publish();

    expect(post.status).toBe(PostStatus.PUBLISHED);
  });

  it('should throw error when publishing post with short content', () => {
    const post = new Post(
      '1',
      'My Post',
      'too short',
      PostStatus.DRAFT,
      'user-1',
      new Date(),
      new Date(),
    );

    expect(() => post.publish()).toThrow(
      'Post must have at least 100 characters'
    );
  });

  it('should only allow author to archive post', () => {
    const post = new Post(
      '1',
      'My Post',
      'content',
      PostStatus.PUBLISHED,
      'author-id',
      new Date(),
      new Date(),
    );

    expect(() => post.archive('different-user')).toThrow(
      'Only the author can archive'
    );

    expect(() => post.archive('author-id')).not.toThrow();
    expect(post.status).toBe(PostStatus.ARCHIVED);
  });
});
```

### 2. Use Case Tests (Integration Tests with Mocks)

```typescript
// __tests__/application/use-cases/CreatePostUseCase.test.ts
import { describe, it, expect, vi } from 'vitest';
import { CreatePostUseCase } from '@/application/use-cases/post/CreatePostUseCase';
import { PostRepository } from '@/domain/ports/repositories/PostRepository';

describe('CreatePostUseCase', () => {
  it('should create post and save to repository', async () => {
    // Mock repository
    const mockRepo: PostRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findByAuthorId: vi.fn(),
      findPublished: vi.fn(),
      delete: vi.fn(),
    };

    const useCase = new CreatePostUseCase(mockRepo);

    const post = await useCase.execute(
      { title: 'Test', content: 'Content' },
      'user-1'
    );

    expect(post.title).toBe('Test');
    expect(post.authorId).toBe('user-1');
    expect(mockRepo.save).toHaveBeenCalledWith(post);
  });

  it('should throw error for empty title', async () => {
    const mockRepo = {} as PostRepository;
    const useCase = new CreatePostUseCase(mockRepo);

    await expect(
      useCase.execute({ title: '', content: 'Content' }, 'user-1')
    ).rejects.toThrow('Title cannot be empty');
  });
});
```

### 3. tRPC Router Tests (E2E-style)

```typescript
// __tests__/adapters/trpc/routers/post.test.ts
import { describe, it, expect } from 'vitest';
import { appRouter } from '@/adapters/trpc/routers/_app';
import { createInnerTRPCContext } from '@/adapters/trpc/context';

describe('Post Router', () => {
  it('should create post via tRPC', async () => {
    const ctx = await createInnerTRPCContext({
      session: { user: { id: 'test-user' } },
    });

    const caller = appRouter.createCaller(ctx);

    const post = await caller.post.create({
      title: 'Test Post',
      content: 'Test content',
    });

    expect(post.title).toBe('Test Post');
    expect(post.status).toBe('DRAFT');
  });
});
```

### 4. Component Tests (React Testing Library)

```typescript
// __tests__/adapters/ui/components/CreatePostForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreatePostForm } from '@/adapters/ui/components/posts/CreatePostForm';

// Mock tRPC
vi.mock('@/lib/trpc', () => ({
  trpc: {
    post: {
      create: {
        useMutation: () => ({
          mutateAsync: vi.fn().mockResolvedValue({ id: '1' }),
          isPending: false,
          error: null,
        }),
      },
    },
    useUtils: () => ({
      post: { list: { invalidate: vi.fn() } },
    }),
  },
}));

it('should submit form and create post', async () => {
  render(<CreatePostForm />);

  await userEvent.type(screen.getByPlaceholderText('Post title'), 'New Post');
  await userEvent.type(screen.getByPlaceholderText('Post content'), 'Content');
  await userEvent.click(screen.getByText('Create Post'));

  await waitFor(() => {
    // Assert post was created (router.push called, etc.)
  });
});
```

---

## Benefits of This Architecture

### 1. **Testability**
- Domain logic: Pure unit tests, no mocking
- Use cases: Test with repository mocks
- UI: Test components in isolation

### 2. **Flexibility**
- Swap Prisma for Drizzle without touching business logic
- Change from tRPC to REST without changing use cases
- Migrate from Next.js to Remix/SvelteKit keeping domain intact

### 3. **Maintainability**
- Business rules in one place (domain layer)
- Clear separation of concerns
- Easy to onboard new developers

### 4. **Type Safety**
- End-to-end TypeScript
- tRPC provides type-safe API layer
- Domain models define data contracts

---

## Common Patterns

### Pattern 1: Query vs. Command Separation

```typescript
// Queries - read operations (can be simpler)
export class ListPostsQuery {
  constructor(private postRepository: PostRepository) {}

  async execute(filters: PostFilters): Promise<Post[]> {
    return this.postRepository.findPublished(filters);
  }
}

// Commands - write operations (use full use case pattern)
export class PublishPostCommand {
  constructor(
    private postRepository: PostRepository,
    private emailService: EmailService,
  ) {}

  async execute(postId: string, userId: string): Promise<void> {
    // Complex orchestration
  }
}
```

### Pattern 2: Domain Events

```typescript
// domain/events/PostPublishedEvent.ts
export class PostPublishedEvent {
  constructor(
    public readonly postId: string,
    public readonly authorId: string,
    public readonly publishedAt: Date,
  ) {}
}

// application/use-cases/post/PublishPostUseCase.ts
export class PublishPostUseCase {
  constructor(
    private postRepository: PostRepository,
    private eventBus: EventBus,
  ) {}

  async execute(postId: string, userId: string): Promise<Post> {
    const post = await this.postRepository.findById(postId);
    post.publish();
    await this.postRepository.save(post);

    // Emit event for other modules to handle
    this.eventBus.publish(
      new PostPublishedEvent(post.id, post.authorId, new Date())
    );

    return post;
  }
}
```

### Pattern 3: Server Actions Integration

```typescript
// adapters/ui/actions/post.actions.ts
'use server';

import { createAppDependencies } from '@/config/dependencies';
import { revalidatePath } from 'next/cache';

export async function publishPostAction(postId: string) {
  const { useCases } = createAppDependencies();
  const session = await getServerSession();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  await useCases.post.publishPost.execute(postId, session.user.id);

  revalidatePath('/posts');
}

// Usage in component
import { publishPostAction } from '@/adapters/ui/actions/post.actions';

function PublishButton({ postId }: { postId: string }) {
  return (
    <form action={() => publishPostAction(postId)}>
      <button type="submit">Publish</button>
    </form>
  );
}
```

---

## Migration Strategy

If you're adding this to an existing codebase:

### Phase 1: Add Domain Layer
1. Create `domain/` folder
2. Move business logic from components/API routes to domain models
3. Define ports (interfaces)

### Phase 2: Extract Use Cases
1. Create `application/` folder
2. Move orchestration logic from tRPC routers to use cases
3. Make use cases depend on ports

### Phase 3: Implement Infrastructure
1. Create repository implementations
2. Wire dependencies in factories
3. Update tRPC context to use factories

### Phase 4: Refactor Adapters
1. Make tRPC routers thin (just call use cases)
2. Make components thin (just UI logic)
3. Move business logic out of hooks

---

## Anti-Patterns to Avoid

❌ **Domain entities importing Prisma**
```typescript
// BAD
import { PrismaClient } from '@prisma/client';

export class Post {
  async save() {
    const prisma = new PrismaClient();
    await prisma.post.create({ data: this });
  }
}
```

✅ **Use repositories**
```typescript
// GOOD
export class Post {
  // No persistence logic here
}

// Persistence handled by repository
const postRepository = new PrismaPostRepository(prisma);
await postRepository.save(post);
```

❌ **Use cases depending on tRPC/Next.js**
```typescript
// BAD
import { TRPCError } from '@trpc/server';

export class CreatePostUseCase {
  async execute() {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
}
```

✅ **Use cases throw domain errors**
```typescript
// GOOD
export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

// Map to tRPC error in router
try {
  await useCase.execute();
} catch (error) {
  if (error instanceof UnauthorizedError) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: error.message });
  }
  throw error;
}
```

❌ **Business logic in tRPC routers**
```typescript
// BAD
export const postRouter = router({
  create: protectedProcedure.mutation(async ({ ctx, input }) => {
    // ❌ Business logic in router
    if (input.title.length < 3) throw new Error('Title too short');
    
    const post = await ctx.prisma.post.create({ data: input });
    await sendEmail(post.authorId);
    return post;
  }),
});
```

✅ **Routers delegate to use cases**
```typescript
// GOOD
export const postRouter = router({
  create: protectedProcedure.mutation(async ({ ctx, input }) => {
    // ✅ Delegate to use case
    return ctx.useCases.post.createPost.execute(input, ctx.session.user.id);
  }),
});
```

---

## Resources

- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/) - Original article by Alistair Cockburn
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) - Robert C. Martin
- [tRPC Documentation](https://trpc.io/)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html) - Martin Fowler

---

## Conclusion

This architecture provides:
- ✅ Clear separation between business logic and framework code
- ✅ Testable code at every layer
- ✅ Flexibility to change technologies
- ✅ Type-safe end-to-end development with tRPC
- ✅ Scalable structure for growing applications

Start simple, add complexity only when needed. The key is keeping business logic independent and using interfaces to decouple from implementations.