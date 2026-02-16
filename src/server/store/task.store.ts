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

/**
 * Seed data for development
 * Adds sample tasks on server start to facilitate testing
 */
const seedTasks: Task[] = [
  {
    id: crypto.randomUUID(),
    titulo: 'Implementar autenticação',
    descricao: 'Adicionar sistema de login com NextAuth.js',
    dataCriacao: Date.now() - 3600000, // 1 hora atrás
  },
  {
    id: crypto.randomUUID(),
    titulo: 'Criar documentação',
    descricao: 'Documentar endpoints da API e componentes React',
    dataCriacao: Date.now() - 7200000, // 2 horas atrás
  },
  {
    id: crypto.randomUUID(),
    titulo: 'Configurar CI/CD',
    descricao: null,
    dataCriacao: Date.now() - 10800000, // 3 horas atrás
  },
  {
    id: crypto.randomUUID(),
    titulo: 'Implementar testes unitários',
    descricao: 'Adicionar testes com Jest para componentes críticos',
    dataCriacao: Date.now() - 14400000, // 4 horas atrás
  },
  {
    id: crypto.randomUUID(),
    titulo: 'Otimizar performance',
    descricao: 'Analisar bundle size e implementar code splitting',
    dataCriacao: Date.now() - 18000000, // 5 horas atrás
  },
  {
    id: crypto.randomUUID(),
    titulo: 'Configurar Docker',
    descricao:
      'Criar Dockerfile e docker-compose para ambiente de desenvolvimento',
    dataCriacao: Date.now() - 21600000, // 6 horas atrás
  },
  {
    id: crypto.randomUUID(),
    titulo: 'Implementar cache Redis',
    descricao: 'Adicionar Redis para cache de queries frequentes',
    dataCriacao: Date.now() - 25200000, // 7 horas atrás
  },
  {
    id: crypto.randomUUID(),
    titulo: 'Migrar para PostgreSQL',
    descricao: 'Substituir storage em memória por PostgreSQL com Prisma',
    dataCriacao: Date.now() - 28800000, // 8 horas atrás
  },
  {
    id: crypto.randomUUID(),
    titulo: 'Adicionar validação avançada',
    descricao: 'Implementar validação de campos com mensagens customizadas',
    dataCriacao: Date.now() - 32400000, // 9 horas atrás
  },
  {
    id: crypto.randomUUID(),
    titulo: 'Implementar notificações',
    descricao: null,
    dataCriacao: Date.now() - 36000000, // 10 horas atrás
  },
  {
    id: crypto.randomUUID(),
    titulo: 'Criar dashboard analytics',
    descricao: 'Adicionar gráficos e estatísticas de uso',
    dataCriacao: Date.now() - 39600000, // 11 horas atrás
  },
  {
    id: crypto.randomUUID(),
    titulo: 'Implementar busca',
    descricao: 'Adicionar funcionalidade de busca por título e descrição',
    dataCriacao: Date.now() - 43200000, // 12 horas atrás
  },
];

// Populate store with seed data
seedTasks.forEach((task) => tasksStore.set(task.id, task));
