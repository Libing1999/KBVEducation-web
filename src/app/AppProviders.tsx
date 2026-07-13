import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { queryClient } from '@/lib/queryClient';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { env } from '@/config/env';

/** Wires global providers: error boundary, React Query, toast notifications. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { fontSize: '0.875rem' },
          }}
        />
        {env.isDev && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
