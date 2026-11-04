'use client';

import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    thumbnail?: { url: string } | null;
    default_variant?: { id: number; name: string; color_hex: string } | null;
    variants?: Array<{ color_hex: string }>;
  };
  onAddToCart: (product: ProductCardProps['product']) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const variantColors = product.variants?.slice(0, 4).map(v => v.color_hex) || 
    (product.default_variant?.color_hex ? [product.default_variant.color_hex] : ['#1a1a1a']);

  return (
    <article className={cn('group relative bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-card border border-gray-200 dark:border-gray-700 transition-all hover:shadow-lift')}>
      {/* Product Image */}
      <Link
        href={`/products/${product.slug}`}
        className="block"
        aria-label={`View ${product.name}`}
      >
        <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
          {product.thumbnail?.url ? (
            <img
              src={product.thumbnail.url}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Variant color indicators */}
          {variantColors.length > 1 && (
            <div className="absolute bottom-2 left-2 right-2 flex gap-1 justify-center">
              {variantColors.map((color, i) => (
                <span
                  key={i}
                  className="w-5 h-5 rounded-full border-2 border-white/80 shadow-sm"
                  style={{ backgroundColor: color }}
                  title={`Variant ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1 mb-1">
            {product.name}
          </h3>
          <p className="text-lg font-semibold text-primary-600 dark:text-primary-400 mb-3">
            {formatPrice(product.price)}
          </p>
        </Link>

        {/* Add to Cart Button */}
        <button
          onClick={() => onAddToCart(product)}
          className={cn(
            'w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-colors',
            'bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900'
          )}
        >
          Add to Cart
        </button>
      </div>
    </article>
  );
}
