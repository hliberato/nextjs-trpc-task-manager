'use client'

import { trpc } from '@/utils/trpc'

type Props = {
  initialData: {
    items: any[]
    nextCursor: number | null
  }
}

export default function TaskList({ initialData }: Props) {
  const { data, isLoading } = trpc.task.list.useQuery(
    { limit: 10 },
    {
      initialData,
    }
  )

  if (isLoading) return <p>Loading...</p>

  return (
    <div>
      <h1>Tasks</h1>
      {data?.items.map((task) => (
        <div key={task.id}>
          <h3>{task.titulo}</h3>
          <p>{task.descricao}</p>
        </div>
      ))}
    </div>
  )
}
