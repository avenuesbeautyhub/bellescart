'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import { usePublicProduct } from '@/hooks/user/usePublicProductQueries';

type ProductImage = {
  url: string;
  alt?: string;
  isMain?: boolean;
  _id?: string;
};

type Product = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  images?: (ProductImage | string)[];
  image?: string;
  category?: {
    _id?: string;
    name?: string;
  };
  stock?: number;
  quantity?: number;
  rating?: number;
  reviews?: number;
  isActive?: boolean;
  [key: string]: any; // Allow additional properties from API response
};

export default function GuestProductDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const productId = params?.id as string;

  // React Query hook for fetching product
  const { data: productData, isLoading: loading, error } = usePublicProduct(productId);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // Process product data from React Query
  const product = React.useMemo(() => {
    if (!productData?.data) return null;
    const productDataItem = productData.data.product || productData.data.products?.[0] || productData.data;
    
    // Type guard to ensure we have a Product object
    if (!productDataItem || typeof productDataItem !== 'object') return null;
    
    // Check if it has the essential Product properties
    if ('_id' in productDataItem && 'name' in productDataItem && 'price' in productDataItem) {
      return productDataItem as Product;
    }
    
    return null;
  }, [productData]);

  // ---------------------------------------------------------
  // Product images
  // ---------------------------------------------------------
  const images = useMemo(() => {
    if (!product) return [];

    // Handle images array with objects (url property)
    const productImages = product.images;
    if (productImages && Array.isArray(productImages) && productImages.length > 0) {
      // Check if images are objects with url property
      if (typeof productImages[0] === 'object' && productImages[0] !== null) {
        return (productImages as ProductImage[]).map(img => img.url);
      }
      // If images are already strings
      return productImages as string[];
    }

    // Fallback to single image
    if (product.image) {
      return [product.image];
    }

    return [];
  }, [product]);

  // ---------------------------------------------------------
  // Discount
  // ---------------------------------------------------------
  const discountPercentage = useMemo(() => {
    const originalPrice = product?.originalPrice;
    const price = product?.price || 0;
    
    if (
      !originalPrice ||
      originalPrice <= price
    ) {
      return 0;
    }

    return Math.round(
      ((originalPrice - price) /
        originalPrice) *
        100
    );
  }, [product]);

  // ---------------------------------------------------------
  // Stock
  // ---------------------------------------------------------
  const stock = product?.stock ?? product?.quantity ?? 0;
  const isOutOfStock = stock <= 0;

  // ---------------------------------------------------------
  // Quantity
  // ---------------------------------------------------------
  const increaseQuantity = () => {
    if (quantity < stock) {
      setQuantity((current) => current + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((current) => current - 1);
    }
  };

  // ---------------------------------------------------------
  // Add to cart
  // ---------------------------------------------------------
  const handleAddToCart = async () => {
    if (!product || isOutOfStock) return;

    try {
      setAddingToCart(true);

      /*
       * Replace this section with your existing cart logic.
       *
       * Example:
       *
       * await addToCart({
       *   productId: product._id,
       *   quantity,
       * });
       */

      console.log('Add to cart:', {
        productId: product?._id,
        quantity,
      });

      await new Promise((resolve) =>
        setTimeout(resolve, 500)
      );
    } catch (err) {
      console.error('Add to cart error:', err);
    } finally {
      setAddingToCart(false);
    }
  };

  // ---------------------------------------------------------
  // Buy now
  // ---------------------------------------------------------
  const handleBuyNow = async () => {
    if (!product || isOutOfStock) return;

    /*
     * Connect this with your existing cart/checkout flow.
     */

    console.log('Buy now:', {
      productId: product?._id,
      quantity,
    });

    router.push('/cart');
  };

  // =========================================================
  // LOADING
  // =========================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="animate-pulse">
            {/* Breadcrumb */}
            <div className="h-4 w-48 bg-gray-200 rounded mb-10" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
              {/* Images */}
              <div className="flex gap-4">
                <div className="hidden sm:block w-20 space-y-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded-xl bg-gray-200"
                    />
                  ))}
                </div>

                <div className="flex-1 aspect-square rounded-3xl bg-gray-200" />
              </div>

              {/* Details */}
              <div className="space-y-6">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-10 w-4/5 bg-gray-200 rounded" />
                <div className="h-5 w-32 bg-gray-200 rounded" />
                <div className="h-9 w-40 bg-gray-200 rounded" />

                <div className="space-y-3 pt-4">
                  <div className="h-4 w-full bg-gray-200 rounded" />
                  <div className="h-4 w-5/6 bg-gray-200 rounded" />
                  <div className="h-4 w-4/6 bg-gray-200 rounded" />
                </div>

                <div className="h-14 w-full bg-gray-200 rounded-xl" />
                <div className="h-14 w-full bg-gray-200 rounded-xl" />
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================
  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col">
        <Navbar />

        <main className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M9 9l6 6M15 9l-6 6" />
              </svg>
            </div>

            <h1 className="text-2xl font-semibold text-gray-900">
              Product not found
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Sorry, we couldn't find the product you're looking
              for. It may have been removed or is no longer
              available.
            </p>

            <button
              onClick={() => router.push('/products')}
              className="
                mt-7
                inline-flex items-center justify-center
                px-6 py-3
                rounded-xl
                bg-gray-900
                text-white
                text-sm font-medium
                hover:bg-gray-800
                transition
              "
            >
              Continue Shopping
            </button>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // =========================================================
  // PRODUCT PAGE
  // =========================================================
  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900">
      <Navbar />

      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">

          {/* =================================================
              BREADCRUMB
          ================================================= */}
          <div className="flex items-center flex-wrap gap-2 text-sm text-gray-500 mb-8">
            <button
              onClick={() => router.push('/')}
              className="hover:text-gray-900 transition"
            >
              Home
            </button>

            <span className="text-gray-300">/</span>

            <button
              onClick={() => router.push('/products')}
              className="hover:text-gray-900 transition"
            >
              Shop
            </button>

            {product?.category?.name && (
              <>
                <span className="text-gray-300">/</span>
                <span className="text-gray-900 font-medium">
                  {product.category.name}
                </span>
              </>
            )}
          </div>

          {/* =================================================
              PRODUCT
          ================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">

            {/* =================================================
                IMAGE GALLERY
            ================================================= */}
            <div>
              <div className="flex flex-col sm:flex-row gap-4">

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="order-2 sm:order-1 flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`
                          flex-shrink-0
                          w-16 h-16 sm:w-20 sm:h-20
                          rounded-xl
                          overflow-hidden
                          bg-white
                          border-2
                          transition-all
                          ${
                            selectedImage === index
                              ? 'border-gray-900 shadow-sm'
                              : 'border-gray-200 hover:border-gray-400'
                          }
                        `}
                      >
                        <img
                          src={image}
                          alt={`${product?.name || 'product'} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Main image */}
                <div className="order-1 sm:order-2 flex-1 relative">
                  <div className="relative aspect-square bg-white rounded-3xl overflow-hidden border border-gray-100">

                    {discountPercentage > 0 && (
                      <div className="absolute top-5 left-5 z-10">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-gray-900 text-white text-xs font-semibold">
                          {discountPercentage}% OFF
                        </span>
                      </div>
                    )}

                    {/* Wishlist */}
                    <button
                      onClick={() =>
                        setIsWishlisted(!isWishlisted)
                      }
                      className="
                        absolute top-5 right-5 z-10
                        w-11 h-11
                        rounded-full
                        bg-white/95
                        backdrop-blur
                        shadow-sm
                        border border-gray-100
                        flex items-center justify-center
                        hover:scale-105
                        transition
                      "
                      aria-label="Wishlist"
                    >
                      <svg
                        className={`w-5 h-5 ${
                          isWishlisted
                            ? 'fill-pink-600 text-pink-600'
                            : 'text-gray-700'
                        }`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" />
                      </svg>
                    </button>

                    {images.length > 0 ? (
                      <img
                        src={images[selectedImage]}
                        alt={product?.name || 'product'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg
                          className="w-16 h-16 text-gray-300"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1"
                        >
                          <rect
                            x="3"
                            y="3"
                            width="18"
                            height="18"
                            rx="2"
                          />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path d="m21 15-5-5L5 21" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                PRODUCT INFORMATION
            ================================================= */}
            <div className="lg:py-2">

              {/* Category */}
              {product?.category?.name && (
                <div className="mb-4">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-pink-600">
                    {product.category.name}
                  </span>
                </div>
              )}

              {/* Product name */}
              <h1 className="text-3xl sm:text-4xl xl:text-5xl font-semibold tracking-tight text-gray-900 leading-tight">
                {product?.name || 'Product'}
              </h1>


              {/* Price */}
              <div className="flex flex-wrap items-center gap-3 mt-7">
                <span className="text-3xl font-semibold text-gray-900">
                  ₹{product?.price?.toLocaleString('en-IN') || '0'}
                </span>

                {product?.originalPrice &&
                  product.originalPrice > product.price && (
                    <>
                      <span className="text-lg text-gray-400 line-through">
                        ₹
                        {product.originalPrice.toLocaleString(
                          'en-IN'
                        )}
                      </span>

                      <span className="px-2.5 py-1 rounded-lg bg-green-50 text-green-700 text-xs font-semibold">
                        Save{' '}
                        {discountPercentage}%
                      </span>
                    </>
                  )}
              </div>

              <p className="mt-1 text-xs text-gray-400">
                Inclusive of all applicable taxes
              </p>

              {/* Divider */}
              <div className="my-7 border-t border-gray-200" />

              {/* Description */}
              {product?.description && (
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 mb-3">
                    Description
                  </h2>

                  <p className="text-sm sm:text-base text-gray-500 leading-7 whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Stock */}
              <div className="mt-7">
                {isOutOfStock ? (
                  <div className="flex items-center gap-2 text-sm font-medium text-red-600">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Currently out of stock
                  </div>
                ) : stock <= 5 ? (
                  <div className="flex items-center gap-2 text-sm font-medium text-orange-600">
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    Only {stock} left in stock
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    In stock and ready to ship
                  </div>
                )}
              </div>

              {/* Quantity */}
              {!isOutOfStock && (
                <div className="mt-7">
                  <p className="text-sm font-semibold text-gray-900 mb-3">
                    Quantity
                  </p>

                  <div className="inline-flex items-center border border-gray-200 rounded-xl bg-white">
                    <button
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                      className="
                        w-11 h-11
                        flex items-center justify-center
                        text-gray-600
                        hover:bg-gray-50
                        disabled:text-gray-300
                        transition
                      "
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14" />
                      </svg>
                    </button>

                    <span className="w-12 text-center text-sm font-semibold">
                      {quantity}
                    </span>

                    <button
                      onClick={increaseQuantity}
                      disabled={quantity >= stock}
                      className="
                        w-11 h-11
                        flex items-center justify-center
                        text-gray-600
                        hover:bg-gray-50
                        disabled:text-gray-300
                        transition
                      "
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="mt-7 space-y-3">

                <button
                  onClick={() => router.push('/login')}
                  disabled={isOutOfStock}
                  className="
                    w-full
                    h-14
                    rounded-xl
                    bg-gradient-to-r from-pink-500 to-pink-600
                    text-white
                    font-semibold
                    text-sm
                    flex items-center justify-center gap-3
                    hover:from-pink-600 hover:to-pink-700
                    disabled:bg-gray-300
                    disabled:cursor-not-allowed
                    transition
                    shadow-lg hover:shadow-xl
                  "
                >
                  {isOutOfStock ? (
                    'Out of Stock'
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                        <polyline points="10 17 15 12 10 7" />
                        <line x1="15" y1="12" x2="3" y2="12" />
                      </svg>

                      Login to Continue
                    </>
                  )}
                </button>

                <button
                  onClick={() => router.push('/signup')}
                  disabled={isOutOfStock}
                  className="
                    w-full
                    h-14
                    rounded-xl
                    border-2
                    border-pink-500
                    bg-white
                    text-pink-600
                    font-semibold
                    text-sm
                    hover:bg-pink-50
                    disabled:border-gray-200
                    disabled:text-gray-300
                    disabled:cursor-not-allowed
                    transition
                  "
                >
                  Create Account
                </button>
              </div>

              {/* =================================================
                  SERVICE FEATURES
              ================================================= */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">

                <div className="p-4 rounded-2xl bg-white border border-gray-100">
                  <svg
                    className="w-5 h-5 text-gray-700 mb-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M3 7h11v10H3z" />
                    <path d="M14 10h4l3 3v4h-7z" />
                    <circle cx="7" cy="19" r="2" />
                    <circle cx="18" cy="19" r="2" />
                  </svg>

                  <p className="text-xs font-semibold text-gray-900">
                    Fast Delivery
                  </p>

                  <p className="mt-1 text-[11px] text-gray-500">
                    Delivered safely to your doorstep
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-gray-100">
                  <svg
                    className="w-5 h-5 text-gray-700 mb-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M12 3l8 4v5c0 4.5-3.2 7.6-8 9-4.8-1.4-8-4.5-8-9V7l8-4z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>

                  <p className="text-xs font-semibold text-gray-900">
                    Secure Payment
                  </p>

                  <p className="mt-1 text-[11px] text-gray-500">
                    Your payment information is protected
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-gray-100">
                  <svg
                    className="w-5 h-5 text-gray-700 mb-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M20 11a8 8 0 10-2.34 5.66" />
                    <path d="M20 5v6h-6" />
                  </svg>

                  <p className="text-xs font-semibold text-gray-900">
                    Easy Returns
                  </p>

                  <p className="mt-1 text-[11px] text-gray-500">
                    Simple and hassle-free returns
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* =================================================
              PRODUCT INFORMATION
          ================================================= */}
          <section className="mt-16 sm:mt-20">
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">

              <div className="px-6 sm:px-8 py-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">
                  Product Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">

                <div className="p-6 sm:p-8">
                  <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                    Category
                  </p>

                  <p className="mt-2 text-sm font-medium text-gray-900">
                    {product?.category?.name || '—'}
                  </p>
                </div>

                <div className="p-6 sm:p-8">
                  <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                    Availability
                  </p>

                  <p className="mt-2 text-sm font-medium text-gray-900">
                    {isOutOfStock
                      ? 'Out of stock'
                      : 'Available'}
                  </p>
                </div>

                <div className="p-6 sm:p-8">
                  <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                    Product ID
                  </p>

                  <p className="mt-2 text-sm font-medium text-gray-900 break-all">
                    {product?._id || 'N/A'}
                  </p>
                </div>

              </div>
            </div>
          </section>

          {/* =================================================
              BACK TO SHOP
          ================================================= */}
          <div className="mt-12 text-center">
            <button
              onClick={() => router.push('/products')}
              className="
                inline-flex items-center gap-2
                text-sm font-medium
                text-gray-600
                hover:text-gray-900
                transition
              "
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 15.293a1 1 0 01-1.414 0L6.586 10l4.707-4.707a1 1 0 011.414 1.414L9.414 10l3.293 3.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>

              Continue Shopping
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
