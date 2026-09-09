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

  // ============================================================
  // DATA
  // ============================================================

  const {
    data: productData,
    isLoading: isLoadingProduct,
  } = useProduct(productId);

  const { data: cartData } = useCartQuery();

  const addToCartMutation = useAddToCart();
  const updateCartItemMutation = useUpdateCartItem();

  // ============================================================
  // STATE
  // ============================================================

  const [selectedImage, setSelectedImage] =
    useState<string | null>(null);

  const [quantity, setQuantity] = useState(1);

  // ============================================================
  // PRODUCT
  // ============================================================

  const product = useMemo(() => {
    if (!productData?.data) return null;

    const productDataItem =
      productData.data.product ||
      productData.data.products?.[0];

    return productDataItem || null;
  }, [productData]);

  // ============================================================
  // CART
  // ============================================================

  const cartItems = useMemo(() => {
    return cartData?.data?.items || [];
  }, [cartData]);

  const cartItem = useMemo(() => {
    if (!product) return null;

    return (
      cartItems.find((item: any) => {
        const productIdInCart =
          item.product?._id || item.productId;

        return productIdInCart === product._id;
      }) || null
    );
  }, [product, cartItems]);

  const isInCart = !!cartItem;

  const cartItemId = cartItem?._id || null;
  const cartQuantity = cartItem?.quantity || 0;

  // ============================================================
  // IMAGE
  // ============================================================

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

  // ============================================================
  // CART QUANTITY
  // ============================================================

  useEffect(() => {
    if (isInCart && cartQuantity > 0) {
      setQuantity(cartQuantity);
    } else {
      setQuantity(1);
    }
  }, [isInCart, cartQuantity]);

  // ============================================================
  // AUTH LOADING
  // ============================================================

  if (!loaded) {
    return (
      <div className="min-h-screen flex flex-col bg-[#faf9fb]">
        <Navbar />

        <div className="flex-1 flex items-center justify-center px-4">
          <Loader size="lg" text="Loading..." />
        </div>

        <Footer />
      </div>
    );
  }

  // ============================================================
  // GUEST REDIRECT
  // ============================================================

  if (!isAuthenticated) {
    return null;
  }

  // ============================================================
  // PRODUCT LOADING
  // ============================================================

  if (isLoadingProduct) {
    return (
      <div className="min-h-screen flex flex-col bg-[#faf9fb]">
        <Navbar />

        <div className="flex-1 flex items-center justify-center px-4">
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

  // ============================================================
  // PRODUCT NOT FOUND
  // ============================================================

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-[#faf9fb]">
        <Navbar />

        <main className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-md text-center">

            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
              <svg
                className="h-9 w-9 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-semibold text-gray-950">
              Product not found
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              The product you're looking for may no longer
              be available.
            </p>

            <button
              onClick={() => router.push('/products')}
              className="mt-6 rounded-xl bg-gray-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Back to products
            </button>

          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // ============================================================
  // PRODUCT CALCULATIONS
  // ============================================================

  const originalPrice = (product as any).originalPrice;

  const discountPercent = originalPrice
    ? Math.round(
        ((originalPrice - product.price) /
          originalPrice) *
          100
      )
    : 0;

  const isOutOfStock = product.quantity <= 0;

  const maxQuantity = Math.max(
    1,
    product.quantity || 1
  );

  const isCartUpdating =
    addToCartMutation.isPending ||
    updateCartItemMutation.isPending;

  /*
   * Important UX:
   *
   * Existing cart quantity = 1
   * Current quantity = 1
   * -> "In cart · 1"
   *
   * Existing cart quantity = 1
   * Current quantity = 2
   * -> "Update cart · 2"
   */
  const hasQuantityChanged =
    isInCart && quantity !== cartQuantity;

  // ============================================================
  // CART ACTION
  // ============================================================

  const handleAddToCart = async () => {
    if (!product || isOutOfStock) return;

    try {
      if (isInCart && cartItemId) {
        await updateCartItemMutation.mutateAsync({
          itemId: cartItemId,
          request: {
            quantity,
          },
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
      console.error(
        'Failed to add/update cart:',
        error
      );

      globalToast.cart.addFailed();
    }
  };

  // ============================================================
  // WISHLIST
  // ============================================================

  const handleAddToWishlist = () => {
    if (!product) return;

    console.log('Add to wishlist:', product);

    // TODO: Implement wishlist functionality
  };

  // ============================================================
  // QUANTITY
  // ============================================================

  const decreaseQuantity = () => {
    setQuantity((current) =>
      Math.max(1, current - 1)
    );
  };

  const increaseQuantity = () => {
    setQuantity((current) =>
      Math.min(maxQuantity, current + 1)
    );
  };

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9fb] text-gray-900">
      <Navbar />

      <main className="flex-1">

        {/* ======================================================
            ACCOUNT SHOPPING BAR
        ======================================================= */}

        <div className="border-b border-gray-100 bg-white">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">

            <div className="flex items-center justify-between py-3">

              <div className="flex min-w-0 items-center gap-2 text-xs sm:text-sm">

                <Link
                  href="/products"
                  className="font-medium text-gray-500 transition hover:text-pink-600"
                >
                  Products
                </Link>

                <span className="text-gray-300">
                  /
                </span>

                <span className="truncate font-medium text-gray-900">
                  {product.name}
                </span>

              </div>

              <Link
                href="/cart"
                className="hidden shrink-0 items-center gap-2 rounded-full bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-pink-50 hover:text-pink-600 sm:flex"
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
                    strokeWidth={1.8}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 100-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>

                View cart
              </Link>

            </div>

          </div>
        </div>

        {/* ======================================================
            MAIN PRODUCT
        ======================================================= */}

        <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(400px,1.05fr)] lg:gap-10 xl:gap-16">

            {/* ==================================================
                PRODUCT IMAGE
            =================================================== */}

            <section>

              <div className="lg:sticky lg:top-24">

                {/* Main image */}

                <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.03)]">

                  <div className="relative flex h-[360px] items-center justify-center bg-white sm:h-[420px] lg:h-[480px] xl:h-[500px]">

                    {selectedImage ? (
                      <img
                        src={selectedImage}
                        alt={product.name}
                        loading="eager"
                        className="h-full w-full object-contain p-5 sm:p-7 lg:p-8"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-50">
                        <svg
                          className="h-16 w-16 text-gray-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.3}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}

                    {/* Discount */}

                    {discountPercent > 0 && (
                      <div className="absolute left-4 top-4 sm:left-5 sm:top-5">
                        <span className="rounded-full bg-gray-950 px-3 py-1.5 text-xs font-bold text-white shadow-sm">
                          {discountPercent}% OFF
                        </span>
                      </div>
                    )}

                    {/* Cart status */}

                    {isInCart && (
                      <div className="absolute right-4 top-4 sm:right-5 sm:top-5">
                        <div className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-green-600 shadow-sm backdrop-blur">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          In your cart
                        </div>
                      </div>
                    )}

                  </div>

                </div>

                {/* ==================================================
                    IMAGE THUMBNAILS
                =================================================== */}

                {product.images &&
                  product.images.length > 1 && (
                    <div className="mt-4 flex gap-3 overflow-x-auto pb-1">

                      {product.images.map(
                        (
                          image: ProductImage,
                          index: number
                        ) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() =>
                              image.url &&
                              setSelectedImage(
                                image.url
                              )
                            }
                            className={`
                              h-[72px] w-[72px]
                              shrink-0 overflow-hidden
                              rounded-xl border-2 bg-white
                              transition-all duration-200
                              sm:h-20 sm:w-20
                              ${
                                selectedImage ===
                                image.url
                                  ? 'border-gray-950 shadow-sm'
                                  : 'border-gray-200 hover:border-gray-400'
                              }
                            `}
                          >
                            {image.url ? (
                              <img
                                src={image.url}
                                alt={
                                  image.alt ||
                                  product.name
                                }
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gray-50">
                                <span className="text-xs text-gray-400">
                                  Image
                                </span>
                              </div>
                            )}
                          </button>
                        )
                      )}

                    </div>
                  )}

              </div>

            </section>

            {/* ==================================================
                PRODUCT DETAILS
            =================================================== */}

            <section>

              <div className="lg:pt-2">

                {/* Category */}

                {product.category && (
                  <Link
                    href={`/products?category=${encodeURIComponent(
                      product.category.name.toLowerCase()
                    )}`}
                    className="inline-flex items-center rounded-full bg-pink-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-pink-600 transition hover:bg-pink-100"
                  >
                    {product.category.name}
                  </Link>
                )}

                {/* Product name */}

                <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-gray-950 sm:text-4xl lg:text-[40px]">
                  {product.name}
                </h1>

                {/* Brand */}

                {product.brand && (
                  <p className="mt-2 text-sm font-medium text-gray-400">
                    by{' '}
                    <span className="text-gray-700">
                      {product.brand}
                    </span>
                  </p>
                )}

                {/* Description */}

                {product.description && (
                  <p className="mt-5 max-w-2xl text-sm leading-7 text-gray-500 sm:text-base">
                    {product.description}
                  </p>
                )}

                {/* Divider */}

                <div className="my-6 h-px bg-gray-100 sm:my-7" />

                {/* ==================================================
                    PRICE
                =================================================== */}

                <div>

                  <div className="flex flex-wrap items-end gap-3">

                    <span className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
                      ₹{product.price}
                    </span>

                    {originalPrice && (
                      <span className="pb-1 text-lg text-gray-400 line-through">
                        ₹{originalPrice}
                      </span>
                    )}

                    {discountPercent > 0 && (
                      <span className="mb-1 rounded-md bg-green-50 px-2 py-1 text-xs font-bold text-green-600">
                        Save {discountPercent}%
                      </span>
                    )}

                  </div>

                  <p className="mt-2 text-xs text-gray-400">
                    Inclusive of applicable taxes
                  </p>

                </div>

                {/* ==================================================
                    STOCK
                =================================================== */}

                <div className="mt-5">

                  {isOutOfStock ? (
                    <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                      <span className="h-2 w-2 rounded-full bg-red-500" />

                      <span className="text-sm font-semibold text-red-600">
                        Currently unavailable
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-3">

                      <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

                        <span className="text-xs font-semibold text-green-700">
                          In stock
                        </span>
                      </div>

                      {product.quantity < 10 && (
                        <span className="text-xs font-medium text-amber-600">
                          Only {product.quantity}{' '}
                          left
                        </span>
                      )}

                    </div>
                  )}

                </div>

                {/* ==================================================
                    ALREADY IN CART
                =================================================== */}

                {isInCart && (
                  <div className="mt-5 rounded-2xl border border-green-100 bg-green-50/70 p-4">

                    <div className="flex items-center justify-between gap-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100">
                          <svg
                            className="h-4 w-4 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-green-800">
                            Already in your cart
                          </p>

                          <p className="text-xs text-green-600">
                            Quantity: {cartQuantity}
                          </p>
                        </div>

                      </div>

                      <Link
                        href="/cart"
                        className="shrink-0 text-xs font-bold text-green-700 underline underline-offset-2 transition hover:text-green-800"
                      >
                        View cart
                      </Link>

                    </div>

                  </div>
                )}

                {/* ==================================================
                    PURCHASE AREA
                =================================================== */}

                <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end">

                    {/* Quantity */}

                    <div className="sm:shrink-0">

                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400">
                        Quantity
                      </label>

                      <div className="flex h-12 items-center rounded-xl border border-gray-200 bg-gray-50">

                        <button
                          type="button"
                          onClick={decreaseQuantity}
                          disabled={
                            quantity <= 1 ||
                            isOutOfStock ||
                            isCartUpdating
                          }
                          className="flex h-full w-11 items-center justify-center text-lg font-medium text-gray-600 transition hover:bg-white hover:text-gray-950 disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>

                        <div className="flex h-full w-12 items-center justify-center border-x border-gray-200 bg-white text-sm font-semibold text-gray-950">
                          {quantity}
                        </div>

                        <button
                          type="button"
                          onClick={increaseQuantity}
                          disabled={
                            quantity >= maxQuantity ||
                            isOutOfStock ||
                            isCartUpdating
                          }
                          className="flex h-full w-11 items-center justify-center text-lg font-medium text-gray-600 transition hover:bg-white hover:text-gray-950 disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>

                      </div>

                    </div>

                    {/* Main cart action */}

                    <div className="min-w-0 flex-1">

                      <label className="mb-2 hidden text-xs font-bold uppercase tracking-wider text-gray-400 sm:block">
                        {isInCart
                          ? 'Your cart'
                          : 'Shopping'}
                      </label>

                      <Button
                        variant={
                          isInCart &&
                          !hasQuantityChanged
                            ? 'success'
                            : 'primary'
                        }
                        size="lg"
                        className="h-12 w-full rounded-xl text-sm font-semibold"
                        onClick={handleAddToCart}
                        disabled={
                          isOutOfStock ||
                          isCartUpdating ||
                          (isInCart &&
                            !hasQuantityChanged)
                        }
                      >
                        <div className="flex items-center justify-center gap-2">

                          {/* Updating */}

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
                                  strokeWidth="4"
                                />

                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>

                              Updating cart...
                            </>

                          /* Out of stock */

                          ) : isOutOfStock ? (
                            'Out of stock'

                          /* Existing cart but quantity changed */

                          ) : isInCart &&
                            hasQuantityChanged ? (
                            <>
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>

                              Update cart · {quantity}
                            </>

                          /* Existing cart, no changes */

                          ) : isInCart ? (
                            <>
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>

                              In cart · {cartQuantity}
                            </>

                          /* New product */

                          ) : (
                            <>
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 100-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                              </svg>

                              Add to cart
                            </>
                          )}

                        </div>
                      </Button>

                    </div>

                    {/* Wishlist */}

                    <button
                      type="button"
                      onClick={handleAddToWishlist}
                      aria-label="Add to wishlist"
                      className="flex h-12 w-full shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:border-pink-200 hover:bg-pink-50 hover:text-pink-600 sm:w-12"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"
                        />
                      </svg>

                      <span className="ml-2 text-xs font-semibold sm:hidden">
                        Wishlist
                      </span>
                    </button>

                  </div>

                  {/* Continue to cart */}

                  {isInCart && (
                    <Link
                      href="/cart"
                      className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 py-3 text-xs font-semibold text-gray-600 transition hover:bg-gray-100 hover:text-gray-950"
                    >
                      Continue to cart

                      <span>
                        →
                      </span>
                    </Link>
                  )}

                </div>

                {/* ==================================================
                    SHOPPING BENEFITS
                =================================================== */}

                <div className="mt-4 grid grid-cols-1 divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">

                  {/* Shipping */}

                  <div className="flex items-center gap-3 p-4 sm:block sm:p-5">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-50">
                      <svg
                        className="h-4 w-4 text-gray-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.7}
                          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8"
                        />
                      </svg>
                    </div>

                    <div className="sm:mt-3">
                      <p className="text-xs font-bold text-gray-900">
                        Free shipping
                      </p>

                      <p className="mt-0.5 text-[11px] text-gray-400">
                        On orders over ₹500
                      </p>
                    </div>

                  </div>

                  {/* Secure checkout */}

                  <div className="flex items-center gap-3 p-4 sm:block sm:p-5">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-50">
                      <svg
                        className="h-4 w-4 text-gray-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.7}
                          d="M12 15v2m-6 4h12a2 2 0 002-2V9a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2zm10-10V5a4 4 0 00-8 0v2h8z"
                        />
                      </svg>
                    </div>

                    <div className="sm:mt-3">
                      <p className="text-xs font-bold text-gray-900">
                        Secure checkout
                      </p>

                      <p className="mt-0.5 text-[11px] text-gray-400">
                        Protected payment
                      </p>
                    </div>

                  </div>

                  {/* Returns */}

                  <div className="flex items-center gap-3 p-4 sm:block sm:p-5">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-50">
                      <svg
                        className="h-4 w-4 text-gray-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.7}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 014.582 9M4.582 9H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2M19.419 15H15"
                        />
                      </svg>
                    </div>

                    <div className="sm:mt-3">
                      <p className="text-xs font-bold text-gray-900">
                        Easy returns
                      </p>

                      <p className="mt-0.5 text-[11px] text-gray-400">
                        30-day policy
                      </p>
                    </div>

                  </div>

                </div>

              </div>

            </section>

          </div>

        </div>

        {/* ======================================================
            CONTINUE SHOPPING
        ======================================================= */}

        <section className="border-t border-gray-100 bg-white">
          <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">

            <div className="flex flex-col gap-5 rounded-2xl bg-gray-950 px-6 py-7 text-white sm:flex-row sm:items-center sm:justify-between sm:px-8">

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-300">
                  Shopping with us
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  Find more pieces you'll love.
                </h2>
              </div>

              <Link
                href="/products"
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-gray-950 transition hover:bg-pink-50"
              >
                Continue shopping

                <span className="ml-2">
                  →
                </span>
              </Link>

            </div>

          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}