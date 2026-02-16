import { getServerCaller } from '@/server/serverCaller';
import TaskForm from './TaskForm';
import TaskList from './TaskList';

export default async function Home() {
  const caller = await getServerCaller();

  const tasks = await caller.task.list();

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <TaskForm />
        <TaskList initialData={tasks} />
      </div>
    </main>
  );
}
