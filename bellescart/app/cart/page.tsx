'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import { useRequireUserAuth } from '@/auth/user';

import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import CartItem from '@/components/CartItem/CartItem';

import { useCart, useUpdateCartItem, useRemoveFromCart, useClearCart, useValidateStock } from '@/hooks/user/useCartQueries';
import { globalToast } from '@/utils/globalToast';
import { initializeCsrfToken } from '@/services/apiInterceptor';

export default function CartPage() {
  const { loaded, isAuthenticated } = useRequireUserAuth();

  // ============================================================
  // STATE
  // ============================================================

  const [updatingItemId, setUpdatingItemId] =
    useState<string | null>(null);

  const [stockValidation, setStockValidation] = useState<{
    valid: boolean;
    outOfStockItems: Array<{
      productId: string;
      productName: string;
      requestedQuantity: number;
      availableQuantity: number;
    }>;
    message: string;
  } | undefined>(undefined);

  const [isValidatingStock, setIsValidatingStock] =
    useState(false);

  // ============================================================
  // QUERIES / MUTATIONS
  // ============================================================

  const {
    data: cartData,
    isLoading,
  } = useCart();

  const updateCartItem = useUpdateCartItem();
  const removeFromCart = useRemoveFromCart();
  const clearCartMutation = useClearCart();
  const validateStockMutation = useValidateStock();

  // ============================================================
  // PROCESS CART DATA
  // ============================================================

  const cartItems = useMemo(() => {
    if (!cartData?.data?.items) return [];

    return cartData.data.items.map((item: any) => {
      /*
       * Some API responses return:
       *
       * {
       *   product: {...},
       *   quantity: 2
       * }
       *
       * while others may already be flattened.
       */

      if (item.product) {
        return {
          ...item,
          ...item.product,
          _id: item._id,
          cartQuantity: item.quantity,
          stock: item.product?.quantity || 0,
        };
      }

      return {
        ...item,
        cartQuantity: item.quantity,
        stock: item.quantity || 0,
      };
    });
  }, [cartData]);

  // ============================================================
  // VALIDATE STOCK
  // ============================================================

  const validateStock = async () => {
    try {
      setIsValidatingStock(true);

      const result =
        await validateStockMutation.mutateAsync();

      if (result.success && result.data) {
        setStockValidation(result.data);

        if (
          !result.data.valid &&
          result.data.outOfStockItems.length > 0
        ) {
          const outOfStockMessage =
            result.data.outOfStockItems
              .map(
                (item) =>
                  `${item.productName} (Requested: ${item.requestedQuantity}, Available: ${item.availableQuantity})`
              )
              .join(', ');

          globalToast.general.warning(
            'Stock Warning',
            `${result.data.message}. ${outOfStockMessage}`
          );
        }
      } else {
        setStockValidation(undefined);
      }
    } catch (error) {
      console.error(
        'Stock validation error:',
        error
      );

      setStockValidation(undefined);
    } finally {
      setIsValidatingStock(false);
    }
  };

  // ============================================================
  // AUTO VALIDATE WHEN CART LOADS
  // ============================================================

  useEffect(() => {
    if (
      cartData?.data?.items &&
      cartData.data.items.length > 0
    ) {
      validateStock();
    }
  }, [cartData]);

  // ============================================================
  // INITIALIZE CSRF TOKEN
  // ============================================================

  const [csrfInitialized, setCsrfInitialized] = useState(false);
  const [csrfError, setCsrfError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize CSRF token when cart page loads
    const initCsrf = async () => {
      try {
        console.log('[CART PAGE] Initializing CSRF token...');
        await initializeCsrfToken();
        console.log('[CART PAGE] CSRF token initialized successfully');
        setCsrfInitialized(true);
        setCsrfError(null);
      } catch (error) {
        console.error('[CART PAGE] Failed to initialize CSRF token:', error);
        setCsrfError('Failed to initialize security token. Some features may not work properly.');
        setCsrfInitialized(true); // Still set to true to avoid blocking UI
      }
    };
    
    initCsrf();
  }, []);

  // ============================================================
  // LOADING / AUTH
  // ============================================================

  if (!loaded) {
    return (
      <div className="min-h-screen bg-[#faf9fb]">
        <Loader
          size="lg"
          text="Loading..."
          fullScreen
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // ============================================================
  // INITIAL LOADING
  // ============================================================

  if (isLoading && !cartData) {
    return (
      <div className="min-h-screen flex flex-col bg-[#faf9fb]">
        <Navbar />

        <main className="flex-1">
          <div className="mx-auto max-w-[1380px] px-4 py-8 sm:px-6 lg:px-8">

            {/* Header skeleton */}

            <div className="mb-8">
              <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200" />

              <div className="mt-3 h-4 w-72 animate-pulse rounded bg-gray-200" />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">

              {/* Items */}

              <div className="space-y-3">

                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5"
                  >
                    <div className="flex gap-4">

                      <div className="h-24 w-24 shrink-0 animate-pulse rounded-xl bg-gray-200 sm:h-28 sm:w-28" />

                      <div className="flex-1 space-y-3">
                        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />

                        <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />

                        <div className="h-8 w-24 animate-pulse rounded-lg bg-gray-200" />
                      </div>

                    </div>
                  </div>
                ))}

              </div>

              {/* Summary */}

              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <div className="h-6 w-36 animate-pulse rounded bg-gray-200" />

                <div className="mt-6 space-y-4">
                  <div className="flex justify-between">
                    <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                    <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                  </div>

                  <div className="flex justify-between">
                    <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                    <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                  </div>

                  <div className="h-px bg-gray-200" />

                  <div className="flex justify-between">
                    <div className="h-5 w-16 animate-pulse rounded bg-gray-200" />
                    <div className="h-7 w-24 animate-pulse rounded bg-gray-200" />
                  </div>
                </div>

                <div className="mt-7 h-12 animate-pulse rounded-xl bg-gray-200" />
              </div>

            </div>

          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // ============================================================
  // UPDATE QUANTITY
  // ============================================================

  const handleUpdateQuantity = async (
    id: string,
    quantity: number
  ) => {
    if (updatingItemId) return;

    // Ensure CSRF token is initialized before making the request
    if (!csrfInitialized) {
      console.warn('[CART PAGE] CSRF token not initialized, waiting...');
      try {
        await initializeCsrfToken();
        console.log('[CART PAGE] CSRF token initialized before cart operation');
      } catch (error) {
        console.error('[CART PAGE] Failed to initialize CSRF token before cart operation:', error);
        globalToast.general.error('Security Error', 'Failed to initialize security token. Please refresh the page.');
        return;
      }
    }

    try {
      setUpdatingItemId(id);

      await updateCartItem.mutateAsync({
        itemId: id,
        request: {
          quantity,
        },
      });
    } catch (error) {
      console.error(
        '[CART PAGE] Failed to update quantity:',
        error
      );

      globalToast.cart.updateFailed();
    } finally {
      setUpdatingItemId(null);
    }
  };

  // ============================================================
  // REMOVE ITEM
  // ============================================================

  const handleRemove = async (id: string) => {
    // Ensure CSRF token is initialized before making the request
    if (!csrfInitialized) {
      console.warn('[CART PAGE] CSRF token not initialized, waiting...');
      try {
        await initializeCsrfToken();
        console.log('[CART PAGE] CSRF token initialized before cart operation');
      } catch (error) {
        console.error('[CART PAGE] Failed to initialize CSRF token before cart operation:', error);
        globalToast.general.error('Security Error', 'Failed to initialize security token. Please refresh the page.');
        return;
      }
    }

    try {
      await removeFromCart.mutateAsync(id);

      globalToast.cart.itemRemoved();

      await validateStock();
    } catch (error) {
      console.error(
        '[CART PAGE] Failed to remove item:',
        error
      );

      globalToast.cart.removeFailed();
    }
  };

  // ============================================================
  // TOTALS
  // ============================================================

  const total = cartItems.reduce(
    (sum, item) =>
      sum +
      ((item.product?.price ?? item.price) ?? 0) *
        (item.cartQuantity ??
          item.quantity ??
          0),
    0
  );

  const shipping = total > 50 ? 0 : 10;

  const grandTotal = total + shipping;

  // ============================================================
  // ITEM COUNT
  // ============================================================

  const totalQuantity = cartItems.reduce(
    (sum, item) =>
      sum +
      (item.cartQuantity ??
        item.quantity ??
        0),
    0
  );

  const hasStockIssue =
    stockValidation !== undefined &&
    !stockValidation.valid;

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9fb] text-gray-900">

      <Navbar />

      <main className="flex-1">

        {/* ======================================================
            TOP CART HEADER
        ======================================================= */}

        <div className="border-b border-gray-100 bg-white">
          <div className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">

            <div className="flex items-center justify-between py-4">

              <div className="min-w-0">

                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Link
                    href="/products"
                    className="transition hover:text-pink-600"
                  >
                    Products
                  </Link>

                  <span>/</span>

                  <span className="text-gray-600">
                    Cart
                  </span>
                </div>

                <div className="mt-1 flex items-baseline gap-3">

                  <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
                    Your cart
                  </h1>

                  {cartItems.length > 0 && (
                    <span className="text-sm font-medium text-gray-400">
                      {totalQuantity}{' '}
                      {totalQuantity === 1
                        ? 'item'
                        : 'items'}
                    </span>
                  )}

                </div>

              </div>

              <Link
                href="/products"
                className="hidden items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 sm:flex"
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>

                Continue shopping
              </Link>

            </div>

          </div>
        </div>

        {/* ======================================================
            CHECKOUT PROGRESS
        ======================================================= */}

        <div className="border-b border-gray-100 bg-white">
          <div className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">

            <div className="flex items-center justify-center py-5">

              {/* Cart */}

              <div className="flex items-center">

                <div className="flex items-center gap-2">

                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-950 text-xs font-bold text-white">
                    ✓
                  </div>

                  <span className="hidden text-xs font-bold text-gray-950 sm:block">
                    Cart
                  </span>

                </div>

                <div className="mx-3 h-px w-8 bg-gray-300 sm:mx-5 sm:w-16" />

              </div>

              {/* Checkout */}

              <div className="flex items-center">

                <div className="flex items-center gap-2">

                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-400">
                    2
                  </div>

                  <span className="hidden text-xs font-medium text-gray-400 sm:block">
                    Checkout
                  </span>

                </div>

                <div className="mx-3 h-px w-8 bg-gray-200 sm:mx-5 sm:w-16" />

              </div>

              {/* Payment */}

              <div className="flex items-center">

                <div className="flex items-center gap-2">

                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-400">
                    3
                  </div>

                  <span className="hidden text-xs font-medium text-gray-400 sm:block">
                    Payment
                  </span>

                </div>

                <div className="mx-3 h-px w-8 bg-gray-200 sm:mx-5 sm:w-16" />

              </div>

              {/* Complete */}

              <div className="flex items-center gap-2">

                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-400">
                  4
                </div>

                <span className="hidden text-xs font-medium text-gray-400 sm:block">
                  Complete
                </span>

              </div>

            </div>

          </div>
        </div>

        {/* ======================================================
            CONTENT
        ======================================================= */}

        <div className="mx-auto max-w-[1380px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">

          {/* ====================================================
              EMPTY CART
          ===================================================== */}

          {cartItems.length === 0 ? (

            <div className="mx-auto max-w-xl py-12 text-center sm:py-20">

              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-pink-50">

                <svg
                  className="h-11 w-11 text-pink-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 100-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>

              </div>

              <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-pink-500">
                Your shopping bag
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
                Your cart is empty
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
                You haven't added anything yet.
                Discover something you love and
                it will appear here.
              </p>

              <div className="mt-8">

                <Link href="/products">

                  <Button
                    size="lg"
                    className="rounded-xl px-7 shadow-lg shadow-pink-500/20"
                  >
                    <span className="flex items-center gap-2">

                      Explore products

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
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>

                    </span>
                  </Button>

                </Link>

              </div>

            </div>

          ) : (

            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px] xl:gap-8">

              {/* ==================================================
                  LEFT — CART ITEMS
              =================================================== */}

              <section className="min-w-0">

                {/* Items heading */}

                <div className="mb-4 flex items-center justify-between">

                  <div>

                    <h2 className="text-lg font-bold text-gray-950">
                      Cart items
                    </h2>

                    <p className="mt-0.5 text-xs text-gray-400">
                      Review your selection before checkout
                    </p>

                  </div>

                  {/* Clear cart */}

                  <button
                    type="button"
                    onClick={() => {
                      if (
                        confirm(
                          'Are you sure you want to clear your cart?'
                        )
                      ) {
                        clearCartMutation.mutateAsync();
                      }
                    }}
                    disabled={
                      clearCartMutation.isPending
                    }
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-gray-400 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>

                    <span className="hidden sm:inline">
                      {clearCartMutation.isPending
                        ? 'Clearing...'
                        : 'Clear cart'}
                    </span>

                  </button>

                </div>

                {/* ==================================================
                    CSRF ERROR WARNING
                =================================================== */}

                {csrfError && (
                  <div className="mb-4 overflow-hidden rounded-2xl border border-red-200 bg-red-50">

                    <div className="flex items-start gap-3 p-4">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100">

                        <svg
                          className="h-4 w-4 text-red-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>

                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="text-sm font-bold text-red-900">
                          Security Token Issue
                        </p>

                        <p className="mt-1 text-xs leading-5 text-red-800">
                          {csrfError}
                        </p>

                        <button
                          onClick={() => window.location.reload()}
                          className="mt-2 text-xs font-medium text-red-700 underline hover:text-red-900"
                        >
                          Refresh the page to fix this issue
                        </button>

                      </div>

                    </div>

                  </div>
                )}

                {/* ==================================================
                    STOCK WARNING
                =================================================== */}

                {hasStockIssue && (
                  <div className="mb-4 overflow-hidden rounded-2xl border border-amber-200 bg-amber-50">

                    <div className="flex items-start gap-3 p-4">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100">

                        <svg
                          className="h-4 w-4 text-amber-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"
                          />
                        </svg>

                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="text-sm font-bold text-amber-900">
                          Some items need your attention
                        </p>

                        <p className="mt-1 text-xs leading-5 text-amber-800">
                          {stockValidation?.message}
                        </p>

                        {stockValidation?.outOfStockItems?.map(
                          (item) => (
                            <div
                              key={item.productId}
                              className="mt-2 text-xs text-amber-800"
                            >
                              <span className="font-semibold">
                                {item.productName}
                              </span>{' '}
                              — requested{' '}
                              {item.requestedQuantity},
                              available{' '}
                              {item.availableQuantity}
                            </div>
                          )
                        )}

                        <p className="mt-2 text-xs font-medium text-amber-700">
                          Update or remove the affected
                          items before continuing.
                        </p>

                      </div>

                    </div>

                  </div>
                )}

                {/* ==================================================
                    CART ITEMS CONTAINER
                =================================================== */}

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">

                  <div className="divide-y divide-gray-100">

                    {cartItems.map((item) => (
                      <div
                        key={item._id}
                        className="p-4 sm:p-5"
                      >

                        <CartItem
                          item={item}
                          onUpdateQuantity={
                            handleUpdateQuantity
                          }
                          onRemove={handleRemove}
                          isUpdating={
                            updatingItemId === item._id
                          }
                          stockValidation={
                            stockValidation
                          }
                        />

                      </div>
                    ))}

                  </div>

                </div>

                {/* ==================================================
                    CONTINUE SHOPPING
                =================================================== */}

                <Link
                  href="/products"
                  className="mt-4 flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 transition hover:border-gray-300 hover:bg-gray-50 sm:p-5"
                >

                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">

                      <svg
                        className="h-4 w-4 text-gray-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>

                    </div>

                    <div>

                      <p className="text-sm font-semibold text-gray-900">
                        Continue shopping
                      </p>

                      <p className="mt-0.5 text-xs text-gray-400">
                        Discover more products
                      </p>

                    </div>

                  </div>

                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>

                </Link>

                {/* ==================================================
                    SECURITY NOTE
                =================================================== */}

                <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-400">

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
                      d="M12 15v2m-6 4h12a2 2 0 002-2V9a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2zm10-10V5a4 4 0 00-8 0v2h8z"
                    />
                  </svg>

                  <span>
                    Your cart is saved securely to your account
                  </span>

                </div>

              </section>

              {/* ==================================================
                  RIGHT — ORDER SUMMARY
              =================================================== */}

              <aside className="lg:sticky lg:top-24">

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">

                  {/* Summary heading */}

                  <div className="border-b border-gray-100 p-5 sm:p-6">

                    <div className="flex items-center justify-between">

                      <h2 className="text-lg font-bold text-gray-950">
                        Order summary
                      </h2>

                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-500">
                        {totalQuantity}{' '}
                        {totalQuantity === 1
                          ? 'item'
                          : 'items'}
                      </span>

                    </div>

                  </div>

                  {/* ==================================================
                      ITEMS MINI SUMMARY
                  =================================================== */}

                  <div className="max-h-64 overflow-y-auto border-b border-gray-100 px-5 py-4 sm:px-6">

                    <div className="space-y-4">

                      {cartItems.map((item) => {

                        const itemPrice =
                          (item.product?.price ??
                            item.price) ??
                          0;

                        const itemQuantity =
                          item.cartQuantity ??
                          item.quantity ??
                          0;

                        const itemTotal =
                          itemPrice *
                          itemQuantity;

                        return (
                          <div
                            key={item._id}
                            className="flex items-start gap-3"
                          >

                            {/* Image */}

                            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-50">

                              {item.product?.images?.[0]
                                ?.url ? (
                                <img
                                  src={
                                    item.product
                                      .images[0]
                                      .url
                                  }
                                  alt={
                                    item.product
                                      ?.name ??
                                    item.name
                                  }
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">

                                  <svg
                                    className="h-5 w-5 text-gray-300"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={1.5}
                                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>

                                </div>
                              )}

                            </div>

                            {/* Details */}

                            <div className="min-w-0 flex-1">

                              <p className="truncate text-xs font-semibold text-gray-900">
                                {item.product?.name ??
                                  item.name}
                              </p>

                              <p className="mt-1 text-[11px] text-gray-400">
                                Qty: {itemQuantity}
                              </p>

                            </div>

                            <span className="shrink-0 text-xs font-bold text-gray-900">
                              ₹
                              {itemTotal.toFixed(2)}
                            </span>

                          </div>
                        );
                      })}

                    </div>

                  </div>

                  {/* ==================================================
                      PRICE BREAKDOWN
                  =================================================== */}

                  <div className="p-5 sm:p-6">

                    <div className="space-y-3">

                      <div className="flex items-center justify-between text-sm">

                        <span className="text-gray-500">
                          Subtotal
                        </span>

                        <span className="font-semibold text-gray-900">
                          ₹{total.toFixed(2)}
                        </span>

                      </div>

                      <div className="flex items-center justify-between text-sm">

                        <span className="text-gray-500">
                          Shipping
                        </span>

                        <span className="font-semibold text-gray-900">

                          {shipping === 0 ? (
                            <span className="text-green-600">
                              Free
                            </span>
                          ) : (
                            `₹${shipping.toFixed(2)}`
                          )}

                        </span>

                      </div>

                    </div>

                    {/* Total */}

                    <div className="my-5 h-px bg-gray-200" />

                    <div className="flex items-end justify-between gap-4">

                      <div>

                        <p className="text-base font-bold text-gray-950">
                          Total
                        </p>

                        <p className="mt-1 text-[11px] text-gray-400">
                          Inclusive of applicable charges
                        </p>

                      </div>

                      <p className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
                        ₹{grandTotal.toFixed(2)}
                      </p>

                    </div>

                    {/* ==================================================
                        CHECKOUT
                    =================================================== */}

                    <div className="mt-6">

                      {hasStockIssue ? (

                        <div>

                          <Button
                            disabled
                            size="lg"
                            className="w-full cursor-not-allowed rounded-xl bg-gray-300 text-gray-500"
                          >
                            <span className="flex items-center justify-center gap-2">

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
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                              </svg>

                              Update cart to continue

                            </span>
                          </Button>

                          <p className="mt-2 text-center text-[11px] text-red-500">
                            Please resolve the stock
                            issue above.
                          </p>

                        </div>

                      ) : (

                        <Link
                          href="/checkout"
                          className="block"
                        >

                          <Button
                            size="lg"
                            className="w-full rounded-xl py-3.5 text-sm font-bold shadow-lg shadow-pink-500/20 transition-all hover:shadow-pink-500/30"
                          >

                            <span className="flex items-center justify-center gap-2">

                              Proceed to checkout

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
                                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                                />
                              </svg>

                            </span>

                          </Button>

                        </Link>

                      )}

                    </div>

                    {/* Payment reassurance */}

                    <div className="mt-5 border-t border-gray-100 pt-5">

                      <div className="flex items-center gap-3">

                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-50">

                          <svg
                            className="h-4 w-4 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.8}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>

                        </div>

                        <div>

                          <p className="text-xs font-semibold text-gray-800">
                            Secure checkout
                          </p>

                          <p className="mt-0.5 text-[11px] text-gray-400">
                            Your order is protected
                          </p>

                        </div>

                      </div>

                      <div className="mt-4 flex items-center gap-3">

                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink-50">

                          <svg
                            className="h-4 w-4 text-pink-600"
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

                        <div>

                          <p className="text-xs font-semibold text-gray-800">
                            Easy shopping
                          </p>

                          <p className="mt-0.5 text-[11px] text-gray-400">
                            Your cart is saved to your account
                          </p>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

                {/* ==================================================
                    SHIPPING MESSAGE
                =================================================== */}

                <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">

                  <div className="flex items-start gap-3">

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-50">

                      <svg
                        className="h-4 w-4 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.7}
                          d="M3 7h13v10H3V7zm13 5h3l2 2v3h-5v-5zM7 19a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4z"
                        />
                      </svg>

                    </div>

                    <div>

                      <p className="text-xs font-semibold text-gray-800">
                        Shipping calculated at checkout
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-gray-400">
                        Review your delivery details during
                        checkout before placing the order.
                      </p>

                    </div>

                  </div>

                </div>

              </aside>

            </div>

          )}

        </div>

      </main>

      {/* ========================================================
          MOBILE STICKY CHECKOUT
      ========================================================= */}

      {cartItems.length > 0 && !hasStockIssue && (
        <div className="sticky bottom-0 z-30 border-t border-gray-200 bg-white/95 p-3 backdrop-blur-md lg:hidden">

          <div className="mx-auto flex max-w-[1380px] items-center gap-3">

            <div className="min-w-0 flex-1">

              <p className="text-[11px] text-gray-400">
                Total
              </p>

              <p className="truncate text-lg font-bold text-gray-950">
                ₹{grandTotal.toFixed(2)}
              </p>

            </div>

            <Link
              href="/checkout"
              className="shrink-0"
            >

              <Button
                size="lg"
                className="rounded-xl px-6 shadow-lg shadow-pink-500/20"
              >
                Checkout
              </Button>

            </Link>

          </div>

        </div>
      )}

      <Footer />

    </div>
  );
}