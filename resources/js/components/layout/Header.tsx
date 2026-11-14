'use client';

import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCartStore } from '@/stores/useCartStore';
import { useLogout } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  const { user, isAuthenticated } = useAuthStore();
  const { items, toggleDrawer } = useCartStore();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const page = usePage();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const closeNav = () => setIsNavOpen(false);

  const handleLogout = () => {
    setIsMenuOpen(false);
    setIsNavOpen(false);
    logout(undefined, {
      onSettled: () => {
        window.location.href = '/login';
      },
    });
  };

  const isAdmin = user?.abilities?.can_admin || false;
  const isSuperAdmin = user?.abilities?.can_super_admin || false;

  const navLinkClass = (active: boolean) =>
    cn(
      'rounded-full px-1 py-2 text-sm font-medium transition-colors',
      active ? 'text-accent' : 'text-muted hover:text-ink',
    );

  const mobileLinkClass = (active: boolean) =>
    cn(
      'block rounded-full px-4 py-3 text-base font-medium transition-colors',
      active ? 'bg-panel text-accent' : 'text-ink hover:bg-panel',
    );

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-page/90 backdrop-blur-md">
      <nav className="container-page" aria-label="Main navigation">
        <div className="flex h-16 items-center justify-between gap-4 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Tumbler Shop Home">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
                <path d="M16 2L4 8v16l12 6 12-6V8L16 2zm0 2.5L25.5 9.5V22.5L16 29.5 6.5 22.5V9.5L16 4.5zM16 3.8L8.2 7.4v17.2L16 28.2l7.8-3.6V7.4L16 3.8z" />
              </svg>
            </span>
            <span className="font-display text-lg font-semibold tracking-tight whitespace-nowrap text-ink sm:text-xl lg:text-2xl">
              Tumbler Shop
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 lg:flex">
            <Link href="/products" className={navLinkClass(page.url.startsWith('/products'))}>
              Products
            </Link>
            {isAuthenticated && (
              <Link href="/orders" className={navLinkClass(page.url.startsWith('/orders'))}>
                My Orders
              </Link>
            )}
            {(isAdmin || isSuperAdmin) && (
              <Link href="/admin" className={navLinkClass(page.url.startsWith('/admin'))}>
                Admin
              </Link>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile menu toggle: the desktop nav is hidden below lg, and
                without this the only routes were Products (via the logo) and
                whatever the user menu happened to expose. */}
            <button
              type="button"
              onClick={() => setIsNavOpen((open) => !open)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-panel lg:hidden"
              aria-label={isNavOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isNavOpen}
              aria-controls="mobile-menu"
            >
              {isNavOpen ? (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              )}
            </button>

            {/* Cart pill */}
            <button
              type="button"
              onClick={toggleDrawer}
              className="relative inline-flex h-11 items-center gap-2 rounded-full border border-hairline bg-surface px-3 text-ink transition-colors hover:border-accent hover:text-accent sm:px-4"
              aria-label={`Shopping cart${cartCount > 0 ? ` with ${cartCount} items` : ' empty'}`}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="hidden text-sm font-medium sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 font-display text-xs leading-none font-bold text-accent-foreground">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            {/* Theme toggle: desktop only next to the cart; the mobile trigger
                lives inside the hamburger menu below. */}
            <ThemeToggle className="hidden lg:block" />

            {/* User Menu */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  id="user-menu-button"
                  type="button"
                  onClick={() => setIsMenuOpen((open) => !open)}
                  className="flex min-h-11 items-center gap-2 rounded-full p-1 pr-2 transition-colors hover:bg-panel"
                  aria-expanded={isMenuOpen}
                  aria-haspopup="true"
                  aria-controls="user-menu-dropdown"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-panel">
                    <span className="font-display text-sm font-semibold text-accent">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </span>
                  <svg className="hidden h-4 w-4 text-muted sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                <div
                  id="user-menu-dropdown"
                  className={cn(
                    'absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-hairline bg-surface py-1 shadow-soft transition-all duration-200',
                    isMenuOpen ? 'visible translate-y-0 opacity-100' : 'invisible translate-y-2 opacity-0',
                  )}
                  role="menu"
                >
                  <div className="border-b border-hairline px-4 py-3">
                    <p className="text-sm font-medium text-ink">{user.name}</p>
                    <p className="truncate text-xs text-muted">{user.email}</p>
                    <span
                      className={cn(
                        'badge mt-2 capitalize',
                        user.role === 'super_admin' && 'badge-danger',
                        user.role === 'admin' && 'badge-accent',
                        user.role === 'user' && 'badge-success',
                      )}
                    >
                      {user.role.replace('_', ' ')}
                    </span>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm text-ink transition-colors hover:bg-panel"
                    role="menuitem"
                  >
                    <svg className="mr-2 inline h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm text-ink transition-colors hover:bg-panel"
                    role="menuitem"
                  >
                    <svg className="mr-2 inline h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    My Orders
                  </Link>
                  {(isAdmin || isSuperAdmin) && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm text-ink transition-colors hover:bg-panel"
                      role="menuitem"
                    >
                      <svg className="mr-2 inline h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      Admin Dashboard
                    </Link>
                  )}
                  <hr className="my-1 border-hairline" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full px-4 py-2.5 text-left text-sm text-danger transition-colors hover:bg-danger-tint disabled:opacity-50"
                    role="menuitem"
                  >
                    <svg className="mr-2 inline h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="hidden items-center gap-4 lg:flex">
                <Link href="/login" className="text-sm font-medium text-muted transition-colors hover:text-ink">
                  Sign In
                </Link>
                <Link href="/register" className="btn btn-primary btn-sm">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile navigation. Rendered but hidden so aria-controls always
            resolves to a real element. */}
        <div
          id="mobile-menu"
          className={cn('border-t border-hairline pb-4 lg:hidden', isNavOpen ? 'block' : 'hidden')}
        >
          <div className="space-y-1 pt-3">
            <Link
              href="/products"
              onClick={closeNav}
              className={mobileLinkClass(page.url.startsWith('/products'))}
            >
              Products
            </Link>
            {isAuthenticated && (
              <Link
                href="/orders"
                onClick={closeNav}
                className={mobileLinkClass(page.url.startsWith('/orders'))}
              >
                My Orders
              </Link>
            )}
            {(isAdmin || isSuperAdmin) && (
              <Link
                href="/admin"
                onClick={closeNav}
                className={mobileLinkClass(page.url.startsWith('/admin'))}
              >
                Admin
              </Link>
            )}

            <div className="mt-3 border-t border-hairline pt-3">
              <ThemeToggle variant="row" />
            </div>

            {isAuthenticated ? (
              <>
                <Link href="/profile" onClick={closeNav} className={mobileLinkClass(page.url.startsWith('/profile'))}>
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="block w-full rounded-full px-4 py-3 text-left text-base font-medium text-danger transition-colors hover:bg-danger-tint disabled:opacity-50"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href="/login"
                  onClick={closeNav}
                  className="btn btn-outline w-full"
                >
                  Sign In
                </Link>
                <Link href="/register" onClick={closeNav} className="btn btn-primary w-full">
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
