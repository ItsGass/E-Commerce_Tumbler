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

const TILE_TINTS = ['bg-tint-1', 'bg-tint-2', 'bg-tint-4', 'bg-tint-5', 'bg-tint-3'];

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
  const tileTint = TILE_TINTS[Math.abs(product.id) % TILE_TINTS.length];

  return (
    <article className={cn('group relative rounded-card bg-surface p-3.5 shadow-card transition-shadow hover:shadow-soft')}>
      {/* Product Image */}
      <Link
        href={`/products/${product.slug}`}
        className="block"
        aria-label={`View ${product.name}`}
      >
        <div className={cn('relative aspect-[4/5] overflow-hidden rounded-tile', tileTint)}>
          <ProductImage
            src={product.thumbnail?.url}
            alt={product.name}
            className="transition-transform duration-300 group-hover:scale-105"
          />

          {soldOut && (
            <span className="badge badge-danger absolute top-2.5 left-2.5">
              Sold out
            </span>
          )}
          {lowStock && (
            <span className="badge badge-warning absolute top-2.5 left-2.5">
              Only {product.stock} left
            </span>
          )}

          {/* Variant color indicators */}
          {variantColors.length > 1 && (
            <div className="absolute right-2.5 bottom-2.5 left-2.5 flex justify-center gap-1">
              {variantColors.map((color, i) => (
                <span
                  key={i}
                  className="h-5 w-5 rounded-full border-2 border-surface shadow-card"
                  style={{ backgroundColor: color }}
                  title={`Variant ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="px-1 pt-4 pb-1">
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="mb-1 line-clamp-1 font-sans text-base font-medium text-ink">
            {product.name}
          </h3>
          <p className="mb-3 font-display text-lg font-semibold text-accent">
            {formatPrice(product.price)}
          </p>
        </Link>

        {/* Add to Cart Button */}
        <button
          onClick={() => onAddToCart(product)}
          disabled={soldOut}
          className={cn(
            'btn btn-primary w-full disabled:bg-panel disabled:text-muted disabled:shadow-none',
          )}
        >
          {soldOut ? 'Sold out' : 'Add to Cart'}
        </button>
      </div>
    </article>
  );
}
