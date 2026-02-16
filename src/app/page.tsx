import { getServerCaller } from '@/server/serverCaller';
import Link from 'next/link';
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
 * - Separate pages for create/edit (matches assessment requirements)
 */
export default async function Home() {
  const caller = await getServerCaller();

  const tasks = await caller.task.list();

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header with create button */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gerenciador de Tarefas
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Organize suas tarefas de forma simples e eficiente
            </p>
          </div>
          <Link
            href="/tasks/new"
            className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Nova Tarefa
          </Link>
        </div>

        <TaskList initialData={tasks} />

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} - Gerenciador de Tarefas
          </p>
          <p className="mt-2 text-sm text-gray-500">
            <a
              href="https://github.com/hliberato/nextjs-trpc-task-manager"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            >
              Ver código no GitHub
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
