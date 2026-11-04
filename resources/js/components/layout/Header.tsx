'use client';

import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCartStore } from '@/stores/useCartStore';
import { useLogout } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export function Header() {
  const { user, isAuthenticated } = useAuthStore();
  const { getItemCount, toggleDrawer } = useCartStore();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const page = usePage();
  const cartCount = getItemCount();

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout(undefined, {
      onSettled: () => {
        window.location.href = '/login';
      },
    });
  };

  const isAdmin = user?.abilities?.can_admin || false;
  const isSuperAdmin = user?.abilities?.can_super_admin || false;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" aria-label="Tumbler Shop Home">
            <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 32 32">
              <path d="M16 2L4 8v16l12 6 12-6V8L16 2zm0 2.5L25.5 9.5V22.5L16 29.5 6.5 22.5V9.5L16 4.5zM16 3.8L8.2 7.4v17.2L16 28.2l7.8-3.6V7.4L16 3.8z"/>
            </svg>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100 hidden sm:block">
              Tumbler Shop
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <Link 
              href="/products" 
              className={cn(
                'text-sm font-medium transition-colors',
                page.url.startsWith('/products') 
                  ? 'text-primary-600' 
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
              )}
            >
              Products
            </Link>
            {isAuthenticated && (
              <Link 
                href="/orders" 
                className={cn(
                  'text-sm font-medium transition-colors',
                  page.url.startsWith('/orders') 
                    ? 'text-primary-600' 
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                )}
              >
                My Orders
              </Link>
            )}
            {(isAdmin || isSuperAdmin) && (
              <Link 
                href="/admin" 
                className={cn(
                  'text-sm font-medium transition-colors',
                  page.url.startsWith('/admin') 
                    ? 'text-primary-600' 
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                )}
              >
                Admin
              </Link>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Cart Button */}
            <button
              onClick={toggleDrawer}
              className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              aria-label={`Shopping cart${cartCount > 0 ? ` with ${cartCount} items` : ' empty'}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  id="user-menu-button"
                  onClick={() => setIsMenuOpen((open) => !open)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-expanded={isMenuOpen}
                  aria-haspopup="true"
                  aria-controls="user-menu-dropdown"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                <div 
                  id="user-menu-dropdown"
                  className={cn(
                    'absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 transform transition-all duration-200 z-50',
                    isMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'
                  )}
                  role="menu"
                >
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    <span className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1',
                      user.role === 'super_admin' && 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
                      user.role === 'admin' && 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
                      user.role === 'user' && 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                    )}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    role="menuitem"
                  >
                    <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    role="menuitem"
                  >
                    <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    My Orders
                  </Link>
                  {(isAdmin || isSuperAdmin) && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      role="menuitem"
                    >
                      <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      Admin Dashboard
                    </Link>
                  )}
                  <hr className="my-1 border-gray-200 dark:border-gray-700" />
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                    role="menuitem"
                  >
                    <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}