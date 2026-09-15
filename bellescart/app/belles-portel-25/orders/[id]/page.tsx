'use client';

import React, { use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { useRequireAdminAuth } from '@/auth/admin';
import AdminHeader from '@/components/AdminHeader/AdminHeader';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Loader from '@/components/ui/Loader';

import {
  useAdminOrder,
  useAdminUpdateOrderStatus,
  useAdminCancelOrder,
} from '@/hooks/user/useAdminQueries';

const ADMIN_BASE = '/belles-portel-25';

const STATUS_OPTIONS = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

type Status =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

const statusMeta: Record<
  Status,
  {
    label: string;
    description: string;
    dot: string;
    bg: string;
    text: string;
    border: string;
  }
> = {
  pending: {
    label: 'Pending',
    description: 'Awaiting order processing',
    dot: 'bg-amber-500',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },

  processing: {
    label: 'Processing',
    description: 'Order is being prepared',
    dot: 'bg-violet-500',
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    border: 'border-violet-200',
  },

  shipped: {
    label: 'Shipped',
    description: 'Order is on its way',
    dot: 'bg-blue-500',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },

  delivered: {
    label: 'Delivered',
    description: 'Order successfully delivered',
    dot: 'bg-emerald-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },

  cancelled: {
    label: 'Cancelled',
    description: 'Order has been cancelled',
    dot: 'bg-rose-500',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
  },
};

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const { loaded, isAuthenticated } =
    useRequireAdminAuth();

  const {
    data: orderData,
    isLoading: isLoadingOrder,
    refetch: refetchOrder,
  } = useAdminOrder(id);

  const updateStatusMutation =
    useAdminUpdateOrderStatus();

  const cancelOrderMutation =
    useAdminCancelOrder();

  const order =
    orderData?.data?.order as any || null;

  const status: Status = useMemo(() => {
    if (
      order?.status &&
      STATUS_OPTIONS.includes(order.status)
    ) {
      return order.status as Status;
    }

    return 'pending';
  }, [order?.status]);

  const currentStatus = statusMeta[status];

  const formatAmount = (amount?: number) => {
    return `₹${Number(amount || 0).toLocaleString(
      'en-IN'
    )}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '—';

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleUpdateStatus = async (
    newStatus: string
  ) => {
    if (newStatus === order?.status) {
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        orderId: id,
        status: newStatus,
      });

      await refetchOrder();
    } catch (error) {
      console.error(
        'Failed to update order status:',
        error
      );
    }
  };

  const handleCancelOrder = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this order? This action cannot be easily reversed.'
    );

    if (!confirmed) return;

    try {
      await cancelOrderMutation.mutateAsync(id);
      await refetchOrder();
    } catch (error) {
      console.error(
        'Failed to cancel order:',
        error
      );
    }
  };

  if (!loaded) {
    return (
      <div className="min-h-screen bg-[#f7f4f1]">
        <AdminHeader />

        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
          <Loader
            size="lg"
            text="Checking admin access..."
          />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (isLoadingOrder) {
    return (
      <div className="min-h-screen bg-[#f7f4f1]">
        <AdminHeader />

        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
          <Loader
            size="lg"
            text="Loading order details..."
          />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#f7f4f1]">
        <AdminHeader />

        <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4">
          <div className="w-full max-w-md rounded-3xl border border-[#e5dcd7] bg-white p-8 text-center shadow-[0_15px_50px_rgba(52,34,43,0.06)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f4eeeb] text-2xl text-[#80636e]">
              ?
            </div>

            <h1 className="mt-5 font-serif text-3xl text-[#30242a]">
              Order not found
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#918289]">
              We couldn't find the order you're
              looking for. It may have been removed or
              the order ID may be incorrect.
            </p>

            <Link
              href={`${ADMIN_BASE}/orders`}
              className="mt-6 inline-block"
            >
              <Button variant="secondary">
                ← Back to Orders
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f4f1] text-[#2c2228]">
      <AdminHeader />

      <main>
        {/* =====================================================
            HERO
        ====================================================== */}
        <section className="border-b border-[#e5dcd8] bg-white">
          <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <Link
              href={`${ADMIN_BASE}/orders`}
              className="mb-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#8d7d84] transition hover:text-[#6b2745]"
            >
              <span className="text-base">
                ←
              </span>
              Back to Orders
            </Link>

            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-[#9a8b91]">
                  <span>Orders</span>

                  <span className="text-[#d3c8c4]">
                    /
                  </span>

                  <span className="font-medium text-[#5f4a54]">
                    Order Details
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-serif text-3xl font-medium tracking-tight text-[#291e24] sm:text-4xl lg:text-5xl">
                    Order Details
                  </h1>

                  <StatusPill status={status} />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span className="font-mono text-sm font-semibold text-[#5b3b49]">
                    {order.orderNumber ||
                      order._id}
                  </span>

                  <span className="hidden h-4 w-px bg-[#dcd2ce] sm:block" />

                  <span className="text-xs text-[#94868c]">
                    Placed{' '}
                    {formatDateTime(
                      order.createdAt
                    )}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => refetchOrder()}
                  className="rounded-xl border border-[#ddd3cf] bg-white px-4 py-2.5 text-xs font-semibold text-[#4d3c44] transition hover:border-[#7b3654] hover:text-[#6b2745]"
                >
                  ↻ Refresh
                </button>

                {order.status !== 'cancelled' &&
                  order.status !== 'delivered' && (
                    <button
                      type="button"
                      onClick={handleCancelOrder}
                      disabled={
                        cancelOrderMutation.isPending
                      }
                      className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                    >
                      {cancelOrderMutation.isPending
                        ? 'Cancelling...'
                        : 'Cancel Order'}
                    </button>
                  )}
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_370px]">
            {/* =================================================
                MAIN COLUMN
            ================================================== */}
            <div className="min-w-0 space-y-6">
              {/* ORDER STATUS */}
              <section className="overflow-hidden rounded-3xl border border-[#e5dcd7] bg-white shadow-[0_8px_30px_rgba(52,34,43,0.04)]">
                <div className="border-b border-[#eee7e3] px-5 py-5 sm:px-7">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a08f96]">
                        Fulfillment
                      </p>

                      <h2 className="mt-1 font-serif text-2xl text-[#30242a]">
                        Order progress
                      </h2>
                    </div>

                    <StatusPill status={status} />
                  </div>
                </div>

                <div className="p-5 sm:p-7">
                  <OrderTimeline
                    status={status}
                  />

                  <div className="mt-7 rounded-2xl border border-[#e8dfdb] bg-[#faf7f5] p-4 sm:p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9c8d93]">
                          Change status
                        </p>

                        <p className="mt-1 text-sm text-[#6d5d64]">
                          Update the fulfillment stage
                          for this order.
                        </p>
                      </div>

                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleUpdateStatus(
                            e.target.value
                          )
                        }
                        disabled={
                          updateStatusMutation.isPending
                        }
                        className="h-11 w-full rounded-xl border border-[#dcd2ce] bg-white px-4 text-sm font-medium text-[#42343b] outline-none transition focus:border-[#7b3654] focus:ring-4 focus:ring-[#7b3654]/10 disabled:opacity-60 md:w-56"
                      >
                        {STATUS_OPTIONS.map(
                          (option) => (
                            <option
                              key={option}
                              value={option}
                            >
                              {statusMeta[
                                option as Status
                              ].label}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    {updateStatusMutation.isPending && (
                      <p className="mt-3 text-xs font-medium text-[#7b3654]">
                        Updating order status...
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* CUSTOMER */}
              <section className="rounded-3xl border border-[#e5dcd7] bg-white p-5 shadow-[0_8px_30px_rgba(52,34,43,0.04)] sm:p-7">
                <SectionHeading
                  eyebrow="Customer"
                  title="Customer information"
                  description="The customer associated with this order."
                />

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <CustomerInfo
                    icon="◉"
                    label="Name"
                    value={
                      order.customer?.name ||
                      'N/A'
                    }
                  />

                  <CustomerInfo
                    icon="✉"
                    label="Email"
                    value={
                      order.customer?.email ||
                      'N/A'
                    }
                  />

                  <CustomerInfo
                    icon="⌕"
                    label="Phone"
                    value={
                      order.customer?.phone ||
                      'N/A'
                    }
                  />

                  <CustomerInfo
                    icon="#"
                    label="User ID"
                    value={order.userId || 'N/A'}
                    mono
                  />
                </div>
              </section>

              {/* ORDER ITEMS */}
              <section className="overflow-hidden rounded-3xl border border-[#e5dcd7] bg-white shadow-[0_8px_30px_rgba(52,34,43,0.04)]">
                <div className="border-b border-[#eee7e3] px-5 py-5 sm:px-7">
                  <SectionHeading
                    eyebrow="Products"
                    title="Order items"
                    description={`${
                      order.items?.length || 0
                    } ${
                      order.items?.length === 1
                        ? 'item'
                        : 'items'
                    } in this order.`}
                  />
                </div>

                <div className="divide-y divide-[#eee7e3]">
                  {order.items?.map(
                    (item: any, index: number) => {
                      const productName =
                        item.product?.name ||
                        item.name ||
                        'Product';

                      const image =
                        item.product?.image ||
                        item.image;

                      const quantity =
                        Number(item.quantity) || 0;

                      const price =
                        Number(item.price) || 0;

                      const itemTotal =
                        item.total !== undefined
                          ? Number(item.total)
                          : price * quantity;

                      return (
                        <div
                          key={index}
                          className="flex gap-4 p-5 sm:px-7 sm:py-6"
                        >
                          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-[#e4dcd8] bg-[#f5efec] sm:h-24 sm:w-24">
                            {image ? (
                              <img
                                src={image}
                                alt={productName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-2xl text-[#9c858f]">
                                ◇
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <h3 className="text-sm font-semibold text-[#30252b] sm:text-base">
                                  {productName}
                                </h3>

                                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#918289]">
                                  <span>
                                    Qty{' '}
                                    <strong className="text-[#55464d]">
                                      {quantity}
                                    </strong>
                                  </span>

                                  <span>
                                    Unit price{' '}
                                    <strong className="text-[#55464d]">
                                      {formatAmount(
                                        price
                                      )}
                                    </strong>
                                  </span>
                                </div>
                              </div>

                              <p className="font-serif text-lg font-semibold text-[#382832]">
                                {formatAmount(
                                  itemTotal
                                )}
                              </p>
                            </div>

                            {item.product?._id && (
                              <p className="mt-3 font-mono text-[10px] text-[#aaa0a3]">
                                Product ID:{' '}
                                {item.product._id}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </section>

              {/* SHIPPING */}
              <section className="rounded-3xl border border-[#e5dcd7] bg-white p-5 shadow-[0_8px_30px_rgba(52,34,43,0.04)] sm:p-7">
                <SectionHeading
                  eyebrow="Delivery"
                  title="Shipping address"
                  description="Destination provided for this order."
                />

                <div className="mt-6 flex gap-4 rounded-2xl border border-[#e8dfdb] bg-[#faf7f5] p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#6b2745] shadow-sm">
                    ⌂
                  </div>

                  <div className="text-sm leading-7 text-[#4d3d44]">
                    <p className="font-semibold text-[#30252b]">
                      {order.shippingAddress
                        ?.street || 'N/A'}
                    </p>

                    <p>
                      {order.shippingAddress
                        ?.city || ''}
                      {order.shippingAddress
                        ?.state
                        ? `, ${order.shippingAddress.state}`
                        : ''}
                    </p>

                    <p>
                      {order.shippingAddress
                        ?.zipCode || ''}
                    </p>

                    <p>
                      {order.shippingAddress
                        ?.country || ''}
                    </p>
                  </div>
                </div>
              </section>

              {/* NOTES */}
              {order.notes && (
                <section className="rounded-3xl border border-[#e5dcd7] bg-white p-5 shadow-[0_8px_30px_rgba(52,34,43,0.04)] sm:p-7">
                  <SectionHeading
                    eyebrow="Additional"
                    title="Order notes"
                  />

                  <div className="mt-5 rounded-2xl border border-[#eadfda] bg-[#faf7f5] p-5">
                    <p className="whitespace-pre-wrap text-sm leading-7 text-[#5f5057]">
                      {order.notes}
                    </p>
                  </div>
                </section>
              )}
            </div>

            {/* =================================================
                SIDEBAR
            ================================================== */}
            <aside className="min-w-0 space-y-6 xl:sticky xl:top-24 xl:self-start">
              {/* TOTAL */}
              <section className="overflow-hidden rounded-3xl border border-[#4b1830] bg-[#4b1830] text-white shadow-[0_15px_45px_rgba(75,24,48,0.18)]">
                <div className="p-6 sm:p-7">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/55">
                    Order value
                  </p>

                  <p className="mt-2 font-serif text-4xl font-medium tracking-tight sm:text-5xl">
                    {formatAmount(order.total)}
                  </p>

                  <p className="mt-2 text-xs text-white/55">
                    Order #{order.orderNumber ||
                      order._id}
                  </p>
                </div>

                <div className="border-t border-white/10 bg-white/5 p-5 sm:p-6">
                  <div className="space-y-3">
                    <SummaryRow
                      label="Subtotal"
                      value={formatAmount(
                        order.subtotal
                      )}
                      dark
                    />

                    <SummaryRow
                      label="Shipping"
                      value={formatAmount(
                        order.shipping
                      )}
                      dark
                    />

                    {order.discount > 0 && (
                      <SummaryRow
                        label="Discount"
                        value={`-${formatAmount(
                          order.discount
                        )}`}
                        dark
                        positive
                      />
                    )}

                    <div className="border-t border-white/10 pt-3">
                      <SummaryRow
                        label="Total"
                        value={formatAmount(
                          order.total
                        )}
                        dark
                        total
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* PAYMENT */}
              <section className="rounded-3xl border border-[#e5dcd7] bg-white p-5 shadow-[0_8px_30px_rgba(52,34,43,0.04)] sm:p-6">
                <SectionHeading
                  eyebrow="Payment"
                  title="Payment information"
                />

                <div className="mt-5 space-y-1">
                  <SideInfoRow
                    label="Method"
                    value={
                      order.paymentMethod ===
                      'cash_on_delivery'
                        ? 'Cash on Delivery'
                        : order.paymentMethod ||
                          'N/A'
                    }
                  />

                  <SideInfoRow
                    label="Payment status"
                    value={
                      order.paymentStatus ||
                      'Paid'
                    }
                    valueClass={
                      order.paymentStatus
                        ?.toLowerCase()
                        .includes('paid')
                        ? 'text-emerald-700'
                        : undefined
                    }
                  />

                  <SideInfoRow
                    label="Order date"
                    value={formatDateTime(
                      order.createdAt
                    )}
                  />
                </div>

                {order.paymentMethod ===
                  'cash_on_delivery' && (
                  <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                    <div className="flex gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-700 shadow-sm">
                        ₹
                      </span>

                      <div>
                        <p className="text-xs font-bold text-emerald-800">
                          COD Order
                        </p>

                        <p className="mt-1 text-xs leading-5 text-emerald-700">
                          Customer will pay{' '}
                          <strong>
                            {formatAmount(
                              order.total
                            )}
                          </strong>{' '}
                          on delivery.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* STATUS CONTROL */}
              <section className="rounded-3xl border border-[#e5dcd7] bg-white p-5 shadow-[0_8px_30px_rgba(52,34,43,0.04)] sm:p-6">
                <SectionHeading
                  eyebrow="Management"
                  title="Order status"
                  description="Update the fulfillment state."
                />

                <div className="mt-5">
                  <StatusPill status={status} />

                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleUpdateStatus(
                        e.target.value
                      )
                    }
                    disabled={
                      updateStatusMutation.isPending
                    }
                    className="mt-4 h-11 w-full rounded-xl border border-[#dcd2ce] bg-[#fcfaf9] px-4 text-sm font-medium text-[#403239] outline-none transition focus:border-[#7b3654] focus:bg-white focus:ring-4 focus:ring-[#7b3654]/10 disabled:opacity-50"
                  >
                    {STATUS_OPTIONS.map(
                      (option) => (
                        <option
                          key={option}
                          value={option}
                        >
                          {statusMeta[
                            option as Status
                          ].label}
                        </option>
                      )
                    )}
                  </select>

                  {updateStatusMutation.isPending && (
                    <p className="mt-2 text-[11px] font-medium text-[#7b3654]">
                      Saving status...
                    </p>
                  )}
                </div>
              </section>

              {/* TRACKING */}
              {order.trackingNumber && (
                <section className="rounded-3xl border border-[#e5dcd7] bg-white p-5 shadow-[0_8px_30px_rgba(52,34,43,0.04)] sm:p-6">
                  <SectionHeading
                    eyebrow="Delivery"
                    title="Tracking"
                  />

                  <div className="mt-5 space-y-1">
                    <SideInfoRow
                      label="Tracking number"
                      value={
                        order.trackingNumber
                      }
                      mono
                    />

                    {order.estimatedDelivery && (
                      <SideInfoRow
                        label="Estimated delivery"
                        value={formatDate(
                          order.estimatedDelivery
                        )}
                      />
                    )}

                    {order.nimbus?.courier && (
                      <SideInfoRow
                        label="Courier"
                        value={
                          order.nimbus.courier
                        }
                      />
                    )}
                  </div>

                  <div className="mt-5 rounded-2xl bg-[#f7f3f1] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#9b8b91]">
                      Shipment status
                    </p>

                    <p className="mt-1 text-sm font-semibold capitalize text-[#44343c]">
                      {order.nimbus
                        ?.shipmentStatus ||
                        order.status}
                    </p>
                  </div>
                </section>
              )}

              {/* NIMBUS */}
              {order.nimbus && (
                <section className="rounded-3xl border border-[#e5dcd7] bg-white p-5 shadow-[0_8px_30px_rgba(52,34,43,0.04)] sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <SectionHeading
                      eyebrow="Courier"
                      title="NimbusPost"
                    />

                    <span className="rounded-full bg-[#f4eeeb] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-[#765765]">
                      Shipment
                    </span>
                  </div>

                  <div className="mt-5 space-y-1">
                    {order.nimbus
                      .shipmentId && (
                      <SideInfoRow
                        label="Shipment ID"
                        value={
                          order.nimbus.shipmentId
                        }
                        mono
                      />
                    )}

                    {order.nimbus
                      .trackingId && (
                      <SideInfoRow
                        label="Tracking ID"
                        value={
                          order.nimbus.trackingId
                        }
                        mono
                      />
                    )}

                    {order.nimbus
                      .airwayBill && (
                      <SideInfoRow
                        label="Airway Bill"
                        value={
                          order.nimbus.airwayBill
                        }
                        mono
                      />
                    )}

                    {order.nimbus
                      .shipmentStatus && (
                      <SideInfoRow
                        label="Shipment status"
                        value={
                          order.nimbus
                            .shipmentStatus
                        }
                      />
                    )}

                    {order.nimbus.courier && (
                      <SideInfoRow
                        label="Courier"
                        value={
                          order.nimbus.courier
                        }
                      />
                    )}
                  </div>
                </section>
              )}

              {/* DANGER ZONE */}
              {order.status !== 'cancelled' &&
                order.status !== 'delivered' && (
                  <section className="rounded-3xl border border-rose-200 bg-rose-50/60 p-5 sm:p-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-500">
                      Order actions
                    </p>

                    <h3 className="mt-1 font-serif text-xl text-rose-900">
                      Cancel order
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-rose-700/80">
                      Cancelling an order should only be
                      done when the customer or
                      fulfillment process requires it.
                    </p>

                    <button
                      type="button"
                      onClick={handleCancelOrder}
                      disabled={
                        cancelOrderMutation.isPending
                      }
                      className="mt-4 w-full rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                    >
                      {cancelOrderMutation.isPending
                        ? 'Cancelling order...'
                        : 'Cancel Order'}
                    </button>
                  </section>
                )}
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ============================================================
   ORDER TIMELINE
============================================================ */

function OrderTimeline({
  status,
}: {
  status: Status;
}) {
  const steps: Status[] = [
    'pending',
    'processing',
    'shipped',
    'delivered',
  ];

  const currentIndex =
    status === 'cancelled'
      ? -1
      : steps.indexOf(status);

  if (status === 'cancelled') {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-rose-600 shadow-sm">
            ×
          </div>

          <div>
            <p className="text-sm font-semibold text-rose-900">
              Order cancelled
            </p>

            <p className="mt-0.5 text-xs text-rose-700">
              This order is no longer moving through
              fulfillment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-5 right-5 top-5 hidden h-px bg-[#e3d9d5] md:block" />

      <div className="relative grid grid-cols-1 gap-5 md:grid-cols-4 md:gap-3">
        {steps.map((step, index) => {
          const meta = statusMeta[step];

          const isComplete =
            index <= currentIndex;

          const isCurrent =
            index === currentIndex;

          return (
            <div
              key={step}
              className="flex items-center gap-3 md:flex-col md:text-center"
            >
              <div
                className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-white text-xs font-bold shadow-sm ${
                  isComplete
                    ? `${meta.dot} text-white`
                    : 'bg-[#eee7e3] text-[#9b8d92]'
                }`}
              >
                {isComplete ? '✓' : index + 1}
              </div>

              <div className="min-w-0 md:mt-2">
                <p
                  className={`text-xs font-bold ${
                    isCurrent
                      ? meta.text
                      : isComplete
                        ? 'text-[#55444b]'
                        : 'text-[#9b8d92]'
                  }`}
                >
                  {meta.label}
                </p>

                <p className="mt-0.5 text-[10px] text-[#a09297]">
                  {meta.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   STATUS PILL
============================================================ */

function StatusPill({
  status,
}: {
  status: Status;
}) {
  const meta = statusMeta[status];

  return (
    <span
      className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] ${meta.bg} ${meta.text} ${meta.border}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${meta.dot}`}
      />

      {meta.label}
    </span>
  );
}

/* ============================================================
   SECTION HEADING
============================================================ */

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#a08f96]">
        {eyebrow}
      </p>

      <h2 className="mt-1 font-serif text-2xl text-[#30242a]">
        {title}
      </h2>

      {description && (
        <p className="mt-1 text-xs leading-5 text-[#96878d]">
          {description}
        </p>
      )}
    </div>
  );
}

/* ============================================================
   CUSTOMER INFO
============================================================ */

function CustomerInfo({
  icon,
  label,
  value,
  mono = false,
}: {
  icon: string;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#e9e1dd] bg-[#fcfaf9] p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-semibold text-[#6b2745] shadow-sm">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#a09297]">
          {label}
        </p>

        <p
          className={`mt-1 truncate text-sm font-semibold text-[#44353d] ${
            mono ? 'font-mono text-[11px]' : ''
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   SUMMARY ROW
============================================================ */

function SummaryRow({
  label,
  value,
  dark = false,
  positive = false,
  total = false,
}: {
  label: string;
  value: string;
  dark?: boolean;
  positive?: boolean;
  total?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={
          total
            ? dark
              ? 'text-sm font-semibold text-white'
              : 'text-sm font-semibold text-[#3e3238]'
            : dark
              ? 'text-xs text-white/55'
              : 'text-xs text-[#8c7d83]'
        }
      >
        {label}
      </span>

      <span
        className={
          total
            ? dark
              ? 'font-serif text-xl font-semibold text-white'
              : 'font-serif text-xl font-semibold text-[#30242a]'
            : positive
              ? 'text-xs font-semibold text-emerald-300'
              : dark
                ? 'text-xs font-medium text-white/80'
                : 'text-xs font-medium text-[#4d3d44]'
        }
      >
        {value}
      </span>
    </div>
  );
}

/* ============================================================
   SIDE INFO ROW
============================================================ */

function SideInfoRow({
  label,
  value,
  mono = false,
  valueClass,
}: {
  label: string;
  value: string;
  mono?: boolean;
  valueClass?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#eee7e3] py-3 last:border-0">
      <span className="shrink-0 text-xs text-[#94858b]">
        {label}
      </span>

      <span
        className={`max-w-[62%] break-words text-right text-xs font-semibold text-[#46363e] ${
          mono ? 'font-mono' : ''
        } ${valueClass || ''}`}
      >
        {value}
      </span>
    </div>
  );
}