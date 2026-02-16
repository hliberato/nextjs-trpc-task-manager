import { z } from 'zod';

export const createTaskSchema = z.object({
  titulo: z
    .string()
    .min(1, 'Título é obrigatório')
    .max(120, 'Título muito longo'),
  descricao: z.string().optional(),
});

export const updateTaskSchema = z.object({
  id: z.string(),
  titulo: z.string().min(1).max(120).optional(),
  descricao: z.string().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
