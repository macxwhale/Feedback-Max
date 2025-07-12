
# Application Architecture

## Overview
This document outlines the architecture principles, patterns, and conventions used throughout the application to ensure consistency, maintainability, and developer experience.

## Directory Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn/ui)
│   ├── admin/          # Admin-specific components
│   ├── auth/           # Authentication components
│   └── common/         # Shared components
├── hooks/              # Custom React hooks
├── services/           # Business logic and API services
├── utils/              # Pure utility functions
├── types/              # TypeScript type definitions
├── infrastructure/     # System-level services
├── domain/             # Domain models and interfaces
├── application/        # Application services
└── docs/               # Documentation
```

## Architecture Patterns

### Clean Architecture
- **Domain Layer**: Core business logic and entities
- **Application Layer**: Use cases and application services
- **Infrastructure Layer**: External dependencies and frameworks
- **Presentation Layer**: UI components and hooks

### Component Design Principles
1. **Single Responsibility**: Each component has one clear purpose
2. **Composition over Inheritance**: Prefer composition patterns
3. **Props Interface**: Clear, typed interfaces for all props
4. **Minimal State**: Keep local state minimal and focused

### Hook Patterns
- **Custom Hooks**: Encapsulate reusable stateful logic
- **Service Hooks**: Bridge between components and services
- **Utility Hooks**: Common patterns (async state, local storage)

## Naming Conventions

### Files and Directories
- Components: `PascalCase.tsx`
- Hooks: `camelCase.ts` (prefixed with `use`)
- Services: `camelCase.ts`
- Types: `camelCase.ts`
- Utils: `camelCase.ts`

### Variables and Functions
- Variables: `camelCase`
- Functions: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Types/Interfaces: `PascalCase`

### Components
- Component names: `PascalCase`
- Props interfaces: `ComponentNameProps`
- Event handlers: `handle` prefix (e.g., `handleClick`)

## Code Quality Standards

### TypeScript Usage
- Strict mode enabled
- Explicit return types for functions
- No `any` types (use `unknown` instead)
- Proper error handling with typed errors

### React Best Practices
- Functional components with hooks
- Proper dependency arrays for useEffect
- Memoization for expensive computations
- Error boundaries for graceful failures

### Performance Considerations
- Lazy loading for large components
- Memoization for expensive operations
- Proper key props for lists
- Optimistic updates for better UX

## Development Workflow

### Code Review Guidelines
1. Check for proper TypeScript usage
2. Verify component composition
3. Ensure proper error handling
4. Review performance implications
5. Validate accessibility requirements

### Testing Strategy
- Unit tests for utility functions
- Component testing with React Testing Library
- Integration tests for critical paths
- End-to-end tests for user workflows

This architecture promotes maintainability, scalability, and developer joy through consistent patterns and clear conventions.
