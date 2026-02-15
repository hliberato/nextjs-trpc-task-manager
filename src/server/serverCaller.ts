import { createContext } from './context';
import { appRouter } from './root';

export async function getServerCaller() {
  const context = await createContext();
  return appRouter.createCaller(context);
}
