import { TRPCError } from '@trpc/server';
import z from 'zod';
import { createTaskSchema, updateTaskSchema } from '../schemas/task.schema';
import { Task, tasksStore } from '../store/task.store';
import { publicProcedure, router } from '../trpc';

/**
 * tRPC Router for task CRUD operations
 *
 * Architectural decisions:
 * - Uses `publicProcedure` since there's no authentication (as per requirements)
 * - Each procedure has Zod validation before executing logic
 * - Errors are thrown via TRPCError for type-safe serialization
 * - Returns complete objects (not just IDs) to optimize client cache
 */
export const taskRouter = router({
  /**
   * LIST: Returns all tasks sorted by creation date (newest first)
   *
   * Decision: server-side sorting instead of client-side
   * - Ensures consistent ordering
   * - Facilitates future pagination (cursor-based)
   * - Client doesn't need to re-sort on each update
   * - Used for SSR initial page load
   */
  list: publicProcedure.query(() => {
    return Array.from(tasksStore.values()).sort(
      (a, b) => b.dataCriacao - a.dataCriacao
    );
  }),

  /**
   * INFINITE LIST: Paginated task list for infinite scroll
   *
   * Cursor-based pagination:
   * - First page: returns initial 9 tasks (ensures screen is filled and sentinel is below fold)
   * - Subsequent pages: returns 3 tasks per page (smooth scrolling)
   * - Cursor: timestamp of last task in current page
   * - Next cursor: timestamp to fetch older tasks
   *
   * Benefits over offset-based:
   * - Handles real-time updates (new tasks don't shift pages)
   * - No duplicate items if data changes during pagination
   * - Efficient for sorted time-based data
   *
   * NOTE: Includes artificial 1.5s delay ONLY for subsequent pages (infinite scroll)
   * This helps demonstrate loading states during development/evaluation
   * First page loads instantly to avoid delay after create/update operations
   * In production, remove setTimeout to get instant in-memory responses
   */
  infiniteList: publicProcedure
    .input(
      z.object({
        cursor: z.number().optional(), // timestamp of last task from previous page
      })
    )
    .query(async ({ input }) => {
      /**
       * FAKE DELAY: Simulates server response time for infinite scroll
       * Purpose: Demonstrate loading UI during infinite scroll pagination
       * Duration: 1.5 seconds
       * Applied ONLY to subsequent pages (when cursor exists)
       * First page is instant to avoid delay after create/edit operations
       * TODO: Remove this setTimeout in production for instant responses
       */
      if (input.cursor !== undefined) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      const allTasks = Array.from(tasksStore.values()).sort(
        (a, b) => b.dataCriacao - a.dataCriacao
      );

      // Determine page size: 9 for first page, 3 for subsequent
      const isFirstPage = input.cursor === undefined;
      const limit = isFirstPage ? 9 : 3;

      // Filter tasks older than cursor (if cursor exists)
      const filteredTasks = input.cursor
        ? allTasks.filter((task) => task.dataCriacao < input.cursor!)
        : allTasks;

      // Get current page tasks
      const tasks = filteredTasks.slice(0, limit);

      // Determine next cursor (timestamp of last task in current page)
      const nextCursor =
        tasks.length === limit ? tasks[tasks.length - 1].dataCriacao : null;

      return {
        tasks,
        nextCursor,
      };
    }),

  /**
   * GET BY ID: Returns a single task by ID
   *
   * Used for edit page to fetch task data
   * - Efficient: fetches only one task instead of all
   * - Returns null if not found (handled by page)
   */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      const task = tasksStore.get(input.id);
      return task ?? null;
    }),

  /**
   * CREATE: Creates new task
   *
   * Implementation decisions:
   * - crypto.randomUUID() for unique IDs (available in Node 19+)
   * - `descricao ?? null` converts undefined to null for type consistency
   * - Date.now() for timestamp (facilitates sorting and serialization)
   * - Returns complete task for client to update cache optimistically
   */
  create: publicProcedure.input(createTaskSchema).mutation(({ input }) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      titulo: input.titulo,
      descricao: input.descricao ?? null,
      dataCriacao: Date.now(),
    };

    tasksStore.set(newTask.id, newTask);

    return newTask;
  }),

  /**
   * UPDATE: Updates existing task (partial update)
   *
   * Decisions:
   * - Checks existence before updating (fail-fast)
   * - Uses spread operator for merge (preserves unsent fields)
   * - TRPCError with code 'NOT_FOUND' for type-safe error handling on client
   * - Returns complete updated task (not just success boolean)
   */
  update: publicProcedure.input(updateTaskSchema).mutation(({ input }) => {
    const existingTask = tasksStore.get(input.id);

    if (!existingTask) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Task not found',
      });
    }

    const updatedTask: Task = {
      ...existingTask,
      ...input,
    };

    tasksStore.set(input.id, updatedTask);

    return updatedTask;
  }),

  /**
   * DELETE: Removes task
   *
   * Decisions:
   * - Validates existence before deleting (avoids deleting non-existent ID without feedback)
   * - Returns deleted task (useful for undo/rollback or logging)
   * - Inline schema (z.object) since validation is simple
   */
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      const existingTask = tasksStore.get(input.id);

      if (!existingTask) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found',
        });
      }

      tasksStore.delete(input.id);

      return existingTask;
    }),
});
