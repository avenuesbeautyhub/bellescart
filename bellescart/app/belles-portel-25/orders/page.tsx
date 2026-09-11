'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Loader from '@/components/ui/Loader';
import {
  useAdminOrders,
  useAdminUpdateOrderStatus,
  useAdminCancelOrder,
} from '@/hooks/user/useAdminQueries';
import { useQueryClient } from '@tanstack/react-query';
import { OrderData } from '@/services/admin/orderService';

const ADMIN_BASE = '/belles-portel-25';

type Status =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

const STATUS_OPTIONS: Status[] = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

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
    description: 'Awaiting processing',
    dot: 'bg-amber-500',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  processing: {
    label: 'Processing',
    description: 'Being prepared',
    dot: 'bg-violet-500',
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    border: 'border-violet-200',
  },
  shipped: {
    label: 'Shipped',
    description: 'On the way',
    dot: 'bg-blue-500',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  delivered: {
    label: 'Delivered',
    description: 'Successfully delivered',
    dot: 'bg-emerald-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  cancelled: {
    label: 'Cancelled',
    description: 'Order cancelled',
    dot: 'bg-rose-500',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
  },
};

export default function OrderManagementPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [draftStatus, setDraftStatus] = useState<Record<string, string>>({});

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] =
    useState('All Statuses');

  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { data: ordersData, isLoading } = useAdminOrders({
    page: currentPage,
    limit: itemsPerPage,
  });

  const updateOrderStatusMutation =
    useAdminUpdateOrderStatus();

  const cancelOrderMutation = useAdminCancelOrder();

  const orders = ordersData?.data?.orders || [];

  const getOrderId = (order: OrderData) =>
    order._id || order.id || '';

  const getStatus = (status: string): Status => {
    if (
      status === 'pending' ||
      status === 'processing' ||
      status === 'shipped' ||
      status === 'delivered' ||
      status === 'cancelled'
    ) {
      return status;
    }

    return 'pending';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
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

  const formatAmount = (amount?: number) => {
    return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
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

      default:
        return 'secondary';
    }
  };

  const handleViewOrder = (order: OrderData) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);

    setTimeout(() => {
      setSelectedOrder(null);
    }, 150);
  };

  const handleUpdateStatus = async (
    orderId: string,
    newStatus: string
  ) => {
    try {
      await updateOrderStatusMutation.mutateAsync({
        orderId,
        status: newStatus,
      });

      setDraftStatus((previous) => ({
        ...previous,
        [orderId]: newStatus,
      }));

      await queryClient.invalidateQueries({
        queryKey: ['admin', 'orders'],
      });

      if (selectedOrder && getOrderId(selectedOrder) === orderId) {
        setSelectedOrder((previous) =>
          previous
            ? {
                ...previous,
                status: newStatus as Status,
              }
            : previous
        );
      }
    } catch (error) {
      console.error(
        'Failed to update order status:',
        error
      );
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this order? This action cannot be easily reversed.'
    );

    if (!confirmed) return;

    try {
      await cancelOrderMutation.mutateAsync(orderId);

      await queryClient.invalidateQueries({
        queryKey: ['admin', 'orders'],
      });

      closeModal();
    } catch (error) {
      console.error(
        'Failed to cancel order:',
        error
      );
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const search = searchQuery.trim().toLowerCase();

      if (search) {
        const matchesId =
          order._id?.toLowerCase().includes(search) ||
          order.id?.toLowerCase().includes(search);

        const matchesCustomer =
          order.customer?.name
            ?.toLowerCase()
            .includes(search) ||
          order.customer?.email
            ?.toLowerCase()
            .includes(search);

        if (!matchesId && !matchesCustomer) {
          return false;
        }
      }

      if (
        selectedStatus !== 'All Statuses' &&
        order.status !== selectedStatus
      ) {
        return false;
      }

      if (dateRange.start && order.createdAt) {
        const orderDate = new Date(order.createdAt);
        const startDate = new Date(dateRange.start);

        if (orderDate < startDate) {
          return false;
        }
      }

      if (dateRange.end && order.createdAt) {
        const orderDate = new Date(order.createdAt);
        const endDate = new Date(dateRange.end);

        endDate.setHours(23, 59, 59, 999);

        if (orderDate > endDate) {
          return false;
        }
      }

      return true;
    });
  }, [
    orders,
    searchQuery,
    selectedStatus,
    dateRange,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrders.length / itemsPerPage)
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const paginatedOrders = filteredOrders.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage
  );

  const stats = useMemo(() => {
    const pending = orders.filter(
      (order) => order.status === 'pending'
    ).length;

    const processing = orders.filter(
      (order) => order.status === 'processing'
    ).length;

    const shipped = orders.filter(
      (order) => order.status === 'shipped'
    ).length;

    const delivered = orders.filter(
      (order) => order.status === 'delivered'
    ).length;

    const cancelled = orders.filter(
      (order) => order.status === 'cancelled'
    ).length;

    const revenue = orders
      .filter((order) => order.status !== 'cancelled')
      .reduce(
        (sum, order) =>
          sum + Number(order.totalAmount || 0),
        0
      );

    return {
      total: orders.length,
      pending,
      processing,
      shipped,
      delivered,
      cancelled,
      revenue,
    };
  }, [orders]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('All Statuses');
    setDateRange({
      start: '',
      end: '',
    });
    setCurrentPage(1);
  };

  const hasFilters =
    searchQuery ||
    selectedStatus !== 'All Statuses' ||
    dateRange.start ||
    dateRange.end;

  if (isLoading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-[#f7f4f1] flex items-center justify-center">
        <Loader
          size="lg"
          text="Loading your orders..."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f4f1] text-[#241d22]">
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}
      <header className="border-b border-[#e7dfda] bg-white">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[150px] flex-col justify-center gap-6 py-7 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8d7d84]">
                <button
                  onClick={() =>
                    router.push(
                      `${ADMIN_BASE}/dashboard`
                    )
                  }
                  className="transition-colors hover:text-[#4b1830]"
                >
                  Dashboard
                </button>

                <span className="text-[#cfc4c0]">
                  /
                </span>

                <span className="text-[#4b1830]">
                  Orders
                </span>
              </div>

              <div className="flex items-end gap-4">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.25em] text-[#a28f96]">
                    BellesCart Commerce
                  </p>

                  <h1 className="font-serif text-4xl font-medium tracking-tight text-[#251c22] sm:text-5xl">
                    Orders
                  </h1>
                </div>

                <span className="mb-1 hidden h-8 w-px bg-[#ddd3cf] sm:block" />

                <p className="mb-1 hidden max-w-sm text-sm leading-6 text-[#776970] sm:block">
                  Manage customer purchases, fulfillment
                  status and order details from one place.
                </p>
              </div>
            </div>

            <Button
              variant="secondary"
              onClick={() =>
                queryClient.invalidateQueries({
                  queryKey: ['admin', 'orders'],
                })
              }
            >
              <span className="mr-2">↻</span>
              Refresh Orders
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* =====================================================
            OVERVIEW
        ====================================================== */}
        <section className="mb-7">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a28f96]">
                Order Overview
              </p>

              <h2 className="mt-1 font-serif text-2xl text-[#2a2026]">
                Fulfillment at a glance
              </h2>
            </div>

            <span className="hidden text-xs text-[#94858b] sm:block">
              Current loaded orders
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <StatCard
              label="Total Orders"
              value={stats.total}
              icon="◎"
            />

            <StatCard
              label="Pending"
              value={stats.pending}
              icon="◷"
              accent="amber"
            />

            <StatCard
              label="Processing"
              value={stats.processing}
              icon="◌"
              accent="violet"
            />

            <StatCard
              label="Shipped"
              value={stats.shipped}
              icon="→"
              accent="blue"
            />

            <StatCard
              label="Delivered"
              value={stats.delivered}
              icon="✓"
              accent="green"
            />

            <StatCard
              label="Cancelled"
              value={stats.cancelled}
              icon="×"
              accent="rose"
            />
          </div>
        </section>

        {/* =====================================================
            FILTER PANEL
        ====================================================== */}
        <section className="mb-6 overflow-hidden rounded-2xl border border-[#e6ddd8] bg-white shadow-[0_8px_30px_rgba(52,34,43,0.04)]">
          <div className="border-b border-[#eee7e3] px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#2d2329]">
                  Find orders
                </h2>

                <p className="mt-0.5 text-xs text-[#93858a]">
                  Search by order ID or customer details.
                </p>
              </div>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="self-start text-xs font-semibold text-[#6b2745] hover:text-[#43152c] sm:self-auto"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-5 sm:p-6 md:grid-cols-2 xl:grid-cols-4">
            <FilterField label="Search">
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a4959a]">
                  ⌕
                </span>

                <input
                  type="text"
                  placeholder="Order ID, name, email..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-11 w-full rounded-xl border border-[#ded5d1] bg-[#fcfaf9] pl-10 pr-4 text-sm text-[#292027] outline-none transition placeholder:text-[#aaa0a3] focus:border-[#7b3654] focus:bg-white focus:ring-4 focus:ring-[#7b3654]/10"
                />
              </div>
            </FilterField>

            <FilterField label="Order Status">
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-11 w-full rounded-xl border border-[#ded5d1] bg-[#fcfaf9] px-4 text-sm text-[#292027] outline-none transition focus:border-[#7b3654] focus:bg-white focus:ring-4 focus:ring-[#7b3654]/10"
              >
                <option value="All Statuses">
                  All statuses
                </option>

                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {statusMeta[status].label}
                  </option>
                ))}
              </select>
            </FilterField>

            <FilterField label="From Date">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => {
                  setDateRange((previous) => ({
                    ...previous,
                    start: e.target.value,
                  }));
                  setCurrentPage(1);
                }}
                className="h-11 w-full rounded-xl border border-[#ded5d1] bg-[#fcfaf9] px-4 text-sm text-[#292027] outline-none transition focus:border-[#7b3654] focus:bg-white focus:ring-4 focus:ring-[#7b3654]/10"
              />
            </FilterField>

            <FilterField label="To Date">
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => {
                  setDateRange((previous) => ({
                    ...previous,
                    end: e.target.value,
                  }));
                  setCurrentPage(1);
                }}
                className="h-11 w-full rounded-xl border border-[#ded5d1] bg-[#fcfaf9] px-4 text-sm text-[#292027] outline-none transition focus:border-[#7b3654] focus:bg-white focus:ring-4 focus:ring-[#7b3654]/10"
              />
            </FilterField>
          </div>
        </section>

        {/* =====================================================
            RESULTS HEADER
        ====================================================== */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a28f96]">
              Order Registry
            </p>

            <h2 className="mt-1 font-serif text-2xl text-[#2a2026]">
              {filteredOrders.length}{' '}
              {filteredOrders.length === 1
                ? 'order'
                : 'orders'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-[#8c7d83]">
              Show
            </label>

            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(
                  Number(e.target.value)
                );
                setCurrentPage(1);
              }}
              className="h-9 rounded-lg border border-[#ddd3cf] bg-white px-2.5 text-xs font-medium text-[#44383e] outline-none focus:border-[#7b3654]"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* =====================================================
            DESKTOP TABLE
        ====================================================== */}
        <section className="hidden overflow-hidden rounded-2xl border border-[#e6ddd8] bg-white shadow-[0_8px_30px_rgba(52,34,43,0.04)] lg:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-b border-[#eee7e3] bg-[#fbf9f8]">
                  <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-[#93858b]">
                    Order
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-[#93858b]">
                    Customer
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-[#93858b]">
                    Date
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-[#93858b]">
                    Amount
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-[#93858b]">
                    Items
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-[#93858b]">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-[0.18em] text-[#93858b]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#eee7e3]">
                {paginatedOrders.length > 0 ? (
                  paginatedOrders.map((order) => {
                    const orderId = getOrderId(order);
                    const status = getStatus(
                      order.status
                    );
                    const meta = statusMeta[status];

                    return (
                      <tr
                        key={orderId}
                        className="group transition-colors hover:bg-[#fdfbfa]"
                      >
                        <td className="px-6 py-5">
                          <button
                            type="button"
                            onClick={() =>
                              handleViewOrder(order)
                            }
                            className="text-left"
                          >
                            <p className="font-mono text-sm font-semibold text-[#3e2632] transition-colors group-hover:text-[#7a3152]">
                              {order.id || order._id}
                            </p>

                            <p className="mt-1 text-[11px] text-[#a19499]">
                              #{orderId.slice(-8)}
                            </p>
                          </button>
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex items-center gap-3">
                            <CustomerAvatar
                              name={
                                order.customer?.name ||
                                'N'
                              }
                            />

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-[#30262c]">
                                {order.customer?.name ||
                                  'N/A'}
                              </p>

                              <p className="max-w-[220px] truncate text-xs text-[#94868b]">
                                {order.customer?.email ||
                                  'N/A'}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-5 whitespace-nowrap">
                          <p className="text-sm font-medium text-[#40363b]">
                            {formatDate(
                              order.createdAt
                            )}
                          </p>

                          <p className="mt-1 text-[11px] text-[#a19499]">
                            {new Date(
                              order.createdAt
                            ).toLocaleTimeString(
                              'en-IN',
                              {
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )}
                          </p>
                        </td>

                        <td className="px-5 py-5 whitespace-nowrap">
                          <p className="font-serif text-base font-semibold text-[#30242b]">
                            {formatAmount(
                              order.totalAmount
                            )}
                          </p>
                        </td>

                        <td className="px-5 py-5 whitespace-nowrap">
                          <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-[#f5efec] px-2 text-xs font-bold text-[#59484f]">
                            {order.items?.length || 0}
                          </span>
                        </td>

                        <td className="px-5 py-5 whitespace-nowrap">
                          <StatusPill status={status} />
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                router.push(
                                  `${ADMIN_BASE}/orders/${orderId}`
                                )
                              }
                              className="rounded-lg border border-[#ded4d0] bg-white px-3 py-2 text-xs font-semibold text-[#4c3a42] transition hover:border-[#7b3654] hover:text-[#6b2745]"
                            >
                              View
                            </button>

                            <select
                              value={
                                draftStatus[orderId] ??
                                order.status
                              }
                              onChange={(e) =>
                                setDraftStatus(
                                  (previous) => ({
                                    ...previous,
                                    [orderId]:
                                      e.target.value,
                                  })
                                )
                              }
                              className="h-9 rounded-lg border border-[#ded4d0] bg-white px-2 text-xs font-medium text-[#4c3a42] outline-none focus:border-[#7b3654]"
                            >
                              {STATUS_OPTIONS.map(
                                (option) => (
                                  <option
                                    key={option}
                                    value={option}
                                  >
                                    {
                                      statusMeta[
                                        option
                                      ].label
                                    }
                                  </option>
                                )
                              )}
                            </select>

                            <button
                              type="button"
                              disabled={
                                updateOrderStatusMutation.isPending
                              }
                              onClick={() =>
                                handleUpdateStatus(
                                  orderId,
                                  draftStatus[
                                    orderId
                                  ] ?? order.status
                                )
                              }
                              className="rounded-lg bg-[#4b1830] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#361021] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {updateOrderStatusMutation.isPending
                                ? '...'
                                : 'Save'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <EmptyOrdersState
                    hasFilters={Boolean(
                      hasFilters
                    )}
                    onClear={clearFilters}
                  />
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            totalItems={filteredOrders.length}
            itemsPerPage={itemsPerPage}
            onPrevious={() =>
              setCurrentPage(
                Math.max(1, safeCurrentPage - 1)
              )
            }
            onNext={() =>
              setCurrentPage(
                Math.min(
                  totalPages,
                  safeCurrentPage + 1
                )
              )
            }
          />
        </section>

        {/* =====================================================
            MOBILE / TABLET CARDS
        ====================================================== */}
        <section className="space-y-3 lg:hidden">
          {paginatedOrders.length > 0 ? (
            paginatedOrders.map((order) => {
              const orderId = getOrderId(order);
              const status = getStatus(order.status);

              return (
                <article
                  key={orderId}
                  className="overflow-hidden rounded-2xl border border-[#e5dcd7] bg-white shadow-[0_5px_24px_rgba(52,34,43,0.04)]"
                >
                  <div className="flex items-start justify-between gap-4 border-b border-[#eee7e3] p-4 sm:p-5">
                    <div className="flex min-w-0 items-center gap-3">
                      <CustomerAvatar
                        name={
                          order.customer?.name || 'N'
                        }
                      />

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#30262c]">
                          {order.customer?.name ||
                            'N/A'}
                        </p>

                        <p className="truncate text-xs text-[#97898e]">
                          {order.customer?.email ||
                            'N/A'}
                        </p>
                      </div>
                    </div>

                    <StatusPill status={status} />
                  </div>

                  <div className="grid grid-cols-2 gap-px bg-[#eee7e3]">
                    <InfoCell
                      label="Order"
                      value={
                        order.id || order._id
                      }
                      mono
                    />

                    <InfoCell
                      label="Date"
                      value={formatDate(
                        order.createdAt
                      )}
                    />

                    <InfoCell
                      label="Amount"
                      value={formatAmount(
                        order.totalAmount
                      )}
                      emphasis
                    />

                    <InfoCell
                      label="Items"
                      value={`${order.items?.length || 0} ${
                        order.items?.length === 1
                          ? 'item'
                          : 'items'
                      }`}
                    />
                  </div>

                  <div className="space-y-3 p-4 sm:p-5">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `${ADMIN_BASE}/orders/${orderId}`
                        )
                      }
                      className="flex w-full items-center justify-between rounded-xl border border-[#ddd3cf] bg-[#fcfaf9] px-4 py-3 text-left transition hover:border-[#7b3654]"
                    >
                      <span>
                        <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#9a8b91]">
                          Order details
                        </span>

                        <span className="mt-1 block text-sm font-semibold text-[#4b1830]">
                          Open full order
                        </span>
                      </span>

                      <span className="text-lg text-[#7b3654]">
                        →
                      </span>
                    </button>

                    <div>
                      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.15em] text-[#9a8b91]">
                        Update status
                      </label>

                      <div className="flex gap-2">
                        <select
                          value={
                            draftStatus[orderId] ??
                            order.status
                          }
                          onChange={(e) =>
                            setDraftStatus(
                              (previous) => ({
                                ...previous,
                                [orderId]:
                                  e.target.value,
                              })
                            )
                          }
                          className="h-10 min-w-0 flex-1 rounded-xl border border-[#ddd3cf] bg-white px-3 text-xs font-medium text-[#44363d] outline-none focus:border-[#7b3654]"
                        >
                          {STATUS_OPTIONS.map(
                            (option) => (
                              <option
                                key={option}
                                value={option}
                              >
                                {
                                  statusMeta[option]
                                    .label
                                }
                              </option>
                            )
                          )}
                        </select>

                        <button
                          type="button"
                          disabled={
                            updateOrderStatusMutation.isPending
                          }
                          onClick={() =>
                            handleUpdateStatus(
                              orderId,
                              draftStatus[
                                orderId
                              ] ?? order.status
                            )
                          }
                          className="h-10 rounded-xl bg-[#4b1830] px-4 text-xs font-semibold text-white disabled:opacity-50"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-2xl border border-[#e5dcd7] bg-white">
              <div className="px-6 py-14 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#f4eeeb] text-2xl text-[#80636e]">
                  ◌
                </div>

                <h3 className="font-serif text-2xl text-[#30242a]">
                  No orders found
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#93858b]">
                  No orders match the current search
                  and filter criteria.
                </p>

                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-5 text-sm font-semibold text-[#6b2745] hover:text-[#43152c]"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          )}

          {paginatedOrders.length > 0 && (
            <Pagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              totalItems={filteredOrders.length}
              itemsPerPage={itemsPerPage}
              onPrevious={() =>
                setCurrentPage(
                  Math.max(
                    1,
                    safeCurrentPage - 1
                  )
                )
              }
              onNext={() =>
                setCurrentPage(
                  Math.min(
                    totalPages,
                    safeCurrentPage + 1
                  )
                )
              }
            />
          )}
        </section>
      </main>

      {/* =====================================================
          ORDER DETAIL MODAL
      ====================================================== */}
      {showModal && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={closeModal}
          onCancel={handleCancelOrder}
          isCancelling={
            cancelOrderMutation.isPending
          }
          formatAmount={formatAmount}
          formatDate={formatDate}
          formatDateTime={formatDateTime}
          getStatusColor={getStatusColor}
          getStatus={getStatus}
          onUpdateStatus={handleUpdateStatus}
          draftStatus={draftStatus}
          setDraftStatus={setDraftStatus}
        />
      )}
    </div>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  label,
  value,
  icon,
  accent = 'default',
}: {
  label: string;
  value: number;
  icon: string;
  accent?:
    | 'default'
    | 'amber'
    | 'violet'
    | 'blue'
    | 'green'
    | 'rose';
}) {
  const accentMap = {
    default: {
      icon: 'bg-[#f4eeeb] text-[#6b2745]',
      value: 'text-[#2f252b]',
    },
    amber: {
      icon: 'bg-amber-50 text-amber-700',
      value: 'text-amber-800',
    },
    violet: {
      icon: 'bg-violet-50 text-violet-700',
      value: 'text-violet-800',
    },
    blue: {
      icon: 'bg-blue-50 text-blue-700',
      value: 'text-blue-800',
    },
    green: {
      icon: 'bg-emerald-50 text-emerald-700',
      value: 'text-emerald-800',
    },
    rose: {
      icon: 'bg-rose-50 text-rose-700',
      value: 'text-rose-800',
    },
  };

  const current = accentMap[accent];

  return (
    <div className="rounded-2xl border border-[#e5dcd7] bg-white p-4 shadow-[0_5px_20px_rgba(52,34,43,0.03)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9b8c92]">
            {label}
          </p>

          <p
            className={`mt-2 font-serif text-3xl font-semibold ${current.value}`}
          >
            {value}
          </p>
        </div>

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold ${current.icon}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   FILTER FIELD
============================================================ */

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-[#95868c]">
        {label}
      </label>

      {children}
    </div>
  );
}

/* ============================================================
   CUSTOMER AVATAR
============================================================ */

function CustomerAvatar({
  name,
}: {
  name: string;
}) {
  const initial =
    name.trim().charAt(0).toUpperCase() || 'N';

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f0e5e8] font-serif text-sm font-semibold text-[#6b2745]">
      {initial}
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
      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] ${meta.bg} ${meta.text} ${meta.border}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${meta.dot}`}
      />

      {meta.label}
    </span>
  );
}

/* ============================================================
   INFO CELL
============================================================ */

function InfoCell({
  label,
  value,
  mono = false,
  emphasis = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  emphasis?: boolean;
}) {
  return (
    <div className="bg-white p-4">
      <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#a09297]">
        {label}
      </p>

      <p
        className={`mt-1 truncate ${
          emphasis
            ? 'font-serif text-base font-semibold text-[#30242b]'
            : 'text-sm font-medium text-[#46383f]'
        } ${mono ? 'font-mono' : ''}`}
      >
        {value}
      </p>
    </div>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyOrdersState({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean;
  onClear: () => void;
}) {
  return (
    <tr>
      <td colSpan={7}>
        <div className="px-6 py-20 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#f4eeeb] text-2xl text-[#80636e]">
            ◌
          </div>

          <h3 className="font-serif text-2xl text-[#30242a]">
            No orders found
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#93858b]">
            There are no orders matching your current
            search and filter criteria.
          </p>

          {hasFilters && (
            <button
              type="button"
              onClick={onClear}
              className="mt-5 text-sm font-semibold text-[#6b2745] hover:text-[#43152c]"
            >
              Clear all filters
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

/* ============================================================
   PAGINATION
============================================================ */

function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPrevious,
  onNext,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  if (totalItems === 0) return null;

  const start =
    (currentPage - 1) * itemsPerPage + 1;

  const end = Math.min(
    currentPage * itemsPerPage,
    totalItems
  );

  return (
    <div className="flex flex-col gap-3 border-t border-[#eee7e3] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="text-xs text-[#8f8086]">
        Showing{' '}
        <span className="font-semibold text-[#51434a]">
          {start}–{end}
        </span>{' '}
        of{' '}
        <span className="font-semibold text-[#51434a]">
          {totalItems}
        </span>{' '}
        orders
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={currentPage === 1}
          className="rounded-lg border border-[#ddd3cf] bg-white px-3 py-2 text-xs font-semibold text-[#51434a] transition hover:border-[#7b3654] hover:text-[#6b2745] disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Previous
        </button>

        <span className="rounded-lg bg-[#f4eeeb] px-3 py-2 text-xs font-bold text-[#5c3d4a]">
          {currentPage} / {totalPages}
        </span>

        <button
          type="button"
          onClick={onNext}
          disabled={currentPage === totalPages}
          className="rounded-lg border border-[#ddd3cf] bg-white px-3 py-2 text-xs font-semibold text-[#51434a] transition hover:border-[#7b3654] hover:text-[#6b2745] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   ORDER DETAILS MODAL
============================================================ */

function OrderDetailsModal({
  order,
  onClose,
  onCancel,
  isCancelling,
  formatAmount,
  formatDate,
  formatDateTime,
  getStatusColor,
  getStatus,
  onUpdateStatus,
  draftStatus,
  setDraftStatus,
}: {
  order: OrderData;
  onClose: () => void;
  onCancel: (orderId: string) => void;
  isCancelling: boolean;
  formatAmount: (amount?: number) => string;
  formatDate: (date?: string) => string;
  formatDateTime: (date?: string) => string;
  getStatusColor: (status: string) => string;
  getStatus: (status: string) => Status;
  onUpdateStatus: (
    orderId: string,
    status: string
  ) => void;
  draftStatus: Record<string, string>;
  setDraftStatus: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
}) {
  const orderId = order._id || order.id || '';
  const status = getStatus(order.status);
  const meta = statusMeta[status];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#21171d]/60 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/20 bg-[#faf8f7] shadow-[0_30px_100px_rgba(25,12,19,0.3)]">
        {/* Modal header */}
        <div className="shrink-0 border-b border-[#e7dfdb] bg-white px-5 py-5 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a18f97]">
                Order Details
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-3">
                <h2 className="font-mono text-lg font-semibold text-[#32262d] sm:text-xl">
                  {order.id || order._id}
                </h2>

                <StatusPill status={status} />
              </div>

              <p className="mt-1.5 text-xs text-[#94868c]">
                Placed {formatDateTime(order.createdAt)}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f5f0ed] text-lg text-[#695961] transition hover:bg-[#eee5e1] hover:text-[#3d2c34]"
              aria-label="Close order details"
            >
              ×
            </button>
          </div>
        </div>

        {/* Modal content */}
        <div className="overflow-y-auto">
          <div className="space-y-5 p-4 sm:p-7">
            {/* Top status banner */}
            <div
              className={`rounded-2xl border ${meta.border} ${meta.bg} p-4 sm:p-5`}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p
                    className={`text-xs font-bold uppercase tracking-[0.14em] ${meta.text}`}
                  >
                    Current status
                  </p>

                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${meta.dot}`}
                    />

                    <span
                      className={`font-serif text-xl font-semibold ${meta.text}`}
                    >
                      {meta.label}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-[#7f7076]">
                    {meta.description}
                  </p>
                </div>

                <div className="flex w-full gap-2 md:w-auto">
                  <select
                    value={
                      draftStatus[orderId] ??
                      order.status
                    }
                    onChange={(e) =>
                      setDraftStatus(
                        (previous) => ({
                          ...previous,
                          [orderId]:
                            e.target.value,
                        })
                      )
                    }
                    className="h-10 min-w-0 flex-1 rounded-xl border border-[#d9cec9] bg-white px-3 text-xs font-medium text-[#43343b] outline-none focus:border-[#7b3654] md:w-44 md:flex-none"
                  >
                    {STATUS_OPTIONS.map(
                      (option) => (
                        <option
                          key={option}
                          value={option}
                        >
                          {statusMeta[option].label}
                        </option>
                      )
                    )}
                  </select>

                  <button
                    type="button"
                    disabled={
                      draftStatus[orderId] ===
                        order.status ||
                      (!draftStatus[orderId] &&
                        !order.status)
                    }
                    onClick={() =>
                      onUpdateStatus(
                        orderId,
                        draftStatus[orderId] ??
                          order.status
                      )
                    }
                    className="h-10 rounded-xl bg-[#4b1830] px-4 text-xs font-semibold text-white transition hover:bg-[#361021] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>

            {/* Customer + shipping */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <DetailPanel
                eyebrow="Customer"
                title="Customer information"
              >
                <div className="flex items-center gap-3 border-b border-[#eee7e3] pb-4">
                  <CustomerAvatar
                    name={
                      order.customer?.name || 'N'
                    }
                  />

                  <div>
                    <p className="font-semibold text-[#30252b]">
                      {order.customer?.name ||
                        'N/A'}
                    </p>

                    <p className="text-xs text-[#93858b]">
                      {order.customer?.email ||
                        'N/A'}
                    </p>
                  </div>
                </div>

                <DetailRow
                  label="Phone"
                  value={
                    order.customer?.phone || 'N/A'
                  }
                />

                <DetailRow
                  label="User ID"
                  value={order.userId || 'N/A'}
                  mono
                />
              </DetailPanel>

              <DetailPanel
                eyebrow="Delivery"
                title="Shipping address"
              >
                <div className="rounded-xl bg-[#faf7f5] p-4 text-sm leading-6 text-[#44373e]">
                  <p>
                    {order.shippingAddress?.street ||
                      'N/A'}
                  </p>

                  <p>
                    {order.shippingAddress?.city ||
                      'N/A'}
                    {order.shippingAddress?.state
                      ? `, ${order.shippingAddress.state}`
                      : ''}
                  </p>

                  <p>
                    {order.shippingAddress?.zipCode ||
                      ''}
                  </p>

                  <p>
                    {order.shippingAddress?.country ||
                      ''}
                  </p>
                </div>
              </DetailPanel>
            </div>

            {/* Items */}
            <DetailPanel
              eyebrow="Products"
              title={`Order items • ${
                order.items?.length || 0
              }`}
            >
              <div className="divide-y divide-[#eee7e3]">
                {order.items?.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 py-4 first:pt-0 last:pb-0"
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-16 w-16 shrink-0 rounded-xl border border-[#e4dcd8] object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#f3ece9] text-lg text-[#987f89]">
                          ◇
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#33282e]">
                          {item.name}
                        </p>

                        <p className="mt-1 text-xs text-[#94858b]">
                          Qty {item.quantity} ×{' '}
                          {formatAmount(item.price)}
                        </p>
                      </div>

                      <p className="shrink-0 font-serif text-sm font-semibold text-[#34262d]">
                        {formatAmount(
                          item.price *
                            item.quantity
                        )}
                      </p>
                    </div>
                  )
                )}
              </div>
            </DetailPanel>

            {/* Payment + summary */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <DetailPanel
                eyebrow="Payment"
                title="Payment information"
              >
                <DetailRow
                  label="Method"
                  value={
                    order.paymentMethod || 'N/A'
                  }
                />

                <DetailRow
                  label="Payment status"
                  value={
                    order.paymentStatus || 'N/A'
                  }
                />

                <DetailRow
                  label="Order date"
                  value={formatDateTime(
                    order.createdAt
                  )}
                />
              </DetailPanel>

              <DetailPanel
                eyebrow="Summary"
                title="Order total"
              >
                <div className="space-y-3">
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-[#84757b]">
                      Order subtotal
                    </span>

                    <span className="font-medium text-[#3e3238]">
                      {formatAmount(
                        order.totalAmount
                      )}
                    </span>
                  </div>

                  {order.coupon && (
                    <div className="flex justify-between gap-4 text-sm">
                      <span className="text-[#84757b]">
                        Coupon ·{' '}
                        {order.coupon.code}
                      </span>

                      <span className="font-medium text-emerald-700">
                        -
                        {formatAmount(
                          order.discountAmount ||
                            0
                        )}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-[#e9e1dd] pt-3">
                    <div className="flex items-end justify-between gap-4">
                      <span className="text-sm font-semibold text-[#4d3d44]">
                        Total
                      </span>

                      <span className="font-serif text-2xl font-semibold text-[#4b1830]">
                        {formatAmount(
                          order.totalAmount
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </DetailPanel>
            </div>

            {/* Notes */}
            {order.notes && (
              <DetailPanel
                eyebrow="Additional"
                title="Order notes"
              >
                <div className="rounded-xl bg-[#faf7f5] p-4 text-sm leading-6 text-[#5e4e55]">
                  {order.notes}
                </div>
              </DetailPanel>
            )}

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-[#e8dfdb] pt-5 sm:flex-row sm:justify-between">
              <div>
                {order.status !== 'cancelled' &&
                  order.status !== 'delivered' && (
                    <button
                      type="button"
                      disabled={isCancelling}
                      onClick={() =>
                        onCancel(orderId)
                      }
                      className="w-full rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50 sm:w-auto"
                    >
                      {isCancelling
                        ? 'Cancelling...'
                        : 'Cancel order'}
                    </button>
                  )}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = `${ADMIN_BASE}/orders/${orderId}`;
                  }}
                  className="rounded-xl border border-[#ddd3cf] bg-white px-5 py-2.5 text-xs font-semibold text-[#4c3b43] transition hover:border-[#7b3654] hover:text-[#6b2745]"
                >
                  Open full page
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl bg-[#4b1830] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#361021]"
                >
                  Close details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   DETAIL PANEL
============================================================ */

function DetailPanel({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#e6ddd8] bg-white p-5 shadow-[0_5px_20px_rgba(52,34,43,0.025)]">
      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#a08f96]">
        {eyebrow}
      </p>

      <h3 className="mt-1 mb-4 font-serif text-xl text-[#30242b]">
        {title}
      </h3>

      {children}
    </section>
  );
}

/* ============================================================
   DETAIL ROW
============================================================ */

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-5 border-t border-[#eee7e3] py-3 first:border-t-0">
      <span className="text-xs text-[#96878d]">
        {label}
      </span>

      <span
        className={`text-right text-sm font-medium text-[#45373e] ${
          mono ? 'font-mono text-xs' : ''
        }`}
      >
        {value}
      </span>
    </div>
  );
}