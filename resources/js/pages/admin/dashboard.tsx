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
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
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
      color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
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
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
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
      color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
      href: '/admin/orders',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Overview of your Tumbler Shop
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Link key={stat.label} href={stat.href} className="block">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
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
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Recent Orders
              </h2>
              <Link href="/admin/orders" className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700">
                View All
              </Link>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {data?.recent_orders?.slice(0, 5).map((order) => (
                <div key={order.id} className="p-6 flex items-center justify-between">
                  <div>
                    <p className="font-mono font-medium text-gray-900 dark:text-gray-100">
                      {order.code}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {order.buyer_name} • {formatPrice(order.total)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={cn(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      order.status === 'pending' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
                      order.status === 'paid' && 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
                      order.status === 'processing' && 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
                      order.status === 'shipped' && 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
                      order.status === 'completed' && 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
                      order.status === 'cancelled' && 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
                    )}>
                      {order.status}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              {!data?.recent_orders?.length && (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  No recent orders
                </div>
              )}
            </div>
          </div>

          {/* Low Stock Products */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Low Stock Alert
              </h2>
              <Link href="/admin/products" className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700">
                View All
              </Link>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {data?.low_stock_products?.slice(0, 5).map((product) => (
                <div key={product.id} className="p-6 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={cn(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      product.stock === 0
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        : product.stock <= 5
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    )}>
                      {product.stock} left
                    </span>
                  </div>
                </div>
              ))}
              {!data?.low_stock_products?.length && (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
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