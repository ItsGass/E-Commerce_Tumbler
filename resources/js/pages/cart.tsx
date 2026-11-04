'use client';

import { Link } from '@inertiajs/react';
import { useCartStore } from '@/stores/useCartStore';
import { useValidateCart, type CartItem } from '@/hooks/useCart';
import { useUserCheckout, useGuestCheckout } from '@/hooks/useCheckout';
import { useAuthStore } from '@/stores/useAuthStore';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { cn, formatPrice } from '@/lib/utils';
import { useState } from 'react';

export default function Cart() {
  const { items, clearCart, getSubtotal, getItemCount, closeDrawer, toggleDrawer } = useCartStore();
  const { user } = useAuthStore();
  const { mutate: validateCart, isPending: isValidating } = useValidateCart();
  const { mutate: guestCheckout, isPending: isGuestCheckout } = useGuestCheckout();
  const { mutate: userCheckout, isPending: isUserCheckout } = useUserCheckout();

  const [showCheckout, setShowCheckout] = useState(false);
  const [buyerData, setBuyerData] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    province: '',
    postal_code: '',
  });

  const subtotal = getSubtotal();
  const shipping = subtotal >= 500000 ? 0 : 15000;
  const total = subtotal + shipping;

  const handleCheckout = async () => {
    if (items.length === 0) return;

    // Validate cart first
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

      if (user) {
        // User checkout
        userCheckout(validated.items);
      } else {
        // Guest checkout - show form
        setShowCheckout(true);
      }
    } catch (error) {
      console.error('Cart validation failed:', error);
    }
  };

  const handleGuestCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    const cartItems: CartItem[] = items.map(item => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
    }));
    guestCheckout({ items: cartItems, buyer: buyerData });
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
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Looks like you haven't added any tumblers yet.
          </p>
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Shopping Cart ({getItemCount()})
          </h1>
        </div>

        {showCheckout && !user && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Guest Checkout
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Please fill in your details to complete the order.
                </p>
                <form onSubmit={handleGuestCheckout} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={buyerData.name}
                      onChange={(e) => setBuyerData({...buyerData, name: e.target.value})}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
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
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
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
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={buyerData.street}
                      onChange={(e) => setBuyerData({...buyerData, street: e.target.value})}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        value={buyerData.city}
                        onChange={(e) => setBuyerData({...buyerData, city: e.target.value})}
                        required
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
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
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
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
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCheckout(false)}
                      className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isGuestCheckout}
                      className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
                    >
                      {isGuestCheckout ? 'Processing...' : `Place Order - ${formatPrice(total)}`}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <div 
                key={`${item.productId}-${item.variantId || 'main'}`}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex gap-4"
              >
                <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
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
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      {item.variantColorHex && (
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.variantColorHex }} />
                      )}
                      {item.variantName}
                    </p>
                  )}
                  <p className="text-lg font-semibold text-primary-600 dark:text-primary-400 mt-1">
                    {formatPrice(item.price)}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded-lg">
                    <button
                      onClick={() => useCartStore.getState().updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="px-3 py-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => useCartStore.getState().updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                      className="px-3 py-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                  <button
                    onClick={() => useCartStore.getState().removeItem(item.productId, item.variantId)}
                    className="text-gray-400 hover:text-red-500 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
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
                    ✓ Free shipping applied (orders over Rp500.000)
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
                onClick={handleCheckout}
                disabled={items.length === 0 || isValidating || isGuestCheckout || isUserCheckout}
                className={cn(
                  'w-full py-3 px-4 rounded-lg font-semibold text-lg transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                  'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-500/25',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {isValidating ? 'Validating...' : isGuestCheckout || isUserCheckout ? 'Processing...' : 'Proceed to Checkout'}
              </button>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                Secure checkout powered by Tumbler Shop
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}