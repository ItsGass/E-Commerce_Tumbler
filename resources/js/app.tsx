import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/stores/useAuthStore';
import Layout from '@/components/layout/Layout';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';

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

createInertiaApp({
  title: (title) => (title ? `${title} - ${appName}` : appName),
  progress: {
    color: '#4B5563',
  },
  setup({ el, App, props }) {
    // Hydrate auth store from Inertia props (shared data is in props.auth.user)
    const authUser = (props as any).auth?.user;
    if (authUser) {
      useAuthStore.getState().hydrate({ user: authUser });
    }

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