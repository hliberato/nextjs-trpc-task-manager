'use client';

import { trpc } from '@/utils/trpc';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import { ToastProvider } from './ToastContext';

/**
 * Providers: Root provider component for tRPC and React Query
 *
 * Architecture:
 * - Must be Client Component ('use client') to use hooks and context
 * - Wraps entire app to make tRPC and React Query available everywhere
 * - Components are wrapped in layout.tsx
 *
 * Client initialization:
 * - useState ensures clients are created only once (stable across re-renders)
 * - QueryClient configured with reasonable defaults
 * - tRPC client uses httpBatchLink for automatic request batching
 *
 * Performance optimizations:
 * - httpBatchLink: Multiple tRPC calls in same tick = single HTTP request
 * - refetchOnWindowFocus: false to avoid unnecessary refetches (we use optimistic updates)
 */
export function Providers({ children }: { children: React.ReactNode }) {
  /**
   * QueryClient instance
   *
   * Configuration:
   * - refetchOnWindowFocus: false prevents automatic refetch when user returns to tab
   *   (not needed since we manually update cache via optimistic updates)
   */
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  /**
   * tRPC client instance
   *
   * Configuration:
   * - httpBatchLink: Batches multiple calls within 10ms into single HTTP request
   * - url: Points to Next.js API route handler at /api/trpc
   *
   * Batching example:
   * - trpc.task.list() + trpc.task.create() called in same render
   * - Results in 1 HTTP POST instead of 2 separate requests
   * - Reduces latency and server load
   */
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: '/api/trpc',
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{children}</ToastProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
