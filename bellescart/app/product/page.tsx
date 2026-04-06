'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import ProductGrid from '@/components/ProductGrid/ProductGrid';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Rating from '@/components/ui/Rating';
import Badge from '@/components/ui/Badge';
import { getProductById, getRelatedProducts } from '@/utils/mockData';
import { useAuth } from '@/utils/auth';

function ProductDetails() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('id') || '1';
  const product = getProductById(productId);
  const relatedProducts = getRelatedProducts(productId);
  const { isAuthenticated } = useAuth();

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Product not found</p>
      </div>
    );
  }

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Product Details */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            {/* Product Image */}
            <div className="flex items-center justify-center">
              <div className="relative w-full h-96 bg-gray-200 rounded-lg overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
                {discountPercent > 0 && (
                  <Badge variant="danger" className="absolute top-4 left-4">
                    -{discountPercent}%
                  </Badge>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-4">{product.name}</h1>

              <div className="flex items-center gap-4 mb-6">
                <Rating rating={product.rating} reviews={product.reviews} />
              </div>

              <p className="text-gray-600 text-lg mb-6">{product.description}</p>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-bold text-gray-900">₹{product.price}</span>
                  {product.originalPrice && (
                    <span className="text-xl text-gray-600 line-through">
                      ₹{product.originalPrice}
                    </span>
                  )}
                </div>
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {product.inStock ? (
                  <Badge variant="success">In Stock</Badge>
                ) : (
                  <Badge variant="danger">Out of Stock</Badge>
                )}
              </div>

              {/* Options */}
              {product.sizes && (
                <Select
                  label="Size"
                  value={selectedSize}
                  onChange={e => setSelectedSize(e.target.value)}
                  options={product.sizes.map(size => ({
                    value: size,
                    label: size,
                  }))}
                />
              )}

              {product.colors && (
                <Select
                  label="Color"
                  value={selectedColor}
                  onChange={e => setSelectedColor(e.target.value)}
                  options={product.colors.map(color => ({
                    value: color,
                    label: color,
                  }))}
                />
              )}

              {/* Quantity */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg w-32">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-l border-r border-gray-300">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="flex gap-4">
                <Button
                  size="lg"
                  className="flex-1"
                  disabled={!product.inStock || !isAuthenticated}
                >
                  {isAuthenticated ? 'Add to Cart' : 'Login to Add to Cart'}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-6"
                  disabled={!isAuthenticated}
                >
                  ♡
                </Button>
              </div>

              {/* Shipping Info */}
              <div className="mt-8 bg-gray-100 p-4 rounded-lg">
                <ul className="space-y-2 text-gray-700">
                  <li>✓ Free shipping on orders over ₹5000</li>
                  <li>✓ 30-day return policy</li>
                  <li>✓ Secure checkout</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Related Products */}
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Related Products</h2>
            <ProductGrid products={relatedProducts} isLoggedIn={isAuthenticated} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ProductDetailsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductDetails />
    </Suspense>
  );
}
