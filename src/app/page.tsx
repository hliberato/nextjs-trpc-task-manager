import { getServerCaller } from '@/server/serverCaller'
import TaskList from './task-list'

export default async function Home() {
  const caller = await getServerCaller()

  const tasks = await caller.task.list({
    limit: 10,
  })

  return <TaskList initialData={tasks} />
}
