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
import { useCart, useUpdateCartItem, useRemoveFromCart, useClearCart, useValidateStock } from '@/hooks/user/useCartQueries';
import { globalToast } from '@/utils/globalToast';

export default function CartPage() {
  const { loaded, isAuthenticated } = useRequireUserAuth();
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [stockValidation, setStockValidation] = useState<{
    valid: boolean;
    outOfStockItems: Array<{ productId: string; productName: string; requestedQuantity: number; availableQuantity: number }>;
    message: string;
  } | undefined>(undefined);
  const [isValidatingStock, setIsValidatingStock] = useState(false);

  // React Query hooks
  const { data: cartData, isLoading } = useCart();
  const updateCartItem = useUpdateCartItem();
  const removeFromCart = useRemoveFromCart();
  const clearCartMutation = useClearCart();
  const validateStockMutation = useValidateStock();

  // Process cart data
  const cartItems = React.useMemo(() => {
    if (!cartData?.data?.items) return [];
    
    // Flatten product data from nested structure
    return cartData.data.items.map((item: any) => ({
      ...item,
      ...(item.product || {}),
      _id: item._id,
      cartQuantity: item.quantity, // Preserve cart item quantity
      stock: item.product?.quantity || 0 // Product's available stock
    }));
  }, [cartData]);

  // Validate stock and show out-of-stock indicators
  const validateStock = async () => {
    try {
      setIsValidatingStock(true);
      const result = await validateStockMutation.mutateAsync();
      
      if (result.success && result.data) {
        setStockValidation(result.data);
        
        // Show warning if items are out of stock
        if (!result.data.valid && result.data.outOfStockItems.length > 0) {
          const outOfStockMessage = result.data.outOfStockItems
            .map(item => `${item.productName} (Requested: ${item.requestedQuantity}, Available: ${item.availableQuantity})`)
            .join(', ');
          
          globalToast.general.warning(
            'Stock Warning',
            `${result.data.message}. ${outOfStockMessage}`
          );
        }
      } else {
        setStockValidation(undefined);
      }
    } catch (error) {
      console.error('Stock validation error:', error);
      setStockValidation(undefined);
    } finally {
      setIsValidatingStock(false);
    }
  };

  // Auto-validate stock when cart loads
  useEffect(() => {
    if (cartData?.data?.items && cartData.data.items.length > 0) {
      validateStock();
    }
  }, [cartData]);

  // Show loader while checking authentication
  if (!loaded) {
    return <Loader size="lg" text="Loading..." fullScreen />;
  }

  if (!isAuthenticated) return null;

  // Show skeleton loader only when first loading with no data
  if (isLoading && !cartData) {
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

    try {
      setUpdatingItemId(id);
      await updateCartItem.mutateAsync({ itemId: id, request: { quantity } });
    } catch (error) {
      console.error('Failed to update quantity:', error);
      globalToast.cart.updateFailed();
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await removeFromCart.mutateAsync(id);
      globalToast.cart.itemRemoved();
      // Re-validate stock after removing item
      await validateStock();
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
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Enhanced Progress Steps */}
          <div className="mb-8">
            {/* Desktop Progress */}
            <div className="hidden sm:block">
              <div className="flex items-center justify-center max-w-2xl mx-auto">
                <div className="flex items-center w-full">
                  <div className="flex flex-col items-center flex-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-pink-600 text-white flex items-center justify-center font-bold mb-2 shadow-lg">1</div>
                    <span className="text-sm font-semibold text-pink-600">Cart</span>
                  </div>
                  <div className="flex-1 h-1 bg-gradient-to-r from-pink-500 to-pink-300 mx-2"></div>
                  <div className="flex flex-col items-center flex-1">
                    <div className="w-12 h-12 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-semibold mb-2">2</div>
                    <span className="text-sm font-medium text-gray-500">Checkout</span>
                  </div>
                  <div className="flex-1 h-1 bg-gray-200 mx-2"></div>
                  <div className="flex flex-col items-center flex-1">
                    <div className="w-12 h-12 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-semibold mb-2">3</div>
                    <span className="text-sm font-medium text-gray-500">Payment</span>
                  </div>
                  <div className="flex-1 h-1 bg-gray-200 mx-2"></div>
                  <div className="flex flex-col items-center flex-1">
                    <div className="w-12 h-12 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-semibold mb-2">4</div>
                    <span className="text-sm font-medium text-gray-500">Complete</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Mobile Progress */}
            <div className="sm:hidden">
              <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-600">Step 1 of 4</span>
                  <span className="text-sm font-bold text-pink-600">Cart</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-pink-500 to-pink-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>Cart</span>
                  <span>Checkout</span>
                  <span>Payment</span>
                  <span>Complete</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
            <p className="text-gray-600 text-lg">{cartItems.length > 0 ? `You have ${cartItems.length} item${cartItems.length > 1 ? 's' : ''} in your cart` : 'Review your items before checkout'}</p>
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl shadow-xl border border-gray-100">
              <div className="mb-8">
                <div className="w-40 h-40 mx-auto bg-gradient-to-br from-pink-50 to-rose-50 rounded-full flex items-center justify-center">
                  <svg className="w-20 h-20 text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-3">Your cart is empty</h2>
              <p className="text-gray-500 text-lg mb-6">Looks like you haven't added any items yet</p>
              <p className="text-gray-400 text-sm mb-10">Start shopping to add items to your cart</p>
              <Link href="/products">
                <Button size="lg" className="shadow-xl shadow-pink-500/30 hover:shadow-pink-500/40 transition-all">
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Start Shopping
                  </span>
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      Cart Items ({cartItems.length})
                    </h2>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to clear your cart?')) {
                          clearCartMutation.mutateAsync();
                        }
                      }}
                      className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-2 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Clear Cart
                    </button>
                  </div>
                  <div className="space-y-4">
                    {cartItems.map(item => (
                      <CartItem
                        key={item._id}
                        item={item}
                        onUpdateQuantity={handleUpdateQuantity}
                        onRemove={handleRemove}
                        isUpdating={updatingItemId === item._id}
                        stockValidation={stockValidation}
                      />
                    ))}
                  </div>
                </div>

                {/* Continue Shopping */}
                <div className="bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50 rounded-3xl p-6 border border-pink-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-gray-800 mb-1 text-lg">Continue Shopping</h3>
                      <p className="text-sm text-gray-600">Add more items to your cart</p>
                    </div>
                    <Link href="/products">
                      <Button variant="outline" className="shadow-sm hover:bg-white transition-colors w-full sm:w-auto">
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                          Browse Products
                        </span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1 order-first lg:order-last">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sticky top-4">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    Order Summary
                  </h2>

                  {/* Items Summary */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl mb-6 max-h-48 overflow-y-auto">
                    <div className="space-y-3">
                      {cartItems.map(item => (
                        <div key={item._id} className="flex justify-between items-start pb-3 border-b border-gray-200 last:border-0 last:pb-0">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                            <p className="text-xs text-gray-500 mt-1">Qty: {item.cartQuantity || item.quantity}</p>
                          </div>
                          <span className="text-sm font-bold text-gray-900">
                            ₹{((item.price || 0) * (item.cartQuantity || item.quantity || 0)).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900 font-bold">₹{total.toFixed(2)}</span>
                    </div>
                    {/* <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="text-gray-900 font-semibold">
                        ₹{shipping.toFixed(2)}
                        {shipping === 0 && <span className="text-green-600 ml-2 font-medium">(Free)</span>}
                      </span>
                    </div> */}
                    <div className="border-t-2 border-gray-200 pt-4 flex justify-between items-center">
                      <span className="font-bold text-gray-800 text-xl">Total</span>
                      <span className="text-4xl font-bold text-pink-600">₹{grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {stockValidation !== undefined && !stockValidation.valid ? (
                      <Button 
                        disabled={true}
                        className="w-full bg-gray-400 cursor-not-allowed" 
                        size="lg"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          Items Out of Stock - Update Cart
                        </span>
                      </Button>
                    ) : (
                      <Link href="/checkout">
                        <Button className="w-full shadow-xl shadow-pink-500/30 hover:shadow-pink-500/40 transition-all" size="lg">
                          <span className="flex items-center justify-center gap-2">
                            Proceed to Checkout
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </span>
                        </Button>
                      </Link>
                    )}
                    
                    {/* Stock validation status */}
                    {stockValidation !== undefined && !stockValidation.valid && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-red-800">{stockValidation.message}</p>
                            <p className="text-xs text-red-600 mt-1">Please update quantities or remove out-of-stock items to proceed.</p>
                          </div>
                        </div>
                      </div>
                    )}
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