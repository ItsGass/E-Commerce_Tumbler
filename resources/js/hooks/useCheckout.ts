'use client';

import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { useCartStore } from '@/stores/useCartStore';
import { CartItem } from './useCart';

export interface CheckoutItem {
  product_id: number;
  variant_id?: number;
  quantity: number;
}

function toCheckoutItems(items: CartItem[]): CheckoutItem[] {
  return items.map(item => ({
    product_id: item.productId,
    variant_id: item.variantId,
    quantity: item.quantity,
  }));
}

export interface BuyerData {
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postal_code: string;
}

export interface OrderResponse {
  data: {
    id: number;
    code: string;
    status: string;
    total: number;
    buyer: BuyerData;
    items: Array<{
      id: number;
      product_id: number;
      variant_id: number | null;
      product_name: string;
      unit_price: number;
      quantity: number;
      line_total: number;
    }>;
  };
  message: string;
}

export function useGuestCheckout() {
  return useMutation({
    mutationFn: async ({ items, buyer }: { items: CartItem[]; buyer: BuyerData }) => {
      const response = await api.post<OrderResponse>('/checkout/guest', { items: toCheckoutItems(items), buyer });
      return response.data;
    },
    onSuccess: () => {
      useCartStore.getState().clearCart();
    },
  });
}

export function useUserCheckout() {
  return useMutation({
    mutationFn: async (items: CartItem[]) => {
      const response = await api.post<OrderResponse>('/checkout/user', { items: toCheckoutItems(items) });
      return response.data;
    },
    onSuccess: () => {
      useCartStore.getState().clearCart();
    },
  });
}
