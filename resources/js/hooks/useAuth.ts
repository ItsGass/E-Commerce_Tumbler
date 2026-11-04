'use client';

import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/stores/useAuthStore';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'super_admin';
  profile_complete: boolean;
  abilities: {
    can_admin: boolean;
    can_super_admin: boolean;
    profile_complete: boolean;
  };
  phone?: string;
  street?: string;
  city?: string;
  province?: string;
  postal_code?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export function useRegister() {
  return useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await api.post<User>('/auth/register', data);
      return response.data;
    },
    onSuccess: (user) => {
      useAuthStore.getState().setUser(user);
    },
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await api.post<User>('/auth/login', data);
      return response.data;
    },
    onSuccess: (user) => {
      useAuthStore.getState().setUser(user);
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSuccess: () => {
      useAuthStore.getState().logout();
    },
  });
}

export function useMe() {
  return useMutation({
    mutationFn: async () => {
      const response = await api.get<User>('/auth/user');
      return response.data;
    },
    onSuccess: (user) => {
      useAuthStore.getState().setUser(user);
    },
  });
}
