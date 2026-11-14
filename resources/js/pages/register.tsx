'use client';

import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useRegister } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/useAuthStore';
import { cn } from '@/lib/utils';
import type { PageProps } from '@inertiajs/core';

interface RegisterPageProps extends PageProps {
  flash?: {
    error?: string;
  };
}

function passwordStrength(pwd: string) {
  let strength = 0;
  if (pwd.length >= 8) strength++;
  if (/[A-Z]/.test(pwd)) strength++;
  if (/[a-z]/.test(pwd)) strength++;
  if (/[0-9]/.test(pwd)) strength++;
  if (/[^A-Za-z0-9]/.test(pwd)) strength++;
  return strength;
}

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; password_confirmation?: string }>({});
  const { mutate: register, isPending } = useRegister();
  const { setUser } = useAuthStore();
  const page = usePage<RegisterPageProps>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: { name?: string; email?: string; password?: string; password_confirmation?: string } = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (password !== passwordConfirmation) newErrors.password_confirmation = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    register({ name, email, password, password_confirmation: passwordConfirmation }, {
      onSuccess: (user) => {
        setUser(user);
        window.location.href = '/';
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || 'Registration failed';
        const validationErrors = error.response?.data?.errors || {};
        setErrors({
          name: validationErrors.name?.[0],
          email: validationErrors.email?.[0] || (message.includes('email') ? message : undefined),
          password: validationErrors.password?.[0],
          password_confirmation: validationErrors.password_confirmation?.[0],
        });
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
            Create Account
          </h1>
          <p className="text-muted">
            Join Tumbler Shop and start shopping
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
              <label htmlFor="name" className="block text-sm font-medium text-ink mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                className={cn(
                  'w-full px-4 py-3 border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-accent',
                  errors.name ? 'border-danger' : 'border-hairline'
                )}
              />
              {errors.name && <p className="mt-1 text-sm text-danger">{errors.name}</p>}
            </div>

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
                autoComplete="new-password"
                className={cn(
                  'w-full px-4 py-3 border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-accent',
                  errors.password ? 'border-danger' : 'border-hairline'
                )}
              />
              {errors.password && <p className="mt-1 text-sm text-danger">{errors.password}</p>}
              
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded transition-colors ${
                          passwordStrength(password) >= level
                            ? level <= 2 ? 'bg-danger-tint0' : level <= 4 ? 'bg-warning' : 'bg-success-tint0'
                            : 'bg-panel'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted">
                    {passwordStrength(password) <= 2 ? 'Weak' : passwordStrength(password) <= 4 ? 'Medium' : 'Strong'}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="password_confirmation" className="block text-sm font-medium text-ink mb-1">
                Confirm Password
              </label>
              <input
                id="password_confirmation"
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
                autoComplete="new-password"
                className={cn(
                  'w-full px-4 py-3 border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-accent',
                  errors.password_confirmation ? 'border-danger' : 'border-hairline'
                )}
              />
              {errors.password_confirmation && <p className="mt-1 text-sm text-danger">{errors.password_confirmation}</p>}
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
              {isPending ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted">
              Already have an account?{' '}
              <Link href="/login" className="text-accent hover:text-accent font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}