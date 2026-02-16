'use client';

import { trpc } from '@/utils/trpc';
import { useState } from 'react';

/**
 * TaskForm: Component for creating new tasks
 *
 * Implementation decisions:
 * - Client Component ('use client') because it uses interactivity (useState, events)
 * - Controlled inputs via React state (single source of truth)
 * - Dual validation: client-side (UX) + server-side (security)
 */
export default function TaskForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const utils = trpc.useUtils();

  /**
   * Mutation hook for task creation
   *
   * Cache strategy: Optimistic Updates via setData
   * Why not use invalidate()?
   * - invalidate() forces full server refetch
   * - with SSR + initialData, refetch doesn't happen (staleTime: Infinity)
   * - setData() updates cache manually = instant UI
   *
   * Benefits:
   * - Zero perceived delay for user
   * - Fewer server requests
   * - Better UX even with slow connection
   */
  const createTask = trpc.task.create.useMutation({
    onSuccess: (newTask) => {
      setTitle('');
      setDescription('');
      setError('');

      const currentData = utils.task.list.getData();
      if (currentData) {
        // Optimistic update: adds new task to top of list
        utils.task.list.setData(undefined, [newTask, ...currentData]);
      } else {
        // Fallback: if cache empty, force refetch
        utils.task.list.invalidate();
      }
    },
    onError: (err) => {
      setError(err.message ?? 'Erro inesperado');
    },
  });

  /**
   * Submit handler with client-side validation
   *
   * Decision: validate before sending (fail-fast)
   * - Saves unnecessary server request
   * - Instant feedback for user
   * - trim() removes extra spaces (sanitization)
   */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Título é obrigatório');
      return;
    }

    createTask.mutate({
      titulo: title.trim(),
      descricao: description.trim() || undefined,
    });
  };

  const isSubmitting = createTask.isPending;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-gray-200 shadow-sm p-8"
    >
      <h2 className="text-2xl font-semibold text-gray-900 mb-8">
        Criar Nova Tarefa
      </h2>

      <div className="space-y-6">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Título <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError('');
            }}
            disabled={isSubmitting}
            className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
            placeholder="Digite o título da tarefa"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Descrição
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (error) setError('');
            }}
            disabled={isSubmitting}
            rows={4}
            className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed resize-none transition-colors"
            placeholder="Digite a descrição da tarefa (opcional)"
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isSubmitting ? 'Criando...' : 'Criar Tarefa'}
        </button>
      </div>
    </form>
  );
}
