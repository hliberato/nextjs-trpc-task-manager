# Task Manager - Next.js + tRPC

A modern, full-stack task management application built with Next.js 15, tRPC v11, and React Query.

This project demonstrates a clean architecture with Server-Side Rendering (SSR), type-safe APIs, optimistic UI updates, and a polished "Big Tech SaaS" design.

---

## ✨ Features

- ✅ **Create tasks** with title and description
- ✅ **Inline editing** - edit tasks directly in the UI
- ✅ **Delete with confirmation** - inline confirmation UI (no modals)
- ✅ **Optimistic updates** - instant UI feedback using cache manipulation
- ✅ **Server-Side Rendering** - initial data fetched on the server
- ✅ **Type-safe** - end-to-end type safety with tRPC
- ✅ **Form validation** - frontend and backend validation with Zod
- ✅ **Clean UI** - minimal, professional design with Tailwind CSS

---

## 🛠 Tech Stack

- **Next.js 15.2.3** (App Router)
- **TypeScript 5.4.5**
- **tRPC v11.10.0** (type-safe API)
- **React Query 5.59.16** (data fetching & caching)
- **Tailwind CSS 3.4.3** (styling)
- **Zod 3.23.8** (runtime validation)

---

## 📁 Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── api/trpc/[trpc]/     # tRPC HTTP handler
│   ├── TaskForm.tsx          # Create task form
│   ├── TaskItem.tsx          # Task card (view/edit/delete)
│   ├── TaskList.tsx          # Tasks list with SSR
│   ├── page.tsx              # Home page
│   ├── layout.tsx            # Root layout
│   ├── providers.tsx         # React Query provider
│   └── globals.css           # Tailwind directives
│
├── server/                   # Backend (tRPC)
│   ├── routers/
│   │   └── task.router.ts    # Task CRUD operations
│   ├── schemas/
│   │   └── task.schema.ts    # Zod validation schemas
│   ├── store/
│   │   └── task.store.ts     # In-memory data store
│   ├── root.ts               # AppRouter definition
│   ├── trpc.ts               # tRPC setup
│   ├── context.ts            # Request context
│   └── serverCaller.ts       # Server-side tRPC caller
│
└── utils/
    └── trpc.ts               # Client-side tRPC setup
```

---

## 🏗 Architecture

### Backend (tRPC)

The backend uses **tRPC** for type-safe API endpoints with automatic type inference.

#### Task Router (`task.router.ts`)

- **`task.list`** - Returns all tasks sorted by creation date (newest first)
- **`task.create`** - Creates a new task with title and optional description
- **`task.update`** - Updates an existing task
- **`task.delete`** - Deletes a task by ID

#### Data Model

```typescript
type Task = {
  id: string; // UUID
  title: string; // Required, 1-120 chars
  description: string | null; // Optional
  createdAt: number; // Unix timestamp
};
```

#### Validation

All inputs are validated using **Zod schemas**:

- Title is required (1-120 characters)
- Description is optional
- Proper error messages for validation failures

#### Storage

Data is stored in-memory using a `Map<string, Task>`:

- Simple and fast
- Resets on server restart
- Perfect for demo/testing purposes

---

### Frontend (Next.js App Router)

#### Server-Side Rendering

The home page (`page.tsx`) uses **true SSR**:

1. Fetches tasks on the server using `createCaller`
2. Passes `initialData` to client component
3. React Query hydrates the cache
4. No loading state on initial render

#### Client Components

**TaskForm** - Create new tasks

- Controlled inputs with `useState`
- Frontend validation (prevents empty title)
- Shows backend validation errors
- Resets form on success

**TaskItem** - Display and edit tasks

- Three modes: View, Edit, Delete Confirmation
- Inline editing (no modal)
- Inline delete confirmation (no `window.confirm()`)
- Optimistic updates for instant feedback

**TaskList** - Display all tasks

- SSR with `initialData`
- Clean empty state with icon
- Sorted by newest first

#### Cache Management

The app uses **optimistic updates** with `setQueryData`:

**Create**: Prepends new task to cache array

```typescript
utils.task.list.setData(undefined, [newTask, ...currentData]);
```

**Update**: Replaces task in cache array

```typescript
const updated = currentData.map((t) =>
  t.id === updatedTask.id ? updatedTask : t
);
utils.task.list.setData(undefined, updated);
```

**Delete**: Removes task from cache array

```typescript
const filtered = currentData.filter((t) => t.id !== taskId);
utils.task.list.setData(undefined, filtered);
```

This ensures **instant UI updates** without waiting for server response.

---

## 🎨 Design System

The UI follows a **minimal "Big Tech SaaS"** aesthetic:

- **Color Palette**: Neutral grayscale with subtle blue accents
- **Typography**: Clear hierarchy with `font-medium` and `font-semibold`
- **Spacing**: Generous padding and consistent gaps
- **Borders**: Rounded corners (`rounded-xl`, `rounded-lg`)
- **Shadows**: Subtle `shadow-sm` with hover states
- **Transitions**: Smooth `transition-all duration-200`
- **Focus States**: Visible focus rings for accessibility
- **Responsive**: Mobile-friendly with max-width containers

### Key UI Elements

- **Page Background**: Soft gray (`bg-gray-50`)
- **Cards**: White with borders (`bg-white border-gray-200`)
- **Inputs**: Large padding (`px-4 py-2.5`) with focus rings
- **Buttons**: Blue primary, gray secondary, red destructive
- **Empty State**: Centered with icon, heading, and description

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (or 20+)
- Yarn (or npm/pnpm)

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project
cd nextjs-trpc-task-manager

# Install dependencies
yarn install
```

