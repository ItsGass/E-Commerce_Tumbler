'use client';

import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useLogin } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/useAuthStore';
import { cn } from '@/lib/utils';

import type { PageProps } from '@inertiajs/core';

interface LoginPageProps extends PageProps {
  flash?: {
    error?: string;
  };
  redirect?: string;
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { mutate: login, isPending } = useLogin();
  const { setUser } = useAuthStore();
  const page = usePage<LoginPageProps>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!password.trim()) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    login({ email, password }, {
      onSuccess: (user) => {
        setUser(user);
        // Redirect to intended page or home
        const redirect = (page.props as any).redirect || '/';
        window.location.href = redirect;
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || 'Invalid credentials';
        if (message.includes('email')) {
          setErrors({ email: message });
        } else if (message.includes('password')) {
          setErrors({ password: message });
        } else {
          setErrors({ email: message });
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-page flex items-center justify-center px-5 py-16 sm:px-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <svg className="w-12 h-12 mx-auto text-accent" fill="currentColor" viewBox="0 0 32 32">
              <path d="M16 2L4 8v16l12 6 12-6V8L16 2zm0 2.5L25.5 9.5V22.5L16 29.5 6.5 22.5V9.5L16 4.5zM16 3.8L8.2 7.4v17.2L16 28.2l7.8-3.6V7.4L16 3.8z"/>
            </svg>
          </Link>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-ink mb-2">
            Welcome Back
          </h1>
          <p className="text-muted">
            Sign in to your Tumbler Shop account
          </p>
        </div>

        <div className="bg-surface rounded-2xl shadow-card border border-hairline p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {page.props.flash?.error && (
              <div className="bg-danger-tint border border-danger/30 text-danger px-4 py-3 rounded-lg text-sm">
                {page.props.flash.error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className={cn(
                  'w-full px-4 py-3 border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-accent',
                  errors.email ? 'border-danger' : 'border-hairline'
                )}
              />
              {errors.email && <p className="mt-1 text-sm text-danger">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className={cn(
                  'w-full px-4 py-3 border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-accent',
                  errors.password ? 'border-danger' : 'border-hairline'
                )}
              />
              {errors.password && <p className="mt-1 text-sm text-danger">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted">
                <input type="checkbox" className="w-4 h-4 text-accent border-hairline rounded focus:ring-accent" />
                Remember me
              </label>
              <Link href="/forgot-password" className="text-sm text-accent hover:text-accent">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className={cn(
                'w-full py-3 px-4 rounded-lg font-semibold text-lg transition-all',
                'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
                'bg-accent text-accent-foreground hover:bg-accent-hover hover:shadow-soft',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isPending ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted">
              Don't have an account?{' '}
              <Link href="/register" className="text-accent hover:text-accent font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}