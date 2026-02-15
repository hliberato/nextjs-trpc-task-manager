'use client';

import { AppRouter } from '@/server/root';
import { trpc } from '@/utils/trpc';
import { inferRouterOutputs } from '@trpc/server';
import TaskItem from './TaskItem';

type RouterOutput = inferRouterOutputs<AppRouter>;
type TaskListOutput = RouterOutput['task']['list'];

type Props = {
  initialData: TaskListOutput;
};

export default function TaskList({ initialData }: Props) {
  const { data } = trpc.task.list.useQuery(undefined, {
    initialData,
  });

  const items = data ?? [];

  if (items.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Tarefas</h1>
        <p className="text-gray-500 text-sm">Nenhuma tarefa cadastrada.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Tarefas</h1>

      <div className="space-y-4">
        {items.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}
