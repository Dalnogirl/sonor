# Domain Layer

## 🎯 Purpose

The **Domain Layer** contains the core business logic of the application. It's the heart of the system and is completely **framework-agnostic**.

## ✨ Key Principles

### Single Responsibility Principle (SRP)
Each entity/value object has one clear responsibility and reason to change.

### Dependency Inversion Principle (DIP)
This layer defines **ports** (interfaces) that outer layers must implement. The domain **never depends on infrastructure**.

## 📂 Structure

\`\`\`
domain/
├── models/          # Entities & Value Objects
├── services/        # Domain Services (complex business rules)
└── ports/          # Interfaces (contracts for external dependencies)
    ├── repositories/
    ├── services/
    └── utils/
\`\`\`

## 🚫 What NOT to Do

- ❌ Import from `infrastructure/`, `adapters/`, or `application/`
- ❌ Use framework-specific code (Next.js, tRPC, Prisma, React)
- ❌ Add persistence logic to entities
- ❌ Make HTTP calls or read files directly

## ✅ What to Do

- ✅ Keep entities pure TypeScript classes
- ✅ Encapsulate business rules in entity methods
- ✅ Define interfaces (ports) for external dependencies
- ✅ Write testable code with zero mocking

## 📝 Example

\`\`\`typescript
// ✅ GOOD - Pure domain entity
export class Post {
  constructor(
    public readonly id: string,
    public title: string,
    public content: string,
    public status: PostStatus,
  ) {}

  publish(): void {
    if (this.content.length < 100) {
      throw new Error('Post must have at least 100 characters');
    }
    this.status = PostStatus.PUBLISHED;
  }
}

// ✅ GOOD - Port definition
export interface PostRepository {
  findById(id: string): Promise<Post | null>;
  save(post: Post): Promise<void>;
}
\`\`\`
