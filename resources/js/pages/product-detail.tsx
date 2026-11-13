'use client';

import { useEffect, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useProduct, useProductViewer } from '@/hooks/useProducts';
import { useCartStore } from '@/stores/useCartStore';
import { ProductViewer3D, VariantSelector, ProductImage } from '@/components/product';
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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showViewer, setShowViewer] = useState(false);
  const [quantity, setQuantity] = useState(1);
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

  const galleryImages = (mergedProduct?.images || []).filter((image) => Boolean(image.url));
  const safeImageIndex = Math.min(selectedImageIndex, Math.max(galleryImages.length - 1, 0));
  const selectedImageUrl = galleryImages[safeImageIndex]?.url || thumbnailUrl;
  const hasPhotos = galleryImages.length > 0;
  const showPhotos = hasPhotos && !showViewer;
  const maxQuantity = Math.max(mergedProduct?.stock ?? 1, 1);
  const quantityValue = Math.min(quantity, maxQuantity);

  useEffect(() => {
    setSelectedImageIndex(0);
    setShowViewer(false);
    setQuantity(1);
  }, [slug]);

  if (!mergedProduct) {
    return (
      <div className="min-h-screen bg-page py-8">
        <div className="container-page animate-pulse">
          <div className="mb-6 h-5 w-64 rounded bg-panel" />
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="space-y-4">
              <div className="aspect-[4/5] w-full rounded-xl bg-panel" />
              <div className="flex gap-2">
                {[0, 1, 2].map((index) => (
                  <div
                    key={index}
                    className="aspect-[4/5] w-16 sm:w-20 rounded-lg bg-panel"
                  />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-10 w-3/4 rounded bg-panel" />
              <div className="h-8 w-1/3 rounded bg-panel" />
              <div className="h-6 w-32 rounded-full bg-panel" />
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-panel" />
                <div className="h-4 w-full rounded bg-panel" />
                <div className="h-4 w-2/3 rounded bg-panel" />
              </div>
              <div className="h-14 w-full rounded-lg bg-panel" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({
      productId: mergedProduct.id,
      variantId: selectedVariant?.id,
      quantity: quantityValue,
      name: mergedProduct.name,
      price: mergedProduct.price,
      image: thumbnailUrl,
      variantName: selectedVariant?.name,
      variantColorHex: selectedVariant?.color_hex,
    });
    openDrawer();
  };

  return (
    <div className="min-h-screen bg-page py-8">
      <div className="container-page">
        <nav className="mb-6 text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-muted">
            <li>
              <Link href="/" className="hover:text-ink">
                Home
              </Link>
            </li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <Link 
                href="/products" 
                className="hover:text-ink"
              >
                Products
              </Link>
            </li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <span className="text-ink font-medium truncate max-w-xs">
                {mergedProduct.name}
              </span>
            </li>
          </ol>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-4">
            <div className="relative">
              {showPhotos ? (
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-hairline bg-surface shadow-card">
                  <ProductImage
                    src={selectedImageUrl}
                    alt={mergedProduct.name}
                    loading="eager"
                  />
                </div>
              ) : (
                <ProductViewer3D
                  glbUrl={glbUrl}
                  variantTextures={variants}
                  defaultVariantIndex={selectedVariantIndex}
                  fallbackImage={selectedImageUrl}
                  className="bg-surface rounded-xl shadow-card border border-hairline"
                />
              )}
            </div>

            {hasPhotos && (
              <div className="flex flex-wrap items-center gap-2">
                <div
                  className="flex gap-2 overflow-x-auto pb-2"
                  role="group"
                  aria-label={`${mergedProduct.name} photos`}
                >
                  {galleryImages.map((image, index) => {
                    const isActive = !showViewer && index === safeImageIndex;

                    return (
                      <button
                        key={image.id ?? index}
                        type="button"
                        onClick={() => {
                          setSelectedImageIndex(index);
                          setShowViewer(false);
                        }}
                        className={cn(
                          'relative aspect-[4/5] w-16 sm:w-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all',
                          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-page',
                          isActive
                            ? 'border-accent'
                            : 'border-transparent hover:border-muted/40'
                        )}
                        aria-label={`Show ${mergedProduct.name} photo ${index + 1}`}
                        aria-pressed={isActive}
                      >
                        <ProductImage src={image.url} alt={mergedProduct.name} />
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setShowViewer((value) => !value)}
                  aria-pressed={showViewer}
                  className={cn(
                    'ml-auto inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-page',
                    showViewer
                      ? 'border-accent bg-panel text-accent'
                      : 'border-hairline text-ink hover:bg-panel dark:text-muted'
                  )}
                >
                  {showViewer ? 'Photo gallery' : '3D view'}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-ink mb-2">
                {mergedProduct.name}
              </h1>
              <p className="text-2xl font-semibold text-accent">
                {formatPrice(mergedProduct.price)}
              </p>
            </div>

            <div className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium',
              mergedProduct.stock > 10
                ? 'bg-success-tint text-success'
                : mergedProduct.stock > 0
                ? 'bg-warning-tint text-warning'
                : 'bg-danger-tint text-danger'
            )}>
              {mergedProduct.stock > 10 && (
                <>
                  <span className="w-2 h-2 rounded-full bg-success-tint0" />
                  In Stock ({mergedProduct.stock} available)
                </>
              )}
              {mergedProduct.stock > 0 && mergedProduct.stock <= 10 && (
                <>
                  <span className="w-2 h-2 rounded-full bg-warning" />
                  Low Stock ({mergedProduct.stock} left)
                </>
              )}
              {mergedProduct.stock === 0 && (
                <>
                  <span className="w-2 h-2 rounded-full bg-danger-tint0" />
                  Out of Stock
                </>
              )}
            </div>

            {mergedProduct.description && (
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-muted whitespace-pre-wrap">
                  {mergedProduct.description}
                </p>
              </div>
            )}

            <VariantSelector
              variants={variants}
              selectedIndex={selectedVariantIndex}
              onSelect={setSelectedVariantIndex}
            />

            <div className="pt-4 border-t border-hairline">
              <div className="mb-4 flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-ink">
                  Quantity
                </span>
                <div className="flex items-center rounded-lg border border-hairline">
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => Math.max(1, Math.min(value, maxQuantity) - 1))}
                    disabled={mergedProduct.stock === 0 || quantityValue <= 1}
                    className="p-2.5 text-muted hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Decrease quantity"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="w-10 text-center text-sm font-semibold text-ink" aria-live="polite">
                    {quantityValue}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => Math.min(maxQuantity, Math.min(value, maxQuantity) + 1))}
                    disabled={mergedProduct.stock === 0 || quantityValue >= maxQuantity}
                    className="p-2.5 text-muted hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={mergedProduct.stock === 0}
                className={cn(
                  'w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
                  mergedProduct.stock === 0
                    ? 'bg-panel text-muted cursor-not-allowed dark:text-muted'
                    : 'bg-accent text-accent-foreground hover:bg-accent-hover hover:shadow-soft'
                )}
              >
                {mergedProduct.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>

            <div className="text-sm text-muted">
              <p>Cart: {cartItemCount} item{cartItemCount !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        <section className="mt-16">
          <h2 className="text-2xl font-bold text-ink mb-6">
            You May Also Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <p className="col-span-full text-center text-muted py-8">
              Related products coming soon...
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}