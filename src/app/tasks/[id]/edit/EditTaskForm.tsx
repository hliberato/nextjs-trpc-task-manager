'use client';

import { AppRouter } from '@/server/root';
import { trpc } from '@/utils/trpc';
import { inferRouterOutputs } from '@trpc/server';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type RouterOutput = inferRouterOutputs<AppRouter>;
type Task = RouterOutput['task']['list'][number];

type Props = {
  task: Task;
};

/**
 * EditTaskForm: Form for editing existing tasks
 *
 * Implementation:
 * - Pre-populated with current task data
 * - Redirects to home after successful update
 * - Has cancel button to return without saving
 * - Uses router.refresh() to invalidate SSR cache after update
 */
export default function EditTaskForm({ task }: Props) {
  const [titulo, setTitulo] = useState(task.titulo);
  const [descricao, setDescricao] = useState(task.descricao || '');
  const [error, setError] = useState('');

  const router = useRouter();

  const updateTask = trpc.task.update.useMutation({
    onSuccess: () => {
      router.push('/');
      router.refresh();
    },
    onError: (err) => {
      setError(err.message ?? 'Erro inesperado');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!titulo.trim()) {
      setError('Título é obrigatório');
      return;
    }

    updateTask.mutate({
      id: task.id,
      titulo: titulo.trim(),
      descricao: descricao.trim() || undefined,
    });
  };

  const isSubmitting = updateTask.isPending;

  // Check if form has unsaved changes
  const hasChanges =
    titulo.trim() !== task.titulo ||
    descricao.trim() !== (task.descricao || '');

  return (
    <div>
      {/* Header with back button */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Voltar para lista
        </Link>
        <h1 className="text-3xl font-semibold text-gray-900">Editar Tarefa</h1>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-200 shadow-sm p-8"
      >
        <div className="space-y-6">
          <div>
            <label
              htmlFor="titulo"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Título <span className="text-red-500">*</span>
            </label>
            <input
              id="titulo"
              type="text"
              value={titulo}
              onChange={(e) => {
                setTitulo(e.target.value);
                if (error) setError('');
              }}
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
              placeholder="Digite o título da tarefa"
              autoFocus
            />
          </div>

          <div>
            <label
              htmlFor="descricao"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Descrição
            </label>
            <textarea
              id="descricao"
              value={descricao}
              onChange={(e) => {
                setDescricao(e.target.value);
                if (error) setError('');
              }}
              disabled={isSubmitting}
              rows={6}
              className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed resize-none transition-colors"
              placeholder="Digite a descrição da tarefa (opcional)"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !hasChanges}
              className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            <Link
              href="/"
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-200 text-center"
            >
              Cancelar
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
