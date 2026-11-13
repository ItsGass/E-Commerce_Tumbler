'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { RequireRole } from '@/components/auth';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/useAuthStore';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'super_admin';
  phone?: string;
  street?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  profile_complete: boolean;
  abilities: {
    can_admin: boolean;
    can_super_admin: boolean;
    profile_complete: boolean;
  };
  created_at: string;
}

interface UsersResponse {
  data: User[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
}

const ROLE_COLORS: Record<string, string> = {
  user: 'bg-panel text-ink dark:text-muted',
  admin: 'bg-tint-3 text-accent',
  super_admin: 'bg-danger-tint text-danger',
};

function extractErrorMessage(error: any): string {
  const validationErrors = error?.response?.data?.errors;
  const firstValidationError = validationErrors ? Object.values(validationErrors)[0] : undefined;
  const firstNameError = Array.isArray(firstValidationError) ? firstValidationError[0] : undefined;

  return firstNameError || error?.response?.data?.message || 'Something went wrong. Please try again.';
}

function AdminUsersContent() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const [actionError, setActionError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['super-admin', 'users', { page, search, role: roleFilter }],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, per_page: 15 };
      if (search) params.search = search;
      if (roleFilter !== 'all') params.role = roleFilter;
      
      const response = await api.get<UsersResponse>('/super-admin/users', { params });
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post('/super-admin/users', formData);
      return response.data;
    },
    onSuccess: () => {
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'users'] });
      setShowCreateModal(false);
    },
    onError: (error) => setActionError(extractErrorMessage(error)),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
      const response = await api.patch(`/super-admin/users/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'users'] });
      setEditingUser(null);
    },
    onError: (error) => setActionError(extractErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/super-admin/users/${id}`);
    },
    onSuccess: () => {
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'users'] });
    },
    onError: (error) => setActionError(extractErrorMessage(error)),
  });

  const changeRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: number; role: string }) => {
      const response = await api.patch(`/super-admin/users/${id}/role`, { role });
      return response.data;
    },
    onSuccess: () => {
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'users'] });
    },
    onError: (error) => setActionError(extractErrorMessage(error)),
  });

  const handleRoleChange = (user: User, newRole: string) => {
    if (window.confirm(`Change ${user.name}'s role to ${newRole}?`)) {
      setActionError(null);
      changeRoleMutation.mutate({ id: user.id, role: newRole });
    }
  };

  const confirmDelete = (user: User) => {
    if (window.confirm(`Are you sure you want to delete "${user.name}"? This action cannot be undone.`)) {
      setActionError(null);
      deleteMutation.mutate(user.id);
    }
  };

  return (
    <div className="min-h-screen bg-page py-8">
      <div className="container-page">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-ink mb-2">
              User Management
            </h1>
            <p className="text-muted">
              Manage user accounts and roles
            </p>
          </div>
          <button
            onClick={() => {
              setActionError(null);
              setShowCreateModal(true);
            }}
            className="inline-flex items-center px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent-hover transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Add User
          </button>
        </div>

        {actionError && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-danger/30 bg-danger-tint px-4 py-3 text-sm text-danger"
          >
            {actionError}
          </div>
        )}

        {/* Filters */}
        <div className="bg-surface rounded-xl shadow-card border border-hairline p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by name, email..."
                className="w-full px-4 py-2 pl-10 border border-hairline rounded-lg bg-panel focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-hairline rounded-lg bg-panel focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-surface rounded-xl shadow-card border border-hairline overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-panel">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Profile</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted uppercase tracking-wider pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {data?.data.map((user) => {
                      const isSelf = currentUser?.id === user.id;

                      return (
                      <tr key={user.id} className="hover:bg-panel">
                        <td className="px-6 py-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-ink">{user.name}</p>
                              {isSelf && (
                                <span className="inline-flex items-center rounded-full bg-panel px-2 py-0.5 text-xs font-medium text-ink dark:text-muted">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted">{user.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user, e.target.value)}
                            disabled={changeRoleMutation.isPending || isSelf}
                            title={isSelf ? 'You cannot change your own role' : undefined}
                            aria-label={isSelf ? `Role for ${user.name} (you cannot change your own role)` : `Role for ${user.name}`}
                            className={cn(
                              'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60',
                              ROLE_COLORS[user.role]
                            )}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="super_admin">Super Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                            user.profile_complete
                              ? 'bg-success-tint text-success'
                              : 'bg-warning-tint text-warning'
                          )}>
                            {user.profile_complete ? 'Complete' : 'Incomplete'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right pr-6">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setActionError(null);
                                setEditingUser(user);
                              }}
                              className="text-accent hover:text-accent text-sm font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => confirmDelete(user)}
                              disabled={deleteMutation.isPending || isSelf}
                              title={isSelf ? 'You cannot delete your own account' : undefined}
                              aria-label={isSelf ? `Delete ${user.name} (you cannot delete your own account)` : `Delete ${user.name}`}
                              className="text-danger hover:text-danger text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                      );
                    })}
                    {!data?.data.length && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-muted">
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data && data.meta.last_page > 1 && (
                <div className="px-6 py-4 border-t border-hairline flex items-center justify-between">
                  <p className="text-sm text-ink">
                    Showing {data.meta.per_page * (data.meta.current_page - 1) + 1} to {Math.min(data.meta.per_page * data.meta.current_page, data.meta.total)} of {data.meta.total}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={data.meta.current_page === 1 || isFetching}
                      className="px-3 py-1 border border-hairline rounded-lg text-sm text-ink hover:bg-panel disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(data.meta.last_page, p + 1))}
                      disabled={data.meta.current_page === data.meta.last_page || isFetching}
                      className="px-3 py-1 border border-hairline rounded-lg text-sm text-ink hover:bg-panel disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-surface rounded-xl shadow-soft max-w-md w-full max-h-[90vh] overflow-y-auto">
              <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); createMutation.mutate(fd); }} className="p-6 space-y-4" id="create-user-form">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-ink">Create User</h2>
                  <button type="button" onClick={() => setShowCreateModal(false)} className="text-muted hover:text-ink">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">Name *</label>
                    <input name="name" type="text" required className="w-full px-4 py-2 border border-hairline rounded-lg bg-panel focus:outline-none focus:ring-2 focus:ring-accent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">Email *</label>
                    <input name="email" type="email" required className="w-full px-4 py-2 border border-hairline rounded-lg bg-panel focus:outline-none focus:ring-2 focus:ring-accent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">Password *</label>
                    <input name="password" type="password" required minLength={8} className="w-full px-4 py-2 border border-hairline rounded-lg bg-panel focus:outline-none focus:ring-2 focus:ring-accent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">Confirm Password *</label>
                    <input name="password_confirmation" type="password" required className="w-full px-4 py-2 border border-hairline rounded-lg bg-panel focus:outline-none focus:ring-2 focus:ring-accent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">Role *</label>
                    <select name="role" required className="w-full px-4 py-2 border border-hairline rounded-lg bg-panel focus:outline-none focus:ring-2 focus:ring-accent">
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">Phone</label>
                    <input name="phone" type="tel" className="w-full px-4 py-2 border border-hairline rounded-lg bg-panel focus:outline-none focus:ring-2 focus:ring-accent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">Street</label>
                    <input name="street" type="text" className="w-full px-4 py-2 border border-hairline rounded-lg bg-panel focus:outline-none focus:ring-2 focus:ring-accent" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-ink mb-1">City</label>
                      <input name="city" type="text" className="w-full px-4 py-2 border border-hairline rounded-lg bg-panel focus:outline-none focus:ring-2 focus:ring-accent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink mb-1">Province</label>
                      <input name="province" type="text" className="w-full px-4 py-2 border border-hairline rounded-lg bg-panel focus:outline-none focus:ring-2 focus:ring-accent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink mb-1">Postal Code</label>
                      <input name="postal_code" type="text" className="w-full px-4 py-2 border border-hairline rounded-lg bg-panel focus:outline-none focus:ring-2 focus:ring-accent" />
                    </div>
                  </div>
                </div>

                {actionError && (
                  <p className="text-sm text-danger">{actionError}</p>
                )}

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 border border-hairline rounded-lg text-ink hover:bg-panel font-medium">Cancel</button>
                  <button type="submit" disabled={createMutation.isPending} className="flex-1 px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent-hover disabled:opacity-50">{createMutation.isPending ? 'Creating...' : 'Create User'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-surface rounded-xl shadow-soft max-w-md w-full max-h-[90vh] overflow-y-auto">
              <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); fd.append('_method', 'PATCH'); updateMutation.mutate({ id: editingUser.id, data: fd }); }} className="p-6 space-y-4" id="edit-user-form">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-ink">Edit User</h2>
                  <button type="button" onClick={() => setEditingUser(null)} className="text-muted hover:text-ink"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">Name *</label>
                    <input name="name" type="text" defaultValue={editingUser.name} required className="w-full px-4 py-2 border border-hairline rounded-lg bg-panel focus:outline-none focus:ring-2 focus:ring-accent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">Email *</label>
                    <input name="email" type="email" defaultValue={editingUser.email} required className="w-full px-4 py-2 border border-hairline rounded-lg bg-panel focus:outline-none focus:ring-2 focus:ring-accent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">Phone</label>
                    <input name="phone" type="tel" defaultValue={editingUser.phone || ''} className="w-full px-4 py-2 border border-hairline rounded-lg bg-panel focus:outline-none focus:ring-2 focus:ring-accent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">Street</label>
                    <input name="street" type="text" defaultValue={editingUser.street || ''} className="w-full px-4 py-2 border border-hairline rounded-lg bg-panel focus:outline-none focus:ring-2 focus:ring-accent" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-ink mb-1">City</label>
                      <input name="city" type="text" defaultValue={editingUser.city || ''} className="w-full px-4 py-2 border border-hairline rounded-lg bg-panel focus:outline-none focus:ring-2 focus:ring-accent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink mb-1">Province</label>
                      <input name="province" type="text" defaultValue={editingUser.province || ''} className="w-full px-4 py-2 border border-hairline rounded-lg bg-panel focus:outline-none focus:ring-2 focus:ring-accent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink mb-1">Postal Code</label>
                      <input name="postal_code" type="text" defaultValue={editingUser.postal_code || ''} className="w-full px-4 py-2 border border-hairline rounded-lg bg-panel focus:outline-none focus:ring-2 focus:ring-accent" />
                    </div>
                  </div>
                </div>

                {actionError && (
                  <p className="text-sm text-danger">{actionError}</p>
                )}

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setEditingUser(null)} className="flex-1 px-4 py-2 border border-hairline rounded-lg text-ink hover:bg-panel font-medium">Cancel</button>
                  <button type="submit" disabled={updateMutation.isPending} className="flex-1 px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent-hover disabled:opacity-50">{updateMutation.isPending ? 'Saving...' : 'Save Changes'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminUsers() {
  return (
    <RequireRole roles={['super_admin']}>
      <AdminUsersContent />
    </RequireRole>
  );
}