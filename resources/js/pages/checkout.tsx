'use client';

import { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
import { useCartStore } from '@/stores/useCartStore';
import { useValidateCart, type CartItem } from '@/hooks/useCart';
import { useUserCheckout, useGuestCheckout } from '@/hooks/useCheckout';
import { useAuthStore } from '@/stores/useAuthStore';
import { cn, formatPrice } from '@/lib/utils';

interface BuyerFormData {
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postal_code: string;
}

export default function Checkout() {
  const { items, clearCart, getSubtotal } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const { mutate: validateCart, isPending: isValidating } = useValidateCart();
  const { mutate: guestCheckout, isPending: isGuestCheckout } = useGuestCheckout();
  const { mutate: userCheckout, isPending: isUserCheckout } = useUserCheckout();

  const [buyerData, setBuyerData] = useState<BuyerFormData>({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    province: '',
    postal_code: '',
  });
  const [errors, setErrors] = useState<Partial<BuyerFormData>>({});
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [orderCode, setOrderCode] = useState<string | null>(null);

  const subtotal = getSubtotal();
  const shipping = subtotal >= 500000 ? 0 : 15000;
  const total = subtotal + shipping;

  // Prefill user data if logged in
  useEffect(() => {
    if (user && user.profile_complete) {
      setBuyerData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        street: user.street || '',
        city: user.city || '',
        province: user.province || '',
        postal_code: user.postal_code || '',
      });
    }
  }, [user]);

  const handleProceedToCheckout = async () => {
    if (items.length === 0) return;

    const cartItems: CartItem[] = items.map(item => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
    }));

    try {
      const validated = await new Promise<any>((resolve, reject) => {
        validateCart(cartItems, {
          onSuccess: resolve,
          onError: reject,
        });
      });

      if (isAuthenticated && user?.profile_complete) {
        setStep('checkout');
      } else if (!isAuthenticated) {
        setStep('checkout');
      } else {
        // User not profile complete - redirect to profile
        window.location.href = '/profile';
      }
    } catch (error) {
      console.error('Cart validation failed:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Partial<BuyerFormData> = {};
    Object.entries(buyerData).forEach(([key, value]) => {
      if (!value.trim()) {
        newErrors[key as keyof BuyerFormData] = 'This field is required';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const cartItems: CartItem[] = items.map(item => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
    }));

    if (isAuthenticated) {
      userCheckout(cartItems, {
        onSuccess: (data) => {
          setOrderCode(data.data.code);
          setStep('success');
        },
      });
    } else {
      guestCheckout({ items: cartItems, buyer: buyerData }, {
        onSuccess: (data) => {
          setOrderCode(data.data.code);
          setStep('success');
        },
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <svg className="w-24 h-24 mx-auto text-gray-300 dark:text-gray-600 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Your cart is empty
          </h1>
          <Link 
            href="/products"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // Success step
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Order Confirmed!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Thank you for your purchase. Your order has been placed successfully.
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6 text-left">
              <p className="font-medium text-gray-900 dark:text-gray-100">
                Order Code: <span className="text-primary-600 dark:text-primary-400 font-mono">{orderCode}</span>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Save this code to track your order.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Link
                href={`/track/${orderCode}`}
                className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Track Order
              </Link>
              <Link
                href="/products"
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Cart step - show cart summary with proceed button
  if (step === 'cart') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">
              Checkout
            </h1>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div 
                  key={`${item.productId}-${item.variantId || 'main'}`}
                  className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex gap-4"
                >
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {item.name}
                    </h3>
                    {item.variantName && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.variantName}
                      </p>
                    )}
                    <p className="text-lg font-semibold text-primary-600 dark:text-primary-400 mt-1">
                      {formatPrice(item.price)} × {item.quantity}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                  </div>
                  {subtotal >= 500000 && (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      ✓ Free shipping (orders over Rp500.000)
                    </p>
                  )}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-gray-100">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleProceedToCheckout}
                  disabled={isValidating}
                  className={cn(
                    'w-full py-3 px-4 rounded-lg font-semibold text-lg transition-all',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                    'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-500/25',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {isValidating ? 'Validating...' : 'Proceed to Checkout'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Checkout form step
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">
            Checkout
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Buyer Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                  Contact Information
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={buyerData.name}
                        onChange={(e) => setBuyerData({...buyerData, name: e.target.value})}
                        required
                        className={cn(
                          'w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500',
                          errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        )}
                      />
                      {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={buyerData.email}
                        onChange={(e) => setBuyerData({...buyerData, email: e.target.value})}
                        required
                        className={cn(
                          'w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500',
                          errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        )}
                      />
                      {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={buyerData.phone}
                      onChange={(e) => setBuyerData({...buyerData, phone: e.target.value})}
                      required
                      className={cn(
                        'w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500',
                        errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      )}
                    />
                    {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={buyerData.street}
                      onChange={(e) => setBuyerData({...buyerData, street: e.target.value})}
                      required
                      className={cn(
                        'w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500',
                        errors.street ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      )}
                    />
                    {errors.street && <p className="mt-1 text-sm text-red-500">{errors.street}</p>}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        value={buyerData.city}
                        onChange={(e) => setBuyerData({...buyerData, city: e.target.value})}
                        required
                        className={cn(
                          'w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500',
                          errors.city ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        )}
                      />
                      {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Province *
                      </label>
                      <input
                        type="text"
                        value={buyerData.province}
                        onChange={(e) => setBuyerData({...buyerData, province: e.target.value})}
                        required
                        className={cn(
                          'w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500',
                          errors.province ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        )}
                      />
                      {errors.province && <p className="mt-1 text-sm text-red-500">{errors.province}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        value={buyerData.postal_code}
                        onChange={(e) => setBuyerData({...buyerData, postal_code: e.target.value})}
                        required
                        className={cn(
                          'w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500',
                          errors.postal_code ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        )}
                      />
                      {errors.postal_code && <p className="mt-1 text-sm text-red-500">{errors.postal_code}</p>}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isGuestCheckout || isUserCheckout}
                className={cn(
                  'w-full py-3 px-6 rounded-lg font-semibold text-lg transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                  'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-500/25',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {isGuestCheckout || isUserCheckout ? 'Processing...' : `Place Order - ${formatPrice(total)}`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Order Summary
              </h2>

              <div className="space-y-2 mb-4 max-h-60 overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.variantId || 'main'}`} className="flex gap-3">
                    <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {item.name}
                      </p>
                      {item.variantName && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {item.variantName}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Qty: {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-gray-100 border-t border-gray-200 dark:border-gray-700 pt-3">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}