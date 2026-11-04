'use client';

import { useMutation } from '@tanstack/react-query';
import { api, ensureCsrfCookie } from '@/lib/axios';
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

interface UserResponse {
  data: User;
  message?: string;
}

export function useRegister() {
  return useMutation({
    mutationFn: async (data: RegisterData) => {
      await ensureCsrfCookie();
      const response = await api.post<UserResponse>('/auth/register', data);
      return response.data.data;
    },
    onSuccess: (user) => {
      useAuthStore.getState().setUser(user);
    },
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: async (data: LoginData) => {
      await ensureCsrfCookie();
      const response = await api.post<UserResponse>('/auth/login', data);
      return response.data.data;
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
    onSettled: () => {
      useAuthStore.getState().logout();
    },
  });
}

export function useMe() {
  return useMutation({
    mutationFn: async () => {
      const response = await api.get<UserResponse>('/auth/user');
      return response.data.data;
    },
    onSuccess: (user) => {
      useAuthStore.getState().setUser(user);
    },
  });
}
