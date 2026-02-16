import { getServerCaller } from '@/server/serverCaller';
import { notFound } from 'next/navigation';
import EditTaskForm from './EditTaskForm';

type PageProps = {
  params: Promise<{ id: string }>;
};

/**
 * Task edit page with SSR
 *
 * Flow:
 * 1. Server fetches task by ID
 * 2. If not found, shows 404
 * 3. If found, passes to EditTaskForm client component
 * 4. Form pre-populated with existing data
 *
 * Benefits of SSR:
 * - No loading state (data already available)
 * - SEO friendly (though not important for auth-protected edit pages)
 * - Validates task exists before rendering form
 */
export default async function EditTaskPage({ params }: PageProps) {
  const { id } = await params;
  const caller = await getServerCaller();

  const tasks = await caller.task.list();
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <EditTaskForm task={task} />
      </div>
    </main>
  );
}
