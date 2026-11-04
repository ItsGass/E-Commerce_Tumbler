'use client';

import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { addProductToCart } from '@/hooks/useCart';
import { ProductCard } from '@/components/product';
import { cn } from '@/lib/utils';

export default function Products() {
  const [search, setSearch] = useState('');
  const { data, isLoading, isFetching } = useProducts({ search });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 lg:py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-2">
            All Products
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover our collection of premium tumblers
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className={cn(
                'w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 dark:border-gray-600',
                'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
                'placeholder-gray-400 dark:placeholder-gray-500',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent'
              )}
            />
            <svg 
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-xl mb-4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : data?.data.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No products found
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
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
                        'px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600',
                        'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                      )}
                    >
                      Previous
                    </button>
                  )}
                  <span className="px-3 py-2 text-gray-700 dark:text-gray-300">
                    Page {data.meta.current_page} of {data.meta.last_page}
                  </span>
                  {data.meta.current_page < data.meta.last_page && (
                    <button
                      className={cn(
                        'px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600',
                        'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
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