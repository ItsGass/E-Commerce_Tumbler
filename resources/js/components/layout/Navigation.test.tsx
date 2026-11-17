import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
    within,
} from '@testing-library/react';
import type { Page } from '@inertiajs/core';
import { App } from '@inertiajs/react';
import { PageShell, RootProviders } from '@/components/AppShell';
import { NAVIGATION_GROUPS } from '@/config/navigation';
import { useAuthStore } from '@/stores/useAuthStore';

const fakePage = {
    component: 'navigation-test',
    props: { auth: { user: null }, errors: {} },
    url: '/',
    version: 'test',
    sharedProps: [],
} as unknown as Page;

function EmptyPage() {
    return null;
}

function renderStorefront() {
    return render(
        <RootProviders>
            <App
                initialPage={fakePage}
                initialComponent={EmptyPage}
                resolveComponent={async () => EmptyPage}
                titleCallback={(title) => title}
            >
                {({ Component, props, key }) => (
                    <PageShell
                        Component={Component}
                        pageProps={props}
                        pageKey={key}
                    />
                )}
            </App>
        </RootProviders>,
    );
}

const desktopNav = () => screen.getByTestId('desktop-navigation');

const trigger = (label: string) =>
    within(desktopNav()).getByRole('button', { name: label });

const openMenu = (label: string) => {
    fireEvent.click(trigger(label));

    return within(desktopNav()).getByRole('menu', { name: label });
};

describe('header dropdowns', () => {
    beforeEach(() => {
        useAuthStore.setState({ user: null, isAuthenticated: false });
        renderStorefront();
    });

    afterEach(() => {
        cleanup();
    });

    it('opens on click and closes on Escape, returning focus to the trigger', async () => {
        const shop = trigger('Shop');

        expect(shop.getAttribute('aria-haspopup')).toBe('true');
        expect(shop.getAttribute('aria-expanded')).toBe('false');

        const menu = openMenu('Shop');

        expect(shop.getAttribute('aria-expanded')).toBe('true');
        expect(within(menu).getAllByRole('menuitem')).toHaveLength(4);

        fireEvent.keyDown(shop, { key: 'Escape' });

        await waitFor(() => {
            expect(shop.getAttribute('aria-expanded')).toBe('false');
            expect(
                within(desktopNav()).queryByRole('menu', { name: 'Shop' }),
            ).toBeNull();
            expect(document.activeElement).toBe(shop);
        });
    });

    it('closes on an outside pointer press', async () => {
        const shop = trigger('Shop');
        openMenu('Shop');

        fireEvent.pointerDown(document.body);

        await waitFor(() => {
            expect(shop.getAttribute('aria-expanded')).toBe('false');
            expect(
                within(desktopNav()).queryByRole('menu', { name: 'Shop' }),
            ).toBeNull();
        });
    });

    it('opens with Enter and moves focus with the arrow keys', async () => {
        const support = trigger('Support');

        fireEvent.keyDown(support, { key: 'Enter' });

        const items = within(
            within(desktopNav()).getByRole('menu', { name: 'Support' }),
        ).getAllByRole('menuitem');

        await waitFor(() => expect(document.activeElement).toBe(items[0]));
        expect(items[0].textContent).toContain('Track Order');

        fireEvent.keyDown(document.activeElement as Element, {
            key: 'ArrowDown',
        });
        expect(document.activeElement).toBe(items[1]);
        expect(items[1].textContent).toContain('Shipping Info');

        fireEvent.keyDown(document.activeElement as Element, {
            key: 'ArrowUp',
        });
        expect(document.activeElement).toBe(items[0]);

        fireEvent.keyDown(document.activeElement as Element, {
            key: 'Escape',
        });

        await waitFor(() => {
            expect(document.activeElement).toBe(support);
            expect(support.getAttribute('aria-expanded')).toBe('false');
        });
    });
});

describe('shared navigation config', () => {
    beforeEach(() => {
        useAuthStore.setState({ user: null, isAuthenticated: false });
        renderStorefront();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders the same group links in the header and the footer', () => {
        const footer = screen.getByRole('contentinfo');

        for (const group of NAVIGATION_GROUPS) {
            const menu = openMenu(group.label);
            const headerHrefs = within(menu)
                .getAllByRole('menuitem')
                .map((link) => link.getAttribute('href'));

            const footerNav = within(footer).getByRole('navigation', {
                name: group.label,
            });
            const footerHrefs = within(footerNav)
                .getAllByRole('link')
                .map((link) => link.getAttribute('href'));

            expect(headerHrefs).toEqual(group.links.map((link) => link.href));
            expect(footerHrefs).toEqual(headerHrefs);

            fireEvent.keyDown(trigger(group.label), { key: 'Escape' });
        }
    });

    it('keeps header and footer links relative except the social icons', () => {
        const footer = screen.getByRole('contentinfo');
        const headerHrefs: string[] = [];

        for (const group of NAVIGATION_GROUPS) {
            const menu = openMenu(group.label);
            headerHrefs.push(
                ...within(menu)
                    .getAllByRole('menuitem')
                    .map((link) => link.getAttribute('href') ?? ''),
            );

            fireEvent.keyDown(trigger(group.label), { key: 'Escape' });
        }

        expect(headerHrefs.every((href) => href.startsWith('/'))).toBe(true);

        const absoluteHrefs = [...footer.querySelectorAll('a[href^="http"]')]
            .map((link) => link.getAttribute('aria-label') ?? '')
            .sort((a, b) => a.localeCompare(b));

        expect(absoluteHrefs).toEqual(['Facebook', 'Instagram', 'Twitter']);
    });
});
