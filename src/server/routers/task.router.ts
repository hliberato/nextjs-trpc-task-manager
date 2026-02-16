import { TRPCError } from '@trpc/server';
import z from 'zod';
import { createTaskSchema, updateTaskSchema } from '../schemas/task.schema';
import { Task, tasksStore } from '../store/task.store';
import { publicProcedure, router } from '../trpc';

export const taskRouter = router({
  list: publicProcedure.query(() => {
    return Array.from(tasksStore.values()).sort(
      (a, b) => b.dataCriacao - a.dataCriacao
    );
  }),

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
