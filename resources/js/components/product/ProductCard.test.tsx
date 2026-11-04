import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { App } from '@inertiajs/react';
import type { Page } from '@inertiajs/core';
import { ProductCard } from './ProductCard';
import { addProductToCart } from '@/hooks/useCart';
import { useCartStore } from '@/stores/useCartStore';
import { RootProviders } from '@/components/AppShell';

const product = {
  id: 1,
  name: 'Classic Stainless Tumbler',
  slug: 'classic-stainless-tumbler',
  price: 185000,
  thumbnail: { url: '/storage/products/classic.jpg' },
  default_variant: { id: 7, name: 'Matte Black', color_hex: '#1a1a1a' },
  variants: [{ color_hex: '#1a1a1a' }, { color_hex: '#f5f5f5' }],
};

const fakePage = {
  component: 'product-card',
  props: { auth: { user: null }, errors: {} },
  url: '/products',
  version: 'test',
  sharedProps: [],
} as unknown as Page;

function CardPage() {
  return <ProductCard product={product} onAddToCart={addProductToCart} />;
}

function renderCard() {
  return render(
    <RootProviders>
      <App
        initialPage={fakePage}
        initialComponent={CardPage}
        resolveComponent={async () => CardPage}
        titleCallback={(title) => title}
      />
    </RootProviders>,
  );
}

describe('ProductCard interactions', () => {
  beforeEach(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    localStorage.clear();
    useCartStore.setState({ items: [], isOpen: false });
  });

  afterEach(() => {
    cleanup();
  });

  it('links to the product detail page', () => {
    renderCard();

    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link.getAttribute('href')).toBe(`/products/${product.slug}`);
    }
  });

  it('adds the default variant to the cart when Add to Cart is clicked', () => {
    renderCard();

    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }));

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toMatchObject({
      productId: product.id,
      variantId: product.default_variant.id,
      quantity: 1,
      name: product.name,
      price: product.price,
      variantName: product.default_variant.name,
      variantColorHex: product.default_variant.color_hex,
    });
    expect(state.isOpen).toBe(true);
  });
});
