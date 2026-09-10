'use client';

import React, {
  useEffect,
  useState,
  Suspense,
} from 'react';

import Link from 'next/link';

import {
  useRouter,
  useSearchParams,
} from 'next/navigation';

import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';

import { useRequireUserAuth } from '@/auth/user';
import { useOrder } from '@/hooks/user/useOrderQueries';

function OrderConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderId =
    searchParams.get('orderId');

  const {
    data: orderData,
    isLoading,
  } = useOrder(orderId || '');

  const [showConfetti, setShowConfetti] =
    useState(true);

  const [countdown, setCountdown] =
    useState(6);

  // ============================================================
  // REDIRECT IF ORDER ID IS MISSING
  // ============================================================

  useEffect(() => {
    if (!orderId) {
      router.push('/orders');
    }
  }, [orderId, router]);

  // ============================================================
  // CONFETTI
  // ============================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  // ============================================================
  // COUNTDOWN
  // ============================================================

  useEffect(() => {
    const countdownTimer =
      setInterval(() => {
        setCountdown((prev) =>
          Math.max(0, prev - 1)
        );
      }, 1000);

    return () =>
      clearInterval(countdownTimer);
  }, []);

  // ============================================================
  // AUTO REDIRECT
  // ============================================================

  useEffect(() => {
    if (countdown === 0) {
      router.push('/orders');
    }
  }, [countdown, router]);

  // ============================================================
  // ORDER DATA
  // ============================================================

  const order = React.useMemo(() => {
    if (!orderData?.data) {
      return null;
    }

    return (
      orderData.data.order || null
    );
  }, [orderData]);

  // ============================================================
  // LOADING
  // ============================================================

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#faf9fb]">

        <Navbar />

        <main className="flex-1 flex items-center justify-center px-4">

          <div className="text-center">

            <Loader
              size="lg"
              text="Loading order details..."
            />

          </div>

        </main>

        <Footer />

      </div>
    );
  }

  if (!order) {
    return null;
  }

  // ============================================================
  // HELPERS
  // ============================================================

  const formatDate = (
    dateString: string
  ) => {
    if (!dateString) {
      return 'N/A';
    }

    const date = new Date(
      dateString
    );

    return date.toLocaleDateString(
      'en-US',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    );
  };

  const formatAddress = (
    address: any
  ) => {
    if (!address) {
      return 'N/A';
    }

    if (typeof address === 'string') {
      return address;
    }

    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`;
  };

  const formattedPaymentMethod =
    order.paymentMethod
      ?.replace('_', ' ')
      ?.replace(
        /\b\w/g,
        (char: string) =>
          char.toUpperCase()
      );

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9fb] text-gray-900">

      {/* ========================================================
          LIGHT CONFETTI
      ========================================================= */}

      {showConfetti && (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">

          {[...Array(32)].map(
            (_, index) => (
              <span
                key={index}
                className="absolute animate-order-confetti h-1.5 w-1.5 rounded-full opacity-70"
                style={{
                  left: `${(index * 31) % 100}%`,
                  top: `${-5 - (index % 10)}%`,
                  animationDelay: `${(index % 8) * 0.12}s`,
                  animationDuration: `${
                    2.8 + (index % 4) * 0.4
                  }s`,
                }}
              />
            )
          )}

        </div>
      )}

      <Navbar />

      <main className="flex-1">

        {/* ======================================================
            SUCCESS HERO
        ======================================================= */}

        <section className="border-b border-gray-100 bg-white">

          <div className="mx-auto max-w-5xl px-4 py-10 text-center sm:px-6 sm:py-14 lg:px-8">

            {/* Success icon */}

            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-50">

              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 shadow-lg shadow-green-500/20">

                <svg
                  className="h-7 w-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>

              </div>

            </div>

            <div className="mx-auto max-w-2xl">

              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-green-600">
                Order confirmed
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl lg:text-5xl">
                Thank you for your order!
              </h1>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
                Your order has been placed successfully.
                We’ll take care of the next steps and
                arrange your delivery.
              </p>

            </div>

            {/* Order number */}

            <div className="mx-auto mt-7 flex w-fit max-w-full flex-col items-center rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 sm:flex-row sm:gap-4">

              <div className="flex items-center gap-2">

                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Order number
                </span>

                <span className="hidden text-gray-300 sm:inline">
                  •
                </span>

              </div>

              <span className="break-all text-sm font-bold text-gray-900">
                {order.orderNumber}
              </span>

            </div>

            {/* Countdown */}

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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>

              <span>
                Returning to your orders in{' '}
                <strong className="text-gray-700">
                  {countdown}s
                </strong>
              </span>

            </div>

          </div>

        </section>

        {/* ======================================================
            CONTENT
        ======================================================= */}

        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

          {/* ====================================================
              ORDER STATUS
          ===================================================== */}

          <section className="mb-5 rounded-2xl border border-gray-200 bg-white">

            <div className="px-5 py-5 sm:px-6">

              <div className="flex items-center justify-between gap-4">

                <div>

                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Order status
                  </p>

                  <div className="mt-1 flex items-center gap-2">

                    <span className="h-2 w-2 rounded-full bg-green-500" />

                    <span className="text-sm font-bold capitalize text-gray-900">
                      {order.status}
                    </span>

                  </div>

                </div>

                <div className="rounded-xl bg-green-50 px-3 py-2 text-right">

                  <p className="text-[9px] font-bold uppercase tracking-wider text-green-600">
                    Payment
                  </p>

                  <p className="mt-0.5 text-xs font-bold capitalize text-green-800">
                    {formattedPaymentMethod}
                  </p>

                </div>

              </div>

              {/* Progress */}

              <div className="mt-6">

                <div className="relative flex items-center justify-between">

                  <div className="absolute left-0 right-0 top-3 h-px bg-gray-200" />

                  <div className="absolute left-0 top-3 h-px w-[15%] bg-green-500" />

                  {/* Step 1 */}

                  <div className="relative z-10 flex flex-col items-start">

                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white">

                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>

                    </div>

                    <span className="mt-2 text-[10px] font-semibold text-gray-700">
                      Placed
                    </span>

                  </div>

                  {/* Step 2 */}

                  <div className="relative z-10 flex flex-col items-center">

                    <div className="h-6 w-6 rounded-full border-2 border-gray-200 bg-white" />

                    <span className="mt-2 text-[10px] font-medium text-gray-400">
                      Processing
                    </span>

                  </div>

                  {/* Step 3 */}

                  <div className="relative z-10 flex flex-col items-center">

                    <div className="h-6 w-6 rounded-full border-2 border-gray-200 bg-white" />

                    <span className="mt-2 text-[10px] font-medium text-gray-400">
                      Shipped
                    </span>

                  </div>

                  {/* Step 4 */}

                  <div className="relative z-10 flex flex-col items-end">

                    <div className="h-6 w-6 rounded-full border-2 border-gray-200 bg-white" />

                    <span className="mt-2 text-[10px] font-medium text-gray-400">
                      Delivered
                    </span>

                  </div>

                </div>

              </div>

            </div>

          </section>

          {/* ====================================================
              ORDER DETAILS
          ===================================================== */}

          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">

            {/* Header */}

            <div className="border-b border-gray-100 px-5 py-4 sm:px-6">

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <h2 className="text-base font-bold text-gray-950">
                    Order details
                  </h2>

                  <p className="mt-0.5 text-xs text-gray-400">
                    Placed on{' '}
                    {formatDate(
                      order.createdAt
                    )}
                  </p>

                </div>

                <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-[10px] font-semibold text-gray-600">
                  {order.items?.length || 0}{' '}
                  {order.items?.length === 1
                    ? 'item'
                    : 'items'}
                </span>

              </div>

            </div>

            {/* ==================================================
                ITEMS
            =================================================== */}

            <div className="px-5 py-5 sm:px-6">

              <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Your items
              </p>

              <div className="divide-y divide-gray-100">

                {order.items?.map(
                  (
                    item: any,
                    index: number
                  ) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 py-4 first:pt-0 last:pb-0 sm:gap-4"
                    >

                      {/* Product image / placeholder */}

                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100 sm:h-20 sm:w-20">

                        {item.product
                          ?.images?.[0]
                          ?.url ? (
                          <img
                            src={
                              item.product
                                .images[0]
                                .url
                            }
                            alt={
                              item.product
                                ?.name ||
                              'Product'
                            }
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <svg
                            className="h-6 w-6 text-gray-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                            />
                          </svg>
                        )}

                      </div>

                      {/* Details */}

                      <div className="min-w-0 flex-1">

                        <p className="line-clamp-2 text-sm font-semibold text-gray-900">
                          {item.product
                            ?.name ||
                            'Product'}
                        </p>

                        <div className="mt-1.5 flex flex-wrap items-center gap-2">

                          <span className="text-xs text-gray-400">
                            Qty {item.quantity}
                          </span>

                          {item.price !==
                            undefined && (
                            <>
                              <span className="text-gray-300">
                                •
                              </span>

                              <span className="text-xs text-gray-400">
                                ₹
                                {item.price?.toFixed(
                                  2
                                )}{' '}
                                each
                              </span>
                            </>
                          )}

                        </div>

                      </div>

                      {/* Price */}

                      <div className="shrink-0 text-right">

                        <p className="text-sm font-bold text-gray-900 sm:text-base">
                          ₹
                          {item.total?.toFixed(
                            2
                          ) ||
                            '0.00'}
                        </p>

                      </div>

                    </div>
                  )
                )}

              </div>

            </div>

            {/* ==================================================
                SUMMARY + ADDRESS
            =================================================== */}

            <div className="grid grid-cols-1 border-t border-gray-100 md:grid-cols-2">

              {/* Address */}

              <div className="border-b border-gray-100 p-5 md:border-b-0 md:border-r sm:p-6">

                <div className="flex items-center gap-2">

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">

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
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.7}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>

                  </div>

                  <div>

                    <p className="text-sm font-bold text-gray-900">
                      Delivery address
                    </p>

                    <p className="text-[10px] text-gray-400">
                      Shipping destination
                    </p>

                  </div>

                </div>

                <div className="mt-4 rounded-xl bg-gray-50 p-4">

                  <p className="text-sm leading-6 text-gray-700">
                    {formatAddress(
                      order.shippingAddress
                    )}
                  </p>

                </div>

                <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-400">

                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.7}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m-8-4V7m8 4v10M4 7v10l8 4"
                    />
                  </svg>

                  Standard shipping

                </div>

              </div>

              {/* Price Summary */}

              <div className="p-5 sm:p-6">

                <div className="flex items-center gap-2">

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-50">

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
                        d="M9 14l6-6m-5.5-.5h.01M14.5 14.5h.01M19 5H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2z"
                      />
                    </svg>

                  </div>

                  <div>

                    <p className="text-sm font-bold text-gray-900">
                      Payment summary
                    </p>

                    <p className="text-[10px] text-gray-400">
                      Order total
                    </p>

                  </div>

                </div>

                <div className="mt-4 space-y-3">

                  <div className="flex justify-between text-sm">

                    <span className="text-gray-500">
                      Subtotal
                    </span>

                    <span className="font-semibold text-gray-900">
                      ₹
                      {order.subtotal?.toFixed(
                        2
                      ) || '0.00'}
                    </span>

                  </div>

                  <div className="flex justify-between text-sm">

                    <span className="text-gray-500">
                      Shipping
                    </span>

                    <span className="font-semibold text-gray-900">

                      ₹
                      {order.shipping?.toFixed(
                        2
                      ) || '0.00'}

                      {order.shipping ===
                        0 && (
                        <span className="ml-1.5 text-xs font-bold text-green-600">
                          Free
                        </span>
                      )}

                    </span>

                  </div>

                  {order.coupon && (
                    <div className="flex justify-between text-sm">

                      <span className="text-gray-500">
                        Discount
                      </span>

                      <span className="font-semibold text-green-600">
                        -₹
                        {order.discountAmount?.toFixed(
                          2
                        ) || '0.00'}
                      </span>

                    </div>
                  )}

                </div>

                <div className="my-4 h-px bg-gray-200" />

                <div className="flex items-end justify-between gap-3">

                  <div>

                    <p className="text-sm font-bold text-gray-900">
                      Total paid
                    </p>

                    <p className="mt-0.5 text-[10px] text-gray-400">
                      Including applicable charges
                    </p>

                  </div>

                  <p className="text-2xl font-bold tracking-tight text-pink-600">
                    ₹
                    {order.total?.toFixed(
                      2
                    ) || '0.00'}
                  </p>

                </div>

              </div>

            </div>

          </section>

          {/* ====================================================
              CONFIRMATION MESSAGE
          ===================================================== */}

          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:p-5">

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">

              <svg
                className="h-4 w-4 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>

            </div>

            <div>

              <p className="text-xs font-bold text-blue-900">
                Order confirmation
              </p>

              <p className="mt-1 text-xs leading-5 text-blue-700">
                Your order details have been recorded.
                Keep your order number handy for future
                reference.
              </p>

            </div>

          </div>

          {/* ====================================================
              ACTIONS
          ===================================================== */}

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">

            <Link
              href="/orders"
              className="w-full"
            >

              <Button
                variant="primary"
                size="lg"
                className="w-full rounded-xl shadow-lg shadow-pink-500/15"
              >

                <span className="flex items-center justify-center gap-2">

                  View my orders

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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>

                </span>

              </Button>

            </Link>

            <Link
              href="/products"
              className="w-full"
            >

              <Button
                variant="outline"
                size="lg"
                className="w-full rounded-xl"
              >

                <span className="flex items-center justify-center gap-2">

                  Continue shopping

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
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>

                </span>

              </Button>

            </Link>

          </div>

          <div className="pb-4 pt-5 text-center">

            <p className="text-[10px] text-gray-400">
              Need help with your order? You can find
              your order details in{' '}
              <Link
                href="/orders"
                className="font-semibold text-gray-600 hover:text-pink-600"
              >
                My Orders
              </Link>
              .
            </p>

          </div>

        </div>

      </main>

      <Footer />

      {/* ========================================================
          ANIMATIONS
      ========================================================= */}

      <style jsx global>{`
        @keyframes order-confetti {
          0% {
            transform: translateY(-10vh) rotate(0deg);
            opacity: 0;
          }

          10% {
            opacity: 0.75;
          }

          100% {
            transform: translateY(115vh) rotate(540deg);
            opacity: 0;
          }
        }

        .animate-order-confetti {
          animation-name: order-confetti;
          animation-timing-function: ease-in;
          animation-iteration-count: 1;
        }

        .animate-order-confetti:nth-child(4n) {
          background: #ec4899;
        }

        .animate-order-confetti:nth-child(4n + 1) {
          background: #8b5cf6;
        }

        .animate-order-confetti:nth-child(4n + 2) {
          background: #10b981;
        }

        .animate-order-confetti:nth-child(4n + 3) {
          background: #f59e0b;
        }
      `}</style>

    </div>
  );
}

// ============================================================
// PAGE WRAPPER
// ============================================================

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#faf9fb]">

          <Loader
            size="lg"
            text="Loading..."
          />

        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}