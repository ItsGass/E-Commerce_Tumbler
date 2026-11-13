'use client';

import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { useCartStore } from '@/stores/useCartStore';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isOpen } = useCartStore();

  return (
    <div className="flex min-h-screen flex-col bg-page text-ink">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <CartDrawer isOpen={isOpen} />
    </div>
  );
}