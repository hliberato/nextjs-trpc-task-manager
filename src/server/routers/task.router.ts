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
   */
  list: publicProcedure.query(() => {
    return Array.from(tasksStore.values()).sort(
      (a, b) => b.dataCriacao - a.dataCriacao
    );
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
