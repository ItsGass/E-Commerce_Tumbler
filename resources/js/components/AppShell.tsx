'use client';

import type { ReactNode } from 'react';
import type { ResolvedComponent } from '@inertiajs/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import ErrorBoundary from '@/components/ErrorBoundary';
import Layout from '@/components/layout/Layout';
import { queryClient } from '@/lib/queryClient';

export function RootProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {children}
        {import.meta.env.VITE_SHOW_DEVTOOLS === 'true' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

interface PageShellProps {
  Component: ResolvedComponent;
  pageProps: Record<string, unknown>;
  pageKey: number | null;
}

/**
 * Rendered as a child of Inertia's <App>, i.e. inside both PageContext and
 * the root providers, so Layout/Header can use usePage() and useMutation().
 */
export function PageShell({ Component, pageProps, pageKey }: PageShellProps) {
  return (
    <Layout>
      <Component key={pageKey ?? undefined} {...pageProps} />
    </Layout>
  );
}
