'use client';

import { useCallback, useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
import { useCartStore } from '@/stores/useCartStore';
import { useValidateCart, type CartItem } from '@/hooks/useCart';
import { useUserCheckout, useGuestCheckout } from '@/hooks/useCheckout';
import { useAuthStore } from '@/stores/useAuthStore';
import { ProductImage } from '@/components/product';
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
  const { items, clearCart } = useCartStore();
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
  const [validationError, setValidationError] = useState<string | null>(null);
  const [hasAutoValidated, setHasAutoValidated] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
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

  const handleProceedToCheckout = useCallback(async () => {
    if (items.length === 0) {
      return;
    }

    setValidationError(null);

    const cartItems: CartItem[] = items.map(item => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
    }));

    try {
      await new Promise<any>((resolve, reject) => {
        validateCart(cartItems, {
          onSuccess: resolve,
          onError: reject,
        });
      });

      if (isAuthenticated && user && !user.profile_complete) {
        // Missing shipping details: collect them before taking payment.
        window.location.href = '/profile';
        return;
      }

      setStep('checkout');
    } catch {
      setValidationError(
        'Some items in your cart are no longer available. Review the items below or update your cart and try again.'
      );
    }
  }, [items, validateCart, isAuthenticated, user]);

  // `/checkout` is already the destination of "Proceed to Checkout", so
  // validate on arrival instead of asking for the same click twice. If the
  // cart cannot be validated we stay on the summary and show why.
  useEffect(() => {
    if (hasAutoValidated || items.length === 0) {
      return;
    }
    setHasAutoValidated(true);
    void handleProceedToCheckout();
  }, [hasAutoValidated, items.length, handleProceedToCheckout]);

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

  // A placed order empties the cart, so the empty-cart screen must not
  // shadow the confirmation that follows it.
  if (items.length === 0 && step !== 'success') {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <svg className="w-24 h-24 mx-auto text-muted mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h1 className="text-2xl font-bold text-ink mb-2">
            Your cart is empty
          </h1>
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

  // Success step
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-page py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-surface rounded-2xl shadow-soft border border-hairline p-8">
            <div className="w-16 h-16 bg-success-tint rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

  // Cart step - show cart summary with proceed button
  if (step === 'cart') {
    return (
      <div className="min-h-screen bg-page py-8">
        <div className="container-page">
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-ink">
              Checkout
            </h1>
          </div>

          {(isValidating || validationError) && (
            <div className="mb-6" aria-live="polite">
              {isValidating ? (
                <div className="flex items-center gap-3 rounded-xl border border-hairline bg-surface px-4 py-3 text-sm text-muted shadow-card">
                  <span
                    className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-primary border-t-transparent"
                    aria-hidden="true"
                  />
                  Checking item availability…
                </div>
              ) : (
                <div
                  role="alert"
                  className="rounded-xl border border-danger/30 bg-danger-tint px-4 py-3 text-sm text-danger"
                >
                  {validationError}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="min-w-0 space-y-4 lg:col-span-2">
              {items.map((item) => (
                <div 
                  key={`${item.productId}-${item.variantId || 'main'}`}
                  className="flex min-w-0 gap-4 rounded-xl border border-hairline bg-surface p-4 shadow-card"
                >
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-panel">
                    <ProductImage src={item.image} alt={item.name} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-ink line-clamp-2">
                      {item.name}
                    </h3>
                    {item.variantName && (
                      <p className="text-sm text-muted">
                        {item.variantName}
                      </p>
                    )}
                    <p className="text-lg font-semibold text-accent mt-1">
                      {formatPrice(item.price)} × {item.quantity}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="font-semibold text-ink">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

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
                      ✓ Free shipping (orders over Rp500.000)
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
                  onClick={handleProceedToCheckout}
                  disabled={isValidating}
                  className={cn(
                    'w-full py-3 px-4 rounded-lg font-semibold text-lg transition-all',
                    'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
                    'bg-accent text-accent-foreground hover:bg-accent-hover hover:shadow-soft',
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
    <div className="min-h-screen bg-page py-8">
      <div className="container-page">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-ink">
            Checkout
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Buyer Form */}
          <div className="min-w-0 space-y-6 lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-surface rounded-xl shadow-card border border-hairline p-6">
                <h2 className="text-xl font-bold text-ink mb-6">
                  Contact Information
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-ink mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={buyerData.name}
                        onChange={(e) => setBuyerData({...buyerData, name: e.target.value})}
                        required
                        className={cn(
                          'w-full px-4 py-2 border rounded-lg bg-panel focus:outline-none focus:ring-2 focus:ring-accent',
                          errors.name ? 'border-danger' : 'border-hairline'
                        )}
                      />
                      {errors.name && <p className="mt-1 text-sm text-danger">{errors.name}</p>}
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
                        className={cn(
                          'w-full px-4 py-2 border rounded-lg bg-panel focus:outline-none focus:ring-2 focus:ring-accent',
                          errors.email ? 'border-danger' : 'border-hairline'
                        )}
                      />
                      {errors.email && <p className="mt-1 text-sm text-danger">{errors.email}</p>}
                    </div>
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
                      className={cn(
                        'w-full px-4 py-2 border rounded-lg bg-panel focus:outline-none focus:ring-2 focus:ring-accent',
                        errors.phone ? 'border-danger' : 'border-hairline'
                      )}
                    />
                    {errors.phone && <p className="mt-1 text-sm text-danger">{errors.phone}</p>}
                  </div>
                </div>
              </div>

              <div className="bg-surface rounded-xl shadow-card border border-hairline p-6">
                <h2 className="text-xl font-bold text-ink mb-6">
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={buyerData.street}
                      onChange={(e) => setBuyerData({...buyerData, street: e.target.value})}
                      required
                      className={cn(
                        'w-full px-4 py-2 border rounded-lg bg-panel focus:outline-none focus:ring-2 focus:ring-accent',
                        errors.street ? 'border-danger' : 'border-hairline'
                      )}
                    />
                    {errors.street && <p className="mt-1 text-sm text-danger">{errors.street}</p>}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-ink mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        value={buyerData.city}
                        onChange={(e) => setBuyerData({...buyerData, city: e.target.value})}
                        required
                        className={cn(
                          'w-full px-4 py-2 border rounded-lg bg-panel focus:outline-none focus:ring-2 focus:ring-accent',
                          errors.city ? 'border-danger' : 'border-hairline'
                        )}
                      />
                      {errors.city && <p className="mt-1 text-sm text-danger">{errors.city}</p>}
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
                        className={cn(
                          'w-full px-4 py-2 border rounded-lg bg-panel focus:outline-none focus:ring-2 focus:ring-accent',
                          errors.province ? 'border-danger' : 'border-hairline'
                        )}
                      />
                      {errors.province && <p className="mt-1 text-sm text-danger">{errors.province}</p>}
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
                        className={cn(
                          'w-full px-4 py-2 border rounded-lg bg-panel focus:outline-none focus:ring-2 focus:ring-accent',
                          errors.postal_code ? 'border-danger' : 'border-hairline'
                        )}
                      />
                      {errors.postal_code && <p className="mt-1 text-sm text-danger">{errors.postal_code}</p>}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isGuestCheckout || isUserCheckout}
                className={cn(
                  'w-full py-3 px-6 rounded-lg font-semibold text-lg transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
                  'bg-accent text-accent-foreground hover:bg-accent-hover hover:shadow-soft',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {isGuestCheckout || isUserCheckout ? 'Processing...' : `Place Order - ${formatPrice(total)}`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="min-w-0 lg:col-span-1">
            <div className="bg-surface rounded-xl shadow-card border border-hairline p-6 sticky top-24">
              <h2 className="text-xl font-bold text-ink mb-4">
                Order Summary
              </h2>

              <div className="space-y-2 mb-4 max-h-60 overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.variantId || 'main'}`} className="flex gap-3">
                    <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-panel">
                      <ProductImage src={item.image} alt={item.name} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink line-clamp-2">
                        {item.name}
                      </p>
                      {item.variantName && (
                        <p className="text-xs text-muted">
                          {item.variantName}
                        </p>
                      )}
                      <p className="text-sm text-muted">
                        Qty: {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-ink whitespace-nowrap">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-hairline pt-4 space-y-3">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-ink border-t border-hairline pt-3">
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