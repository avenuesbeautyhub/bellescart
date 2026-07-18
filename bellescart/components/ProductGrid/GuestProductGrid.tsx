'use client';

import React from 'react';
import { Product } from '@/utils/types';
import GuestProductCard from '@/components/ProductCard/GuestProductCard';
import { useAuth } from '@/auth/user';

interface GuestProductGridProps {
  products: Product[];
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
}

export default function GuestProductGrid({
  products,
  onAddToCart,
  onAddToWishlist,
}: GuestProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="col-span-full py-12 text-center">
        <p className="text-gray-500 text-lg">No products found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product, index) => (
        <GuestProductCard
          key={`${product._id}-${index}`}
          product={product}
          onAddToCart={onAddToCart}
          onAddToWishlist={onAddToWishlist}
        />
      ))}
    </div>
  );
}