### Development

```bash
# Start development server
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
# Build the app
yarn build

# Start production server
yarn start
```

### Type Checking

```bash
# Run TypeScript type checker
yarn typecheck
```

### Linting

```bash
# Run ESLint
yarn lint
```

---

## 🔑 Key Decisions

### Why tRPC?

- **End-to-end type safety** without code generation
- **Automatic type inference** from server to client
- **No need for REST/GraphQL** for internal APIs
- **Excellent DX** with autocomplete and type checking

### Why React Query?

- **Smart caching** with automatic refetching
- **SSR support** with hydration
- **Optimistic updates** for instant UI feedback
- **Built-in loading/error states**

### Why In-Memory Storage?

- **Simplicity** - no database setup required
- **Fast** - perfect for demos and testing
- **Easy to understand** - clear data flow
- Can be easily replaced with a real database later

### Why No Database?

This is a **technical assessment** focused on:

- Clean architecture
- Type safety
- Code quality
- Understanding of modern React patterns

Adding a database would add unnecessary complexity for the core demonstration.

---

## 🧪 Testing the App

1. **Create your first task**
   - Enter title and description
   - Click "Create Task"
   - Task appears instantly (optimistic update)

2. **Edit a task**
   - Click "Edit" button
   - Modify title/description
   - Click "Save" (disabled if no changes)
   - Changes appear instantly

3. **Delete a task**
   - Click "Delete" button
   - Inline confirmation appears
   - Click "Confirm" to delete
   - Task disappears instantly

4. **Form validation**
   - Try submitting without title → See error
   - Try submitting with very long title → Backend validation error

---

## 📝 API Reference

### tRPC Endpoints

#### `task.list`

```typescript
query() => Task[]
```

Returns all tasks sorted by `createdAt` (descending).

#### `task.create`

```typescript
mutation({ title: string, description?: string }) => Task
```

Creates a new task. Title is required (1-120 chars).

#### `task.update`

```typescript
mutation({ id: string, title?: string, description?: string }) => Task
```

Updates an existing task. Throws `NOT_FOUND` if task doesn't exist.

#### `task.delete`

```typescript
mutation({ id: string }) => Task
```

Deletes a task. Throws `NOT_FOUND` if task doesn't exist.

---

## 🔮 Future Enhancements

### Backend

- [ ] Add PostgreSQL/MongoDB for persistence
- [ ] Add user authentication (NextAuth.js)
- [ ] Add task categories/tags
- [ ] Add task due dates
- [ ] Add task priority levels
- [ ] Add task completion status
- [ ] Add search and filtering

### Frontend

- [ ] Add infinite scroll pagination
- [ ] Add drag-and-drop reordering
- [ ] Add keyboard shortcuts
- [ ] Add dark mode
- [ ] Add animations (Framer Motion)
- [ ] Add task details modal
- [ ] Add bulk operations

### Testing

- [ ] Unit tests (Vitest)
- [ ] Integration tests (Playwright)
- [ ] E2E tests for critical flows
- [ ] API tests for tRPC endpoints

### DevOps

- [ ] Docker setup
- [ ] CI/CD pipeline
- [ ] Deploy to Vercel/Railway
- [ ] Environment variables setup
- [ ] Logging and monitoring

---

## 📚 Learn More

### Official Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Zod Documentation](https://zod.dev/)

### Useful Resources

- [tRPC with Next.js App Router](https://trpc.io/docs/client/nextjs/setup)
- [React Query SSR Guide](https://tanstack.com/query/latest/docs/framework/react/guides/ssr)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

---

## 👤 Author

Built as a technical assessment to demonstrate:

- Modern React/Next.js patterns
- Type-safe full-stack development
- Clean architecture and code organization
- Professional UI/UX design
- Best practices for state management

---

## 📄 License

This project is private and built for assessment purposes.
