'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/utils/types';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Rating from '@/components/ui/Rating';
import { useAuth } from '@/utils/auth';

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
  const { isAuthenticated } = useAuth();
  const isUserLoggedIn = isLoggedIn !== undefined ? isLoggedIn : isAuthenticated;

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <Link href={`/product?id=${product.id}`}>
        <div className="relative h-64 bg-gray-200 overflow-hidden cursor-pointer group">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
          {discountPercent > 0 && (
            <Badge variant="danger" className="absolute top-3 right-3">
              -{discountPercent}%
            </Badge>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Out of Stock</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/product?id=${product.id}`}>
          <h3 className="text-lg font-semibold text-gray-800 hover:text-pink-500 truncate cursor-pointer">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mt-2">
          <Rating rating={product.rating} reviews={product.reviews} size="sm" />
        </div>

        <p className="text-gray-600 text-sm mt-2 overflow-hidden" style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {product.description}
        </p>

        <div className="flex items-center gap-2 mt-3">
          <span className="text-2xl font-bold text-gray-900">₹{product.price}</span>
          {product.originalPrice && (
            <span className="text-lg text-gray-500 line-through">
              ₹{product.originalPrice}
            </span>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            variant="primary"
            size="md"
            className="flex-1"
            onClick={() => onAddToCart?.(product)}
            disabled={!product.inStock || !isLoggedIn}
          >
            {isLoggedIn ? 'Add to Cart' : 'Login to Add'}
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => onAddToWishlist?.(product)}
            className="px-3"
            disabled={!isLoggedIn}
          >
            ♡
          </Button>
        </div>
      </div>
    </div>
  );
}