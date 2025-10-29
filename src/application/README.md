# Application Layer

## 📋 Purpose

The **Application Layer** orchestrates business workflows through **Use Cases**. It defines how the application responds to user actions.

## ✨ Key Principles

### Single Responsibility Principle (SRP)
Each use case handles one specific workflow (e.g., CreatePost, PublishPost).

### Open/Closed Principle (OCP)
New use cases can be added without modifying existing ones.

### Controller Pattern (GRASP)
Use cases act as controllers, coordinating domain objects and repositories.

## 📂 Structure

\`\`\`
application/
├── use-cases/       # Business workflows
│   ├── user/
│   ├── post/
│   └── auth/
└── dto/            # Data Transfer Objects
\`\`\`

## 🚫 What NOT to Do

- ❌ Import from `infrastructure/` or `adapters/`
- ❌ Use framework-specific types (tRPC, Next.js)
- ❌ Access database directly (use repositories instead)
- ❌ Put business rules here (they belong in domain)

## ✅ What to Do

- ✅ Depend on domain entities and ports
- ✅ Orchestrate workflows
- ✅ Define transaction boundaries
- ✅ Handle authorization logic
- ✅ Call repositories via ports

## 📝 Example

\`\`\`typescript
// ✅ GOOD - Use case orchestrates workflow
export class CreatePostUseCase {
  constructor(private postRepository: PostRepository) {}

  async execute(dto: CreatePostDTO, authorId: string): Promise<Post> {
    // 1. Validate input
    if (dto.title.trim().length === 0) {
      throw new Error('Title cannot be empty');
    }

    // 2. Create domain entity
    const post = new Post(
      crypto.randomUUID(),
      dto.title,
      dto.content,
      PostStatus.DRAFT,
    );

    // 3. Persist via repository port
    await this.postRepository.save(post);

    return post;
  }
}
\`\`\`
