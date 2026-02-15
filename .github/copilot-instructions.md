# Copilot Instructions

This project is a technical assessment built with:

- Next.js 16 (App Router)
- TypeScript
- tRPC v11
- React Query
- Tailwind CSS

## Architectural Guidelines

- Use the App Router (no Pages Router).
- Keep server logic inside `src/server/`.
- Use `createCaller` for SSR data fetching.
- Do not introduce additional libraries unless strictly necessary.
- Prefer simple and readable implementations over complex abstractions.
- Keep separation between:
  - Server logic (tRPC routers, context)
  - Client components
  - UI components

## tRPC Conventions

- Use `publicProcedure` unless authentication is explicitly required.
- Always validate inputs using Zod.
- Use `TRPCError` for meaningful error responses.
- Avoid business logic inside React components.

## React & UI Guidelines

- Use functional components.
- Use controlled inputs for forms.
- Implement proper loading and error states.
- Use Tailwind with minimal and clean styling.
- Avoid unnecessary UI libraries.

## Data Fetching Strategy

- Use SSR via `createCaller` for initial data load.
- Hydrate data using React Query.
- Invalidate queries after mutations.
- Use cursor-based pagination when implementing infinite scroll.

## Code Quality

- Keep code simple and explicit.
- Avoid overengineering.
- Prefer clarity over cleverness.
- Add comments only when explaining architectural decisions.
