export type Task = {
  id: string;
  title: string;
  description: string | null;
  createdAt: number;
};

export const tasksStore = new Map<string, Task>();
