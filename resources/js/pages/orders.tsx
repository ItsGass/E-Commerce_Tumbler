'use client';

import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { useUserOrders } from '@/hooks/useOrders';
import { cn, formatPrice } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-warning-tint text-warning',
  paid: 'bg-tint-5 text-accent',
  processing: 'bg-tint-3 text-accent',
  shipped: 'bg-tint-3 text-accent',
  completed: 'bg-success-tint text-success',
  cancelled: 'bg-danger-tint text-danger',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  paid: 'Paid',
  processing: 'Processing',
  shipped: 'Shipped',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function Orders() {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'past'>('all');
  const { data, isLoading, isFetching } = useUserOrders();

  const filteredOrders = data?.data.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return !['completed', 'cancelled'].includes(order.status);
    if (activeTab === 'past') return ['completed', 'cancelled'].includes(order.status);
    return true;
  }) || [];

  return (
    <div className="min-h-screen bg-page py-16">
      <div className="container-page">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-ink mb-2">
            My Orders
          </h1>
          <p className="text-muted">
            Track and manage your orders
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-hairline">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {[
              { key: 'all', label: 'All Orders' },
              { key: 'active', label: 'Active' },
              { key: 'past', label: 'Past' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={cn(
                  'py-3 px-1 border-b-2 font-medium text-sm transition-colors',
                  activeTab === tab.key
                    ? 'border-accent text-accent'
                    : 'border-transparent text-muted hover:text-ink'
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse bg-surface rounded-xl border border-hairline p-6">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-panel rounded-lg" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-panel rounded w-1/4" />
                    <div className="h-4 bg-panel rounded w-1/2" />
                    <div className="h-4 bg-panel rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 mx-auto text-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h2 className="text-xl font-semibold text-ink mb-2">
              No orders found
            </h2>
            <p className="text-muted mb-6">
              {activeTab === 'all' 
                ? "You haven't placed any orders yet."
                : activeTab === 'active'
                ? 'No active orders at the moment.'
                : 'No past orders yet.'}
            </p>
            <Link 
              href="/products"
              className="inline-flex items-center px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent-hover transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <article 
                key={order.id} 
                className="bg-surface rounded-xl shadow-card border border-hairline overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div>
                      <p className="font-mono font-medium text-ink">
                        Order {order.code}
                      </p>
                      <p className="text-sm text-muted">
                        Placed {new Date(order.created_at).toLocaleDateString('en-ID', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={cn(
                        'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                        STATUS_COLORS[order.status]
                      )}>
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                      <Link
                        href={`/track/${order.code}`}
                        className="text-accent hover:text-accent-hover text-sm font-medium"
                      >
                        Track
                      </Link>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="flex flex-wrap gap-3 mb-4">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-panel">
                          {item.variant?.color_hex ? (
                            <div className="w-full h-full" style={{ backgroundColor: item.variant.color_hex }} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink truncate">
                            {item.product_name}
                          </p>
                          <p className="text-xs text-muted">
                            Qty: {item.quantity} × {formatPrice(item.unit_price)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-panel flex items-center justify-center text-muted">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-hairline">
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-ink">
                        {formatPrice(order.total)}
                      </span>
                      <span className="text-sm text-muted">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <Link
                      href={`/track/${order.code}`}
                      className="inline-flex items-center px-4 py-2 border border-hairline rounded-lg text-sm font-medium text-ink hover:bg-panel"
                    >
                      View Details
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {data && data.meta.last_page > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2" aria-label="Pagination">
              {data.meta.current_page > 1 && (
                <button className="px-3 py-2 rounded-lg border border-hairline text-muted hover:bg-panel">
                  Previous
                </button>
              )}
              <span className="px-3 py-2 text-ink">
                Page {data.meta.current_page} of {data.meta.last_page}
              </span>
              {data.meta.current_page < data.meta.last_page && (
                <button className="px-3 py-2 rounded-lg border border-hairline text-muted hover:bg-panel">
                  Next
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}