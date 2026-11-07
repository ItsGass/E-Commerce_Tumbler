'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export interface OrderBuyer {
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postal_code: string;
}

export interface OrderItem {
  id: number;
  product_id: number;
  variant_id: number | null;
  product_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  variant?: {
    id: number;
    name: string;
    color_hex: string;
  } | null;
}

export interface Order {
  id: number;
  code: string;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  subtotal: number;
  shipping_cost: number;
  total: number;
  buyer: OrderBuyer;
  items: OrderItem[];
  user_id?: number | null;
  paid_at?: string | null;
  shipped_at?: string | null;
  completed_at?: string | null;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrdersResponse {
  data: Order[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}

export interface TrackOrderParams {
  code: string;
  email?: string;
  phone?: string;
}

// Query keys
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) => [...orderKeys.lists(), params] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: number) => [...orderKeys.details(), id] as const,
  track: (code: string, params?: { email?: string; phone?: string }) => 
    [...orderKeys.all, 'track', code, params] as const,
};

// Track order (guest)
export function useTrackOrder(code: string, email?: string, phone?: string) {
  return useQuery({
    queryKey: orderKeys.track(code, { email, phone }),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (email) params.append('email', email);
      if (phone) params.append('phone', phone);
      
      const response = await api.get<{ data: Order }>(`/orders/${code}/track`, { params });
      // The endpoint answers with a resource wrapper, so the order itself sits
      // under `data`. Returning the wrapper made the page read `order.buyer`
      // from an object that has none, and the track screen crashed.
      return response.data.data;
    },
    enabled: !!code && (!!email || !!phone),
    staleTime: 10_000,
  });
}

// Get user's orders
export function useUserOrders(params?: { page?: number; per_page?: number }) {
  return useQuery({
    queryKey: orderKeys.list(params || {}),
    queryFn: async () => {
      const response = await api.get<OrdersResponse>('/orders', { params });
      return response.data;
    },
  });
}

// Get single order (user)
export function useOrder(id: number) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<Order>(`/orders/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}
