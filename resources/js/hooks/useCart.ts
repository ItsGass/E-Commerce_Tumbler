'use client';

import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { useCartStore } from '@/stores/useCartStore';

export interface CartItem {
  productId: number;
  variantId?: number;
  quantity: number;
}

export interface ValidatedCartItem {
  product_id: number;
  variant_id: number | null;
  quantity: number;
  name: string;
  price: number;
  image?: string;
  variant_name?: string;
}

export interface CartTotals {
  subtotal: number;
  shipping: number;
  total: number;
}

export interface ValidateCartResponse {
  items: ValidatedCartItem[];
  totals: CartTotals;
}

export interface AddToCartProduct {
  id: number;
  name: string;
  price: number;
  thumbnail?: { url: string } | null;
  default_variant?: { id: number; name: string; color_hex: string } | null;
}

/**
 * Adds a catalog card product using its default variant and opens the cart,
 * matching the behavior of the product detail page.
 */
export function addProductToCart(product: AddToCartProduct): void {
  useCartStore.getState().addItem({
    productId: product.id,
    variantId: product.default_variant?.id,
    name: product.name,
    price: product.price,
    image: product.thumbnail?.url,
    variantName: product.default_variant?.name,
    variantColorHex: product.default_variant?.color_hex,
  });
  useCartStore.getState().openDrawer();
}

export function useValidateCart() {
  return useMutation({
    mutationFn: async (items: CartItem[]) => {
      // The API validates snake_case keys (items.*.product_id); the cart store
      // keeps camelCase for client-side ergonomics.
      const response = await api.post<ValidateCartResponse>('/cart/validate', {
        items: items.map((item) => ({
          product_id: item.productId,
          variant_id: item.variantId ?? null,
          quantity: item.quantity,
        })),
      });
      return response.data;
    },
    onSuccess: (data) => {
      // Update local cart with validated data (server prices, etc.)
      useCartStore.getState().clearCart();
      data.items.forEach(item => {
        useCartStore.getState().addItem({
          productId: item.product_id,
          variantId: item.variant_id || undefined,
          quantity: item.quantity,
          name: item.name,
          price: item.price,
          image: item.image,
          variantName: item.variant_name,
        });
      });
    },
  });
}
