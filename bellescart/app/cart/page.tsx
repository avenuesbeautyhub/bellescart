'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRequireUserAuth } from '@/auth/user';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import CartItem from '@/components/CartItem/CartItem';
import { CartItem as CartItemType } from '@/utils/types';
import { cartService } from '@/services/cartService';
import { globalToast } from '@/utils/globalToast';
import { useCart } from '@/contexts/CartContext';

export default function CartPage() {
  const { loaded, isAuthenticated } = useRequireUserAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const { refreshCartCount } = useCart();

  // Load cart data when authenticated
  useEffect(() => {
    if (loaded && isAuthenticated) {
      loadCart();
    }
  }, [loaded, isAuthenticated]);

  const loadCart = async () => {
    try {
      setIsLoading(true);
      const response = await cartService.getCart();
      console.log(response);
      if (response.success && response.data?.items) {
        // Flatten product data from nested structure
        // Explicitly handle field names to avoid collision between cart quantity and stock
        const flattenedItems = response.data.items.map((item: any) => ({
          ...item,
          ...(item.product || {}),
          _id: item._id,
          cartQuantity: item.quantity, // Preserve cart item quantity
          stock: item.product?.quantity || 0 // Product's available stock
        }));
        setCartItems(flattenedItems);
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
      globalToast.cart.loadFailed();
    } finally {
      setIsLoading(false);
    }
  };

  // Show loader while checking authentication
  if (!loaded) {
    return <Loader size="lg" text="Loading..." fullScreen />;
  }

  if (!isAuthenticated) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="mb-8">
              <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-64 mb-2"></div>
              <div className="h-5 bg-gray-200 rounded animate-pulse w-96"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-gray-200 rounded-lg animate-pulse"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                        <div className="h-8 bg-gray-200 rounded animate-pulse w-24"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-4">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-40 mb-6"></div>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                    </div>
                    <div className="flex justify-between">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                    </div>
                    <div className="border-t border-gray-100 pt-4 flex justify-between">
                      <div className="h-5 bg-gray-200 rounded animate-pulse w-16"></div>
                      <div className="h-8 bg-gray-200 rounded animate-pulse w-20"></div>
                    </div>
                  </div>
                  <div className="mt-6 space-y-3">
                    <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const handleUpdateQuantity = async (id: string, quantity: number) => {
    if (updatingItemId) return; // Prevent multiple simultaneous updates

    // Optimistic update - update UI immediately
    const previousItems = [...cartItems];
    setCartItems(items =>
      items.map(item => (item._id === id ? { ...item, cartQuantity: quantity } : item))
    );

    try {
      setUpdatingItemId(id);
      const response = await cartService.updateCartItem(id, { quantity });
      if (response.success) {
        refreshCartCount(); // Update navbar cart count
      } else {
        // Revert on failure
        setCartItems(previousItems);
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
      // Revert on error
      setCartItems(previousItems);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      const response = await cartService.removeFromCart(id);
      if (response.success) {
        setCartItems(items => items.filter(item => item._id !== id));
        refreshCartCount(); // Update navbar cart count
        globalToast.cart.itemRemoved();
      } else {
        globalToast.cart.removeFailed();
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
      globalToast.cart.removeFailed();
    }
  };

  const total = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.cartQuantity || item.quantity || 0), 0);
  const shipping = total > 50 ? 0 : 10;
  const grandTotal = total + shipping;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
            <p className="text-gray-600">Review your items before checkout</p>
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="mb-6">
                <svg className="w-32 h-32 mx-auto text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
              <p className="text-gray-500 text-lg mb-8">Looks like you haven't added any items yet</p>
              <Link href="/products">
                <Button size="lg" className="shadow-lg shadow-pink-500/30">Start Shopping</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">Cart Items ({cartItems.length})</h2>
                  </div>
                  <div className="space-y-4">
                    {cartItems.map(item => (
                      <CartItem
                        key={item._id}
                        item={item}
                        onUpdateQuantity={handleUpdateQuantity}
                        onRemove={handleRemove}
                        isUpdating={updatingItemId === item._id}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 sticky top-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Order Summary
                  </h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900 font-semibold">₹{total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Shipping</span>
                      <span className="text-gray-900 font-semibold">
                        ₹{shipping.toFixed(2)}
                        {shipping === 0 && <span className="text-green-600 ml-2 text-sm">(Free)</span>}
                      </span>
                    </div>
                    <div className="border-t-2 border-gray-100 pt-4 flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-3xl font-bold text-pink-600">
                        ₹{grandTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Link href="/checkout">
                      <Button className="w-full shadow-lg shadow-pink-500/30 hover:shadow-pink-500/40 transition-shadow" size="lg">
                        Proceed to Checkout
                      </Button>
                    </Link>
                    <Link href="/products">
                      <Button variant="outline" className="w-full hover:bg-gray-50 transition-colors">
                        Continue Shopping
                      </Button>
                    </Link>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span>Secure checkout</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}