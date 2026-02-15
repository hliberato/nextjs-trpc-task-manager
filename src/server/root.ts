import { taskRouter } from './routers/task.router';
import { router } from './trpc';

export const appRouter = router({
  task: taskRouter,
});

export type AppRouter = typeof appRouter;
