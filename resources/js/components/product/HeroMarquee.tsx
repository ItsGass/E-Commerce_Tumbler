'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { ProductImage } from './ProductImage';

export interface HeroMarqueeProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  image?: string | null;
}

interface HeroMarqueeProps {
  products: HeroMarqueeProduct[];
  className?: string;
}

const MAX_CARDS = 12;
const MIN_CARDS_PER_COLUMN = 4;
const DIRECTIONS = ['up', 'down', 'up'] as const;
const DURATIONS = ['34s', '42s', '38s'] as const;
const COLUMN_OFFSETS = [0, 2, 4] as const;
const TINTS = [
  'var(--warm-panel)',
  'var(--warm-tint-4)',
  'var(--warm-blush)',
  'var(--warm-tint-1)',
  'var(--warm-tint-4)',
] as const;

function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
}

/**
 * Rotate the list per column, then repeat it until the track is tall enough
 * to cover the viewport. The track is rendered twice, so `translateY(-50%)`
 * lands exactly on the start of the second copy.
 */
function buildColumn(products: HeroMarqueeProduct[], offset: number): HeroMarqueeProduct[] {
  if (products.length === 0) {
    return [];
  }

  const rotated = products.map((_, index) => products[(index + offset) % products.length]);
  const target = Math.max(MIN_CARDS_PER_COLUMN, rotated.length);
  const filled: HeroMarqueeProduct[] = [];

  while (filled.length < target) {
    filled.push(...rotated);
  }

  return filled.slice(0, target);
}

function MarqueeCard({
  product,
  eager,
  duplicate = false,
  tintIndex = 0,
}: {
  product: HeroMarqueeProduct;
  eager: boolean;
  duplicate?: boolean;
  tintIndex?: number;
}) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="hero-marquee__card group"
      style={{ '--marquee-tint': TINTS[tintIndex % TINTS.length] } as CSSProperties}
      aria-label={`View ${product.name}`}
      aria-hidden={duplicate ? true : undefined}
      tabIndex={duplicate ? -1 : undefined}
    >
      <span className="hero-marquee__frame">
        <span className="hero-marquee__image">
          <ProductImage
            src={product.image}
            alt={product.name}
            className="transition-transform duration-300 group-hover:scale-105"
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
          />
          <span className="hero-marquee__wash" aria-hidden="true" />
        </span>
      </span>
      <span className="hero-marquee__caption">
        <span className="hero-marquee__name">{product.name}</span>
        <span className="hero-marquee__price">{formatPrice(product.price)}</span>
      </span>
    </Link>
  );
}

export function HeroMarquee({ products, className }: HeroMarqueeProps) {
  const [tabHidden, setTabHidden] = useState(false);

  useEffect(() => {
    const onVisibilityChange = () => setTabHidden(document.hidden);

    onVisibilityChange();
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  const cards = useMemo(() => products.slice(0, MAX_CARDS), [products]);

  const columns = useMemo(
    () =>
      DIRECTIONS.map((direction, index) => ({
        direction,
        duration: DURATIONS[index],
        items: buildColumn(cards, COLUMN_OFFSETS[index]),
      })),
    [cards],
  );

  const staticCards = cards.slice(0, 6);

  if (cards.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'hero-marquee',
        tabHidden && 'hero-marquee--tab-hidden',
        className,
      )}
    >
      <div className="hero-marquee__columns">
        {columns.map((column, columnIndex) => (
          <div
            key={columnIndex}
            className={cn(
              'hero-marquee__track',
              column.direction === 'up'
                ? 'hero-marquee__track--up'
                : 'hero-marquee__track--down',
            )}
            style={{ '--marquee-duration': column.duration } as CSSProperties}
          >
            {[...column.items, ...column.items].map((product, index) => (
              <MarqueeCard
                key={`${columnIndex}-${index}-${product.id}`}
                product={product}
                eager={index < 2 || (index >= column.items.length && index < column.items.length + 2)}
                duplicate={index >= column.items.length}
                tintIndex={index + columnIndex}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="hero-marquee__static">
        {staticCards.map((product, index) => (
          <MarqueeCard
            key={`static-${index}-${product.id}`}
            product={product}
            eager={index < 2}
            tintIndex={index}
          />
        ))}
      </div>
    </div>
  );
}
