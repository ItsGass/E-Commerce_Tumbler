'use client';

import { Link } from '@inertiajs/react';
import { useProducts } from '@/hooks/useProducts';
import { addProductToCart } from '@/hooks/useCart';
import { HeroMarquee, ProductCard, type HeroMarqueeProduct } from '@/components/product';

interface HomeProps {
  heroProducts?: HeroMarqueeProduct[];
}

const FEATURES = [
  {
    title: 'Demo checkout',
    description: 'Orders are placed in demo mode. No real payment is collected or charged.',
    tint: 'bg-tint-1',
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 8h6M9 12h6M9 16h3" />
      </svg>
    ),
  },
  {
    title: 'Live stock counts',
    description: 'Cards, product pages and checkout all use the same inventory numbers.',
    tint: 'bg-tint-2',
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 3 7l9 4 9-4-9-4Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m3 12 9 4 9-4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m3 17 9 4 9-4" />
      </svg>
    ),
  },
  {
    title: 'Order tracking',
    description: 'Every demo order gets a code and a tracking page at /track.',
    tint: 'bg-tint-4',
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    ),
  },
];

const TESTIMONIALS = [
  {
    quote: 'The 3D view made it easy to pick a colour before ordering.',
    location: 'Jakarta',
  },
  {
    quote: 'I could see the stock count before checkout, so there were no surprises.',
    location: 'Bandung',
  },
  {
    quote: 'Tracking the demo order took one code and my email address.',
    location: 'Surabaya',
  },
];

export default function Home({ heroProducts = [] }: HomeProps) {
  const { data, isLoading } = useProducts({ per_page: 4 });
  const firstProductSlug = heroProducts[0]?.slug;
  const try3dHref = firstProductSlug ? `/products/${firstProductSlug}` : '/products';

  return (
    <div className="min-h-screen bg-page">
      {/* Hero: one warm card inside the shared page container. */}
      <section className="pt-6 pb-8 sm:pt-10 lg:pb-10">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-panel bg-gradient-to-r from-panel via-panel to-blush">
            <div className="grid items-center gap-10 px-6 py-10 sm:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-4 lg:py-14 lg:pr-0 lg:pl-14">
              <div className="max-w-xl">
                <p className="eyebrow">Teman minum sepanjang hari</p>
                <h1 className="mt-4 text-ink">
                  Tumbler yang menemanimu{' '}
                  <em className="font-display italic text-accent">sepanjang hari</em>
                </h1>
                <p className="mt-5 max-w-md text-lg text-muted">
                  Foto asli, stok yang jujur, dan pratinjau 3D sebelum memilih warna.
                  Semua alurnya bisa dicoba sampai checkout demo.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link href="/products" className="btn btn-primary">
                    Lihat koleksi
                  </Link>
                  <Link href={try3dHref} className="btn btn-ghost">
                    Coba 3D
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>

              <div className="min-w-0 lg:-mr-6">
                <HeroMarquee products={heroProducts} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-8 lg:py-10">
        <div className="container-page">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3 lg:gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-card border border-hairline bg-surface p-6 shadow-card sm:p-7"
              >
                <div className={`inline-flex h-14 w-14 items-center justify-center rounded-full ${feature.tint} text-ink`}>
                  {feature.icon}
                </div>
                <h3 className="mt-5 text-xl text-ink">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-8 lg:py-10">
        <div className="container-page">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-ink">Featured Products</h2>
              <p className="mt-2 text-muted">A sample of the demo catalog</p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 rounded-full text-sm font-medium text-accent transition-colors hover:text-accent-hover"
            >
              View All
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse rounded-card bg-surface p-3 shadow-card">
                  <div className="mb-4 aspect-[4/5] rounded-tile bg-panel" />
                  <div className="mb-2 h-4 w-3/4 rounded-full bg-panel" />
                  <div className="h-4 w-1/2 rounded-full bg-panel" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {data?.data.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addProductToCart}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Sample testimonials */}
      <section className="py-8 lg:py-10">
        <div className="container-page">
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <h2 className="text-ink">What customers say</h2>
            <span className="badge badge-warning uppercase tracking-wide">
              Sample content — demo only
            </span>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3 lg:gap-6">
            {TESTIMONIALS.map((testimonial) => (
              <figure
                key={testimonial.quote}
                className="rounded-card border border-hairline bg-surface p-6 shadow-card"
              >
                <blockquote className="text-ink">“{testimonial.quote}”</blockquote>
                <figcaption className="mt-4 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-panel text-sm font-semibold text-accent">
                    SC
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-ink">Sample customer</span>
                    <span className="block text-sm text-muted">{testimonial.location}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted">
            These quotes are sample copy for this demo and are not real customer reviews.
          </p>
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-accent py-12 text-accent-foreground lg:py-16">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-accent-foreground">Ready to Find Your Perfect Tumbler?</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-accent-foreground/85">
              Explore the demo catalog and place a sample order to see the whole checkout flow.
            </p>
            <Link
              href="/products"
              className="btn btn-secondary mt-8"
            >
              Shop Collection
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
