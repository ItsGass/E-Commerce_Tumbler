import axios, { AxiosError, type AxiosResponse } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from './axios';

/**
 * Deterministic coverage for the 419/CSRF branch in lib/axios.ts.
 *
 * The real network flow was also verified against `php artisan serve`:
 *   POST /api/cart/validate -> 419 (stale X-XSRF-TOKEN)
 *   GET  /sanctum/csrf-cookie -> 204
 *   POST /api/cart/validate -> 200 (fresh X-XSRF-TOKEN)
 * A real browser never reaches that branch because Laravel 13 skips the token
 * comparison when the request carries `Sec-Fetch-Site: same-origin`.
 */

const originalAdapter = api.defaults.adapter;

function setXsrfCookie(value: string | null): void {
    if (value === null) {
        document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        return;
    }

    document.cookie = `XSRF-TOKEN=${value}; path=/`;
}

function response(config: unknown, status: number, data: unknown = {}): AxiosResponse {
    return {
        config: config as AxiosResponse['config'],
        status,
        statusText: String(status),
        headers: {},
        data,
    };
}

function csrfError(config: unknown): AxiosError {
    return new AxiosError(
        'CSRF token mismatch.',
        'ERR_BAD_REQUEST',
        config as AxiosError['config'],
        null,
        response(config, 419, { message: 'CSRF token mismatch.' }),
    );
}

describe('api csrf interceptor', () => {
    const seenTokens: Array<string | undefined> = [];

    beforeEach(() => {
        seenTokens.length = 0;
        setXsrfCookie('stale-token');
    });

    afterEach(() => {
        api.defaults.adapter = originalAdapter;
        vi.restoreAllMocks();
        setXsrfCookie(null);
    });

    it('refreshes the cookie once and retries a 419 write', async () => {
        vi.spyOn(axios, 'get').mockImplementation(async () => {
            setXsrfCookie('fresh-token');

            return {
                status: 204,
                statusText: 'No Content',
                headers: {},
                data: null,
                config: {},
            } as AxiosResponse;
        });

        let attempt = 0;
        api.defaults.adapter = async (config) => {
            attempt++;
            seenTokens.push(config.headers['X-XSRF-TOKEN'] as string | undefined);

            if (attempt === 1) {
                throw csrfError(config);
            }

            return response(config, 200, { ok: true });
        };

        const result = await api.post('/cart/validate', { items: [] });

        expect(attempt).toBe(2);
        expect(seenTokens).toEqual(['stale-token', 'fresh-token']);
        expect(result.status).toBe(200);
        expect(result.data).toEqual({ ok: true });
        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(axios.get).toHaveBeenCalledWith('/sanctum/csrf-cookie', expect.any(Object));
    });

    it('bootstraps the cookie before a write when no token exists', async () => {
        setXsrfCookie(null);
        vi.spyOn(axios, 'get').mockImplementation(async () => {
            setXsrfCookie('bootstrap-token');

            return {
                status: 204,
                statusText: 'No Content',
                headers: {},
                data: null,
                config: {},
            } as AxiosResponse;
        });

        api.defaults.adapter = async (config) => {
            seenTokens.push(config.headers['X-XSRF-TOKEN'] as string | undefined);

            return response(config, 200, { ok: true });
        };

        const result = await api.post('/cart/validate', { items: [] });

        expect(seenTokens).toEqual(['bootstrap-token']);
        expect(result.status).toBe(200);
        expect(axios.get).toHaveBeenCalledTimes(1);
    });

    it('does not refresh or retry a non-419 failure', async () => {
        const refresh = vi.spyOn(axios, 'get');
        let attempt = 0;

        api.defaults.adapter = async (config) => {
            attempt++;
            throw new AxiosError(
                'Validation failed',
                'ERR_BAD_REQUEST',
                config,
                null,
                response(config, 422, { message: 'Validation failed' }),
            );
        };

        await expect(api.post('/cart/validate', {})).rejects.toMatchObject({
            response: { status: 422 },
        });
        expect(attempt).toBe(1);
        expect(refresh).not.toHaveBeenCalled();
    });
});
