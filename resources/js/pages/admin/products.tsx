'use client';

import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { RequireRole } from '@/components/auth';
import { cn, formatPrice } from '@/lib/utils';

interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: number;
  stock: number;
  glb_url: string | null;
  is_active: boolean;
  variants: Array<{
    id: number;
    name: string;
    color_hex: string;
  }>;
  images: Array<{ id: number; url: string; is_thumbnail: boolean }>;
  thumbnail?: { url: string } | null;
  created_at: string;
}

interface ProductsResponse {
  data: Product[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
}

function AdminProductsContent() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin', 'products', { page, search }],
    queryFn: async () => {
      const response = await api.get<ProductsResponse>('/admin/products', {
        params: { page, search, per_page: 10 },
      });
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      // The store endpoint only accepts product fields; files go to their own
      // endpoints after the product exists. Let the browser set the multipart
      // boundary (setting Content-Type manually drops it).
      const payload = new FormData();
      for (const key of ['name', 'slug', 'description', 'price', 'stock']) {
        const value = formData.get(key);
        if (value !== null) {
          payload.append(key, value);
        }
      }

      const response = await api.post('/admin/products', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const productId = response.data?.data?.id as number | undefined;

      const image = formData.get('image');
      if (productId && image instanceof File && image.size > 0) {
        const imagePayload = new FormData();
        imagePayload.append('image', image);
        imagePayload.append('is_thumbnail', '1');
        await api.post(`/admin/products/${productId}/images`, imagePayload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      const glb = formData.get('glb');
      if (productId && glb instanceof File && glb.size > 0) {
        const glbPayload = new FormData();
        glbPayload.append('glb', glb);
        await api.post(`/admin/products/${productId}/glb`, glbPayload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      setShowCreateModal(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Record<string, unknown> }) => {
      const response = await api.patch(`/admin/products/${id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      setEditingProduct(null);
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: async ({ id, file }: { id: number; file: File }) => {
      const payload = new FormData();
      payload.append('image', file);
      payload.append('is_thumbnail', '1');
      const response = await api.post(`/admin/products/${id}/images`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      setEditingProduct(null);
    },
  });

  const uploadGlbMutation = useMutation({
    mutationFn: async ({ id, file }: { id: number; file: File }) => {
      const payload = new FormData();
      payload.append('glb', file);
      const response = await api.post(`/admin/products/${id}/glb`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      setEditingProduct(null);
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: async ({ productId, imageId }: { productId: number; imageId: number }) => {
      await api.delete(`/admin/products/${productId}/images/${imageId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      setEditingProduct(null);
    },
  });

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProduct) return;

    const formData = new FormData(e.currentTarget);
    updateMutation.mutate({
      id: editingProduct.id,
      payload: {
        name: formData.get('name'),
        slug: formData.get('slug'),
        description: formData.get('description') || null,
        price: Number(formData.get('price')),
        stock: Number(formData.get('stock')),
        is_active: formData.get('is_active') === 'on',
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate(formData);
  };

  const confirmDelete = (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-2">
              Products
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your product catalog
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search products..."
              className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Variants</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {data?.data.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                              {product.thumbnail?.url ? (
                                <img src={product.thumbnail.url} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-xs">
                                {product.name}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                                {product.slug}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {formatPrice(product.price)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={cn(
                            'font-medium',
                            product.stock === 0 && 'text-red-600 dark:text-red-400',
                            product.stock > 0 && product.stock <= 10 && 'text-yellow-600 dark:text-yellow-400',
                            product.stock > 10 && 'text-gray-900 dark:text-gray-100'
                          )}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {product.variants.slice(0, 3).map((v) => (
                              <span key={v.id} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                {v.color_hex && (
                                  <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: v.color_hex }} />
                                )}
                                {v.name}
                              </span>
                            ))}
                            {product.variants.length > 3 && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                                +{product.variants.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={cn(
                            'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                            product.is_active
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                          )}>
                            {product.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(product.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right pr-6">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingProduct(product)}
                              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => confirmDelete(product.id, product.name)}
                              disabled={deleteMutation.isPending}
                              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!data?.data.length && (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                          No products found. <Link href="#" onClick={() => setShowCreateModal(true)} className="text-primary-600 hover:text-primary-700">Create one</Link>.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data && data.meta.last_page > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Showing {data.meta.per_page * (data.meta.current_page - 1) + 1} to {Math.min(data.meta.per_page * data.meta.current_page, data.meta.total)} of {data.meta.total}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={data.meta.current_page === 1 || isFetching}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(data.meta.last_page, p + 1))}
                      disabled={data.meta.current_page === data.meta.last_page || isFetching}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Create Product Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-6 space-y-6" id="create-product-form">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Create Product
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name *
                    </label>
                    <input
                      name="name"
                      type="text"
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Slug *
                    </label>
                    <input
                      name="slug"
                      type="text"
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Price (IDR) *
                    </label>
                    <input
                      name="price"
                      type="number"
                      required
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Stock *
                    </label>
                    <input
                      name="stock"
                      type="number"
                      required
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Product Image (Optional)
                  </label>
                  <input
                    name="image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    JPG, PNG or WebP. Max 5MB. Uploaded as the product thumbnail.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    GLB Model (Optional)
                  </label>
                  <input
                    name="glb"
                    type="file"
                    accept=".glb"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Max 10MB. Model/Gltf-binary format only.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
                  >
                    {createMutation.isPending ? 'Creating...' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleEditSubmit} className="p-6 space-y-6" id="edit-product-form">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Edit Product
                  </h2>
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name *
                    </label>
                    <input
                      name="name"
                      type="text"
                      required
                      defaultValue={editingProduct.name}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Slug *
                    </label>
                    <input
                      name="slug"
                      type="text"
                      required
                      defaultValue={editingProduct.slug}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={editingProduct.description ?? ''}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Price (IDR) *
                    </label>
                    <input
                      name="price"
                      type="number"
                      required
                      min="0"
                      defaultValue={editingProduct.price}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Stock *
                    </label>
                    <input
                      name="stock"
                      type="number"
                      required
                      min="0"
                      defaultValue={editingProduct.stock}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <input
                    name="is_active"
                    type="checkbox"
                    defaultChecked={editingProduct.is_active}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  Active
                </label>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">
                    Images &amp; Model
                  </h3>

                  {editingProduct.images.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {editingProduct.images.map((image) => (
                        <div key={image.id} className="relative">
                          <img
                            src={image.url}
                            alt={`${editingProduct.name} image`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                          />
                          {image.is_thumbnail && (
                            <span className="absolute top-1 left-1 px-2 py-0.5 rounded bg-primary-600 text-white text-[10px] font-medium">
                              Thumbnail
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => deleteImageMutation.mutate({ productId: editingProduct.id, imageId: image.id })}
                            disabled={deleteImageMutation.isPending}
                            className="absolute bottom-1 right-1 px-2 py-0.5 rounded bg-red-600 text-white text-xs font-medium hover:bg-red-700 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No images yet.</p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Upload / replace thumbnail
                      </label>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        disabled={uploadImageMutation.isPending}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            uploadImageMutation.mutate({ id: editingProduct.id, file });
                          }
                        }}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      {uploadImageMutation.isPending && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Uploading...</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Upload / replace GLB
                      </label>
                      <input
                        type="file"
                        accept=".glb"
                        disabled={uploadGlbMutation.isPending}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            uploadGlbMutation.mutate({ id: editingProduct.id, file });
                          }
                        }}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      {uploadGlbMutation.isPending && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Uploading...</p>
                      )}
                      {editingProduct.glb_url ? (
                        <a
                          href={editingProduct.glb_url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-block text-xs text-primary-600 dark:text-primary-400"
                        >
                          Current model
                        </a>
                      ) : (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">No model uploaded.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
                  >
                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminProducts() {
  return (
    <RequireRole roles={['admin', 'super_admin']}>
      <AdminProductsContent />
    </RequireRole>
  );
}