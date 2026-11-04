import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore, type User } from '@/stores/useAuthStore';
import Layout from '@/components/layout/Layout';
import { createInertiaApp, router } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';

import type { Page } from '@inertiajs/core';

const appName = import.meta.env.VITE_APP_NAME || 'Tumbler Shop';

function AppRoot({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

function App() {
  return <AppRoot><div /></AppRoot>;
}

function syncAuthFromPage(page: Page): void {
  const auth = (page.props as { auth?: { user: User | null } }).auth;
  // Always hydrate, including `null`, so a logged-out server session clears stale state.
  useAuthStore.getState().hydrate({ user: auth?.user ?? null });
}

createInertiaApp({
  title: (title) => (title ? `${title} - ${appName}` : appName),
  progress: {
    color: '#4B5563',
  },
  setup({ el, App, props }) {
    syncAuthFromPage(props.initialPage);

    router.on('success', (event) => {
      syncAuthFromPage(event.detail.page);
    });

    window.addEventListener('auth:unauthorized', () => {
      useAuthStore.getState().logout();
    });

    createRoot(el).render(
      <Layout>
        <App {...props} />
      </Layout>
    );
  },
  resolve: async (name) => {
    const pages = import.meta.glob('./pages/**/*.tsx', { eager: true });
    const page = pages[`./pages/${name}.tsx`];
    if (!page) {
      throw new Error(`Page "${name}" not found`);
    }
    return (page as any).default;
  },
});
