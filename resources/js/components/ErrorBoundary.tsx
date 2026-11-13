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
          className="flex min-h-screen items-center justify-center bg-page px-4"
        >
          <div className="w-full max-w-md rounded-xl border border-danger/30 bg-surface p-6 shadow-card">
            <h1 className="text-lg font-semibold text-danger">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-muted">
              The page failed to render. Reload to try again.
            </p>
            <pre className="mt-4 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-panel p-3 text-xs text-danger">
              {this.state.error.message}
            </pre>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-danger px-4 py-2 text-sm font-medium text-page hover:bg-danger/85"
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
