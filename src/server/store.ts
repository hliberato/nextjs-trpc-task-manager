export type Task = {
  id: string
  titulo: string
  descricao?: string
  dataCriacao: number
}

export const tasks: Task[] = [
  {
    id: '1',
    titulo: 'Primeira tarefa',
    descricao: 'Teste SSR',
    dataCriacao: Date.now() - 2000,
  },
  {
    id: '2',
    titulo: 'Segunda tarefa',
    descricao: 'Outra task',
    dataCriacao: Date.now() - 1000,
  },
]

