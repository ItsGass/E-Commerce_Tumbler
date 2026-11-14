'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { RequireRole } from '@/components/auth';
import { cn, formatPrice } from '@/lib/utils';

interface Order {
  id: number;
  code: string;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  subtotal: number;
  shipping_cost: number;
  total: number;
  buyer: {
    name: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    province: string;
    postal_code: string;
  };
  user_id?: number | null;
  created_at: string;
  items: Array<{
    id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
  }>;
}

interface OrdersResponse {
  data: Order[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
}

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

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending: ['paid', 'cancelled'],
  paid: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['completed'],
  completed: [],
  cancelled: [],
};

function AdminOrdersContent() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin', 'orders', { page, search, status: statusFilter }],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, per_page: 15 };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      
      const response = await api.get<OrdersResponse>('/admin/orders', { params });
      return response.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, reason }: { id: number; status: string; reason?: string }) => {
      const response = await api.patch(`/admin/orders/${id}/status`, { status, reason });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      setSelectedOrder(null);
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post(`/admin/orders/${id}/mark-paid`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
    },
  });

  const handleStatusChange = (order: Order, newStatus: string) => {
    if (newStatus === 'cancelled') {
      const reason = window.prompt('Cancellation reason (optional):');
      if (reason === null) return; // User cancelled
      updateStatusMutation.mutate({ id: order.id, status: newStatus, reason });
    } else {
      updateStatusMutation.mutate({ id: order.id, status: newStatus });
    }
  };

  const allowedNextStatuses = (currentStatus: string) => {
    return ALLOWED_TRANSITIONS[currentStatus] || [];
  };

  return (
    <div className="min-h-screen bg-page py-8">
      <div className="container-page">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-ink mb-2">
            Order Management
          </h1>
          <p className="text-muted">
            View and manage customer orders
          </p>
        </div>

        {/* Filters */}
        <div className="bg-surface rounded-xl shadow-card border border-hairline p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by code, name, email..."
                className="w-full px-4 py-2 pl-10 border border-hairline rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-hairline rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-surface rounded-xl shadow-card border border-hairline overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-panel">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Order</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted uppercase tracking-wider pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {data?.data.map((order) => (
                      <tr key={order.id} className="hover:bg-panel">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-mono font-medium text-ink">
                              {order.code}
                            </p>
                            <p className="text-sm text-muted">
                              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-ink">
                              {order.buyer.name}
                            </p>
                            <p className="text-sm text-muted">
                              {order.buyer.email}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1 max-h-24 overflow-y-auto">
                            {order.items.map((item) => (
                              <div key={item.id} className="text-sm text-muted flex gap-2">
                                <span className="font-medium">{item.product_name}</span>
                                <span className="text-muted">×{item.quantity}</span>
                                <span>{formatPrice(item.unit_price)}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-semibold text-ink">
                            {formatPrice(order.total)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                            STATUS_COLORS[order.status]
                          )}>
                            {STATUS_LABELS[order.status] || order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right pr-6">
                          <div className="flex items-center justify-end gap-2">
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order, e.target.value)}
                              disabled={updateStatusMutation.isPending || allowedNextStatuses(order.status).length === 0}
                              className={cn(
                                'px-2 py-1 border rounded-lg text-sm font-medium bg-surface focus:outline-none focus:ring-2 focus:ring-accent',
                                'border-hairline text-ink',
                                'disabled:opacity-50 disabled:cursor-not-allowed'
                              )}
                            >
                              {allowedNextStatuses(order.status).map((s) => (
                                <option key={s} value={s}>
                                  {STATUS_LABELS[s] || s}
                                </option>
                              ))}
                            </select>
                            {order.status !== 'paid' && (
                              <button
                                onClick={() => markPaidMutation.mutate(order.id)}
                                disabled={markPaidMutation.isPending}
                                className="px-2 py-1 bg-success text-page rounded-lg text-xs font-medium hover:bg-success/85 disabled:opacity-50"
                              >
                                Mark Paid
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="text-accent hover:text-accent text-sm font-medium"
                            >
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!data?.data.length && (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-muted">
                          No orders found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data && data.meta.last_page > 1 && (
                <div className="px-6 py-4 border-t border-hairline flex items-center justify-between">
                  <p className="text-sm text-ink">
                    Showing {data.meta.per_page * (data.meta.current_page - 1) + 1} to {Math.min(data.meta.per_page * data.meta.current_page, data.meta.total)} of {data.meta.total}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={data.meta.current_page === 1 || isFetching}
                      className="px-3 py-1 border border-hairline rounded-lg text-sm text-ink hover:bg-panel disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(data.meta.last_page, p + 1))}
                      disabled={data.meta.current_page === data.meta.last_page || isFetching}
                      className="px-3 py-1 border border-hairline rounded-lg text-sm text-ink hover:bg-panel disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay">
            <div className="bg-surface rounded-xl shadow-soft max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-hairline flex items-center justify-between">
                <h2 className="text-xl font-bold text-ink">
                  Order {selectedOrder.code}
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-muted hover:text-ink"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted">Status</p>
                    <p className={cn(
                      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium mt-1',
                      STATUS_COLORS[selectedOrder.status]
                    )}>
                      {STATUS_LABELS[selectedOrder.status] || selectedOrder.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted">Total</p>
                    <p className="font-bold text-lg text-ink mt-1">
                      {formatPrice(selectedOrder.total)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted">Customer</p>
                    <p className="mt-1 text-ink">{selectedOrder.buyer.name}</p>
                    <p className="text-sm text-muted">{selectedOrder.buyer.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted">Phone</p>
                    <p className="mt-1 text-ink">{selectedOrder.buyer.phone}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-ink mb-3">Items</h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex gap-4 p-3 bg-panel rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-ink">{item.product_name}</p>
                          <p className="text-sm text-muted">Qty: {item.quantity} × {formatPrice(item.unit_price)}</p>
                        </div>
                        <p className="font-semibold text-ink whitespace-nowrap">
                          {formatPrice(item.unit_price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminOrders() {
  return (
    <RequireRole roles={['admin', 'super_admin']}>
      <AdminOrdersContent />
    </RequireRole>
  );
}