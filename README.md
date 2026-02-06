# Sonor Next - Music School Management Application

A fullstack Next.js 15 application built with **Hexagonal Architecture** (Ports & Adapters) principles, featuring tRPC v11 for type-safe APIs.

## 🏗️ Architecture Overview

This project follows **Clean Architecture** and **Hexagonal Architecture** principles to ensure:

- ✅ **Testability** - Pure domain logic with zero framework dependencies
- ✅ **Maintainability** - Clear separation of concerns
- ✅ **Flexibility** - Easy to swap implementations without touching business logic
- ✅ **Type Safety** - End-to-end TypeScript with tRPC

### SOLID Principles Applied

- **S**ingle Responsibility - Each class/module has one reason to change
- **O**pen/Closed - Open for extension, closed for modification
- **L**iskov Substitution - Implementations are interchangeable via interfaces
- **I**nterface Segregation - Lean, focused ports (interfaces)
- **D**ependency Inversion - Business logic depends on abstractions, not concretions

## 📁 Project Structure

```
src/
├── domain/              # 🎯 Pure business logic (framework-agnostic)
├── application/         # 📋 Use cases (business workflows)
├── infrastructure/      # 🔧 External implementations (DB, Email, etc.)
├── adapters/           # 🔌 Framework adapters (tRPC, Next.js UI)
├── config/             # ⚙️ Configuration
└── lib/                # 🛠️ Shared utilities
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your database URL and secrets

# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📜 Available Scripts

\`\`\`bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests with Vitest
npm run type-check   # TypeScript type checking
npm run db:generate  # Generate Prisma Client
npm run db:push      # Push schema changes to DB
npm run db:studio    # Open Prisma Studio
npm run db:migrate   # Run database migrations
\`\`\`

## 🧪 Testing Strategy

### Domain Layer (Pure Unit Tests)
- No mocking required
- Test business rules in isolation

### Application Layer (Use Case Tests)
- Mock repositories (ports)
- Test workflows and orchestration

### Adapters (Integration Tests)
- Test tRPC routers
- Test React components with React Testing Library

## 🎓 Learning Resources

### GRASP Patterns Used
- **Information Expert** - Domain entities contain their business logic
- **Creator** - Factories create complex objects
- **Controller** - Use cases orchestrate workflows
- **Low Coupling** - Layers depend on abstractions
- **High Cohesion** - Related functionality grouped together

### Design Patterns
- **Repository Pattern** - Abstract data access
- **Factory Pattern** - Dependency creation
- **Adapter Pattern** - Framework integration
- **Strategy Pattern** - Pluggable implementations

## 📚 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **API:** tRPC v11
- **Database:** PostgreSQL + Prisma
- **Auth:** NextAuth.js
- **Testing:** Vitest + React Testing Library
- **Type Safety:** TypeScript + Zod

## 🤝 Contributing

Contributions are welcome! Please ensure:
- Follow the Hexagonal Architecture principles
- Write tests for new features
- Keep domain layer pure (no framework dependencies)
- Document architectural decisions

## 📄 License

ISC
