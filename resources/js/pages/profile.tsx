'use client';

import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useMe } from '@/hooks/useAuth';
import { cn, formatPrice } from '@/lib/utils';

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postal_code: string;
}

export default function Profile() {
  const { user, setUser, isAuthenticated } = useAuthStore();
  const page = usePage();
  const { mutate: fetchUser, isPending: isFetchingUser } = useMe();

  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    province: '',
    postal_code: '',
  });
  const [errors, setErrors] = useState<Partial<ProfileFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Load user data on mount
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        street: user.street || '',
        city: user.city || '',
        province: user.province || '',
        postal_code: user.postal_code || '',
      });
    } else if (isAuthenticated) {
      fetchUser(undefined, {
        onSuccess: (data) => {
          setFormData({
            name: data.name,
            email: data.email,
            phone: data.phone || '',
            street: data.street || '',
            city: data.city || '',
            province: data.province || '',
            postal_code: data.postal_code || '',
          });
        },
      });
    }
  }, [user, isAuthenticated, fetchUser]);

  const profileComplete = user?.profile_complete || 
    (formData.name && formData.email && formData.phone && formData.street && formData.city && formData.province && formData.postal_code);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    const newErrors: Partial<ProfileFormData> = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (!value.trim()) {
        newErrors[key as keyof ProfileFormData] = 'This field is required';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-XSRF-TOKEN': document.cookie
            .split('; ')
            .find(row => row.startsWith('XSRF-TOKEN='))
            ?.split('=')[1] || '',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const updatedUser = await response.json();
      setUser(updatedUser.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      console.error('Profile update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-page py-16">
      <div className="container-page max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-ink mb-2">
            Profile Settings
          </h1>
          <p className="text-muted">
            Manage your account information and shipping address
          </p>
        </div>

        {/* Profile Completion Status */}
        <div className={cn(
          'mb-8 p-4 rounded-xl border',
          profileComplete
            ? 'bg-success-tint border-success/30'
            : 'bg-warning-tint border-warning/30'
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              profileComplete
                ? 'bg-success-tint text-success'
                : 'bg-warning-tint text-warning'
            )}>
              {profileComplete ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
            </div>
            <div>
              <p className="font-medium text-ink">
                {profileComplete ? 'Profile Complete' : 'Profile Incomplete'}
              </p>
              <p className="text-sm text-muted">
                {profileComplete
                  ? 'Your profile is complete. You can checkout seamlessly.'
                  : 'Complete your profile to enable one-click checkout.'}
              </p>
            </div>
          </div>
        </div>

        {success && (
          <div className="mb-6 bg-success-tint border border-success/30 text-success px-4 py-3 rounded-lg text-sm">
            Profile updated successfully!
          </div>
        )}

        <div className="bg-surface rounded-2xl shadow-card border border-hairline overflow-hidden">
          {/* Personal Info */}
          <div className="p-6 border-b border-hairline">
            <h2 className="text-xl font-bold text-ink mb-4">
              Personal Information
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4" id="profile-form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className={cn(
                      'w-full px-4 py-2 border rounded-lg bg-panel focus:outline-none focus:ring-2 focus:ring-accent',
                      errors.name ? 'border-danger' : 'border-hairline'
                    )}
                  />
                  {errors.name && <p className="mt-1 text-sm text-danger">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    className={cn(
                      'w-full px-4 py-2 border rounded-lg bg-panel focus:outline-none focus:ring-2 focus:ring-accent',
                      errors.email ? 'border-danger' : 'border-hairline'
                    )}
                  />
                  {errors.email && <p className="mt-1 text-sm text-danger">{errors.email}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                  className={cn(
                    'w-full px-4 py-2 border rounded-lg bg-panel focus:outline-none focus:ring-2 focus:ring-accent',
                    errors.phone ? 'border-danger' : 'border-hairline'
                  )}
                />
                {errors.phone && <p className="mt-1 text-sm text-danger">{errors.phone}</p>}
              </div>
            </form>
          </div>

          {/* Shipping Address */}
          <div className="p-6">
            <h2 className="text-xl font-bold text-ink mb-4">
              Shipping Address
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => setFormData({...formData, street: e.target.value})}
                  required
                  className={cn(
                    'w-full px-4 py-2 border rounded-lg bg-panel focus:outline-none focus:ring-2 focus:ring-accent',
                    errors.street ? 'border-danger' : 'border-hairline'
                  )}
                />
                {errors.street && <p className="mt-1 text-sm text-danger">{errors.street}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    required
                    className={cn(
                      'w-full px-4 py-2 border rounded-lg bg-panel focus:outline-none focus:ring-2 focus:ring-accent',
                      errors.city ? 'border-danger' : 'border-hairline'
                    )}
                  />
                  {errors.city && <p className="mt-1 text-sm text-danger">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">
                    Province *
                  </label>
                  <input
                    type="text"
                    value={formData.province}
                    onChange={(e) => setFormData({...formData, province: e.target.value})}
                    required
                    className={cn(
                      'w-full px-4 py-2 border rounded-lg bg-panel focus:outline-none focus:ring-2 focus:ring-accent',
                      errors.province ? 'border-danger' : 'border-hairline'
                    )}
                  />
                  {errors.province && <p className="mt-1 text-sm text-danger">{errors.province}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                    required
                    className={cn(
                      'w-full px-4 py-2 border rounded-lg bg-panel focus:outline-none focus:ring-2 focus:ring-accent',
                      errors.postal_code ? 'border-danger' : 'border-hairline'
                    )}
                  />
                  {errors.postal_code && <p className="mt-1 text-sm text-danger">{errors.postal_code}</p>}
                </div>
              </div>

              <button
                type="submit"
                form="profile-form"
                disabled={isSubmitting}
                className={cn(
                  'w-full py-3 px-6 rounded-lg font-semibold text-lg transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
                  'bg-accent text-accent-foreground hover:bg-accent-hover hover:shadow-soft',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>

        {/* Account Actions */}
        <div className="mt-8 bg-surface rounded-2xl shadow-card border border-hairline p-6">
          <h2 className="text-xl font-bold text-ink mb-4">
            Account Actions
          </h2>
          <div className="space-y-3">
            <button className="w-full py-3 px-4 border border-hairline rounded-lg text-ink hover:bg-panel font-medium flex items-center justify-between">
              <span>Change Password</span>
              <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button className="w-full py-3 px-4 border border-hairline rounded-lg text-ink hover:bg-panel font-medium flex items-center justify-between">
              <span>Notification Preferences</span>
              <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button className="w-full py-3 px-4 border border-danger/40 rounded-lg text-danger hover:bg-danger-tint font-medium flex items-center justify-between">
              <span>Delete Account</span>
              <svg className="w-5 h-5 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}