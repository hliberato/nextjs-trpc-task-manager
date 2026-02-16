# Task Manager - Next.js + tRPC

Full-stack task management application demonstrating modern web architecture with type-safe APIs, server-side rendering, and optimistic updates.

---

## Tech Stack

- **Next.js 15.3.0** - App Router, React Server Components
- **TypeScript 5.4.5** - Strict type safety
- **tRPC v11.10.0** - End-to-end typesafe API
- **React Query 5.59.16** - Data fetching and caching
- **Zod 3.23.8** - Runtime validation

---

## Architecture

### Project Structure

```
src/
├── app/
│   ├── api/trpc/[trpc]/     # tRPC HTTP handler
│   ├── TaskForm.tsx          # Create task component
│   ├── TaskItem.tsx          # Task component with CRUD
│   ├── TaskList.tsx          # List with SSR
│   └── providers.tsx         # React Query setup
│
├── server/
│   ├── routers/
│   │   └── task.router.ts    # CRUD operations
│   ├── schemas/
│   │   └── task.schema.ts    # Zod schemas
│   ├── store/
│   │   └── task.store.ts     # In-memory storage
│   ├── root.ts               # Router composition
│   ├── trpc.ts               # tRPC initialization
│   ├── context.ts            # Request context
│   └── serverCaller.ts       # SSR caller
│
└── utils/
    └── trpc.ts               # Client setup
```

### Backend Design

**tRPC Router** - Type-safe API layer with automatic inference

```typescript
task.list: query() => Task[]
task.create: mutation({ title, description? }) => Task
task.update: mutation({ id, title?, description? }) => Task
task.delete: mutation({ id }) => Task
```

**Data Model**

```typescript
type Task = {
  id: string;
  title: string;
  description: string | null;
  createdAt: number;
};
```

**Validation Layer** - Zod schemas for runtime type checking

- Title: required, 1-120 characters
- Description: optional
- All inputs validated on server

**Storage** - In-memory Map for simplicity

### Frontend Architecture

**Server-Side Rendering**

1. Server fetches data via `createCaller`
2. Data passed as `initialData` to client
3. React Query hydrates cache
4. Zero loading state on first render

**State Management**

- React Query for server state
- Local React state for UI state
- No global state library needed

**Optimistic Updates** - Immediate UI feedback using cache manipulation

```typescript
// Create
utils.task.list.setData(undefined, [newTask, ...currentData]);

// Update
const updated = currentData.map((t) => (t.id === id ? updatedTask : t));
utils.task.list.setData(undefined, updated);

// Delete
const filtered = currentData.filter((t) => t.id !== id);
utils.task.list.setData(undefined, filtered);
```

---

## Key Technical Decisions

### tRPC

- **Type safety**: Automatic type inference from server to client
- **No codegen**: Types derived directly from implementation
- **DX**: Full autocomplete and type checking
- **Performance**: Batching and deduplication built-in

### React Query

- **Caching**: Smart invalidation and automatic refetching
- **SSR**: First-class support with hydration
- **Optimistic updates**: Manual cache updates for instant feedback
- **DevTools**: Built-in debugging tools

### In-Memory Storage

- **Simplicity**: No database setup or migrations
- **Speed**: Instant reads/writes
- **Transparency**: Clear data flow for demonstration
- **Extensibility**: Easy to swap with Prisma/Drizzle later

### TypeScript

- **Strict mode**: Maximum type safety
- **Inference**: Minimal type annotations needed
- **End-to-end**: Types flow from DB → API → UI
- **Runtime validation**: Zod bridges compile-time and runtime

---

## API Reference

### Endpoints

**`task.list`**

```typescript
query() => Task[]
```

Returns all tasks sorted by creation date (descending).

**`task.create`**

```typescript
mutation({ title: string, description?: string }) => Task
```

Validation: title 1-120 chars, description optional.

**`task.update`**

```typescript
mutation({ id: string, title?: string, description?: string }) => Task
```

Throws `NOT_FOUND` if task doesn't exist.

**`task.delete`**

```typescript
mutation({ id: string }) => Task
```

Throws `NOT_FOUND` if task doesn't exist. Returns deleted task.

---

## Getting Started

### Installation

```bash
yarn install
```

### Development

```bash
yarn dev          # Start dev server (localhost:3000)
yarn typecheck    # Type checking
yarn lint         # ESLint
```

### Production

```bash
yarn build        # Build for production
yarn start        # Start production server
```

---

## Implementation Highlights

### Type Safety

- Zero type casts or assertions
- Discriminated unions for state management
- Type-safe error handling with TRPCError
- Inferred types from Zod schemas

### Performance

- SSR eliminates initial loading state
- Optimistic updates for instant feedback
- React Query deduplication
- Minimal bundle size (no heavy libraries)

### Code Quality

- Consistent naming conventions
- Single responsibility principle
- Separation of concerns (client/server)
- No comments (self-documenting code)
- Error handling at every layer

### Best Practices

- Controlled components for forms
- Proper error boundaries
- Loading states for async operations
- Input sanitization (trim)
- Client and server validation

---

## Technical Constraints

- **No database**: Data resets on restart
- **No authentication**: Public access
- **No persistence**: Memory-only storage
- **Single instance**: No horizontal scaling

These are intentional simplifications focusing on core architectural patterns.

---

## Learn More

- [Next.js App Router](https://nextjs.org/docs/app)
- [tRPC Documentation](https://trpc.io/docs)
- [React Query](https://tanstack.com/query/latest)
- [Zod](https://zod.dev/)
- [TypeScript](https://www.typescriptlang.org/)
