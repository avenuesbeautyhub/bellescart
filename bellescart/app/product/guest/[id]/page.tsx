'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import Badge from '@/components/ui/Badge';
import { usePublicProduct } from '@/hooks/user/usePublicProductQueries';
import { Product, ProductImage, ProductCategory } from '@/utils/types';
import Link from 'next/link';
import { toastMessages } from '@/utils/toastHelpers';

export default function GuestProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: productId } = React.use(params);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  // React Query hook
  const { data: productData, isLoading, error } = usePublicProduct(productId);
  const product = productData?.data?.product || productData?.data?.products?.[0] || null;

  // Set main image as selected when product loads
  useEffect(() => {
    if (product) {
      const mainImage = product.images?.find((img: ProductImage) => img.isMain)?.url || product.images?.[0]?.url || '';
      setSelectedImage(mainImage);
    }
  }, [product]);

  const handleAddToCart = () => {
    if (product) {
      console.log('Add to cart:', { ...product, quantity });
    }
    toastMessages.auth.loginRequired();
  };

  const handleAddToWishlist = () => {
    if (product) {
      console.log('Add to wishlist:', product);
      toastMessages.auth.loginRequired();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader size="lg" text="Loading product..." fullScreen />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-8">The product you're looking for doesn't exist.</p>
            <Button onClick={() => router.push('/')} variant="primary">
              Back to Home
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
            <Link href="/" className="hover:text-pink-500 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-pink-500 transition-colors">Products</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Product Images Section */}
            <div className="md:col-span-2 lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-6">
                {/* Vertical Thumbnail Gallery */}
                <div className="md:col-span-1 order-2 md:order-1">
                  {product.images && product.images.length > 1 && (
                    <div className="hidden md:block md:sticky md:top-8">
                      <div className="flex md:flex-col gap-2 lg:gap-4 overflow-x-auto md:overflow-x-visible justify-center md:justify-start py-2">
                        {product.images.map((image: ProductImage, index: number) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImage(image.url)}
                            className={`relative aspect-square bg-white rounded-xl overflow-hidden border-2 transition-all duration-300 hover:scale-110 hover:rotate-1 flex-shrink-0 w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 shadow-md hover:shadow-xl ${selectedImage === image.url
                                ? 'border-pink-500 shadow-2xl ring-4 ring-pink-200 scale-105'
                                : 'border-gray-200 hover:border-pink-300'
                              }`}
                          >
                            <img
                              src={image.url}
                              alt={image.alt}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />

                            {/* Selection indicator overlay */}
                            {selectedImage === image.url && (
                              <>
                                <div className="absolute inset-0 bg-gradient-to-t from-pink-500/30 to-transparent pointer-events-none" />
                                <div className="absolute top-1 right-1 w-4 h-4 bg-pink-500 rounded-full flex items-center justify-center shadow-lg">
                                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              </>
                            )}

                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300 pointer-events-none" />
                          </button>
                        ))}
                      </div>

                      {/* Image counter */}
                      <div className="text-center mt-4 text-xs md:text-sm text-gray-600 font-medium bg-gray-100 rounded-full px-2 py-1 md:px-3 md:py-1 inline-block">
                        {product.images.findIndex(img => img.url === selectedImage) + 1} / {product.images.length}
                      </div>
                    </div>
                  )}
                </div>

                {/* Main Image */}
                <div className="md:col-span-3 order-1 md:order-2">
                  <div className="relative aspect-[4/5] max-w-xs sm:max-w-xs md:max-w-sm lg:max-w-md mx-auto bg-white rounded-2xl shadow-lg overflow-hidden group">
                    <img
                      src={selectedImage}
                      alt={product.name}
                      loading="eager"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {discountPercent > 0 && (
                      <div className="absolute top-4 left-4">
                        <Badge variant="danger" className="text-sm font-bold px-3 py-1">
                          -{discountPercent}% OFF
                        </Badge>
                      </div>
                    )}
                    {!product.quantity && (
                      <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                        <div className="bg-white px-6 py-3 rounded-full">
                          <span className="text-red-600 font-bold text-lg">Out of Stock</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-4 md:space-y-6">
              {/* Product Title and Price */}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 leading-tight">{product.name}</h1>

                {/* Part Number */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-gray-600 font-medium">Part Number:</span>
                  <span className="text-sm text-gray-900 bg-gray-100 px-3 py-1 rounded-full font-mono">{product._id}</span>
                </div>

                {/* Price */}
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-3 mb-4">
                  <span className="text-2xl md:text-3xl font-bold text-gray-900">₹{product.price}</span>
                  {product.originalPrice && (
                    <span className="text-base md:text-lg text-gray-400 line-through">₹{product.originalPrice}</span>
                  )}
                  {discountPercent > 0 && (
                    <span className="text-xs md:text-sm text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-full">
                      Save {discountPercent}%
                    </span>
                  )}
                </div>

                {/* Stock Status */}
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${product.quantity > 0 ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                  <span className={`text-sm font-medium ${product.quantity > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {product.quantity > 0 ? `${product.quantity} items in stock` : 'Out of Stock'}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-600">Category</span>
                  <span className="text-sm text-gray-900 bg-white px-3 py-1 rounded-full border border-gray-200">
                    {product.category?.name}
                  </span>
                </div>
                {product.brand && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-600">Brand</span>
                    <span className="text-sm text-gray-900 bg-white px-3 py-1 rounded-full border border-gray-200">
                      {product.brand}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed text-lg">{product.description}</p>
              </div>

              {/* Quantity Selector */}
              <div className="bg-gray-50 rounded-xl p-4 md:p-6 text-pink-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <label className="text-base md:text-lg font-semibold text-gray-900">Quantity</label>
                  <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                    <div className={`w-2 h-2 rounded-full ${product.quantity > 0 ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                    <span>{product.quantity > 0 ? `${product.quantity} available` : 'Out of Stock'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3 text-pink-800">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={!product.quantity || quantity <= 1}
                    className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-white border-2 border-gray-200 flex items-center justify-center hover:border-pink-500 hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-lg md:text-xl font-semibold shadow-sm"
                  >
                    −
                  </button>
                  <div className="relative">
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      disabled={!product.quantity}
                      className="w-16 h-10 md:w-20 md:h-14 rounded-lg md:rounded-xl bg-white border-2 border-gray-200 text-center text-lg md:text-xl font-bold focus:border-pink-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                      min="1"
                      max={product.quantity || 1}
                    />
                  
                  </div>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={!product.quantity || quantity >= product.quantity}
                    className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-white border-2 border-gray-200 flex items-center justify-center hover:border-pink-500 hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-lg md:text-xl font-semibold shadow-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 md:space-y-4">
                {product.quantity > 0 ? (
                  <div className="flex gap-2 md:gap-4">
                    <Button
                      variant="primary"
                      size="lg"
                      className="flex-1 h-12 md:h-16 text-sm md:text-lg font-semibold bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      onClick={handleAddToCart}
                    >
                      <div className="flex items-center justify-center gap-1 md:gap-2">
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="hidden sm:inline">Login to Add to Cart</span>
                        <span className="sm:hidden">Add to Cart</span>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleAddToWishlist}
                      className="w-12 h-12 md:w-16 md:h-16 hover:bg-pink-50 hover:border-pink-500 hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      <span className="text-xl md:text-2xl">♡</span>
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <Button
                      variant="primary"
                      size="lg"
                      disabled
                      className="w-full h-12 md:h-16 text-sm md:text-lg font-semibold bg-gray-300 cursor-not-allowed"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Out of Stock
                      </div>
                    </Button>
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                      SOLD OUT
                    </div>
                  </div>
                )}
              </div>

              {/* Guest Notice */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">i</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">Shopping as Guest</h4>
                    <p className="text-blue-800 text-sm leading-relaxed">
                      Browse products freely, but you'll need to
                      <Link href={`/login?redirect=${encodeURIComponent(`/product?id=${productId}`)}`} className="text-blue-600 hover:text-blue-800 font-semibold underline ml-1">create an account</Link>
                      {' '}to add items to cart and checkout.
                    </p>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-green-600 text-lg">✓</span>
                  </div>
                  <p className="text-xs text-gray-600 font-medium">Secure Payment</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-blue-600 text-lg">🚚</span>
                  </div>
                  <p className="text-xs text-gray-600 font-medium">Fast Delivery</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-purple-600 text-lg">↩️</span>
                  </div>
                  <p className="text-xs text-gray-600 font-medium">Easy Returns</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
