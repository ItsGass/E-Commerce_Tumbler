'use client';

import { useMemo, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { useProducts } from '@/hooks/useProducts';
import { addProductToCart } from '@/hooks/useCart';
import { ProductCard } from '@/components/product';
import { cn } from '@/lib/utils';

type ProductSort = 'new' | 'popular';

export default function Products() {
  const [search, setSearch] = useState('');
  const { url } = usePage();

  // The URL is the source of truth, so /products?sort=popular can be linked
  // directly and the dropdown always agrees with the request.
  const sort: ProductSort = useMemo(() => {
    const query = url.split('?')[1] ?? '';
    return new URLSearchParams(query).get('sort') === 'popular' ? 'popular' : 'new';
  }, [url]);

  const { data, isLoading, isFetching } = useProducts({ search, sort });

  const handleSortChange = (value: ProductSort) => {
    router.get(
      '/products',
      { sort: value },
      { preserveState: true, preserveScroll: true, replace: true }
    );
  };

  return (
    <div className="min-h-screen bg-page py-10 lg:py-14">
      <Head title="All Products">
        <meta
          name="description"
          content="Browse the Tumbler Shop demo catalog. Every order is a sample and no real payment is taken."
        />
      </Head>

      <div className="container-page">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-ink mb-2">
            All Products
          </h1>
          <p className="text-muted">
            {sort === 'popular'
              ? 'The demo products with the most units sold'
              : 'Discover our collection of premium tumblers'}
          </p>
        </div>

        {/* Search and sort */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className={cn(
                'w-full px-4 py-3 pl-10 rounded-lg border border-hairline',
                'bg-panel text-ink',
                'placeholder-gray-400 dark:placeholder-gray-500',
                'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent'
              )}
            />
            <svg 
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <label htmlFor="product-sort" className="text-sm font-medium text-muted">
              Sort by
            </label>
            <select
              id="product-sort"
              value={sort}
              onChange={(e) => handleSortChange(e.target.value as ProductSort)}
              className="field min-h-11 w-44 cursor-pointer"
            >
              <option value="new">Newest</option>
              <option value="popular">Best selling</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-panel rounded-xl mb-4" />
                <div className="h-4 bg-panel rounded w-3/4 mb-2" />
                <div className="h-4 bg-panel rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : data?.data.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 mx-auto text-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h2 className="text-xl font-semibold text-ink mb-2">
              No products found
            </h2>
            <p className="text-muted">
              {search ? 'Try adjusting your search' : 'Check back later for new products'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data?.data.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addProductToCart}
                />
              ))}
            </div>

            {/* Pagination */}
            {data && data.meta.last_page > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-2" aria-label="Pagination">
                  {data.meta.current_page > 1 && (
                    <button
                      onClick={() => setSearch(search)} // This would need proper pagination handling
                      className={cn(
                        'px-3 py-2 rounded-lg border border-hairline',
                        'text-muted hover:bg-panel',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                      )}
                    >
                      Previous
                    </button>
                  )}
                  <span className="px-3 py-2 text-ink">
                    Page {data.meta.current_page} of {data.meta.last_page}
                  </span>
                  {data.meta.current_page < data.meta.last_page && (
                    <button
                      className={cn(
                        'px-3 py-2 rounded-lg border border-hairline',
                        'text-muted hover:bg-panel'
                      )}
                    >
                      Next
                    </button>
                  )}
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}