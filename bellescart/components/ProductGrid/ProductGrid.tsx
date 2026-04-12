import React from 'react';
import { Product } from '@/utils/types';
import ProductCard from '@/components/ProductCard/ProductCard';
import { useAuth } from '@/auth/user';

interface ProductGridProps {
  products: Product[];
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
  isLoggedIn?: boolean;
}

export default function ProductGrid({
  products,
  onAddToCart,
  onAddToWishlist,
  isLoggedIn,
}: ProductGridProps) {
  const { isAuthenticated } = useAuth();
  const isUserLoggedIn = isLoggedIn !== undefined ? isLoggedIn : isAuthenticated;
  if (products.length === 0) {
    return (
      <div className="col-span-full py-12 text-center">
        <p className="text-gray-500 text-lg">No products found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onAddToWishlist={onAddToWishlist}
          isLoggedIn={isUserLoggedIn}
        />
      ))}
    </div>
  );
}
