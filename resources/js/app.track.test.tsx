import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react';
import { App } from '@inertiajs/react';
import type { Page } from '@inertiajs/core';
import type { AxiosResponse } from 'axios';
import Track from './pages/track';
import { api } from '@/lib/axios';
import { RootProviders } from '@/components/AppShell';

/**
 * Regression cover for the guest tracking screen.
 *
 * `GET /api/orders/{code}/track` answers with a Laravel resource wrapper
 * (`{"data": {...}}`). The hook used to hand the wrapper to the page, which
 * then read `order.buyer.name` from an object that has no `buyer`, and the
 * whole screen crashed with "Cannot read properties of undefined".
 */

const order = {
    id: 7,
    code: 'TS-TEST1234',
    status: 'pending',
    subtotal: 185000,
    shipping_cost: 15000,
    total: 200000,
    buyer: {
        name: 'Guest Item5 Buyer',
        email: 'guest-item5@example.test',
        phone: '081298765432',
        street: 'Jl. Item5 Guest No. 1',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        postal_code: '12345',
    },
    items: [
        {
            id: 1,
            product_id: 1,
            variant_id: null,
            product_name: 'Classic Stainless Tumbler',
            unit_price: 185000,
            quantity: 1,
            line_total: 185000,
            variant: null,
        },
    ],
    created_at: '2026-11-07T12:00:00.000000Z',
    updated_at: '2026-11-07T12:00:00.000000Z',
};

const originalAdapter = api.defaults.adapter;

function fakePage(url: string): Page {
    return {
        component: 'track',
        props: { auth: { user: null }, errors: {} },
        url,
        version: 'test',
        sharedProps: [],
    } as unknown as Page;
}

function renderTrack(url = '/track') {
    const page = fakePage(url);

    return render(
        <RootProviders>
            <App
                initialPage={page}
                initialComponent={Track}
                resolveComponent={async () => Track}
                titleCallback={(title) => title}
            />
        </RootProviders>,
    );
}

describe('guest order tracking', () => {
    beforeEach(() => {
        (
            globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
        ).IS_REACT_ACT_ENVIRONMENT = true;
        api.defaults.adapter = async (config) =>
            ({
                config: config as AxiosResponse['config'],
                status: 200,
                statusText: 'OK',
                headers: {},
                data: { data: order },
            }) as AxiosResponse;
    });

    afterEach(() => {
        cleanup();
        api.defaults.adapter = originalAdapter;
        vi.restoreAllMocks();
    });

    it('renders the order returned inside the resource wrapper', async () => {
        renderTrack();

        fireEvent.change(screen.getByPlaceholderText('TS-ABCD1234'), {
            target: { value: order.code },
        });
        fireEvent.change(screen.getByPlaceholderText('Email address'), {
            target: { value: order.buyer.email },
        });
        fireEvent.click(screen.getByRole('button', { name: /track order/i }));

        // The buyer block crashed the screen before; it must render now.
        await waitFor(() => {
            expect(document.body.textContent).toContain(order.buyer.name);
        });

        expect(document.body.textContent).toContain(order.code);
        expect(document.body.textContent).toContain(order.buyer.email);
        expect(document.body.textContent).toContain(
            order.items[0].product_name,
        );
    });

    it('prefills the order code from /track/{code}', async () => {
        renderTrack(`/track/${order.code}`);

        await waitFor(() => {
            expect(
                (screen.getByPlaceholderText('TS-ABCD1234') as HTMLInputElement)
                    .value,
            ).toBe(order.code);
        });
    });
});
