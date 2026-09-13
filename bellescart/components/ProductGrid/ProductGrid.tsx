import React from 'react';
import { Product } from '@/utils/types';
import ProductCard from '@/components/ProductCard/ProductCard';
import { useAuth } from '@/auth/user';

interface ProductGridProps {
  products: Product[];
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
  wishlistItems?: any[];
  viewMode?: 'grid' | 'list';
}

export default function ProductGrid({
  products,
  onAddToCart,
  onAddToWishlist,
  wishlistItems,
  viewMode = 'grid',
}: ProductGridProps) {
  const { isAuthenticated } = useAuth();

  if (products.length === 0) {
    return (
      <div className="col-span-full flex min-h-[320px] items-center justify-center">
        <div className="max-w-sm px-6 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-gray-200 bg-[#faf9f7]">
            <svg
              className="h-7 w-7 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.4}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0l-2.5 4H6.5L4 13m16 0H4"
              />
            </svg>
          </div>

          <h3 className="text-base font-semibold tracking-tight text-gray-900">
            No pieces found
          </h3>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Try adjusting your search or filters to discover more pieces.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        viewMode === 'grid'
          ? `
        grid
        grid-cols-2
        gap-x-3
        gap-y-8
        sm:grid-cols-2
        sm:gap-x-5
        sm:gap-y-10
        lg:grid-cols-3
        lg:gap-x-6
        lg:gap-y-12
        xl:grid-cols-4
        xl:gap-x-7
        2xl:grid-cols-5
      `
          : `
        grid
        grid-cols-1
        gap-4
      `
      }
    >
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          onAddToCart={onAddToCart}
          onAddToWishlist={onAddToWishlist}
          isLoggedIn={isAuthenticated}
          wishlistItems={wishlistItems}
          viewMode={viewMode}
        />
      ))}
    </div>
  );
}