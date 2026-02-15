import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(120, 'Title too long'),
  description: z.string().optional(),
});

export const updateTaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(120).optional(),
  description: z.string().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
