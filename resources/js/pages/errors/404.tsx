'use client';

import { Link } from '@inertiajs/react';

export default function NotFound() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-page px-5 py-16 sm:px-6">
            <div className="w-full max-w-md text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-warning-tint">
                    <svg
                        className="h-8 w-8 text-warning"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.75 9.75a2.25 2.25 0 114.5 0c0 1.5-2.25 1.875-2.25 3.375M12 17.25h.008M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </div>

                <h1 className="mb-2 text-3xl font-bold tracking-tight text-ink lg:text-4xl">
                    404 — Page not found
                </h1>
                <p className="mb-8 text-muted">
                    That page does not exist in the Tumbler Shop demo. Check the
                    address, or start again from the catalog.
                </p>

                <div className="flex flex-col justify-center gap-3 sm:flex-row">
                    <Link href="/" className="btn btn-primary">
                        Back to shop
                    </Link>
                    <Link href="/products" className="btn btn-outline">
                        Browse products
                    </Link>
                </div>
            </div>
        </div>
    );
}
