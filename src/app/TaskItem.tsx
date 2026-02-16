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
  const [title, setTitle] = useState(task.titulo);
  const [description, setDescription] = useState(task.descricao || '');
  const [error, setError] = useState('');

  const utils = trpc.useUtils();

  const updateTask = trpc.task.update.useMutation({
    onSuccess: (updatedTask) => {
      setIsEditing(false);
      setError('');

      const currentData = utils.task.list.getData();
      if (currentData) {
        const updatedData = currentData.map((t) =>
          t.id === updatedTask.id ? updatedTask : t
        );
        utils.task.list.setData(undefined, updatedData);
      } else {
        utils.task.list.invalidate();
      }
    },
    onError: (err) => {
      setError(err.message ?? 'Erro inesperado');
    },
  });

  const deleteTask = trpc.task.delete.useMutation({
    onSuccess: () => {
      const currentData = utils.task.list.getData();
      if (currentData) {
        const updatedData = currentData.filter((t) => t.id !== task.id);
        utils.task.list.setData(undefined, updatedData);
      } else {
        utils.task.list.invalidate();
      }
    },
    onError: (err) => {
      setError(err.message ?? 'Erro inesperado');
    },
  });

  const handleSave = () => {
    setError('');

    if (!title.trim()) {
      setError('Título é obrigatório');
      return;
    }

    updateTask.mutate({
      id: task.id,
      titulo: title.trim(),
      descricao: description.trim() || undefined,
    });
  };

  const handleCancel = () => {
    setTitle(task.titulo);
    setDescription(task.descricao || '');
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

  const originalDescription = task.descricao ?? '';

  const hasChanges =
    title.trim() !== task.titulo || description.trim() !== originalDescription;

  const isSaving = updateTask.isPending;
  const isDeleting = deleteTask.isPending;

  if (isEditing) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="space-y-5">
          <div>
            <label
              htmlFor={`title-${task.id}`}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Título <span className="text-red-500">*</span>
            </label>
            <input
              id={`title-${task.id}`}
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              disabled={isSaving}
              className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
              placeholder="Digite o título"
            />
          </div>

          <div>
            <label
              htmlFor={`description-${task.id}`}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Descrição
            </label>
            <textarea
              id={`description-${task.id}`}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (error) setError('');
              }}
              disabled={isSaving}
              rows={3}
              className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed resize-none transition-colors"
              placeholder="Digite a descrição (opcional)"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSaving ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-200"
            >
              Editar
            </button>
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
