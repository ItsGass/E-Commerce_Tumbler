import { useAuthStore, type User } from '@/stores/useAuthStore';
import { initializeTheme } from '@/stores/useThemeStore';
import { PageShell, RootProviders } from '@/components/AppShell';
import { createInertiaApp, router } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';

import type { Page } from '@inertiajs/core';

const appName = import.meta.env.VITE_APP_NAME || 'Tumbler Shop';

function syncAuthFromPage(page: Page): void {
  const auth = (page.props as { auth?: { user: User | null } }).auth;
  // Always hydrate, including `null`, so a logged-out server session clears stale state.
  useAuthStore.getState().hydrate({ user: auth?.user ?? null });
}

createInertiaApp({
  title: (title) => (title ? `${title} - ${appName}` : appName),
  progress: {
    color: '#B4492A',
  },
  setup({ el, App, props }) {
    // The inline Blade script already painted the right theme; hydrate the
    // store from the same source so components agree with the document.
    initializeTheme();

    syncAuthFromPage(props.initialPage);

    router.on('success', (event) => {
      syncAuthFromPage(event.detail.page);
    });

    window.addEventListener('auth:unauthorized', () => {
      useAuthStore.getState().logout();
    });

    // Providers sit above Inertia's <App>; Layout is rendered as its child so
    // Header lives inside PageContext and therefore inside the providers too.
    createRoot(el).render(
      <RootProviders>
        <App {...props}>
          {({ Component, props: pageProps, key }) => (
            <PageShell
              Component={Component}
              pageProps={pageProps as Record<string, unknown>}
              pageKey={key}
            />
          )}
        </App>
      </RootProviders>
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
