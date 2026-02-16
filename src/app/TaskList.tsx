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
    staleTime: Infinity,
  });

  const items = data ?? [];

  if (items.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 mb-6">Tasks</h1>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="max-w-sm mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No tasks yet
            </h3>
            <p className="text-sm text-gray-500">
              Create your first task to get started.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-900 mb-6">Tasks</h1>
      <div className="space-y-3">
        {items.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}
