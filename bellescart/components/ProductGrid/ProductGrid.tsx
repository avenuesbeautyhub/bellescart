import React from 'react';
import { Product } from '@/utils/types';
import ProductCard from '@/components/ProductCard/ProductCard';
import { useRequireUserAuth } from '@/auth/user';

interface ProductGridProps {
  products: Product[];
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
}

export default function ProductGrid({
  products,
  onAddToCart,
  onAddToWishlist,
}: ProductGridProps) {
  const { user, loaded, isAuthenticated } = useRequireUserAuth();

  // Show loader while checking authentication
  if (!loaded) {
    return (
      <div className="col-span-full py-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
        <p className="text-gray-500 text-lg mt-2">Loading...</p>
      </div>
    );
  }

  // Don't render if not authenticated (should be handled by useRequireUserAuth redirect)
  if (!isAuthenticated) {
    return null;
  }
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
          key={product._id}
          product={product}
          onAddToCart={onAddToCart}
          onAddToWishlist={onAddToWishlist}
          isLoggedIn={true}
        />
      ))}
    </div>
  );
}
