'use client';

import { trpc } from '@/utils/trpc';
import { useState } from 'react';

import type { AppRouter } from '@/server/root';
import { inferRouterOutputs } from '@trpc/server';
type RouterOutput = inferRouterOutputs<AppRouter>;

type Task = RouterOutput['task']['list'][number];

type Props = {
  task: Task;
};

export default function TaskItem({ task }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [titulo, setTitulo] = useState(task.title);
  const [descricao, setDescricao] = useState(task.description || '');
  const [error, setError] = useState('');

  const utils = trpc.useUtils();

  const updateTask = trpc.task.update.useMutation({
    onSuccess: () => {
      // Exit edit mode
      setIsEditing(false);
      setError('');

      // Invalidate task list to refresh data
      utils.task.list.invalidate();
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const deleteTask = trpc.task.delete.useMutation({
    onSuccess: () => {
      // Invalidate task list to refresh data
      utils.task.list.invalidate();
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSave = () => {
    setError('');

    // Frontend validation
    if (!titulo.trim()) {
      setError('Título é obrigatório');
      return;
    }

    updateTask.mutate({
      id: task.id,
      title: titulo.trim(),
      description: descricao.trim() || undefined,
    });
  };

  const handleCancel = () => {
    // Reset to original values
    setTitulo(task.title);
    setDescricao(task.description || '');
    setError('');
    setIsEditing(false);
  };

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

  const originalDescricao = task.description ?? '';

  const hasChanges =
    titulo.trim() !== task.title || descricao.trim() !== originalDescricao;

  const isSaving = updateTask.isPending;
  const isDeleting = deleteTask.isPending;

  if (isEditing) {
    return (
      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="mb-3">
          <label
            htmlFor={`titulo-${task.id}`}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Título <span className="text-red-500">*</span>
          </label>
          <input
            id={`titulo-${task.id}`}
            type="text"
            value={titulo}
            onChange={(e) => {
              setTitulo(e.target.value);
              if (error) setError('');
            }}
            disabled={isSaving}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Digite o título"
          />
        </div>

        <div className="mb-3">
          <label
            htmlFor={`descricao-${task.id}`}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Descrição
          </label>
          <textarea
            id={`descricao-${task.id}`}
            value={descricao}
            onChange={(e) => {
              setDescricao(e.target.value);
              if (error) setError('');
            }}
            disabled={isSaving}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
            placeholder="Digite a descrição (opcional)"
          />
        </div>

        {error && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? 'Salvando...' : 'Salvar'}
          </button>
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
        {!isConfirmingDelete && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-colors"
            >
              Editar
            </button>
            <button
              onClick={handleDelete}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 transition-colors"
            >
              Deletar
            </button>
          </div>
        )}
      </div>
      {task.description && (
        <p className="text-gray-600 text-sm whitespace-pre-wrap">
          {task.description}
        </p>
      )}

      {isConfirmingDelete && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-gray-800 mb-3 font-medium">
            Tem certeza que deseja excluir?
          </p>

          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isDeleting ? 'Excluindo...' : 'Confirmar'}
            </button>
            <button
              onClick={handleCancelDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
