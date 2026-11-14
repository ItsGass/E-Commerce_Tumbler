'use client';

import { Link } from '@inertiajs/react';
import { useCartStore } from '@/stores/useCartStore';
import { useValidateCart, type CartItem } from '@/hooks/useCart';
import { useUserCheckout, useGuestCheckout } from '@/hooks/useCheckout';
import { useAuthStore } from '@/stores/useAuthStore';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { ProductImage } from '@/components/product';
import { cn, formatPrice } from '@/lib/utils';
import { useState } from 'react';

export default function Cart() {
  const { items, clearCart, closeDrawer, toggleDrawer } = useCartStore();
  const { user } = useAuthStore();
  const { mutate: validateCart, isPending: isValidating } = useValidateCart();
  const { mutate: guestCheckout, isPending: isGuestCheckout } = useGuestCheckout();
  const { mutate: userCheckout, isPending: isUserCheckout } = useUserCheckout();

  const [showCheckout, setShowCheckout] = useState(false);
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [buyerData, setBuyerData] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    province: '',
    postal_code: '',
  });

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 500000 ? 0 : 15000;
  const total = subtotal + shipping;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

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
        userCheckout(validated.items, {
          onSuccess: (data) => setOrderCode(data.data.code),
        });
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
    guestCheckout({ items: cartItems, buyer: buyerData }, {
      onSuccess: (data) => setOrderCode(data.data.code),
    });
  };

  // A placed order empties the cart, so the empty-cart screen must not
  // shadow the confirmation that follows it.
  if (orderCode) {
    return (
      <div className="min-h-screen bg-page py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-surface rounded-2xl shadow-soft border border-hairline p-8">
            <div className="w-16 h-16 bg-success-tint rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-ink mb-2">
              Order Confirmed!
            </h1>
            <p className="text-muted mb-6">
              Thank you for your purchase. Your order has been placed successfully.
            </p>
            <div className="bg-panel rounded-xl p-4 mb-6 text-left">
              <p className="font-medium text-ink">
                Order Code: <span className="text-accent font-mono">{orderCode}</span>
              </p>
              <p className="text-sm text-muted mt-1">
                Save this code to track your order.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Link
                href={`/track/${orderCode}`}
                className="flex-1 px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent-hover transition-colors"
              >
                Track Order
              </Link>
              <Link
                href="/products"
                className="flex-1 px-6 py-3 border border-hairline text-ink rounded-lg font-medium hover:bg-panel transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <svg className="w-24 h-24 mx-auto text-muted mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h1 className="text-2xl font-bold text-ink mb-2">
            Your cart is empty
          </h1>
          <p className="text-muted mb-6">
            Looks like you haven't added any tumblers yet.
          </p>
          <Link 
            href="/products"
            className="inline-flex items-center px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent-hover transition-colors"
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
    <div className="min-h-screen bg-page py-8">
      <div className="container-page">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-ink">
            Shopping Cart ({itemCount})
          </h1>
        </div>

        {showCheckout && !user && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay">
            <div className="bg-surface rounded-xl shadow-soft max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-ink mb-4">
                  Guest Checkout
                </h2>
                <p className="text-muted mb-6">
                  Please fill in your details to complete the order.
                </p>
                <form onSubmit={handleGuestCheckout} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={buyerData.name}
                      onChange={(e) => setBuyerData({...buyerData, name: e.target.value})}
                      required
                      className="w-full px-4 py-2 border border-hairline rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={buyerData.email}
                      onChange={(e) => setBuyerData({...buyerData, email: e.target.value})}
                      required
                      className="w-full px-4 py-2 border border-hairline rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={buyerData.phone}
                      onChange={(e) => setBuyerData({...buyerData, phone: e.target.value})}
                      required
                      className="w-full px-4 py-2 border border-hairline rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={buyerData.street}
                      onChange={(e) => setBuyerData({...buyerData, street: e.target.value})}
                      required
                      className="w-full px-4 py-2 border border-hairline rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-ink mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        value={buyerData.city}
                        onChange={(e) => setBuyerData({...buyerData, city: e.target.value})}
                        required
                        className="w-full px-4 py-2 border border-hairline rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink mb-1">
                        Province *
                      </label>
                      <input
                        type="text"
                        value={buyerData.province}
                        onChange={(e) => setBuyerData({...buyerData, province: e.target.value})}
                        required
                        className="w-full px-4 py-2 border border-hairline rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      value={buyerData.postal_code}
                      onChange={(e) => setBuyerData({...buyerData, postal_code: e.target.value})}
                      required
                      className="w-full px-4 py-2 border border-hairline rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCheckout(false)}
                      className="flex-1 px-4 py-3 border border-hairline rounded-lg text-ink hover:bg-panel font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isGuestCheckout}
                      className="flex-1 px-4 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent-hover disabled:opacity-50"
                    >
                      {isGuestCheckout ? 'Processing...' : `Place Order - ${formatPrice(total)}`}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="min-w-0 space-y-4 lg:col-span-2">
            {items.map((item, index) => (
              <div 
                key={`${item.productId}-${item.variantId || 'main'}`}
                className="flex min-w-0 flex-col gap-3 rounded-xl border border-hairline bg-surface p-4 shadow-card sm:flex-row sm:gap-4"
              >
                <div className="flex min-w-0 flex-1 gap-4">
                  <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-panel">
                    <ProductImage src={item.image} alt={item.name} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-ink line-clamp-2">
                      {item.name}
                    </h3>
                    {item.variantName && (
                      <p className="text-sm text-muted flex items-center gap-1">
                        {item.variantColorHex && (
                          <span className="w-3 h-3 shrink-0 rounded-full" style={{ backgroundColor: item.variantColorHex }} />
                        )}
                        <span className="truncate">{item.variantName}</span>
                      </p>
                    )}
                    <p className="text-lg font-semibold text-accent mt-1">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end sm:gap-2">
                  <div className="flex items-center border border-hairline rounded-lg">
                    <button
                      onClick={() => useCartStore.getState().updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="px-2.5 py-1 text-muted hover:text-ink disabled:opacity-50"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => useCartStore.getState().updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                      className="px-2.5 py-1 text-muted hover:text-ink"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                  <p className="font-semibold text-ink">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                  <button
                    onClick={() => useCartStore.getState().removeItem(item.productId, item.variantId)}
                    className="text-muted hover:text-danger text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="min-w-0 lg:col-span-1">
            <div className="bg-surface rounded-xl shadow-card border border-hairline p-6 sticky top-24">
              <h2 className="text-xl font-bold text-ink mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                </div>
                {subtotal >= 500000 && (
                  <p className="text-sm text-success">
                    ✓ Free shipping applied (orders over Rp500.000)
                  </p>
                )}
                <div className="border-t border-hairline pt-3">
                  <div className="flex justify-between text-lg font-bold text-ink">
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
                  'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
                  'bg-accent text-accent-foreground hover:bg-accent-hover hover:shadow-soft',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {isValidating ? 'Validating...' : isGuestCheckout || isUserCheckout ? 'Processing...' : 'Proceed to Checkout'}
              </button>

              <p className="text-center text-sm text-muted mt-4">
                Secure checkout powered by Tumbler Shop
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}