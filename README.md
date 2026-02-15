# Task Manager -- Technical Assessment

This project is a simple Task Management system built as a technical
assessment.

The goal was to implement a minimal but well-structured fullstack
application using Next.js and tRPC, focusing on architecture, clarity
and correctness rather than visual design.

------------------------------------------------------------------------

## Tech Stack

-   Next.js 16 (App Router)
-   TypeScript
-   tRPC v11
-   React Query
-   Tailwind CSS
-   Zod (input validation)

------------------------------------------------------------------------

## Architecture Overview

### Backend

The backend is implemented using tRPC and keeps data in memory (no
database).

Structure:

-   `src/server/`
    -   `api/routers/` -- task router
    -   `context.ts` -- typed tRPC context
    -   `serverCaller.ts` -- used for SSR
    -   `store.ts` -- in-memory task storage

Each task contains:

-   `id`
-   `titulo`
-   `descricao`
-   `dataCriacao`

CRUD operations are implemented with proper validation and meaningful
error handling using `TRPCError`.

Input validation is handled with Zod.

------------------------------------------------------------------------

### Server-Side Rendering (SSR)

The task list page uses true SSR:

-   Data is fetched on the server using `createCaller`.
-   The result is passed to a client component.
-   React Query hydrates using `initialData`.

This avoids unnecessary client-side loading on first render and keeps
the page SEO-friendly.

------------------------------------------------------------------------

### Pagination

The list endpoint uses cursor-based pagination based on `dataCriacao`.

It returns:

    {
      items: Task[],
      nextCursor: number | null
    }

This structure allows easy implementation of infinite scroll.

------------------------------------------------------------------------

### Frontend

-   Functional components
-   Controlled form inputs
-   Proper loading and error states
-   Query invalidation after mutations
-   Minimal UI with Tailwind CSS

The goal was to keep the interface simple and focus on correct behavior
and clean structure.

------------------------------------------------------------------------

## Running the Project

Install dependencies:

    yarn install

Run development server:

    yarn dev

Open:

    http://localhost:3000

------------------------------------------------------------------------

## Important Notes

-   Data is stored in memory and resets on server restart.
-   This was intentionally kept simple for the purpose of the
    assessment.
-   The project avoids unnecessary abstractions and third-party
    libraries.

------------------------------------------------------------------------

## Possible Improvements

-   Add persistent storage (e.g. database)
-   Add authentication
-   Add optimistic updates
-   Improve UI and accessibility
-   Add tests
