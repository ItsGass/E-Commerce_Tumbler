'use client';

import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { ProductImage } from './ProductImage';

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    stock?: number;
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
  const soldOut = typeof product.stock === 'number' && product.stock <= 0;
  const lowStock = typeof product.stock === 'number' && product.stock > 0 && product.stock < 5;

  return (
    <article className={cn('group relative bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-card border border-gray-200 dark:border-gray-700 transition-all hover:shadow-lift')}>
      {/* Product Image */}
      <Link
        href={`/products/${product.slug}`}
        className="block"
        aria-label={`View ${product.name}`}
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 dark:bg-gray-800">
          <ProductImage
            src={product.thumbnail?.url}
            alt={product.name}
            className="transition-transform duration-300 group-hover:scale-105"
          />

          {soldOut && (
            <span className="absolute top-2 left-2 rounded-full bg-red-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
              Sold out
            </span>
          )}
          {lowStock && (
            <span className="absolute top-2 left-2 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900 shadow-sm dark:bg-amber-400 dark:text-amber-950">
              Only {product.stock} left
            </span>
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
          disabled={soldOut}
          className={cn(
            'w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
            soldOut
              ? 'bg-gray-200 text-gray-600 cursor-not-allowed dark:bg-gray-800 dark:text-gray-300'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          )}
        >
          {soldOut ? 'Sold out' : 'Add to Cart'}
        </button>
      </div>
    </article>
  );
}
