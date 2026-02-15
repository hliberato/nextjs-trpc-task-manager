import {
  createTaskSchema,
  Task,
  taskSchema,
  updateTaskSchema,
} from '../schemas/task.schema';
import { tasksStore } from '../store/task.store';
import { publicProcedure, router } from '../trpc';

export const taskRouter = router({
  list: publicProcedure.query(() => {
    return Array.from(tasksStore.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }),

  create: publicProcedure.input(createTaskSchema).mutation(({ input }) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: input.title,
      description: input.description ?? null,
      createdAt: new Date(),
    };

    tasksStore.set(newTask.id, newTask);

    return newTask;
  }),

  update: publicProcedure.input(updateTaskSchema).mutation(({ input }) => {
    const existingTask = tasksStore.get(input.id);

    if (!existingTask) {
      throw new Error('Task not found');
    }

    const updatedTask: Task = {
      ...existingTask,
      ...input,
    };

    tasksStore.set(input.id, updatedTask);

    return updatedTask;
  }),

  delete: publicProcedure
    .input(
      taskSchema.pick({
        id: true,
      })
    )
    .mutation(({ input }) => {
      const existingTask = tasksStore.get(input.id);

      if (!existingTask) {
        throw new Error('Task not found');
      }

      tasksStore.delete(input.id);

      return existingTask;
    }),
});
