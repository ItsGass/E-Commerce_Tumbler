'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: number;
  stock: number;
  glb_url: string | null;
  is_active: boolean;
  variants: ProductVariant[];
  images: ProductImage[];
  thumbnail?: ProductImage | null;
  default_variant?: ProductVariant | null;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  name: string;
  color_hex: string;
  texture_url: string | null;
  glb_url: string | null;
  sort_order: number;
  is_default: boolean;
}

export interface ProductImage {
  id: number;
  product_id: number;
  url: string;
  sort_order: number;
  is_thumbnail: boolean;
}

export interface ProductsResponse {
  data: Product[];
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

export interface ViewerDataResponse {
  product: {
    id: number;
    name: string;
    slug: string;
    glb_url: string | null;
    thumbnail_url: string | null;
  };
  variants: ProductVariant[];
}

// Query keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (slug: string) => [...productKeys.details(), slug] as const,
  viewer: (slug: string) => [...productKeys.all, 'viewer', slug] as const,
};

// Get products list
export function useProducts(params?: { page?: number; per_page?: number; search?: string }) {
  return useQuery({
    queryKey: productKeys.list(params || {}),
    queryFn: async () => {
      const response = await api.get<ProductsResponse>('/products', { params });
      return response.data;
    },
  });
}

// Get single product
export function useProduct(slug: string) {
  return useQuery({
    queryKey: productKeys.detail(slug),
    queryFn: async () => {
      const response = await api.get<Product>(`/products/${slug}`);
      return response.data;
    },
    enabled: !!slug,
  });
}

// Get viewer data (lightweight for 3D viewer)
export function useProductViewer(slug: string) {
  return useQuery({
    queryKey: productKeys.viewer(slug),
    queryFn: async () => {
      const response = await api.get<ViewerDataResponse>(`/products/${slug}/viewer`);
      return response.data;
    },
    enabled: !!slug,
    staleTime: 5 * 60_000, // 5 minutes
  });
}
