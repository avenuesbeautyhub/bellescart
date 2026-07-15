'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/auth/user';
import { cartService } from '@/services/cartService';

interface CartContextType {
  cartCount: number;
  refreshCartCount: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartCount, setCartCount] = useState(0);
  const { isAuthenticated, loaded } = useAuth();

  const refreshCartCount = async () => {
    if (!isAuthenticated || !loaded) return;
    
    try {
      const response = await cartService.getCart();
      if (response.success && response.data?.items) {
        const count = response.data.items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
        setCartCount(count);
      }
    } catch (error) {
      console.error('Failed to refresh cart count:', error);
    }
  };

  // Load cart count when authentication status changes
  useEffect(() => {
    if (loaded && isAuthenticated) {
      refreshCartCount();
    } else {
      setCartCount(0);
    }
  }, [loaded, isAuthenticated]);

  return (
    <CartContext.Provider value={{ cartCount, refreshCartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
