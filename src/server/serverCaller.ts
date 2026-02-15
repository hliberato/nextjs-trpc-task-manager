import { appRouter } from './api/root'
import { createContext } from './context'

export async function getServerCaller() {
  const context = await createContext()
  return appRouter.createCaller(context)
}
