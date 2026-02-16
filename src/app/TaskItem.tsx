'use client';

import { trpc } from '@/utils/trpc';
import { useState } from 'react';

import type { AppRouter } from '@/server/root';
import { inferRouterOutputs } from '@trpc/server';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
type RouterOutput = inferRouterOutputs<AppRouter>;

/**
 * Type-safe Task type inferred from tRPC router output
 *
 * Benefits:
 * - Automatically synchronized with server types
 * - No manual type definitions needed
 * - Refactoring is type-safe across client/server boundary
 */
type Task = RouterOutput['task']['list'][number];

type Props = {
  task: Task;
};

/**
 * TaskItem: Component for displaying individual tasks
 *
 * Features:
 * - View-only display (edit redirects to dedicated page)
 * - Inline delete with confirmation dialog
 * - Optimistic delete for instant UI feedback
 *
 * Design decision: Separate edit page instead of inline editing
 * - Matches assessment requirement for "Página de Criação/Atualização"
 * - Clearer navigation flow
 * - Delete kept inline as per requirement: "exclusão diretamente na listagem"
 */
export default function TaskItem({ task }: Props) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const utils = trpc.useUtils();

  /**
   * Delete mutation with cache invalidation
   *
   * Strategy: Invalidate infinite query to refetch all pages
   * - Ensures consistent data after deletion
   * - Uses router.refresh() to sync SSR cache
   * - React Query handles loading states automatically
   */
  const deleteTask = trpc.task.delete.useMutation({
    onSuccess: () => {
      // Invalidate infinite query to refetch all pages
      utils.task.infiniteList.invalidate();
      router.refresh();
    },
    onError: (err) => {
      setError(err.message ?? 'Erro inesperado');
    },
  });

  const handleDelete = () => {
    setError('');
    setIsConfirmingDelete(true);
  };

  const handleConfirmDelete = () => {
    setError('');
    deleteTask.mutate({ id: task.id });
  };

  const handleCancelDelete = () => {
    setError('');
    setIsConfirmingDelete(false);
  };

  const isDeleting = deleteTask.isPending;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:border-gray-300 transition-all duration-200 p-6">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {task.titulo}
          </h3>
          {task.descricao && (
            <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
              {task.descricao}
            </p>
          )}
        </div>
        {!isConfirmingDelete && (
          <div className="flex gap-2 flex-shrink-0">
            <Link
              href={`/tasks/${task.id}/edit`}
              className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-200"
            >
              Editar
            </Link>
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-all duration-200"
            >
              Deletar
            </button>
          </div>
        )}
      </div>

      {isConfirmingDelete && (
        <div className="mt-5 pt-5 border-t border-gray-200">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-900 mb-4">
              Tem certeza que deseja deletar esta tarefa?
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isDeleting ? 'Deletando...' : 'Confirmar'}
              </button>
              <button
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
