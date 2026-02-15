import { getServerCaller } from '@/server/serverCaller';
import TaskForm from './TaskForm';
import TaskList from './TaskList';

export default async function Home() {
  const caller = await getServerCaller();

  const tasks = await caller.task.list();

  return (
    <main>
      <TaskForm />
      <TaskList initialData={tasks} />
    </main>
  );
}
