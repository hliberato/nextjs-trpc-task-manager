import { getServerCaller } from '@/server/serverCaller';
import TaskForm from './TaskForm';
import TaskList from './TaskList';

/**
 * Home page with Server-Side Rendering (SSR)
 *
 * SSR Flow:
 * 1. Next.js executes this async component on server
 * 2. getServerCaller() creates tRPC caller without HTTP overhead
 * 3. Tasks are fetched directly from store (in-memory, instant)
 * 4. Data is passed to TaskList as initialData prop
 * 5. HTML is rendered with tasks already included
 *
 * Benefits:
 * - Faster initial page load (no loading spinner)
 * - Better SEO (crawlers see full content)
 * - Improved Core Web Vitals (FCP, LCP)
 *
 * Architecture decision:
 * - Uses tRPC caller instead of direct store access for consistency
 * - Same validation/transformation logic as HTTP routes
 * - Easy to add authentication/authorization later
 */
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
