export type Task = {
  id: string;
  titulo: string;
  descricao: string | null;
  dataCriacao: number;
};

export const tasksStore = new Map<string, Task>();
