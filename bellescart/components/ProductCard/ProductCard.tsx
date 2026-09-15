'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product, ProductImage } from '@/utils/types';
import { useRequireUserAuth } from '@/auth/user';
import {
  useAddToCart,
  useUpdateCartItem,
  useCart,
} from '@/hooks/user/useCartQueries';
import { globalToast } from '@/utils/globalToast';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
  isLoggedIn?: boolean;
  wishlistItems?: any[];
  viewMode?: 'grid' | 'list';
}

export default function ProductCard({
  product,
  onAddToCart,
  onAddToWishlist,
  isLoggedIn,
  wishlistItems,
  viewMode = 'grid',
}: ProductCardProps) {
  const { loaded, isAuthenticated } = useRequireUserAuth();

  const [isInCart, setIsInCart] = useState(false);
  const [cartItemId, setCartItemId] = useState<string | null>(null);
  const [cartQuantity, setCartQuantity] = useState(0);

  const { data: cartData } = useCart({
    enabled: isAuthenticated && loaded,
  });

  const addToCartMutation = useAddToCart();
  const updateCartItemMutation = useUpdateCartItem();

  useEffect(() => {
    if (product && cartData?.data?.items) {
      const cartItem = cartData.data.items.find((item) => {
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
        await updateCartItemMutation.mutateAsync({
          itemId: cartItemId,
          request: {
            quantity: cartQuantity + 1,
          },
        });

        globalToast.cart.quantityUpdated();
      } else {
        await addToCartMutation.mutateAsync({
          productId: product._id,
          quantity: 1,
        });

        globalToast.cart.addSuccess();
      }

      onAddToCart?.(product);
    } catch (error) {
      console.error('Failed to add/update cart:', error);
      globalToast.cart.addFailed();
    }
  };

  if (!loaded) {
    return (
      <div className="overflow-hidden rounded-[24px] bg-white">
        <div className="aspect-[0.82] animate-pulse bg-[#f4f2ef]" />

        <div className="space-y-3 px-1 pt-4">
          <div className="h-2.5 w-20 animate-pulse rounded-full bg-gray-100" />
          <div className="h-4 w-full animate-pulse rounded-full bg-gray-100" />
          <div className="h-4 w-2/3 animate-pulse rounded-full bg-gray-100" />

          <div className="flex items-center justify-between pt-1">
            <div className="h-5 w-20 animate-pulse rounded-full bg-gray-100" />
            <div className="h-9 w-9 animate-pulse rounded-full bg-gray-100" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const discountPercent = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) /
          product.originalPrice) *
          100
      )
    : 0;

  const stock = product?.quantity ?? 0;
  const isOutOfStock = stock <= 0;

  const mainImage =
    product.images?.find((img: ProductImage) => img.isMain)?.url ||
    product.images?.[0]?.url ||
    '';

  const isCartMutationPending =
    addToCartMutation.isPending || updateCartItemMutation.isPending;

  const rating = product.rating || 4;
  const reviewCount = product.reviews || 12;

  // Check if product is in wishlist
  const isInWishlist = wishlistItems?.some(
    (item: any) => item._id === product._id || item === product._id
  ) || false;

  return (
    <article className={`group relative min-w-0 ${viewMode === 'list' ? 'flex gap-4 bg-white rounded-2xl border border-gray-100 p-4' : ''}`}>
      {/* =========================================================
          IMAGE
      ========================================================== */}
      <div className={`relative overflow-hidden ${viewMode === 'list' ? 'flex-shrink-0 w-24 h-24 rounded-xl' : 'rounded-[22px]'} bg-[#f6f4f1]`}>
        <Link
          href={`/product/${product._id}`}
          className="block"
          aria-label={`View ${product.name}`}
        >
          <div className={`relative ${viewMode === 'list' ? 'aspect-square' : 'aspect-[0.84]'} overflow-hidden`}>
            {mainImage ? (
              <Image
                src={mainImage}
                alt={product.name}
                fill
                sizes="
                  (max-width: 640px) 50vw,
                  (max-width: 1024px) 33vw,
                  (max-width: 1536px) 25vw,
                  20vw
                "
                className="
                  object-cover
                  transition-transform
                  duration-700
                  ease-[cubic-bezier(.2,.65,.3,1)]
                  group-hover:scale-[1.055]
                "
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-[#f1efec]">
                <div className="text-center">
                  <svg
                    className="mx-auto h-10 w-10 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            )}

            {/* Bottom image fade */}
            <div
              className="
                pointer-events-none
                absolute inset-x-0 bottom-0 h-28
                bg-gradient-to-t from-black/20 to-transparent
                opacity-0
                transition-opacity duration-500
                group-hover:opacity-100
              "
            />
          </div>
        </Link>

        {/* =======================================================
            TOP LEFT BADGE
        ======================================================== */}
        <div className="absolute left-3 top-3 z-10">
          {isOutOfStock ? (
            <span
              className="
                inline-flex items-center
                rounded-full
                bg-white/95
                px-3 py-1.5
                text-[9px]
                font-bold
                uppercase
                tracking-[0.14em]
                text-gray-600
                shadow-sm
                backdrop-blur-md
              "
            >
              Sold out
            </span>
          ) : discountPercent > 0 ? (
            <span
              className="
                inline-flex items-center
                rounded-full
                bg-[#21151d]
                px-3 py-1.5
                text-[9px]
                font-bold
                uppercase
                tracking-[0.13em]
                text-white
                shadow-sm
              "
            >
              −{discountPercent}%
            </span>
          ) : null}
        </div>

        {/* =======================================================
            WISHLIST
        ======================================================== */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddToWishlist?.(product);
          }}
          disabled={!isLoggedIn}
          aria-label={isInWishlist ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          className={`
            absolute right-3 top-3 z-20
            flex h-9 w-9 items-center justify-center
            rounded-full
            border border-white/80
            bg-white/90
            shadow-sm
            backdrop-blur-md
            transition-all duration-300
            hover:scale-105
            hover:bg-white
            active:scale-95
            disabled:cursor-not-allowed
            disabled:opacity-50
            sm:h-10 sm:w-10
            ${
              isInWishlist
                ? 'text-[#b45370]'
                : 'text-gray-800 hover:text-[#b45370]'
            }
          `}
        >
          <svg
            className="h-[17px] w-[17px] sm:h-[18px] sm:w-[18px]"
            fill={isInWishlist ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"
            />
          </svg>
        </button>

        {/* =======================================================
            STOCK INDICATOR
        ======================================================== */}
        {!isOutOfStock && stock <= 5 && stock > 0 && (
          <div className="absolute bottom-3 left-3 z-10">
            <span
              className="
                inline-flex items-center
                rounded-full
                bg-white/92
                px-2.5 py-1
                text-[9px]
                font-semibold
                tracking-wide
                text-gray-700
                shadow-sm
                backdrop-blur-md
              "
            >
              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-orange-500" />
              {stock} left
            </span>
          </div>
        )}

        {/* =======================================================
            DESKTOP QUICK VIEW
        ======================================================== */}
        <Link
          href={`/product/${product._id}`}
          className="
            absolute bottom-3 left-1/2 z-10
            hidden
            w-[calc(100%-24px)]
            -translate-x-1/2
            translate-y-3
            items-center justify-center
            rounded-xl
            bg-white/95
            px-4 py-2.5
            text-[11px]
            font-semibold
            tracking-wide
            text-gray-900
            opacity-0
            shadow-lg
            backdrop-blur-md
            transition-all duration-300
            group-hover:translate-y-0
            group-hover:opacity-100
            sm:flex
          "
        >
          View details

          <svg
            className="ml-2 h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.6}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>

      {/* =========================================================
          PRODUCT INFORMATION
      ========================================================== */}
      <div className={`${viewMode === 'list' ? 'flex-1 flex flex-col justify-center min-w-0' : 'px-0.5 pt-4'}`}>
        {/* Category */}
        {product.category && (
          <Link
            href={`/product/${product._id}`}
            className="
              block w-fit
              text-[9px]
              font-bold
              uppercase
              tracking-[0.18em]
              text-[#a45b70]
              transition-colors
              hover:text-[#8d4058]
              sm:text-[10px]
            "
          >
            {product.category.name}
          </Link>
        )}

        {/* Product name */}
        <Link
          href={`/product/${product._id}`}
          className="mt-1.5 block"
        >
          <h3
            className="
              line-clamp-2
              min-h-[40px]
              text-[13px]
              font-medium
              leading-[1.5]
              tracking-[-0.01em]
              text-gray-900
              transition-colors
              group-hover:text-[#a45b70]
              sm:text-[14px]
            "
          >
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="mt-2 flex items-center gap-2">
          <div className="flex items-center gap-[1px]">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`h-3 w-3 ${
                  i < rating ? 'text-[#c69a52]' : 'text-gray-200'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>

          <span className="text-[10px] text-gray-400">
            {reviewCount}
          </span>
        </div>

        {/* =======================================================
            PRICE + CART
        ======================================================== */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-1.5">
              <span
                className="
                  text-[15px]
                  font-semibold
                  tracking-[-0.02em]
                  text-gray-950
                  sm:text-[17px]
                "
              >
                ₹{product.price}
              </span>

              {product.originalPrice && (
                <span className="text-[10px] text-gray-400 line-through sm:text-xs">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>

            {discountPercent > 0 && (
              <span className="mt-0.5 block text-[9px] font-medium text-[#a45b70]">
                You save {discountPercent}%
              </span>
            )}
          </div>

          {/* Compact cart button */}
          <button
            type="button"
            onClick={() => handleAddToCart(product)}
            disabled={
              isOutOfStock ||
              !isLoggedIn ||
              isCartMutationPending
            }
            aria-label={
              isOutOfStock
                ? 'Out of stock'
                : isInCart
                ? 'Add another to cart'
                : 'Add to cart'
            }
            className={`
              flex
              h-10
              shrink-0
              items-center
              justify-center
              rounded-full
              px-3.5
              text-[10px]
              font-bold
              tracking-wide
              transition-all
              duration-200
              sm:h-10
              sm:px-4
              sm:text-[11px]

              ${
                isOutOfStock
                  ? 'cursor-not-allowed border border-gray-200 bg-gray-50 text-gray-400'
                  : !isLoggedIn
                  ? 'cursor-not-allowed border border-gray-200 bg-gray-100 text-gray-400'
                  : isInCart
                  ? 'bg-[#21151d] text-white hover:bg-[#34212c]'
                  : 'bg-[#b45f78] text-white shadow-sm hover:bg-[#9e4d66] hover:shadow-md active:scale-95'
              }
            `}
          >
            {isCartMutationPending ? (
              <svg
                className="h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className="opacity-90"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"
                />
              </svg>
            ) : !isLoggedIn ? (
              <span className="hidden sm:inline">Login</span>
            ) : isOutOfStock ? (
              'Sold out'
            ) : isInCart ? (
              <>
                <svg
                  className="mr-1.5 h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>

                <span className="hidden sm:inline">Add more</span>
                <span className="sm:hidden">+</span>
              </>
            ) : (
              <>
                <svg
                  className="mr-1.5 h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.7}
                    d="M12 5v14M5 12h14"
                  />
                </svg>

                <span className="hidden sm:inline">Add</span>
                <span className="sm:hidden">+</span>
              </>
            )}
          </button>
        </div>

        {/* Cart status */}
        {isInCart && !isOutOfStock && (
          <div className="mt-2 flex items-center gap-1.5 text-[9px] font-medium text-emerald-600">
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-50">
              <svg
                className="h-2 w-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </span>

            {cartQuantity}{' '}
            {cartQuantity === 1 ? 'item' : 'items'} in cart
          </div>
        )}
      </div>
    </article>
  );
}