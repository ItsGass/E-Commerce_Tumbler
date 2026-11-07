'use client';

import { useEffect, useMemo, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useTrackOrder } from '@/hooks/useOrders';
import { cn, formatPrice } from '@/lib/utils';

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed', description: 'Your order has been received' },
  { key: 'paid', label: 'Payment Confirmed', description: 'Payment has been verified' },
  { key: 'processing', label: 'Processing', description: 'Your order is being prepared' },
  { key: 'shipped', label: 'Shipped', description: 'Your order is on the way' },
  { key: 'completed', label: 'Delivered', description: 'Order has been delivered' },
  { key: 'cancelled', label: 'Cancelled', description: 'Order has been cancelled' },
];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  paid: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  processing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export default function Track() {
  const { url } = usePage();

  // `/track/{code}` carries the code in the path; prefill it so the buyer only
  // has to confirm who they are.
  const codeFromUrl = useMemo(() => {
    const path = url.split('?')[0].split('/').filter(Boolean);

    if (path.length !== 2 || path[0] !== 'track') {
      return '';
    }

    return path[1].toUpperCase();
  }, [url]);

  const [code, setCode] = useState(codeFromUrl);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (codeFromUrl) {
      setCode(codeFromUrl);
    }
  }, [codeFromUrl]);

  const { data: order, isLoading, isError } = useTrackOrder(
    submitted ? code : '',
    submitted ? email : undefined,
    submitted ? phone : undefined
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || (!email.trim() && !phone.trim())) {
      setError('Please enter order code and email or phone');
      return;
    }
    setError(null);
    setSubmitted(true);
  };

  const getCurrentStepIndex = (status: string) => {
    return STATUS_STEPS.findIndex(s => s.key === status);
  };

  const currentStepIndex = order ? getCurrentStepIndex(order.status) : -1;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-2">
            Track Your Order
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Enter your order code and email or phone to check the status
          </p>
        </div>

        {!submitted && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Order Code *
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="TS-ABCD1234"
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email or Phone *
                </label>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full min-w-0 flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <span className="text-center text-sm text-gray-400 sm:text-base">or</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone number"
                    className="w-full min-w-0 flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Enter either your email or phone number used during checkout
                </p>
              </div>

              {error && (
                <p className="text-red-500 text-sm" role="alert">{error}</p>
              )}

              <button
                type="submit"
                className="w-full py-3 px-6 bg-primary-600 text-white rounded-lg font-semibold text-lg hover:bg-primary-700 transition-colors"
              >
                Track Order
              </button>
            </form>
          </div>
        )}

        {submitted && isLoading && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Looking up your order...</p>
          </div>
        )}

        {submitted && isError && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Order Not Found
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              No order matches the provided details. Please check and try again.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {order && (
          <div className="space-y-8">
            {/* Order Header */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Order {order.code}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    Placed on {new Date(order.created_at).toLocaleDateString('en-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className={cn(
                  'inline-flex items-center px-4 py-2 rounded-full text-sm font-medium',
                  STATUS_COLORS[order.status]
                )}>
                  {STATUS_STEPS.find(s => s.key === order.status)?.label || order.status}
                </div>
              </div>

              {/* Timeline */}
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
                <div className="space-y-6">
                  {STATUS_STEPS.map((step, index) => {
                    const isCompleted = index < currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const isFuture = index > currentStepIndex;

                    return (
                      <div key={step.key} className="flex gap-4 relative">
                        <div className={cn(
                          'flex-shrink-0 w-12 h-12 rounded-full border-4 flex items-center justify-center relative z-10',
                          'transition-all duration-300',
                          isCompleted
                            ? 'bg-primary-600 border-primary-600 text-white'
                            : isCurrent
                            ? 'bg-white dark:bg-gray-900 border-primary-600 text-primary-600 ring-4 ring-primary-100 dark:ring-primary-900/30'
                            : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-400'
                        )}>
                          {isCompleted ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <span className="text-lg font-bold">
                              {index + 1}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 pt-1">
                          <h3 className={cn(
                            'font-medium',
                            isCompleted || isCurrent
                              ? 'text-gray-900 dark:text-gray-100'
                              : 'text-gray-500 dark:text-gray-400'
                          )}>
                            {step.label}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {step.description}
                          </p>
                          {(isCompleted || isCurrent) && order.items && (
                            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                              {order.items.length} item{order.items.length !== 1 ? 's' : ''} •{' '}
                              {formatPrice(order.total)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                Order Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Order Code</p>
                  <p className="font-mono font-medium text-gray-900 dark:text-gray-100">{order.code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                  <p className="font-bold text-lg text-primary-600 dark:text-primary-400">{formatPrice(order.total)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Shipping</p>
                  <p className="text-gray-900 dark:text-gray-100">{formatPrice(order.shipping_cost)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Payment Status</p>
                  <p className={cn(
                    'font-medium',
                    order.status === 'paid' || order.status === 'processing' || order.status === 'shipped' || order.status === 'completed'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-yellow-600 dark:text-yellow-400'
                  )}>
                    {order.status === 'paid' || order.status === 'processing' || order.status === 'shipped' || order.status === 'completed' ? 'Paid' : 'Pending'}
                  </p>
                </div>
              </div>
            </div>

            {/* Items */}
            {order.items && order.items.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Items ({order.items.length})
                </h3>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                        {item.variant?.color_hex ? (
                          <div className="w-full h-full" style={{ backgroundColor: item.variant.color_hex }} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {item.product_name}
                        </p>
                        {item.variant && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {item.variant.name}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Qty: {item.quantity} × {formatPrice(item.unit_price)}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                        {formatPrice(item.line_total)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Buyer Info */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                Shipping Address
              </h3>
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {order.buyer.name}<br />
                {order.buyer.street}<br />
                {order.buyer.city}, {order.buyer.province} {order.buyer.postal_code}<br />
                Phone: {order.buyer.phone}<br />
                Email: {order.buyer.email}
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}