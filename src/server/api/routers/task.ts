import { z } from 'zod'
import { router, publicProcedure } from '../../trpc'
import { tasks } from '../../store'
import { randomUUID } from 'crypto'
import { TRPCError } from '@trpc/server'

export const taskRouter = router({
  list: publicProcedure
  .input(
    z
      .object({
        limit: z.number().min(1).max(50).default(10),
        cursor: z.number().optional(), // timestamp
      })
      .optional()
  )
  .query(({ input }) => {
    const limit = input?.limit ?? 10
    const cursor = input?.cursor

    const sortedTasks = [...tasks].sort(
      (a, b) => b.dataCriacao - a.dataCriacao
    )

    const filteredTasks = cursor
      ? sortedTasks.filter((task) => task.dataCriacao < cursor)
      : sortedTasks

    const paginatedTasks = filteredTasks.slice(0, limit)

    const nextCursor =
      paginatedTasks.length === limit
        ? paginatedTasks[paginatedTasks.length - 1].dataCriacao
        : null

    return {
      items: paginatedTasks,
      nextCursor,
    }
  }),

  create: publicProcedure
    .input(
      z.object({
        titulo: z.string().min(1, 'Título é obrigatório'),
        descricao: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      const newTask = {
        id: randomUUID(),
        titulo: input.titulo,
        descricao: input.descricao,
        dataCriacao: Date.now(),
      }

      tasks.push(newTask)

      return newTask
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        titulo: z.string().min(1, 'Título é obrigatório'),
        descricao: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      const taskIndex = tasks.findIndex((t) => t.id === input.id)

      if (taskIndex === -1) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Tarefa não encontrada',
        })
      }

      tasks[taskIndex] = {
        ...tasks[taskIndex],
        titulo: input.titulo,
        descricao: input.descricao,
      }

      return tasks[taskIndex]
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(({ input }) => {
      const taskIndex = tasks.findIndex((t) => t.id === input.id)

      if (taskIndex === -1) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Tarefa não encontrada',
        })
      }

      const deletedTask = tasks[taskIndex]
      tasks.splice(taskIndex, 1)

      return deletedTask
    }),
})
