'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';

import { ProductImage } from '@/utils/types';
import { useRequireUserAuth } from '@/auth/user';
import { globalToast } from '@/utils/globalToast';

import { useProduct } from '@/hooks/user/useProductQueries';
import {
  useCart as useCartQuery,
  useAddToCart,
  useUpdateCartItem,
} from '@/hooks/user/useCartQueries';

export default function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const productId = resolvedParams.id;

  const { loaded, isAuthenticated } = useRequireUserAuth();

  const {
    data: productData,
    isLoading: isLoadingProduct,
  } = useProduct(productId);

  const { data: cartData } = useCartQuery();

  const addToCartMutation = useAddToCart();
  const updateCartItemMutation = useUpdateCartItem();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const product = useMemo(() => {
    if (!productData?.data) return null;

    return (
      productData.data.product ||
      productData.data.products?.[0] ||
      null
    );
  }, [productData]);

  const cartItems = useMemo(
    () => cartData?.data?.items || [],
    [cartData]
  );

  const cartItem = useMemo(() => {
    if (!product) return null;

    return (
      cartItems.find((item: any) => {
        const productIdInCart = item.product?._id || item.productId;
        return productIdInCart === product._id;
      }) || null
    );
  }, [product, cartItems]);

  const isInCart = !!cartItem;
  const cartItemId = cartItem?._id || null;
  const cartQuantity = cartItem?.quantity || 0;

  useEffect(() => {
    if (!product) return;

    const mainImage =
      product.images?.find(
        (img: ProductImage) => img.isMain
      )?.url ||
      product.images?.[0]?.url ||
      null;

    setSelectedImage(mainImage);
  }, [product]);

  useEffect(() => {
    if (isInCart && cartQuantity > 0) {
      setQuantity(cartQuantity);
    } else {
      setQuantity(1);
    }
  }, [isInCart, cartQuantity]);

  if (!loaded) {
    return (
      <div className="min-h-screen bg-[#faf8f6]">
        <Navbar />
        <div className="flex min-h-[70vh] items-center justify-center px-4">
          <Loader size="lg" text="Loading..." />
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (isLoadingProduct) {
    return (
      <div className="min-h-screen bg-[#faf8f6]">
        <Navbar />
        <div className="flex min-h-[70vh] items-center justify-center px-4">
          <Loader
            size="lg"
            text="Preparing your product..."
            fullScreen
          />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#faf8f6]">
        <Navbar />
        <main className="flex min-h-[65vh] items-center justify-center px-6">
          <div className="max-w-md text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5">
              <svg
                className="h-8 w-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.4}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.24em] text-[#a45b70]">
              BellesCart
            </p>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
              Product not found
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              This piece may no longer be available.
            </p>

            <button
              onClick={() => router.push('/products')}
              className="mt-7 rounded-full bg-[#21151d] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#35232e]"
            >
              Browse collection
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const originalPrice = (product as any).originalPrice;

  const discountPercent = originalPrice
    ? Math.round(
        ((originalPrice - product.price) / originalPrice) * 100
      )
    : 0;

  const isOutOfStock = product.quantity <= 0;
  const maxQuantity = Math.max(1, product.quantity || 1);

  const isCartUpdating =
    addToCartMutation.isPending ||
    updateCartItemMutation.isPending;

  const hasQuantityChanged =
    isInCart && quantity !== cartQuantity;

  const images = (product.images || []).filter(
    (image: ProductImage) => !!image.url
  );

  const rating = (product as any).rating || 4;
  const reviewCount = (product as any).reviews || 12;

  const handleAddToCart = async () => {
    if (!product || isOutOfStock) return;

    try {
      if (isInCart && cartItemId) {
        await updateCartItemMutation.mutateAsync({
          itemId: cartItemId,
          request: { quantity },
        });

        globalToast.cart.quantityUpdated();
      } else {
        await addToCartMutation.mutateAsync({
          productId: product._id,
          quantity,
        });

        globalToast.cart.addSuccess();
      }
    } catch (error) {
      console.error('Failed to add/update cart:', error);
      globalToast.cart.addFailed();
    }
  };

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const increaseQuantity = () => {
    setQuantity((current) =>
      Math.min(maxQuantity, current + 1)
    );
  };

  const handleAddToWishlist = () => {
    console.log('Add to wishlist:', product);
  };

  return (
    <div className="min-h-screen bg-[#faf8f6] text-gray-900">
      <Navbar />

      {/* Breadcrumb */}
      <div className="border-b border-black/[0.055] bg-white">
        <div className="mx-auto flex max-w-[1480px] items-center justify-between px-4 py-3.5 sm:px-6 lg:px-10">
          <nav className="flex min-w-0 items-center gap-2 text-xs">
            <Link
              href="/products"
              className="shrink-0 font-medium text-gray-400 transition hover:text-[#a45b70]"
            >
              Shop
            </Link>

            <span className="text-gray-300">/</span>

            {product.category && (
              <>
                <Link
                  href={`/products?category=${encodeURIComponent(
                    product.category.name.toLowerCase()
                  )}`}
                  className="hidden shrink-0 font-medium text-gray-400 transition hover:text-[#a45b70] sm:inline"
                >
                  {product.category.name}
                </Link>
                <span className="hidden text-gray-300 sm:inline">/</span>
              </>
            )}

            <span className="truncate font-medium text-gray-800">
              {product.name}
            </span>
          </nav>

          <Link
            href="/cart"
            className="ml-4 hidden shrink-0 items-center gap-2 text-xs font-semibold text-gray-500 transition hover:text-[#a45b70] sm:flex"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.7}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 100-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Cart
          </Link>
        </div>
      </div>

      <main>
        <div className="mx-auto max-w-[1480px] px-4 py-5 sm:px-6 sm:py-9 lg:px-10 lg:py-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(420px,0.92fr)] lg:gap-12 xl:gap-20">
            {/* =====================================================
                GALLERY
            ====================================================== */}
            <section className="min-w-0">
              <div className="lg:sticky lg:top-24">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[88px_minmax(0,1fr)]">
                  {/* Vertical thumbnails */}
                  {images.length > 1 && (
                    <div className="order-2 flex gap-2 overflow-x-auto sm:order-1 sm:flex-col sm:overflow-visible">
                      {images.map(
                        (image: ProductImage, index: number) => (
                          <button
                            key={`${image.url}-${index}`}
                            type="button"
                            onClick={() =>
                              setSelectedImage(image.url)
                            }
                            aria-label={`View image ${index + 1}`}
                            className={`
                              relative h-[70px] w-[70px]
                              shrink-0 overflow-hidden rounded-[15px]
                              bg-[#f1eeeb]
                              transition-all duration-200
                              sm:h-[82px] sm:w-[82px]
                              ${
                                selectedImage === image.url
                                  ? 'ring-2 ring-[#21151d] ring-offset-2'
                                  : 'opacity-65 hover:opacity-100'
                              }
                            `}
                          >
                            <img
                              src={image.url}
                              alt={image.alt || product.name}
                              className="h-full w-full object-cover"
                            />
                          </button>
                        )
                      )}
                    </div>
                  )}

                  {/* Main image */}
                  <div className="relative order-1 overflow-hidden rounded-[28px] bg-[#f0ede9] sm:order-2">
                    <div className="relative aspect-[0.9] w-full">
                      {selectedImage ? (
                        <img
                          src={selectedImage}
                          alt={product.name}
                          loading="eager"
                          className="h-full w-full object-contain p-5 sm:p-8 lg:p-10 xl:p-14"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <svg
                            className="h-16 w-16 text-gray-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}

                      {/* Floating wishlist */}
                      <button
                        type="button"
                        onClick={handleAddToWishlist}
                        aria-label="Add to wishlist"
                        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-sm backdrop-blur-md transition hover:scale-105 hover:text-[#a45b70] sm:right-5 sm:top-5"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeWidth="1.5"
                            d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"
                          />
                        </svg>
                      </button>

                      {/* Image labels */}
                      <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 sm:bottom-5 sm:left-5">
                        {discountPercent > 0 && (
                          <span className="rounded-full bg-[#21151d] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white shadow-sm">
                            {discountPercent}% off
                          </span>
                        )}

                        {isInCart && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/92 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-700 shadow-sm backdrop-blur">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            In cart
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* =====================================================
                DETAILS
            ====================================================== */}
            <section className="min-w-0">
              <div className="lg:pt-3">
                {product.category && (
                  <Link
                    href={`/products?category=${encodeURIComponent(
                      product.category.name.toLowerCase()
                    )}`}
                    className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#a45b70] transition hover:text-[#8e4058]"
                  >
                    {product.category.name}
                  </Link>
                )}

                <h1 className="mt-3 max-w-2xl text-[31px] font-semibold leading-[1.1] tracking-[-0.04em] text-gray-950 sm:text-4xl lg:text-[48px]">
                  {product.name}
                </h1>

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                  {product.brand && (
                    <span className="text-sm text-gray-500">
                      by{' '}
                      <span className="font-semibold text-gray-800">
                        {product.brand}
                      </span>
                    </span>
                  )}

                  {product.brand && (
                    <span className="hidden h-1 w-1 rounded-full bg-gray-300 sm:block" />
                  )}

                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, index) => (
                        <svg
                          key={index}
                          className={`h-3.5 w-3.5 ${
                            index < rating
                              ? 'text-[#bd9250]'
                              : 'text-gray-200'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">
                      {reviewCount} reviews
                    </span>
                  </div>
                </div>

                {product.description && (
                  <p className="mt-6 max-w-xl text-[14px] leading-7 text-gray-500 sm:text-[15px]">
                    {product.description}
                  </p>
                )}

                <div className="my-7 h-px bg-gray-200/80" />

                {/* Price */}
                <div>
                  <div className="flex flex-wrap items-end gap-3">
                    <span className="text-[33px] font-semibold tracking-[-0.04em] text-gray-950 sm:text-[39px]">
                      ₹{product.price}
                    </span>

                    {originalPrice && (
                      <span className="pb-1 text-base text-gray-400 line-through">
                        ₹{originalPrice}
                      </span>
                    )}

                    {discountPercent > 0 && (
                      <span className="mb-1 rounded-full bg-[#f6e9ed] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#a45b70]">
                        Save {discountPercent}%
                      </span>
                    )}
                  </div>

                  <p className="mt-1.5 text-[11px] text-gray-400">
                    Inclusive of applicable taxes
                  </p>
                </div>

                {/* Availability */}
                <div className="mt-6">
                  {isOutOfStock ? (
                    <div className="flex items-center gap-2.5 rounded-2xl bg-red-50 px-4 py-3">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      <span className="text-xs font-semibold text-red-700">
                        Currently unavailable
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        In stock
                      </span>

                      {product.quantity < 10 && (
                        <span className="text-xs font-medium text-amber-600">
                          Only {product.quantity} left
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Purchase */}
                <div className="mt-7 rounded-[25px] bg-white p-4 shadow-[0_16px_50px_rgba(35,20,28,0.055)] ring-1 ring-black/[0.055] sm:p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                        Quantity
                      </p>
                      {isInCart && (
                        <p className="mt-1 text-[11px] text-emerald-600">
                          {cartQuantity} currently in cart
                        </p>
                      )}
                    </div>

                    {isInCart && (
                      <Link
                        href="/cart"
                        className="text-xs font-semibold text-[#a45b70] hover:underline"
                      >
                        View cart
                      </Link>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-[auto_minmax(0,1fr)_48px] gap-3">
                    <div className="flex h-12 items-center rounded-full bg-[#faf8f6] ring-1 ring-black/[0.07]">
                      <button
                        type="button"
                        onClick={decreaseQuantity}
                        disabled={
                          quantity <= 1 ||
                          isOutOfStock ||
                          isCartUpdating
                        }
                        className="flex h-full w-10 items-center justify-center text-lg text-gray-500 transition hover:text-gray-950 disabled:opacity-25"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>

                      <span className="flex h-full w-9 items-center justify-center border-x border-gray-200 text-sm font-semibold text-gray-950">
                        {quantity}
                      </span>

                      <button
                        type="button"
                        onClick={increaseQuantity}
                        disabled={
                          quantity >= maxQuantity ||
                          isOutOfStock ||
                          isCartUpdating
                        }
                        className="flex h-full w-10 items-center justify-center text-lg text-gray-500 transition hover:text-gray-950 disabled:opacity-25"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <Button
                      variant={
                        isInCart && !hasQuantityChanged
                          ? 'success'
                          : 'primary'
                      }
                      size="lg"
                      className="h-12 w-full rounded-full text-sm font-semibold"
                      onClick={handleAddToCart}
                      disabled={
                        isOutOfStock ||
                        isCartUpdating ||
                        (isInCart && !hasQuantityChanged)
                      }
                    >
                      <div className="flex items-center justify-center gap-2">
                        {isCartUpdating ? (
                          <>
                            <svg
                              className="h-4 w-4 animate-spin"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="3"
                              />
                              <path
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"
                              />
                            </svg>
                            Updating...
                          </>
                        ) : isOutOfStock ? (
                          'Out of stock'
                        ) : isInCart && hasQuantityChanged ? (
                          `Update cart · ${quantity}`
                        ) : isInCart ? (
                          <>
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            In cart · {cartQuantity}
                          </>
                        ) : (
                          <>
                            Add to cart
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeWidth="1.8"
                                d="M12 5v14M5 12h14"
                              />
                            </svg>
                          </>
                        )}
                      </div>
                    </Button>

                    <button
                      type="button"
                      onClick={handleAddToWishlist}
                      aria-label="Add to wishlist"
                      className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:border-[#e8cbd4] hover:bg-[#fcf5f7] hover:text-[#a45b70]"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeWidth="1.5"
                          d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"
                        />
                      </svg>
                    </button>
                  </div>

                  {isInCart && (
                    <Link
                      href="/cart"
                      className="mt-3 flex items-center justify-center gap-2 rounded-full bg-[#faf8f6] py-3 text-xs font-semibold text-gray-600 transition hover:bg-gray-100 hover:text-gray-950"
                    >
                      Continue to cart
                      <span>→</span>
                    </Link>
                  )}
                </div>

                {/* Benefits */}
                <div className="mt-5 grid grid-cols-3 divide-x divide-gray-200 rounded-[22px] bg-white ring-1 ring-black/[0.055]">
                  <Benefit
                    icon={
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8"
                        />
                      </svg>
                    }
                    title="Free shipping"
                    subtitle="Over ₹500"
                  />

                  <Benefit
                    icon={
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 15v2m-6 4h12a2 2 0 002-2V9a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2zm10-10V5a4 4 0 00-8 0v2h8z"
                        />
                      </svg>
                    }
                    title="Secure checkout"
                    subtitle="Protected payment"
                  />

                  <Benefit
                    icon={
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 014.582 9M4.582 9H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2M19.419 15H15"
                        />
                      </svg>
                    }
                    title="Easy returns"
                    subtitle="30-day policy"
                  />
                </div>

                {/* Product details */}
                <div className="mt-8 border-t border-gray-200/80 pt-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                    Product details
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3">
                    {product.brand && (
                      <Detail label="Brand" value={product.brand} />
                    )}

                    {product.category && (
                      <Detail
                        label="Category"
                        value={product.category.name}
                      />
                    )}

                    <Detail
                      label="Availability"
                      value={
                        isOutOfStock ? 'Unavailable' : 'In stock'
                      }
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Editorial continuation */}
        <section className="border-t border-black/[0.055] bg-white">
          <div className="mx-auto max-w-[1480px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
            <div className="relative overflow-hidden rounded-[28px] bg-[#21151d] px-6 py-8 text-white sm:px-10 sm:py-10">
              <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#e5b5c3]">
                    BellesCart collection
                  </p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
                    Discover something beautiful.
                  </h2>
                  <p className="mt-1.5 max-w-md text-sm text-white/55">
                    Explore more carefully selected pieces from our
                    collection.
                  </p>
                </div>

                <Link
                  href="/products"
                  className="inline-flex shrink-0 items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-950 transition hover:bg-[#f9e8ed]"
                >
                  Continue shopping
                  <span className="ml-2">→</span>
                </Link>
              </div>

              <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border border-white/10" />
              <div className="pointer-events-none absolute -bottom-28 right-20 h-64 w-64 rounded-full border border-white/5" />
            </div>
          </div>
        </section>
      </main>

      {/* Mobile purchase bar */}
      {!isOutOfStock && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-white/95 p-3 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] backdrop-blur-md sm:hidden">
          <div className="flex items-center gap-3">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-gray-900">
                ₹{product.price}
              </p>
              <p className="text-[9px] text-gray-400">
                {quantity} {quantity === 1 ? 'item' : 'items'}
              </p>
            </div>

            <Button
              variant={
                isInCart && !hasQuantityChanged
                  ? 'success'
                  : 'primary'
              }
              className="h-11 flex-1 rounded-full text-sm font-semibold"
              onClick={handleAddToCart}
              disabled={
                isCartUpdating ||
                (isInCart && !hasQuantityChanged)
              }
            >
              {isCartUpdating
                ? 'Updating...'
                : isInCart && hasQuantityChanged
                ? `Update cart · ${quantity}`
                : isInCart
                ? `In cart · ${cartQuantity}`
                : 'Add to cart'}
            </Button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

function Benefit({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="px-2 py-4 text-center sm:px-4 sm:py-5">
      <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#faf8f6] text-gray-700">
        {icon}
      </div>

      <p className="mt-2.5 text-[9px] font-bold text-gray-900 sm:text-[10px]">
        {title}
      </p>

      <p className="mt-0.5 hidden text-[9px] text-gray-400 sm:block">
        {subtitle}
      </p>
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-gray-400">
        {label}
      </p>
      <p className="mt-1 text-xs font-semibold text-gray-800">
        {value}
      </p>
    </div>
  );
}
