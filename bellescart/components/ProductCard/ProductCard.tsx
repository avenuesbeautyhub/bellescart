'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product, ProductImage } from '@/utils/types';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Rating from '@/components/ui/Rating';
import { useRequireUserAuth } from '@/auth/user';
import { cartService } from '@/services/cartService';
import { globalToast } from '@/utils/globalToast';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
  isLoggedIn?: boolean;
}

export default function ProductCard({
  product,
  onAddToCart,
  onAddToWishlist,
  isLoggedIn,
}: ProductCardProps) {
  const { user, loaded, isAuthenticated } = useRequireUserAuth();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isInCart, setIsInCart] = useState(false);
  const [cartItemId, setCartItemId] = useState<string | null>(null);
  const [cartQuantity, setCartQuantity] = useState(0);

  // Load cart when component mounts
  useEffect(() => {
    if (loaded && isAuthenticated) {
      loadCart();
    }
  }, [loaded, isAuthenticated]);

  // Check if product is in cart
  useEffect(() => {
    if (product && cartItems.length > 0) {
      const cartItem = cartItems.find(item => item.product?._id === product._id);
      if (cartItem) {
        setIsInCart(true);
        setCartItemId(cartItem._id);
        setCartQuantity(cartItem.quantity);
      } else {
        setIsInCart(false);
        setCartItemId(null);
        setCartQuantity(0);
      }
    }
  }, [product, cartItems]);

  const loadCart = async () => {
    try {
      const response = await cartService.getCart();
      if (response.success && response.data?.items) {
        setCartItems(response.data.items);
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  };

  const handleAddToCart = async (product: Product) => {
    try {
      let response;
      if (isInCart && cartItemId) {
        // Update existing cart item
        response = await cartService.updateCartItem(cartItemId, {
          quantity: cartQuantity + 1
        });
        if (response.success) {
          globalToast.cart.quantityUpdated();
        } else {
          globalToast.cart.updateFailed();
        }
      } else {
        // Add new item to cart
        response = await cartService.addToCart({
          productId: product._id,
          quantity: 1
        });
        if (response.success) {
          globalToast.cart.addSuccess();
        } else {
          globalToast.cart.addFailed();
        }
      }
      
      if (response.success) {
        onAddToCart?.(product);
        await loadCart(); // Reload cart to update state
      }
    } catch (error) {
      console.error('Failed to add/update cart:', error);
      globalToast.cart.addFailed();
    }
  };

  // Show loader while checking authentication
  if (!loaded) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="aspect-square bg-gray-200 animate-pulse"></div>
        <div className="p-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (should be handled by useRequireUserAuth redirect)
  if (!isAuthenticated) {
    return null;
  }

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Get the main image URL from the images array
  const mainImage = product.images?.find((img: ProductImage) => img.isMain)?.url || product.images?.[0]?.url || '';

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      <Link href={`/product/${product._id}`}>
        <div className="relative aspect-[4/5] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden cursor-pointer">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <span className="text-gray-400 text-sm">No Image</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {discountPercent > 0 && (
              <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                -{discountPercent}% OFF
              </div>
            )}
            {product.quantity <= 5 && product.quantity > 0 && (
              <div className="bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                Only {product.quantity} left
              </div>
            )}
          </div>

          {/* Quick Actions Overlay */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={(e) => {
                e.preventDefault();
                onAddToWishlist?.(product);
              }}
              className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-pink-500 hover:text-white transition-colors duration-200 shadow-lg"
              disabled={!isLoggedIn}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          {/* Out of Stock Overlay */}
          {!product.quantity && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center">
                <span className="text-white font-bold text-lg">Out of Stock</span>
              </div>
            </div>
          )}
        </div>
      </Link>

      <div className="p-5">
        {/* Category */}
        {product.category && (
          <p className="text-xs font-medium text-pink-500 uppercase tracking-wider mb-2">
            {product.category.name}
          </p>
        )}

        {/* Product Name */}
        <Link href={`/product/${product._id}`}>
          <h3 className="text-base font-semibold text-gray-900 hover:text-pink-500 transition-colors duration-200 line-clamp-2 min-h-[48px]">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${i < (product.rating || 4) ? 'text-amber-400' : 'text-gray-200'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">({product.reviews || 12})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-2xl font-bold text-gray-900">₹{product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              ₹{product.originalPrice}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={() => handleAddToCart(product)}
          disabled={!product.quantity || !isLoggedIn}
          className={`w-full mt-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${!product.quantity || !isLoggedIn
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : isInCart
              ? 'bg-green-500 text-white hover:bg-green-600 hover:shadow-lg hover:shadow-green-500/25 transform hover:-translate-y-0.5'
              : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 hover:shadow-lg hover:shadow-pink-500/25 transform hover:-translate-y-0.5'
            }`}
        >
          {!isLoggedIn ? 'Login to Add' : isInCart ? `In Cart (${cartQuantity})` : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}