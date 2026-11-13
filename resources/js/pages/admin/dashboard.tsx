'use client';

import { Link } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { RequireRole } from '@/components/auth';
import { cn, formatPrice } from '@/lib/utils';

interface DashboardStats {
  total_products: number;
  total_orders: number;
  total_users: number;
  total_revenue: number;
  recent_orders: Array<{
    id: number;
    code: string;
    status: string;
    total: number;
    created_at: string;
    buyer_name: string;
  }>;
  low_stock_products: Array<{
    id: number;
    name: string;
    stock: number;
    price: number;
  }>;
}

function AdminDashboardContent() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () => {
      const response = await api.get<DashboardStats>('/admin/dashboard');
      return response.data;
    },
  });

  const stats = [
    {
      label: 'Total Products',
      value: data?.total_products || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: 'bg-tint-5 text-accent',
      href: '/admin/products',
    },
    {
      label: 'Total Orders',
      value: data?.total_orders || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      color: 'bg-success-tint text-success',
      href: '/admin/orders',
    },
    {
      label: 'Total Users',
      value: data?.total_users || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'bg-tint-3 text-accent',
      href: '/admin/users',
    },
    {
      label: 'Total Revenue',
      value: formatPrice(data?.total_revenue || 0),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-warning-tint text-warning',
      href: '/admin/orders',
    },
  ];

  return (
    <div className="min-h-screen bg-page py-8">
      <div className="container-page">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-ink mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted">
            Overview of your Tumbler Shop
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Link key={stat.label} href={stat.href} className="block">
              <div className="bg-surface rounded-xl shadow-card border border-hairline p-6 hover:shadow-card transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted mb-1">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-ink">
                      {stat.value}
                    </p>
                  </div>
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', stat.color)}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Orders & Low Stock */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-surface rounded-xl shadow-card border border-hairline">
            <div className="p-6 border-b border-hairline flex items-center justify-between">
              <h2 className="text-xl font-bold text-ink">
                Recent Orders
              </h2>
              <Link href="/admin/orders" className="text-sm text-accent hover:text-accent">
                View All
              </Link>
            </div>
            <div className="divide-y divide-hairline">
              {data?.recent_orders?.slice(0, 5).map((order) => (
                <div key={order.id} className="p-6 flex items-center justify-between">
                  <div>
                    <p className="font-mono font-medium text-ink">
                      {order.code}
                    </p>
                    <p className="text-sm text-muted">
                      {order.buyer_name} • {formatPrice(order.total)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={cn(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      order.status === 'pending' && 'bg-warning-tint text-warning',
                      order.status === 'paid' && 'bg-tint-5 text-accent',
                      order.status === 'processing' && 'bg-tint-3 text-accent',
                      order.status === 'shipped' && 'bg-tint-3 text-accent',
                      order.status === 'completed' && 'bg-success-tint text-success',
                      order.status === 'cancelled' && 'bg-danger-tint text-danger',
                    )}>
                      {order.status}
                    </span>
                    <span className="text-sm text-muted">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              {!data?.recent_orders?.length && (
                <div className="p-6 text-center text-muted">
                  No recent orders
                </div>
              )}
            </div>
          </div>

          {/* Low Stock Products */}
          <div className="bg-surface rounded-xl shadow-card border border-hairline">
            <div className="p-6 border-b border-hairline flex items-center justify-between">
              <h2 className="text-xl font-bold text-ink">
                Low Stock Alert
              </h2>
              <Link href="/admin/products" className="text-sm text-accent hover:text-accent">
                View All
              </Link>
            </div>
            <div className="divide-y divide-hairline">
              {data?.low_stock_products?.slice(0, 5).map((product) => (
                <div key={product.id} className="p-6 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-ink">
                      {product.name}
                    </p>
                    <p className="text-sm text-muted">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={cn(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      product.stock === 0
                        ? 'bg-danger-tint text-danger'
                        : product.stock <= 5
                        ? 'bg-warning-tint text-warning'
                        : 'bg-success-tint text-success'
                    )}>
                      {product.stock} left
                    </span>
                  </div>
                </div>
              ))}
              {!data?.low_stock_products?.length && (
                <div className="p-6 text-center text-muted">
                  All products well stocked ✓
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <RequireRole roles={['admin', 'super_admin']}>
      <AdminDashboardContent />
    </RequireRole>
  );
}