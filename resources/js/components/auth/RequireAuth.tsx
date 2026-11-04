'use client';

import { useEffect } from 'react';
import { usePage, Link } from '@inertiajs/react';
import { useAuthStore } from '@/stores/useAuthStore';

interface RequireAuthProps {
  children: React.ReactNode;
  requireProfile?: boolean;
}

export function RequireAuth({ children, requireProfile = false }: RequireAuthProps) {
  const { isAuthenticated, user } = useAuthStore();
  const page = usePage();

  // Check on mount and when props change
  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to login with current URL as 'from' parameter
      window.location.href = `/login?from=${encodeURIComponent(page.url)}`;
    } else if (requireProfile && user && !user.profile_complete) {
      window.location.href = `/profile?message=${encodeURIComponent('Please complete your profile to continue')}`;
    }
  }, [isAuthenticated, user, requireProfile, page.url]);

  // Show loading state while checking
  if (!isAuthenticated || (requireProfile && user && !user.profile_complete)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}