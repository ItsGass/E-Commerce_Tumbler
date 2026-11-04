'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';

interface RequireRoleProps {
  children: React.ReactNode;
  roles: string[];
}

export function RequireRole({ children, roles }: RequireRoleProps) {
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
    } else if (user && !roles.includes(user.role)) {
      window.location.href = '/';
    }
  }, [isAuthenticated, user, roles]);

  // Show loading state while checking
  if (!isAuthenticated || (user && !roles.includes(user.role))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}