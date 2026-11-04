'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Root-level safety net: a render error must never leave the SPA as a blank page.
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Unhandled render error:', error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div
          role="alert"
          className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950"
        >
          <div className="w-full max-w-md rounded-xl border border-red-200 bg-white p-6 shadow-sm dark:border-red-900 dark:bg-gray-900">
            <h1 className="text-lg font-semibold text-red-700 dark:text-red-400">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              The page failed to render. Reload to try again.
            </p>
            <pre className="mt-4 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-gray-100 p-3 text-xs text-red-700 dark:bg-gray-800 dark:text-red-400">
              {this.state.error.message}
            </pre>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
