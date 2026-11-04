'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
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
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  hydrate: (props: { user: User | null }) => void;
  hasRole: (roles: string | string[]) => boolean;
}

const AUTH_STORAGE_KEY = 'tumbler-shop-auth';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user) => set({
        user,
        isAuthenticated: !!user,
      }),

      logout: () => set({
        user: null,
        isAuthenticated: false,
      }),

      hydrate: (props) => {
        const user = props.user;
        set({
          user,
          isAuthenticated: !!user,
        });
      },

      hasRole: (roles) => {
        const { user } = get();
        if (!user) return false;
        const roleArray = Array.isArray(roles) ? roles : [roles];
        return roleArray.includes(user.role);
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
