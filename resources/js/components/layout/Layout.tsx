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
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <CartDrawer isOpen={isOpen} />
    </div>
  );
}