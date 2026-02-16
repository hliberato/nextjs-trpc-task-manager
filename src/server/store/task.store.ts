/**
 * Task data model
 *
 * Design decisions:
 * - `dataCriacao` uses timestamp (number) instead of Date for easier JSON serialization
 * - `descricao` is nullable to differentiate absence of value vs empty string
 * - `id` is string (UUID) for future database compatibility
 */
export type Task = {
  id: string;
  titulo: string;
  descricao: string | null;
  dataCriacao: number;
};

/**
 * In-memory storage using Map
 *
 * Technical decision: Map chosen over array because:
 * - O(1) lookup by ID (vs O(n) in array)
 * - Simplifies update/delete operations without array rebuilding
 * - API similar to key-value databases
 *
 * Trade-off: data is lost on server restart (no persistence)
 * For production: replace with Prisma/Drizzle + PostgreSQL keeping same interface
 */
export const tasksStore = new Map<string, Task>();
