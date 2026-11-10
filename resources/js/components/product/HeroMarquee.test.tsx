import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { App } from '@inertiajs/react';
import type { Page } from '@inertiajs/core';
import { RootProviders } from '@/components/AppShell';
import { HeroMarquee, type HeroMarqueeProduct } from './HeroMarquee';

const products: HeroMarqueeProduct[] = [
  {
    id: 1,
    name: 'Classic Stainless Tumbler',
    slug: 'classic-stainless-tumbler',
    price: 185000,
    image: '/storage/products/images/classic-stainless-tumbler.png',
  },
  {
    id: 2,
    name: 'Ceramic Coated Travel Mug',
    slug: 'ceramic-coated-travel-mug',
    price: 220000,
    image: '/storage/products/images/ceramic-coated-travel-mug.png',
  },
  {
    id: 3,
    name: 'Insulated Sports Bottle',
    slug: 'insulated-sports-bottle',
    price: 155000,
    image: '/storage/products/images/insulated-sports-bottle.png',
  },
  {
    id: 4,
    name: 'Minimalist Glass Tumbler',
    slug: 'minimalist-glass-tumbler',
    price: 135000,
    image: '/storage/products/images/minimalist-glass-tumbler.png',
  },
  {
    id: 5,
    name: 'Copper Vacuum Flask',
    slug: 'copper-vacuum-flask',
    price: 285000,
    image: '/storage/products/images/copper-vacuum-flask.png',
  },
];

const fakePage = {
  component: 'hero-marquee',
  props: { auth: { user: null }, errors: {} },
  url: '/',
  version: 'test',
  sharedProps: [],
} as unknown as Page;

function renderMarquee(items: HeroMarqueeProduct[]) {
  function MarqueePage() {
    return <HeroMarquee products={items} />;
  }

  return render(
    <RootProviders>
      <App
        initialPage={fakePage}
        initialComponent={MarqueePage}
        resolveComponent={async () => MarqueePage}
        titleCallback={(title) => title}
      >
        {({ Component, props, key }) => (
          <Component key={key ?? undefined} {...props} />
        )}
      </App>
    </RootProviders>,
  );
}

describe('hero product marquee', () => {
  beforeEach(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  });

  afterEach(() => {
    cleanup();
  });

  it('renders three tracks, each with the product list duplicated once', () => {
    const { container } = renderMarquee(products);

    const tracks = container.querySelectorAll('.hero-marquee__track');
    expect(tracks).toHaveLength(3);

    for (const track of tracks) {
      const cards = [...track.querySelectorAll<HTMLAnchorElement>('.hero-marquee__card')];
      expect(cards).toHaveLength(products.length * 2);

      const originals = cards.slice(0, products.length);
      const duplicates = cards.slice(products.length);

      expect(new Set(originals.map((card) => card.getAttribute('href')))).toEqual(
        new Set(products.map((product) => `/products/${product.slug}`)),
      );

      for (const duplicate of duplicates) {
        expect(duplicate.getAttribute('aria-hidden')).toBe('true');
        expect(duplicate.getAttribute('tabindex')).toBe('-1');
      }

      for (const original of originals) {
        expect(original.hasAttribute('aria-hidden')).toBe(false);
        expect(original.hasAttribute('tabindex')).toBe(false);
      }
    }
  });

  it('links every card to its product detail page and shows a caption', () => {
    const { container } = renderMarquee(products);

    const cards = container.querySelectorAll<HTMLAnchorElement>(
      '.hero-marquee__track .hero-marquee__card',
    );
    expect(cards.length).toBe(products.length * 2 * 3);

    for (const card of cards) {
      const matched = products.find(
        (product) => card.getAttribute('href') === `/products/${product.slug}`,
      );
      expect(matched).toBeDefined();
      expect(card.textContent).toContain(matched!.name);
    }

    expect(cards[0]?.textContent).toContain('Rp');
  });

  it('eager-loads the first cards and lazy-loads the rest, always async', () => {
    const { container } = renderMarquee(products);

    const tracks = container.querySelectorAll('.hero-marquee__track');
    for (const track of tracks) {
      const images = [...track.querySelectorAll<HTMLImageElement>('img')];
      expect(images).toHaveLength(products.length * 2);

      expect(images[0]?.getAttribute('loading')).toBe('eager');
      expect(images[1]?.getAttribute('loading')).toBe('eager');
      expect(images[products.length]?.getAttribute('loading')).toBe('eager');
      expect(images[products.length + 1]?.getAttribute('loading')).toBe('eager');

      for (const image of images) {
        expect(image.getAttribute('decoding')).toBe('async');
        expect(image.getAttribute('src')).toBeTruthy();
      }
    }
  });

  it('falls back to the silhouette when a product has no image', () => {
    const { container } = renderMarquee([{ ...products[0]!, image: null }]);

    const firstCard = container.querySelector('.hero-marquee__track .hero-marquee__card');
    expect(firstCard?.querySelector('img')).toBeNull();
    expect(firstCard?.querySelector('[role="img"]')).not.toBeNull();
  });

  it('caps the marquee at twelve distinct images', () => {
    const many = Array.from({ length: 15 }, (_, index) => ({
      id: index + 1,
      name: `Product ${index + 1}`,
      slug: `product-${index + 1}`,
      price: 100000 + index,
      image: `/storage/products/images/product-${index + 1}.png`,
    }));

    const { container } = renderMarquee(many);

    const sources = new Set(
      [...container.querySelectorAll<HTMLImageElement>('.hero-marquee__columns img')].map(
        (image) => image.getAttribute('src'),
      ),
    );
    expect(sources.size).toBe(12);
  });

  it('renders nothing when there are no products', () => {
    const { container } = renderMarquee([]);

    expect(container.querySelector('.hero-marquee')).toBeNull();
  });
});
