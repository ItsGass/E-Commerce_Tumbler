'use client';

import { Link } from '@inertiajs/react';

export default function Forbidden() {
  return (
    <div className="min-h-screen bg-page flex items-center justify-center px-5 py-16 sm:px-6">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-danger-tint rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v4m0 4h.01M5.07 19h13.86a1.5 1.5 0 001.3-2.25l-6.93-12a1.5 1.5 0 00-2.6 0l-6.93 12A1.5 1.5 0 005.07 19z"
            />
          </svg>
        </div>

        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-ink mb-2">
          403 — Access denied
        </h1>
        <p className="text-muted mb-8">
          Your account does not have permission to open this page.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent-hover transition-colors"
          >
            Back to shop
          </Link>
          <Link
            href="/products"
            className="px-6 py-3 border border-hairline text-ink rounded-lg font-medium hover:bg-panel transition-colors"
          >
            Browse products
          </Link>
        </div>
      </div>
    </div>
  );
}
