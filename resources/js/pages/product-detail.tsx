'use client';

import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useProduct, useProductViewer } from '@/hooks/useProducts';
import { useCartStore } from '@/stores/useCartStore';
import { ProductViewer3D, VariantSelector } from '@/components/product';
import { cn } from '@/lib/utils';

interface ProductDetailProps {
  product?: {
    id: number;
    name: string;
    slug: string;
    description?: string;
    price: number;
    stock: number;
    glb_url: string | null;
    variants: Array<{
      id: number;
      name: string;
      color_hex: string;
      texture_url: string | null;
      glb_url: string | null;
    }>;
    images: Array<{ id?: number; url: string }>;
    thumbnail?: { url: string } | null;
    default_variant?: { color_hex: string } | null;
  };
  initialProduct?: {
    id: number;
    name: string;
    slug: string;
    description?: string;
    price: number;
    stock: number;
    glb_url: string | null;
    variants: Array<{
      id: number;
      name: string;
      color_hex: string;
      texture_url: string | null;
      glb_url: string | null;
    }>;
    images: Array<{ id?: number; url: string }>;
    thumbnail?: { url: string } | null;
    default_variant?: { color_hex: string } | null;
  };
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
}

export default function ProductDetail({ product, initialProduct }: ProductDetailProps) {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const page = usePage();
  const mergedInitialProduct = product || initialProduct;
  // Route::inertia() sends no props, so fall back to the slug in the URL.
  const routeSlug = page.url.split('?')[0].split('/').filter(Boolean).pop() || '';
  const slug = mergedInitialProduct?.slug || routeSlug;
  const { data: fetchedProduct, isLoading } = useProduct(slug);
  const { data: viewerData } = useProductViewer(slug);
  const { items, addItem, openDrawer } = useCartStore();
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const mergedProduct = fetchedProduct || mergedInitialProduct;
  const variants = viewerData?.variants || mergedProduct?.variants || [];
  const thumbnailUrl = mergedProduct?.thumbnail?.url || viewerData?.product?.thumbnail_url || undefined;
  const glbUrl = mergedProduct?.glb_url || viewerData?.product?.glb_url || null;
  const selectedVariant = variants[selectedVariantIndex];

  if (!mergedProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({
      productId: mergedProduct.id,
      variantId: selectedVariant?.id,
      quantity: 1,
      name: mergedProduct.name,
      price: mergedProduct.price,
      image: thumbnailUrl,
      variantName: selectedVariant?.name,
      variantColorHex: selectedVariant?.color_hex,
    });
    openDrawer();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <nav className="mb-6 text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <li>
              <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-300">
                Home
              </Link>
            </li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <Link 
                href="/products" 
                className="hover:text-gray-700 dark:hover:text-gray-300"
              >
                Products
              </Link>
            </li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <span className="text-gray-900 dark:text-gray-100 font-medium truncate max-w-xs">
                {mergedProduct.name}
              </span>
            </li>
          </ol>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-4">
            <div className="relative">
              <ProductViewer3D
                glbUrl={glbUrl}
                variantTextures={variants}
                defaultVariantIndex={selectedVariantIndex}
                fallbackImage={thumbnailUrl}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
              />
            </div>

            {mergedProduct.images && mergedProduct.images.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {mergedProduct.images.map((image, index) => (
                  <button
                    key={image.id ?? index}
                    className={cn(
                      'relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all',
                      index === 0
                        ? 'border-primary-500'
                        : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                    )}
                    aria-label={`View image ${index + 1}`}
                  >
                    <img
                      src={image.url}
                      alt={`${mergedProduct.name} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-2">
                {mergedProduct.name}
              </h1>
              <p className="text-2xl font-semibold text-primary-600 dark:text-primary-400">
                {formatPrice(mergedProduct.price)}
              </p>
            </div>

            <div className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium',
              mergedProduct.stock > 10
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : mergedProduct.stock > 0
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            )}>
              {mergedProduct.stock > 10 && (
                <>
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  In Stock ({mergedProduct.stock} available)
                </>
              )}
              {mergedProduct.stock > 0 && mergedProduct.stock <= 10 && (
                <>
                  <span className="w-2 h-2 rounded-full bg-yellow-500" />
                  Low Stock ({mergedProduct.stock} left)
                </>
              )}
              {mergedProduct.stock === 0 && (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Out of Stock
                </>
              )}
            </div>

            {mergedProduct.description && (
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {mergedProduct.description}
                </p>
              </div>
            )}

            <VariantSelector
              variants={variants}
              selectedIndex={selectedVariantIndex}
              onSelect={setSelectedVariantIndex}
            />

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleAddToCart}
                disabled={mergedProduct.stock === 0}
                className={cn(
                  'w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                  mergedProduct.stock === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                    : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-500/25'
                )}
              >
                {mergedProduct.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>Cart: {cartItemCount} item{cartItemCount !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            You May Also Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <p className="col-span-full text-center text-gray-500 dark:text-gray-400 py-8">
              Related products coming soon...
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}