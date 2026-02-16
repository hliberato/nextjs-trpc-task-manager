'use client';

import { AppRouter } from '@/server/root';
import { trpc } from '@/utils/trpc';
import { inferRouterOutputs } from '@trpc/server';
import { useEffect, useRef } from 'react';
import TaskItem from './TaskItem';

type RouterOutput = inferRouterOutputs<AppRouter>;
type TaskListOutput = RouterOutput['task']['list'];

type Props = {
  initialData: TaskListOutput;
};

/**
 * TaskList: Component for displaying list of tasks with infinite scroll
 *
 * Implementation:
 * - Uses tRPC's useInfiniteQuery for cursor-based pagination
 * - Intersection Observer detects when user scrolls to bottom
 * - Automatically loads next page (3 tasks) when sentinel is visible
 * - First page shows 7 tasks (from SSR) to ensure sentinel is below viewport, subsequent pages load 3 each
 *
 * Benefits:
 * - Better performance with large datasets
 * - Smooth user experience (no "Load More" button needed)
 * - SEO friendly (initial tasks rendered server-side)
 * - Handles real-time updates without pagination issues
 */
export default function TaskList({ initialData }: Props) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    trpc.task.infiniteList.useInfiniteQuery(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
        initialData: {
          pages: [
            {
              tasks: initialData.slice(0, 7),
              nextCursor:
                initialData.length > 7 ? initialData[6].dataCriacao : null,
            },
          ],
          pageParams: [undefined],
        },
        staleTime: Infinity,
      }
    );

  // Sentinel element ref for intersection observer
  const sentinelRef = useRef<HTMLDivElement>(null);
  // Flag to prevent auto-triggering on initial render
  const hasUserScrolled = useRef(false);

  /**
   * Track user scroll to enable infinite scroll only after interaction
   * Prevents automatic triggering when sentinel is visible on page load
   */
  useEffect(() => {
    const handleScroll = () => {
      hasUserScrolled.current = true;
    };

    window.addEventListener('scroll', handleScroll, { once: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /**
   * Intersection Observer for infinite scroll trigger
   *
   * Watches sentinel element at bottom of list
   * When sentinel becomes visible, fetches next page
   * Only triggers after user has scrolled at least once
   */
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        // Only fetch if user has scrolled and sentinel is visible
        if (
          entry.isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage &&
          hasUserScrolled.current
        ) {
          fetchNextPage();
        }
      },
      {
        threshold: 0, // Trigger as soon as any part of sentinel is visible
        rootMargin: '0px', // No anticipatory loading - wait until user reaches the end
      }
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Flatten all pages into single array
  const allTasks = data?.pages.flatMap((page) => page.tasks) ?? [];

  if (isLoading) {
    return (
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 mb-6">Tarefas</h1>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">Carregando tarefas...</p>
        </div>
      </div>
    );
  }

  if (allTasks.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 mb-6">Tarefas</h1>
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
              Nenhuma tarefa ainda
            </h3>
            <p className="text-sm text-gray-500">
              Crie sua primeira tarefa para começar.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-900 mb-6">Tarefas</h1>
      <div className="space-y-3">
        {allTasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}

        {/* Loading indicator while fetching next page */}
        {isFetchingNextPage && (
          <div className="py-8 text-center">
            <div className="animate-spin w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-3 text-sm text-gray-600 loading-dots">
              Carregando mais tarefas
            </p>
          </div>
        )}

        {/* Sentinel element for intersection observer */}
        <div ref={sentinelRef} className="h-4" aria-hidden="true" />

        {/* End of list indicator */}
        {!hasNextPage && allTasks.length > 0 && (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500">Você chegou ao fim da lista</p>
          </div>
        )}
      </div>
    </div>
  );
}
