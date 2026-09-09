'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product, ProductImage } from '@/utils/types';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Rating from '@/components/ui/Rating';
import { useRequireUserAuth } from '@/auth/user';
import { useAddToCart, useUpdateCartItem, useCart } from '@/hooks/user/useCartQueries';
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
  const [isInCart, setIsInCart] = useState(false);
  const [cartItemId, setCartItemId] = useState<string | null>(null);
  const [cartQuantity, setCartQuantity] = useState(0);
  
  // React Query hooks for cart operations
  const { data: cartData } = useCart({ enabled: isAuthenticated && loaded });
  const addToCartMutation = useAddToCart();
  const updateCartItemMutation = useUpdateCartItem();

  // Check if product is in cart using React Query data
  useEffect(() => {
    if (product && cartData?.data?.items) {
      const cartItem = cartData.data.items.find(item => {
        // Handle both nested and flattened structure
        const productId = item.product?._id ?? item._id;
        return productId === product._id;
      });
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
  }, [product, cartData]);

  const handleAddToCart = async (product: Product) => {
    try {
      if (isInCart && cartItemId) {
        // Update existing cart item using React Query mutation
        await updateCartItemMutation.mutateAsync({
          itemId: cartItemId,
          request: { quantity: cartQuantity + 1 }
        });
        globalToast.cart.quantityUpdated();
      } else {
        // Add new item to cart using React Query mutation
        await addToCartMutation.mutateAsync({
          productId: product._id,
          quantity: 1
        });
        globalToast.cart.addSuccess();
      }
      
      onAddToCart?.(product);
    } catch (error) {
      console.error('Failed to add/update cart:', error);
      globalToast.cart.addFailed();
    }
  };

  // Show loader while checking authentication
  if (!loaded) {
    return (
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="aspect-[4/5] bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse"></div>
        <div className="p-5 space-y-3">
          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
          <div className="flex gap-2">
            <div className="h-8 bg-gray-200 rounded animate-pulse flex-1"></div>
            <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded-xl animate-pulse"></div>
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

  // Check stock using quantity field
  const stock = product?.quantity ?? 0;
  const isOutOfStock = stock <= 0;

  // Get the main image URL from the images array
  const mainImage = product.images?.find((img: ProductImage) => img.isMain)?.url || product.images?.[0]?.url || '';

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-pink-200">
      <Link href={`/product/${product._id}`}>
        <div className="relative aspect-[4/5] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden cursor-pointer">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Image Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {isOutOfStock && (
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
                OUT OF STOCK
              </div>
            )}
            {discountPercent > 0 && !isOutOfStock && (
              <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
                -{discountPercent}% OFF
              </div>
            )}
            {stock <= 5 && stock > 0 && (
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
                Only {stock} left
              </div>
            )}
          </div>

          {/* Quick Actions Overlay */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0 z-10">
            <button
              onClick={(e) => {
                e.preventDefault();
                onAddToWishlist?.(product);
              }}
              className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-pink-500 hover:text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110"
              disabled={!isLoggedIn}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                // Quick view functionality could be added here
              }}
              className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-gray-800 hover:text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        </div>
      </Link>

      <div className="p-5">
        {/* Category */}
        {product.category && (
          <p className="text-xs font-semibold text-pink-500 uppercase tracking-wider mb-2">
            {product.category.name}
          </p>
        )}

        {/* Product Name */}
        <Link href={`/product/${product._id}`}>
          <h3 className="text-base font-semibold text-gray-900 hover:text-pink-600 transition-colors duration-200 line-clamp-2 min-h-[48px] leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-2 mt-3">
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
          <span className="text-xs text-gray-500">({product.reviews || 12} reviews)</span>
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
          disabled={isOutOfStock || !isLoggedIn || addToCartMutation.isPending || updateCartItemMutation.isPending}
          className={`w-full mt-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${isOutOfStock || !isLoggedIn
            ? isOutOfStock 
              ? 'bg-red-50 text-red-400 cursor-not-allowed border-2 border-red-200'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-200'
            : isInCart
              ? 'bg-green-500 text-white hover:bg-green-600 hover:shadow-lg hover:shadow-green-500/30 transform hover:-translate-y-0.5'
              : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 hover:shadow-lg hover:shadow-pink-500/30 transform hover:-translate-y-0.5'
            }`}
        >
          {addToCartMutation.isPending || updateCartItemMutation.isPending 
            ? 'Adding...' 
            : !isLoggedIn 
              ? 'Login to Add' 
              : isOutOfStock 
                ? 'Out of Stock' 
                : isInCart 
                  ? `In Cart (${cartQuantity})` 
                  : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}