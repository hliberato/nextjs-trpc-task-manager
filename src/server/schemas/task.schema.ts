import { z } from 'zod';

/**
 * Validation schema for task creation
 *
 * Validation decisions:
 * - `titulo`: min(1) ensures non-empty string after trim
 * - `titulo`: max(120) reasonable limit for titles (UI/DB compatible)
 * - `descricao`: optional (.optional() instead of .nullable()) for flexibility
 *
 * Why Zod?
 * - Runtime validation: protects against malformed payloads
 * - Type inference: keeps types automatically synchronized
 * - Custom messages: better UX with descriptive errors
 */
export const createTaskSchema = z.object({
  titulo: z
    .string()
    .min(1, 'Título é obrigatório')
    .max(120, 'Título muito longo'),
  descricao: z.string().optional(),
});

/**
 * Validation schema for task updates
 *
 * Decision: all fields except `id` are optional
 * - Enables partial updates (PATCH-like behavior)
 * - Client decides which fields to update
 * - Minimizes payload size for simple updates
 */
export const updateTaskSchema = z.object({
  id: z.string(),
  titulo: z.string().min(1).max(120).optional(),
  descricao: z.string().optional(),
});

/**
 * Type inference via Zod
 *
 * Benefit: types automatically derived from schemas
 * - Ensures runtime validation = compile-time validation
 * - Single source of truth for data structure
 * - Refactorings are type-safe
 */
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
