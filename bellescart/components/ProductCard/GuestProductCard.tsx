'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/utils/types';
import { ProductImage } from '@/services/publicProductService';

interface GuestProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
  isLoggedIn?: boolean;
  rating?: number;
  reviewCount?: number;
}

export default function GuestProductCard({
  product,
  onAddToCart,
  onAddToWishlist,
  isLoggedIn = false,
  rating,
  reviewCount,
}: GuestProductCardProps) {
  const discountPercent = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) /
          product.originalPrice) *
          100
      )
    : 0;

  const mainImage =
    product.images?.find((img: ProductImage) => img.isMain)?.url ||
    product.images?.[0]?.url ||
    '';

  const isOutOfStock = !product.quantity;
  const isLowStock = product.quantity > 0 && product.quantity <= 5;

  const displayRating = rating !== undefined ? rating : 0;
  const displayReviewCount = reviewCount !== undefined ? reviewCount : 0;

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      window.location.href = '/login';
      return;
    }

    onAddToWishlist?.(product);
  };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[20px] border border-gray-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-gray-200 hover:shadow-[0_18px_45px_rgba(0,0,0,0.09)]">
      {/* ================= IMAGE ================= */}
      <div className="relative overflow-hidden bg-[#f8f7f5]">
        <Link
          href={`/product/guest/${product._id}`}
          className="block"
          aria-label={`View ${product.name}`}
        >
          <div className="relative aspect-[4/5] overflow-hidden">
            {mainImage ? (
              <Image
                src={mainImage}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={`object-cover transition-transform duration-700 ease-out ${
                  isOutOfStock
                    ? 'grayscale-[15%]'
                    : 'group-hover:scale-[1.045]'
                }`}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
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
                      strokeWidth={1.4}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="mt-2 block text-xs text-gray-400">
                    No image
                  </span>
                </div>
              </div>
            )}

            {/* Subtle bottom gradient */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/15 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
        </Link>

        {/* ================= BADGES ================= */}
        <div className="absolute left-3 top-3 z-20 flex flex-col items-start gap-2">
          {isOutOfStock ? (
            <span className="rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-red-600 shadow-sm backdrop-blur">
              Out of stock
            </span>
          ) : discountPercent > 0 ? (
            <span className="rounded-full bg-gray-950 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-white shadow-sm">
              {discountPercent}% off
            </span>
          ) : null}

          {isLowStock && (
            <span className="rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-semibold text-orange-600 shadow-sm backdrop-blur">
              Only {product.quantity} left
            </span>
          )}
        </div>

        {/* ================= WISHLIST ================= */}
        <button
          type="button"
          onClick={handleWishlist}
          aria-label={
            isLoggedIn
              ? 'Add product to wishlist'
              : 'Login to add product to wishlist'
          }
          className="absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/90 text-gray-700 shadow-sm backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-white hover:text-pink-600 sm:h-10 sm:w-10"
        >
          <svg
            className="h-[18px] w-[18px] sm:h-5 sm:w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.7}
              d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"
            />
          </svg>
        </button>

        {/* ================= VIEW PRODUCT ================= */}
        {!isOutOfStock && (
          <Link
            href={`/product/guest/${product._id}`}
            className="absolute bottom-3 left-1/2 z-20 hidden w-[calc(100%-24px)] -translate-x-1/2 translate-y-2 items-center justify-center rounded-xl bg-white/95 px-4 py-2.5 text-xs font-semibold text-gray-900 opacity-0 shadow-lg backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:flex"
          >
            View product

            <svg
              className="ml-2 h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.7}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        )}

        {/* ================= OUT OF STOCK OVERLAY ================= */}
        {isOutOfStock && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/45 backdrop-blur-[2px]">
            <div className="px-5 text-center">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/10">
                <svg
                  className="h-5 w-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M20 12H4"
                  />
                </svg>
              </div>

              <p className="text-sm font-semibold text-white">
                Currently unavailable
              </p>

              <p className="mt-1 text-[11px] text-white/70">
                This item is out of stock
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ================= PRODUCT DETAILS ================= */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Category */}
        {product.category && (
          <Link
            href={`/product/guest/${product._id}`}
            className="mb-1.5 w-fit text-[10px] font-bold uppercase tracking-[0.16em] text-pink-600 transition-colors hover:text-pink-700 sm:text-[11px]"
          >
            {product.category.name}
          </Link>
        )}

        {/* Product Name */}
        <Link href={`/product/guest/${product._id}`}>
          <h3 className="line-clamp-2 min-h-[42px] text-sm font-semibold leading-[1.45] text-gray-900 transition-colors group-hover:text-pink-600 sm:text-[15px]">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="mt-2.5 flex items-center gap-2">
          <div className="flex items-center gap-[1px]">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < displayRating ? 'text-amber-400' : 'text-gray-200'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>

          <span className="text-[11px] text-gray-400">
            {displayReviewCount} reviews
          </span>
        </div>

        {/* Price */}
        <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-lg font-bold tracking-tight text-gray-950 sm:text-xl">
            ₹{product.price}
          </span>

          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through sm:text-sm">
              ₹{product.originalPrice}
            </span>
          )}

          {discountPercent > 0 && (
            <span className="text-[10px] font-bold text-pink-600 sm:text-xs">
              Save {discountPercent}%
            </span>
          )}
        </div>

        {/* Add To Cart */}
        {isLoggedIn ? (
          <button
            type="button"
            onClick={() => onAddToCart?.(product)}
            disabled={isOutOfStock}
            className={`mt-4 flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 sm:min-h-[44px] sm:text-sm ${
              isOutOfStock
                ? 'cursor-not-allowed border border-red-100 bg-red-50 text-red-400'
                : 'bg-pink-600 text-white shadow-sm hover:bg-pink-700 hover:shadow-md active:scale-[0.98]'
            }`}
          >
            {isOutOfStock ? (
              'Out of Stock'
            ) : (
              <>
                Add to Cart
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M12 5v14M5 12h14"
                  />
                </svg>
              </>
            )}
          </button>
        ) : (
          <Link
            href="/login"
            className={`mt-4 flex min-h-[42px] w-full items-center justify-center rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 sm:min-h-[44px] sm:text-sm ${
              isOutOfStock
                ? 'pointer-events-none cursor-not-allowed border border-red-100 bg-red-50 text-red-400'
                : 'bg-pink-600 text-white shadow-sm hover:bg-pink-700 hover:shadow-md active:scale-[0.98]'
            }`}
          >
            {isOutOfStock ? 'Out of Stock' : 'Login to Add'}
          </Link>
        )}
      </div>
    </article>
  );
}