'use client';

import { Link } from '@inertiajs/react';

export default function Forbidden() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v4m0 4h.01M5.07 19h13.86a1.5 1.5 0 001.3-2.25l-6.93-12a1.5 1.5 0 00-2.6 0l-6.93 12A1.5 1.5 0 005.07 19z"
            />
          </svg>
        </div>

        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-2">
          403 — Access denied
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Your account does not have permission to open this page.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Back to shop
          </Link>
          <Link
            href="/products"
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Browse products
          </Link>
        </div>
      </div>
    </div>
  );
}
