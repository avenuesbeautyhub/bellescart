'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { useRequireUserAuth } from '@/auth/user';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Loader from '@/components/ui/Loader';
import ReturnModal from '@/components/ReturnModal/ReturnModal';

import {
  useOrder,
  useTrackOrderById,
  useCancelOrder,
  useReturnOrder,
} from '@/hooks/user/useOrderQueries';

import { globalToast } from '@/utils/globalToast';

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { loaded, isAuthenticated } = useRequireUserAuth();
  const { id } = React.use(params);

  const {
    data: orderData,
    isLoading: isLoadingOrder,
    refetch: refetchOrder,
  } = useOrder(id);

  const {
    data: trackingData,
    isLoading: isLoadingTracking,
  } = useTrackOrderById(id);

  const cancelOrderMutation = useCancelOrder();
  const returnOrderMutation = useReturnOrder();

  const [showReturnModal, setShowReturnModal] =
    useState(false);

  const order = React.useMemo(() => {
    if (!orderData?.data) return null;

    return orderData.data.order || null;
  }, [orderData]);

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      const response =
        await cancelOrderMutation.mutateAsync(id);

      if (response.success) {
        globalToast.order.cancelSuccess();
        refetchOrder();
      } else {
        globalToast.order.cancelFailed();
      }
    } catch (error) {
      console.error('Failed to cancel order:', error);
      globalToast.order.cancelFailed();
    }
  };

  const handleReturnOrder = async (returnReason: string) => {
    try {
      const response =
        await returnOrderMutation.mutateAsync({
          orderId: id,
          returnReason,
        });

      if (response.success) {
        globalToast.order.returnSuccess();
        setShowReturnModal(false);
        refetchOrder();
      } else {
        globalToast.order.returnFailed();
      }
    } catch (error) {
      console.error('Failed to return order:', error);
      globalToast.order.returnFailed();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'success';
      case 'shipped':
        return 'primary';
      case 'processing':
        return 'secondary';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'danger';
      case 'returned':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatAmount = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getPaymentMethodLabel = (method: string) => {
    if (method === 'cash_on_delivery') {
      return 'Cash on Delivery';
    }

    return method
      ?.replace(/_/g, ' ')
      ?.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  if (!loaded) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fafafa]">
        <Navbar />

        <main className="flex-1 flex items-center justify-center">
          <Loader size="lg" text="Loading..." />
        </main>

        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (isLoadingOrder) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fafafa]">
        <Navbar />

        <main className="flex-1 flex items-center justify-center">
          <Loader
            size="lg"
            text="Loading order details..."
          />
        </main>

        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fafafa]">
        <Navbar />

        <main className="flex-1 flex items-center justify-center px-4">
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
                  strokeWidth={1.6}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a3 3 0 006 0M9 5a3 3 0 013-3 3 3 0 013 3"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-900">
              Order not found
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              We couldn't find the order you're looking for.
            </p>

            <div className="mt-6">
              <Link href="/orders">
                <Button className="bg-gray-950 hover:bg-gray-800">
                  Back to Orders
                </Button>
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  const isActiveOrder =
    order.status !== 'cancelled' &&
    order.status !== 'returned';

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] text-gray-900">
      <Navbar />

      <main className="flex-1 pb-16">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
          {/* Breadcrumb / Back */}
          <div className="mb-6">
            <Link
              href="/orders"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900"
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
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>

              My Orders
            </Link>
          </div>

          {/* Order Heading */}
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-pink-600">
                  Order details
                </p>

                <span className="text-gray-300">•</span>

                <span className="text-xs text-gray-500">
                  {formatShortDate(order.createdAt)}
                </span>
              </div>

              <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
                Order #{order.orderNumber || order._id}
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>

            <Badge
              variant={getStatusColor(order.status)}
            >
              {order.status.charAt(0).toUpperCase() +
                order.status.slice(1)}
            </Badge>
          </div>

          {/* Main Layout */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Main */}
            <div className="space-y-6 lg:col-span-2">
              {/* Order Progress / Status */}
              <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-base font-bold text-gray-900">
                        Order status
                      </h2>

                      <p className="mt-1 text-xs text-gray-500">
                        Current status of your order
                      </p>
                    </div>

                    <Badge
                      variant={getStatusColor(order.status)}
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>

                <div className="px-5 py-6 sm:px-6">
                  {order.status === 'cancelled' ? (
                    <div className="flex items-start gap-4 rounded-xl bg-red-50 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">
                        <svg
                          className="h-5 w-5 text-red-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </div>

                      <div>
                        <p className="font-semibold text-red-900">
                          Order cancelled
                        </p>

                        <p className="mt-1 text-sm text-red-700">
                          This order is no longer being processed.
                        </p>
                      </div>
                    </div>
                  ) : order.status === 'returned' ? (
                    <div className="flex items-start gap-4 rounded-xl bg-gray-50 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">
                        <svg
                          className="h-5 w-5 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.7}
                            d="M3 10h10a4 4 0 014 4v1M3 10l4-4M3 10l4 4"
                          />
                        </svg>
                      </div>

                      <div>
                        <p className="font-semibold text-gray-900">
                          Order returned
                        </p>

                        <p className="mt-1 text-sm text-gray-600">
                          Your return request has been processed.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="absolute left-5 right-5 top-5 hidden h-px bg-gray-200 sm:block" />

                      <div className="relative grid grid-cols-2 gap-6 sm:grid-cols-4">
                        {[
                          {
                            key: 'pending',
                            label: 'Placed',
                          },
                          {
                            key: 'processing',
                            label: 'Processing',
                          },
                          {
                            key: 'shipped',
                            label: 'Shipped',
                          },
                          {
                            key: 'delivered',
                            label: 'Delivered',
                          },
                        ].map((step, index) => {
                          const statusOrder = [
                            'pending',
                            'processing',
                            'shipped',
                            'delivered',
                          ];

                          const currentIndex =
                            statusOrder.indexOf(
                              order.status
                            );

                          const stepIndex =
                            statusOrder.indexOf(step.key);

                          const completed =
                            currentIndex >= stepIndex;

                          return (
                            <div
                              key={step.key}
                              className="relative z-10 text-center"
                            >
                              <div
                                className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full border-4 border-white text-xs font-bold shadow-sm ${
                                  completed
                                    ? 'bg-gray-950 text-white'
                                    : 'bg-gray-100 text-gray-400'
                                }`}
                              >
                                {completed ? (
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
                                ) : (
                                  index + 1
                                )}
                              </div>

                              <p
                                className={`mt-2 text-xs font-semibold ${
                                  completed
                                    ? 'text-gray-900'
                                    : 'text-gray-400'
                                }`}
                              >
                                {step.label}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Key Details */}
                <div className="grid grid-cols-2 border-t border-gray-100 sm:grid-cols-4">
                  <div className="border-b border-gray-100 px-5 py-4 sm:border-b-0 sm:border-r">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                      Order date
                    </p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {formatShortDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="border-b border-gray-100 px-5 py-4 sm:border-b-0 sm:border-r">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                      Payment
                    </p>
                    <p className="mt-1 text-sm font-semibold capitalize text-gray-900">
                      {getPaymentMethodLabel(
                        order.paymentMethod
                      )}
                    </p>
                  </div>

                  <div className="border-r border-gray-100 px-5 py-4">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                      Payment status
                    </p>
                    <p className="mt-1 text-sm font-semibold capitalize text-gray-900">
                      {order.paymentStatus || 'Paid'}
                    </p>
                  </div>

                  <div className="px-5 py-4">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                      Total
                    </p>
                    <p className="mt-1 text-sm font-bold text-gray-950">
                      {formatAmount(order.total)}
                    </p>
                  </div>
                </div>

                {order.paymentMethod ===
                  'cash_on_delivery' && (
                  <div className="border-t border-green-100 bg-green-50 px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white">
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
                            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-green-900">
                          Cash on delivery
                        </p>

                        <p className="text-xs text-green-700">
                          Pay {formatAmount(order.total)} when
                          your order arrives.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* Items */}
              <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-5 sm:px-6">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">
                      Items in this order
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                      {order.items?.length || 0}{' '}
                      {(order.items?.length || 0) === 1
                        ? 'item'
                        : 'items'}
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-gray-100">
                  {order.items?.map(
                    (item: any, index: number) => (
                      <div
                        key={index}
                        className="flex gap-4 px-5 py-5 sm:px-6"
                      >
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:h-24 sm:w-24">
                          {item.product?.image ? (
                            <img
                              src={item.product.image}
                              alt={
                                item.product.name ||
                                item.name
                              }
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <svg
                                className="h-7 w-7 text-gray-300"
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

                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-semibold text-gray-900 sm:text-[15px]">
                            {item.product?.name ||
                              item.name}
                          </p>

                          <div className="mt-2 space-y-1">
                            <p className="text-xs text-gray-500">
                              Quantity:{' '}
                              <span className="font-medium text-gray-700">
                                {item.quantity}
                              </span>
                            </p>

                            <p className="text-xs text-gray-500">
                              Unit price:{' '}
                              <span className="font-medium text-gray-700">
                                {formatAmount(item.price)}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="text-sm font-bold text-gray-950">
                            {formatAmount(item.total)}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </section>

              {/* Shipping Address */}
              <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
                  <h2 className="text-base font-bold text-gray-900">
                    Delivery address
                  </h2>
                </div>

                <div className="flex gap-4 px-5 py-5 sm:px-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50">
                    <svg
                      className="h-5 w-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.7}
                        d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.7}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>

                  <div className="text-sm leading-6 text-gray-600">
                    <p className="font-semibold text-gray-900">
                      {order.shippingAddress?.street}
                    </p>

                    <p>
                      {order.shippingAddress?.city},{' '}
                      {order.shippingAddress?.state}{' '}
                      {order.shippingAddress?.zipCode}
                    </p>

                    <p>
                      {order.shippingAddress?.country}
                    </p>
                  </div>
                </div>
              </section>

              {/* Notes */}
              {order.notes && (
                <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
                    <h2 className="text-base font-bold text-gray-900">
                      Order notes
                    </h2>
                  </div>

                  <p className="px-5 py-5 text-sm leading-6 text-gray-600 sm:px-6">
                    {order.notes}
                  </p>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Summary */}
              <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-5">
                  <h2 className="text-base font-bold text-gray-900">
                    Order summary
                  </h2>
                </div>

                <div className="space-y-3 px-5 py-5">
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-gray-500">
                      Subtotal
                    </span>

                    <span className="font-medium text-gray-900">
                      {formatAmount(order.subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-gray-500">
                      Tax
                    </span>

                    <span className="font-medium text-gray-900">
                      {formatAmount(order.tax)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-gray-500">
                      Shipping
                    </span>

                    <span className="font-medium text-gray-900">
                      {formatAmount(order.shipping)}
                    </span>
                  </div>

                  {order.discount > 0 && (
                    <div className="flex justify-between gap-4 text-sm">
                      <span className="text-green-600">
                        Discount
                      </span>

                      <span className="font-semibold text-green-600">
                        -{formatAmount(order.discount)}
                      </span>
                    </div>
                  )}

                  <div className="my-2 border-t border-gray-100" />

                  <div className="flex items-end justify-between gap-4">
                    <span className="text-sm font-semibold text-gray-900">
                      Total
                    </span>

                    <span className="text-xl font-bold text-gray-950">
                      {formatAmount(order.total)}
                    </span>
                  </div>
                </div>
              </section>

              {/* Tracking */}
              <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-gray-900">
                        Delivery tracking
                      </h2>

                      <p className="mt-1 text-xs text-gray-500">
                        Shipment information
                      </p>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-50">
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
                          d="M9 17h6m-6-4h6m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-5">
                  {order.trackingNumber ? (
                    <>
                      <div className="rounded-xl bg-gray-50 p-4">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                          Tracking number
                        </p>

                        <p className="mt-1 break-all text-sm font-bold text-gray-900">
                          {order.trackingNumber}
                        </p>
                      </div>

                      {order.estimatedDelivery && (
                        <div className="mt-4">
                          <p className="text-xs text-gray-500">
                            Estimated delivery
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-900">
                            {formatDate(
                              order.estimatedDelivery
                            )}
                          </p>
                        </div>
                      )}

                      {order.nimbus?.courier && (
                        <div className="mt-4">
                          <p className="text-xs text-gray-500">
                            Courier
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-900">
                            {order.nimbus.courier}
                          </p>
                        </div>
                      )}

                      {order.nimbus?.shipmentStatus && (
                        <div className="mt-4">
                          <p className="mb-2 text-xs text-gray-500">
                            Shipment status
                          </p>

                          <Badge
                            variant={getStatusColor(
                              order.nimbus.shipmentStatus.toLowerCase()
                            )}
                          >
                            {order.nimbus.shipmentStatus}
                          </Badge>
                        </div>
                      )}

                      <div className="mt-5 border-t border-gray-100 pt-5">
                        {isLoadingTracking ? (
                          <Loader
                            size="sm"
                            text="Loading tracking..."
                          />
                        ) : trackingData ? (
                          <>
                            <h3 className="mb-4 text-sm font-semibold text-gray-900">
                              Tracking history
                            </h3>

                            <div className="relative space-y-5">
                              {trackingData.trackingHistory?.map(
                                (
                                  track: any,
                                  index: number
                                ) => (
                                  <div
                                    key={index}
                                    className="relative flex gap-3"
                                  >
                                    {index <
                                      trackingData
                                        .trackingHistory
                                        .length -
                                        1 && (
                                      <div className="absolute left-[5px] top-3 h-full w-px bg-gray-200" />
                                    )}

                                    <div className="relative z-10 mt-1 h-3 w-3 shrink-0 rounded-full border-2 border-pink-500 bg-white" />

                                    <div className="min-w-0">
                                      <p className="text-sm font-semibold text-gray-900">
                                        {track.status}
                                      </p>

                                      <p className="mt-0.5 text-xs leading-5 text-gray-500">
                                        {track.description}
                                      </p>

                                      <p className="mt-1 text-[11px] text-gray-400">
                                        {track.date}
                                      </p>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="w-full"
                            onClick={() =>
                              refetchOrder()
                            }
                          >
                            Refresh Tracking
                          </Button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      {order.nimbus?.airwayBill ? (
                        <div>
                          <p className="text-xs text-gray-500">
                            Airway Bill Number
                          </p>

                          <p className="mt-1 break-all text-sm font-semibold text-gray-900">
                            {order.nimbus.airwayBill}
                          </p>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-yellow-100 bg-yellow-50 p-4">
                          <p className="text-sm leading-5 text-yellow-800">
                            <span className="font-semibold">
                              Shipping not yet assigned
                            </span>

                            <br />

                            Your order is being processed and
                            will be shipped soon.
                          </p>
                        </div>
                      )}

                      {order.nimbus?.courier && (
                        <div>
                          <p className="text-xs text-gray-500">
                            Courier
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-900">
                            {order.nimbus.courier}
                          </p>
                        </div>
                      )}

                      {order.nimbus?.shipmentStatus && (
                        <div>
                          <p className="mb-2 text-xs text-gray-500">
                            Status
                          </p>

                          <Badge
                            variant={getStatusColor(
                              order.nimbus.shipmentStatus.toLowerCase()
                            )}
                          >
                            {order.nimbus.shipmentStatus}
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>

              {/* Actions */}
              <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-base font-bold text-gray-900">
                  Order actions
                </h2>

                <div className="space-y-2.5">
                  {order.status === 'delivered' && (
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={() =>
                        setShowReturnModal(true)
                      }
                    >
                      Return Order
                    </Button>
                  )}

                  {isActiveOrder &&
                    order.status !== 'delivered' && (
                      <Button
                        variant="danger"
                        className="w-full"
                        onClick={handleCancelOrder}
                      >
                        Cancel Order
                      </Button>
                    )}

                  <Link
                    href="/products"
                    className="block"
                  >
                    <Button
                      variant="secondary"
                      className="w-full"
                    >
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>

      <Footer />

      <ReturnModal
        isOpen={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        onReturn={handleReturnOrder}
        isLoading={returnOrderMutation.isPending}
      />
    </div>
  );
}