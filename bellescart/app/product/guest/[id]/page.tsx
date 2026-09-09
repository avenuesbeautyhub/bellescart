'use client';

import React, { useMemo, useState } from 'react';
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
  [key: string]: any;
};

export default function GuestProductDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const productId = params?.id as string;

  const {
    data: productData,
    isLoading: loading,
    error,
  } = usePublicProduct(productId);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // ---------------------------------------------------------
  // Product
  // ---------------------------------------------------------

  const product = useMemo(() => {
    if (!productData?.data) return null;

    const productDataItem =
      productData.data.product ||
      productData.data.products?.[0] ||
      productData.data;

    if (!productDataItem || typeof productDataItem !== 'object') {
      return null;
    }

    if (
      '_id' in productDataItem &&
      'name' in productDataItem &&
      'price' in productDataItem
    ) {
      return productDataItem as Product;
    }

    return null;
  }, [productData]);

  // ---------------------------------------------------------
  // Product images
  // ---------------------------------------------------------

  const images = useMemo(() => {
    if (!product) return [];

    const productImages = product.images;

    if (
      productImages &&
      Array.isArray(productImages) &&
      productImages.length > 0
    ) {
      if (
        typeof productImages[0] === 'object' &&
        productImages[0] !== null
      ) {
        return (productImages as ProductImage[])
          .map((img) => img.url)
          .filter(Boolean);
      }

      return (productImages as string[]).filter(Boolean);
    }

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

    if (!originalPrice || originalPrice <= price) {
      return 0;
    }

    return Math.round(
      ((originalPrice - price) / originalPrice) * 100
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
  // Guest actions
  // ---------------------------------------------------------

  const handleLogin = () => {
    router.push('/login');
  };

  const handleSignup = () => {
    router.push('/signup');
  };

  // ---------------------------------------------------------
  // Loading
  // ---------------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col">
        <Navbar />

        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="animate-pulse">
              {/* Breadcrumb */}
              <div className="h-4 w-52 bg-gray-200 rounded-full mb-8" />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
                {/* Gallery */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="order-2 sm:order-1 flex sm:flex-col gap-3">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={index}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gray-200"
                      />
                    ))}
                  </div>

                  <div className="order-1 sm:order-2 flex-1">
                    <div className="aspect-square rounded-3xl bg-gray-200" />
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-6">
                  <div className="h-4 w-24 bg-gray-200 rounded-full" />
                  <div className="h-10 w-4/5 bg-gray-200 rounded-xl" />
                  <div className="h-8 w-40 bg-gray-200 rounded-lg" />

                  <div className="space-y-3 pt-3">
                    <div className="h-4 w-full bg-gray-200 rounded" />
                    <div className="h-4 w-5/6 bg-gray-200 rounded" />
                    <div className="h-4 w-4/6 bg-gray-200 rounded" />
                  </div>

                  <div className="h-14 w-full bg-gray-200 rounded-xl" />
                  <div className="h-14 w-full bg-gray-200 rounded-xl" />

                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-28 bg-gray-200 rounded-2xl" />
                    <div className="h-28 bg-gray-200 rounded-2xl" />
                    <div className="h-28 bg-gray-200 rounded-2xl" />
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

  // ---------------------------------------------------------
  // Error / not found
  // ---------------------------------------------------------

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col">
        <Navbar />

        <main className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center">
              <svg
                className="w-9 h-9 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M9 9l6 6M15 9l-6 6" />
              </svg>
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pink-600 mb-3">
              Product unavailable
            </p>

            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
              Product not found
            </h1>

            <p className="mt-3 text-sm sm:text-base leading-7 text-gray-500">
              Sorry, we couldn't find the product you're looking for.
              It may have been removed or is no longer available.
            </p>

            <button
              onClick={() => router.push('/products/guest')}
              className="
                mt-8
                inline-flex items-center justify-center gap-2
                px-6 py-3
                rounded-xl
                bg-gray-900
                text-white
                text-sm font-semibold
                hover:bg-gray-800
                transition-colors
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
        </main>

        <Footer />
      </div>
    );
  }

  const currentImage =
    images[selectedImage] || images[0] || null;

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900">
      <Navbar />

      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 lg:py-10">

          {/* =================================================
              BREADCRUMB
          ================================================= */}

          <nav
            aria-label="Breadcrumb"
            className="flex items-center flex-wrap gap-2 text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8"
          >
            <button
              onClick={() => router.push('/')}
              className="hover:text-gray-900 transition-colors"
            >
              Home
            </button>

            <span className="text-gray-300">/</span>

            <button
              onClick={() => router.push('/products/guest')}
              className="hover:text-gray-900 transition-colors"
            >
              Shop
            </button>

            {product.category?.name && (
              <>
                <span className="text-gray-300">/</span>
                <span className="text-gray-900 font-medium truncate max-w-[180px] sm:max-w-none">
                  {product.category.name}
                </span>
              </>
            )}
          </nav>

          {/* =================================================
              PRODUCT
          ================================================= */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">

            {/* =================================================
                IMAGE GALLERY
            ================================================= */}

            <section aria-label="Product images">
              <div className="flex flex-col sm:flex-row gap-4">

                {/* Thumbnails */}

                {images.length > 1 && (
                  <div
                    className="
                      order-2 sm:order-1
                      flex sm:flex-col
                      gap-3
                      overflow-x-auto sm:overflow-visible
                      pb-1 sm:pb-0
                      scrollbar-none
                    "
                  >
                    {images.map((image, index) => (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        onClick={() => setSelectedImage(index)}
                        aria-label={`View product image ${index + 1}`}
                        aria-current={
                          selectedImage === index
                            ? 'true'
                            : undefined
                        }
                        className={`
                          relative
                          flex-shrink-0
                          w-16 h-16
                          sm:w-20 sm:h-20
                          rounded-xl
                          overflow-hidden
                          bg-white
                          border-2
                          transition-all duration-200
                          focus:outline-none
                          focus-visible:ring-2
                          focus-visible:ring-pink-500
                          focus-visible:ring-offset-2
                          ${
                            selectedImage === index
                              ? 'border-gray-900 shadow-sm'
                              : 'border-gray-200 hover:border-gray-400'
                          }
                        `}
                      >
                        <img
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />

                        {selectedImage === index && (
                          <span className="absolute inset-0 ring-1 ring-inset ring-black/10" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Main image */}

                <div className="order-1 sm:order-2 flex-1 min-w-0">
                  <div
                    className="
                      relative
                      aspect-square
                      bg-white
                      rounded-2xl sm:rounded-3xl
                      overflow-hidden
                      border border-gray-100
                      shadow-[0_10px_40px_rgba(0,0,0,0.04)]
                    "
                  >
                    {/* Discount */}

                    {discountPercentage > 0 && (
                      <div className="absolute top-4 left-4 sm:top-5 sm:left-5 z-10">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-gray-900 text-white text-xs font-semibold shadow-sm">
                          {discountPercentage}% OFF
                        </span>
                      </div>
                    )}

                    {/* Wishlist */}

                    <button
                      type="button"
                      onClick={() =>
                        setIsWishlisted((current) => !current)
                      }
                      aria-label={
                        isWishlisted
                          ? 'Remove from wishlist'
                          : 'Add to wishlist'
                      }
                      aria-pressed={isWishlisted}
                      className="
                        absolute
                        top-4 right-4
                        sm:top-5 sm:right-5
                        z-10
                        w-10 h-10
                        sm:w-11 sm:h-11
                        rounded-full
                        bg-white/95
                        backdrop-blur
                        shadow-sm
                        border border-gray-100
                        flex items-center justify-center
                        hover:scale-105
                        hover:shadow-md
                        transition-all
                        focus:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-pink-500
                      "
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

                    {/* Image */}

                    {currentImage ? (
                      <img
                        src={currentImage}
                        alt={product.name}
                        className="
                          w-full h-full
                          object-cover
                          transition-transform duration-500
                          hover:scale-[1.02]
                        "
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50">
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
                          <circle
                            cx="8.5"
                            cy="8.5"
                            r="1.5"
                          />
                          <path d="m21 15-5-5L5 21" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                PRODUCT INFORMATION
            ================================================= */}

            <section className="lg:py-1">

              {/* Category */}

              {product.category?.name && (
                <div className="mb-3 sm:mb-4">
                  <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-pink-600">
                    {product.category.name}
                  </span>
                </div>
              )}

              {/* Name */}

              <h1 className="text-3xl sm:text-4xl xl:text-[3.2rem] font-semibold tracking-tight text-gray-900 leading-[1.1]">
                {product.name}
              </h1>

              {/* Price */}

              <div className="flex flex-wrap items-center gap-3 mt-5 sm:mt-7">
                <span className="text-3xl sm:text-4xl font-semibold text-gray-900">
                  ₹{product.price?.toLocaleString('en-IN') || '0'}
                </span>

                {product.originalPrice &&
                  product.originalPrice > product.price && (
                    <>
                      <span className="text-base sm:text-lg text-gray-400 line-through">
                        ₹
                        {product.originalPrice.toLocaleString(
                          'en-IN'
                        )}
                      </span>

                      <span className="px-2.5 py-1 rounded-lg bg-green-50 text-green-700 text-xs font-semibold">
                        Save {discountPercentage}%
                      </span>
                    </>
                  )}
              </div>

              <p className="mt-1 text-xs text-gray-400">
                Inclusive of all applicable taxes
              </p>

              <div className="my-6 sm:my-7 border-t border-gray-200" />

              {/* Description */}

              {product.description && (
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 mb-2.5">
                    Description
                  </h2>

                  <p className="text-sm sm:text-base text-gray-500 leading-7 whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Stock */}

              <div className="mt-6 sm:mt-7">
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
                <div className="mt-6 sm:mt-7">
                  <p className="text-sm font-semibold text-gray-900 mb-3">
                    Quantity
                  </p>

                  <div className="inline-flex items-center border border-gray-200 rounded-xl bg-white shadow-sm">
                    <button
                      type="button"
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                      className="
                        w-11 h-11
                        flex items-center justify-center
                        text-gray-600
                        hover:bg-gray-50
                        disabled:text-gray-300
                        transition-colors
                        rounded-l-xl
                        focus:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-inset
                        focus-visible:ring-pink-500
                      "
                    >
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M5 12h14" />
                      </svg>
                    </button>

                    <span
                      className="
                        w-12
                        text-center
                        text-sm
                        font-semibold
                        text-gray-900
                      "
                    >
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={increaseQuantity}
                      disabled={quantity >= stock}
                      aria-label="Increase quantity"
                      className="
                        w-11 h-11
                        flex items-center justify-center
                        text-gray-600
                        hover:bg-gray-50
                        disabled:text-gray-300
                        transition-colors
                        rounded-r-xl
                        focus:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-inset
                        focus-visible:ring-pink-500
                      "
                    >
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </button>
                  </div>

                  <p className="mt-2 text-xs text-gray-400">
                    Maximum {stock} available
                  </p>
                </div>
              )}

              {/* =================================================
                  GUEST CTA
              ================================================= */}

              <div className="mt-7 sm:mt-8">
                <div className="rounded-2xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-purple-50 p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white border border-pink-100 flex items-center justify-center shadow-sm">
                      <svg
                        className="w-5 h-5 text-pink-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                        <polyline points="10 17 15 12 10 7" />
                        <line
                          x1="15"
                          y1="12"
                          x2="3"
                          y2="12"
                        />
                      </svg>
                    </div>

                    <div>
                      <h2 className="text-sm sm:text-base font-semibold text-gray-900">
                        Ready to shop?
                      </h2>

                      <p className="mt-1 text-xs sm:text-sm leading-6 text-gray-500">
                        Sign in to continue with your purchase,
                        or create an account if you're new here.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handleLogin}
                      disabled={isOutOfStock}
                      className="
                        w-full
                        h-12 sm:h-13
                        rounded-xl
                        bg-gradient-to-r
                        from-pink-500
                        to-pink-600
                        text-white
                        font-semibold
                        text-sm
                        flex items-center justify-center gap-2
                        hover:from-pink-600
                        hover:to-pink-700
                        disabled:from-gray-300
                        disabled:to-gray-300
                        disabled:cursor-not-allowed
                        transition-all
                        shadow-sm
                        hover:shadow-md
                        focus:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-pink-500
                        focus-visible:ring-offset-2
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
                            <line
                              x1="15"
                              y1="12"
                              x2="3"
                              y2="12"
                            />
                          </svg>
                          Login to Continue
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleSignup}
                      disabled={isOutOfStock}
                      className="
                        w-full
                        h-12 sm:h-13
                        rounded-xl
                        border
                        border-gray-200
                        bg-white
                        text-gray-900
                        font-semibold
                        text-sm
                        hover:border-pink-300
                        hover:bg-pink-50
                        hover:text-pink-700
                        disabled:border-gray-200
                        disabled:text-gray-300
                        disabled:bg-gray-50
                        disabled:cursor-not-allowed
                        transition-all
                        focus:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-pink-500
                        focus-visible:ring-offset-2
                      "
                    >
                      Create Account
                    </button>
                  </div>
                </div>
              </div>

              {/* =================================================
                  SERVICE FEATURES
              ================================================= */}

              <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Delivery */}

                <div className="p-4 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 transition-colors">
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

                  <p className="mt-1 text-[11px] leading-5 text-gray-500">
                    Delivered safely to your doorstep
                  </p>
                </div>

                {/* Payment */}

                <div className="p-4 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 transition-colors">
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

                  <p className="mt-1 text-[11px] leading-5 text-gray-500">
                    Your payment information is protected
                  </p>
                </div>

                {/* Returns */}

                <div className="p-4 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 transition-colors">
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

                  <p className="mt-1 text-[11px] leading-5 text-gray-500">
                    Simple and hassle-free returns
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* =================================================
              PRODUCT INFORMATION
          ================================================= */}

          <section className="mt-14 sm:mt-20">
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 overflow-hidden">
              <div className="px-5 sm:px-8 py-5 sm:py-6 border-b border-gray-100">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Product Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                {/* Category */}

                <div className="p-5 sm:p-8">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-gray-400 font-semibold">
                    Category
                  </p>

                  <p className="mt-2 text-sm font-medium text-gray-900">
                    {product.category?.name || '—'}
                  </p>
                </div>

                {/* Availability */}

                <div className="p-5 sm:p-8">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-gray-400 font-semibold">
                    Availability
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isOutOfStock
                          ? 'bg-red-500'
                          : 'bg-green-500'
                      }`}
                    />

                    <p className="text-sm font-medium text-gray-900">
                      {isOutOfStock
                        ? 'Out of stock'
                        : 'Available'}
                    </p>
                  </div>
                </div>

                {/* Product ID */}

                <div className="p-5 sm:p-8">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-gray-400 font-semibold">
                    Product ID
                  </p>

                  <p className="mt-2 text-sm font-medium text-gray-900 break-all">
                    {product._id || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              BACK TO SHOP
          ================================================= */}

          <div className="mt-10 sm:mt-12 text-center">
            <button
              type="button"
              onClick={() => router.push('/products/guest')}
              className="
                inline-flex items-center gap-2
                px-4 py-2
                text-sm font-medium
                text-gray-600
                hover:text-gray-900
                hover:bg-white
                rounded-lg
                transition-all
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