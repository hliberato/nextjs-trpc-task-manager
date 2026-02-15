'use client'

import { useState } from 'react'
import { trpc } from '@/utils/trpc'

export default function TaskForm() {
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [error, setError] = useState('')

  const utils = trpc.useUtils()

  const createTask = trpc.task.create.useMutation({
    onSuccess: () => {
      // Reset form
      setTitulo('')
      setDescricao('')
      setError('')
      
      // Invalidate task list to refresh data
      utils.task.list.invalidate()
    },
    onError: (err) => {
      setError(err.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Frontend validation
    if (!titulo.trim()) {
      setError('Título é obrigatório')
      return
    }

    createTask.mutate({
      titulo: titulo.trim(),
      descricao: descricao.trim() || undefined,
    })
  }

  const isSubmitting = createTask.isPending

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Nova Tarefa</h2>

      <div className="mb-4">
        <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-2">
          Título <span className="text-red-500">*</span>
        </label>
        <input
          id="titulo"
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          disabled={isSubmitting}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="Digite o título da tarefa"
        />
      </div>

      <div className="mb-6">
        <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-2">
          Descrição
        </label>
        <textarea
          id="descricao"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          disabled={isSubmitting}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
          placeholder="Digite a descrição da tarefa (opcional)"
        />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? 'Criando...' : 'Criar Tarefa'}
      </button>
    </form>
  )
}
