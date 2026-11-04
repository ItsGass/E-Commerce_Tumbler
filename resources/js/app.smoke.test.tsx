import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from '@inertiajs/react';
import type { Page } from '@inertiajs/core';
import { PageShell, RootProviders } from '@/components/AppShell';
import { useAuthStore } from '@/stores/useAuthStore';

const fakePage = {
  component: 'smoke',
  props: { auth: { user: null }, errors: {}, name: 'Tumbler Shop' },
  url: '/',
  version: 'smoke',
  sharedProps: [],
} as unknown as Page;

function SmokePage() {
  return <div>Smoke page content</div>;
}

function SmokeTree() {
  return (
    <RootProviders>
      <App
        initialPage={fakePage}
        initialComponent={SmokePage}
        resolveComponent={async () => SmokePage}
        titleCallback={(title) => title}
      >
        {({ Component, props, key }) => (
          <PageShell Component={Component} pageProps={props} pageKey={key} />
        )}
      </App>
    </RootProviders>
  );
}

describe('app shell smoke test', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    useAuthStore.setState({ user: null, isAuthenticated: false });
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it('renders Layout, Header and the page inside the root providers', async () => {
    await act(async () => {
      root.render(<SmokeTree />);
    });

    expect(container.querySelector('header')).not.toBeNull();
    expect(container.querySelector('footer')).not.toBeNull();
    expect(container.textContent).toContain('Tumbler Shop');
    expect(container.textContent).toContain('Smoke page content');
    // Header renders the guest menu without throwing on useMutation/usePage.
    expect(container.textContent).toContain('Sign In');
  });
});
