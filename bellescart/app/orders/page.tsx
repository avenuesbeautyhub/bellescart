'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRequireUserAuth } from '@/auth/user';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import OrderCard from '@/components/OrderCard/OrderCard';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import {
  useOrders,
  useCancelOrder,
} from '@/hooks/user/useOrderQueries';
import { globalToast } from '@/utils/globalToast';

export default function OrdersPage() {
  const router = useRouter();
  const { loaded, isAuthenticated } = useRequireUserAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });

  const [sortBy, setSortBy] = useState('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const {
    data: ordersData,
    isLoading,
    error,
  } = useOrders();

  const cancelOrder = useCancelOrder();

  const orders = ordersData?.data?.orders || [];

  const handleCancelOrder = async (orderId: string) => {
    try {
      await cancelOrder.mutateAsync(orderId);
      globalToast.order.cancelSuccess();
    } catch (error) {
      console.error('Failed to cancel order:', error);
      globalToast.order.cancelFailed();
    }
  };

  const statuses = React.useMemo(() => {
    const statusSet = new Set<string>();

    orders.forEach((order) => {
      if (order.status) {
        statusSet.add(order.status);
      }
    });

    return Array.from(statusSet).sort();
  }, [orders]);

  const filteredOrders = orders.filter((order) => {
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();

      const matchesId =
        order._id?.toLowerCase().includes(searchLower) ||
        order.id?.toLowerCase().includes(searchLower);

      const matchesStatus =
        order.status?.toLowerCase().includes(searchLower);

      if (!matchesId && !matchesStatus) {
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

      endDate.setHours(23, 59, 59);

      if (orderDate > endDate) {
        return false;
      }
    }

    return true;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );

      case 'date-asc':
        return (
          new Date(a.createdAt || 0).getTime() -
          new Date(b.createdAt || 0).getTime()
        );

      case 'amount-desc':
        return (b.totalAmount || 0) - (a.totalAmount || 0);

      case 'amount-asc':
        return (a.totalAmount || 0) - (b.totalAmount || 0);

      case 'status':
        return (a.status || '').localeCompare(b.status || '');

      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(
    sortedOrders.length / itemsPerPage
  );

  const paginatedOrders = sortedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const clearFilters = () => {
    setSelectedStatus('All Statuses');
    setSearchQuery('');
    setDateRange({
      start: '',
      end: '',
    });
    setSortBy('date-desc');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    selectedStatus !== 'All Statuses' ||
    !!searchQuery ||
    !!dateRange.start ||
    !!dateRange.end;

  if (!loaded) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fafafa]">
        <Navbar />

        <div className="flex-1 flex items-center justify-center">
          <Loader size="lg" text="Loading..." />
        </div>

        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fafafa]">
        <Navbar />

        <div className="flex-1 flex items-center justify-center">
          <Loader size="lg" text="Loading orders..." />
        </div>

        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fafafa]">
        <Navbar />

        <main className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
              <svg
                className="h-7 w-7 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M12 9v3.75m0 3.75h.008M10.29 3.86l-8.1 14A2 2 0 003.92 21h16.16a2 2 0 001.73-3.14l-8.1-14a2 2 0 00-3.42 0z"
                />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-gray-900">
              We couldn't load your orders
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Something went wrong while retrieving your order
              history.
            </p>

            <div className="mt-6">
              <Button
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] text-gray-900">
      <Navbar />

      <main className="flex-1 pb-16">
        {/* Header */}
        <section className="border-b border-gray-100 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pink-50">
                  <svg
                    className="h-6 w-6 text-pink-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.7}
                      d="M20 7h-2.586a1 1 0 01-.707-.293l-1.828-1.828A1 1 0 0014.172 4H9.828a1 1 0 00-.707.293L7.293 6.121A1 1 0 016.586 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.7}
                      d="M8 13h8M8 17h5"
                    />
                  </svg>
                </div>

                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-pink-600">
                    Your purchases
                  </p>

                  <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
                    My Orders
                  </h1>

                  <p className="mt-1 text-sm text-gray-500">
                    Track and manage your purchases
                  </p>
                </div>
              </div>

              <Link href="/products">
                <Button className="bg-gray-950 px-5 py-2.5 text-sm font-semibold hover:bg-gray-800">
                  Continue Shopping
                  <svg
                    className="ml-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
          {/* Search */}
          <div className="mb-5">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by order ID or status..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-11 pr-11 text-sm text-gray-900 shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-pink-300 focus:ring-4 focus:ring-pink-500/10"
              />

              <svg
                className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  aria-label="Clear search"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Filters */}
          <button
            type="button"
            onClick={() =>
              setShowMobileFilters(!showMobileFilters)
            }
            className="mb-5 flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-semibold text-gray-800 shadow-sm lg:hidden"
          >
            <span className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>

              Filters
            </span>

            <span className="flex items-center gap-2">
              {hasActiveFilters && (
                <span className="h-2 w-2 rounded-full bg-pink-500" />
              )}

              <svg
                className={`h-4 w-4 transition-transform ${
                  showMobileFilters ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </span>
          </button>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {/* Filters */}
            <aside
              className={`lg:col-span-1 ${
                showMobileFilters
                  ? 'block'
                  : 'hidden lg:block'
              }`}
            >
              <div className="space-y-4 lg:sticky lg:top-6">
                {/* Filter Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">
                      Filters
                    </h2>
                    <p className="text-xs text-gray-500">
                      Refine your orders
                    </p>
                  </div>

                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-xs font-semibold text-pink-600 hover:text-pink-700"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Status */}
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <h3 className="mb-3 text-sm font-semibold text-gray-900">
                    Order status
                  </h3>

                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStatus('All Statuses');
                        setCurrentPage(1);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition ${
                        selectedStatus === 'All Statuses'
                          ? 'bg-gray-950 font-semibold text-white'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span>All statuses</span>

                      <span
                        className={`text-xs ${
                          selectedStatus === 'All Statuses'
                            ? 'text-gray-300'
                            : 'text-gray-400'
                        }`}
                      >
                        {orders.length}
                      </span>
                    </button>

                    {statuses.map((status) => {
                      const count = orders.filter(
                        (order) => order.status === status
                      ).length;

                      return (
                        <button
                          type="button"
                          key={status}
                          onClick={() => {
                            setSelectedStatus(status);
                            setCurrentPage(1);
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${
                            selectedStatus === status
                              ? 'bg-pink-50 font-semibold text-pink-700'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <span className="capitalize">
                            {status}
                          </span>

                          <span className="text-xs text-gray-400">
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Date */}
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <h3 className="mb-3 text-sm font-semibold text-gray-900">
                    Date range
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-500">
                        From
                      </label>

                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => {
                          setDateRange({
                            ...dateRange,
                            start: e.target.value,
                          });
                          setCurrentPage(1);
                        }}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-500/10"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-500">
                        To
                      </label>

                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => {
                          setDateRange({
                            ...dateRange,
                            end: e.target.value,
                          });
                          setCurrentPage(1);
                        }}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-500/10"
                      />
                    </div>
                  </div>
                </div>

                {/* Sort */}
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <h3 className="mb-3 text-sm font-semibold text-gray-900">
                    Sort orders
                  </h3>

                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-500/10"
                  >
                    <option value="date-desc">
                      Newest first
                    </option>
                    <option value="date-asc">
                      Oldest first
                    </option>
                    <option value="amount-desc">
                      Amount: high to low
                    </option>
                    <option value="amount-asc">
                      Amount: low to high
                    </option>
                    <option value="status">
                      Status
                    </option>
                  </select>
                </div>

                {/* Count */}
                <div className="rounded-2xl bg-gray-950 p-5 text-white">
                  <p className="text-xs font-medium text-gray-400">
                    Matching orders
                  </p>

                  <p className="mt-1 text-3xl font-bold">
                    {sortedOrders.length}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {hasActiveFilters
                      ? 'Based on your current filters'
                      : 'Across your order history'}
                  </p>
                </div>
              </div>
            </aside>

            {/* Results */}
            <section className="lg:col-span-3">
              {/* Results toolbar */}
              <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {sortedOrders.length}{' '}
                    {sortedOrders.length === 1
                      ? 'order'
                      : 'orders'}
                  </p>

                  <p className="mt-0.5 text-xs text-gray-500">
                    {hasActiveFilters
                      ? 'Filtered results'
                      : 'Your complete order history'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden text-xs text-gray-500 sm:block">
                    Show
                  </span>

                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(
                        parseInt(e.target.value)
                      );
                      setCurrentPage(1);
                    }}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-500/10"
                  >
                    <option value={6}>6 per page</option>
                    <option value={12}>12 per page</option>
                    <option value={24}>24 per page</option>
                  </select>
                </div>
              </div>

              {paginatedOrders.length > 0 ? (
                <>
                  {/* Orders */}
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {paginatedOrders.map((order) => (
                      <OrderCard
                        key={order._id || order.id}
                        order={order}
                        onClick={() =>
                          router.push(
                            `/orders/${order._id || order.id}`
                          )
                        }
                        onCancel={handleCancelOrder}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-7 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-center text-xs text-gray-500 sm:text-left">
                        Showing{' '}
                        <span className="font-semibold text-gray-800">
                          {(currentPage - 1) * itemsPerPage + 1}
                        </span>{' '}
                        –{' '}
                        <span className="font-semibold text-gray-800">
                          {Math.min(
                            currentPage * itemsPerPage,
                            sortedOrders.length
                          )}
                        </span>{' '}
                        of{' '}
                        <span className="font-semibold text-gray-800">
                          {sortedOrders.length}
                        </span>
                      </p>

                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentPage(
                              Math.max(
                                1,
                                currentPage - 1
                              )
                            )
                          }
                          disabled={currentPage === 1}
                          className="flex h-9 items-center gap-1 rounded-xl border border-gray-200 px-3 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <svg
                            className="h-3.5 w-3.5"
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
                          <span className="hidden sm:inline">
                            Previous
                          </span>
                        </button>

                        <div className="flex items-center gap-1">
                          {Array.from(
                            {
                              length: Math.min(
                                5,
                                totalPages
                              ),
                            },
                            (_, i) => {
                              let pageNum;

                              if (totalPages <= 5) {
                                pageNum = i + 1;
                              } else if (
                                currentPage <= 3
                              ) {
                                pageNum = i + 1;
                              } else if (
                                currentPage >=
                                totalPages - 2
                              ) {
                                pageNum =
                                  totalPages - 4 + i;
                              } else {
                                pageNum =
                                  currentPage - 2 + i;
                              }

                              return (
                                <button
                                  type="button"
                                  key={pageNum}
                                  onClick={() =>
                                    setCurrentPage(pageNum)
                                  }
                                  className={`h-9 w-9 rounded-xl text-xs font-semibold transition ${
                                    currentPage === pageNum
                                      ? 'bg-gray-950 text-white'
                                      : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            }
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setCurrentPage(
                              Math.min(
                                totalPages,
                                currentPage + 1
                              )
                            )
                          }
                          disabled={
                            currentPage === totalPages
                          }
                          className="flex h-9 items-center gap-1 rounded-xl border border-gray-200 px-3 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <span className="hidden sm:inline">
                            Next
                          </span>

                          <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* No Results */
                <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-6">
                  <div className="max-w-md text-center">
                    <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50">
                      <svg
                        className="h-8 w-8 text-gray-400"
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

                    <h2 className="text-xl font-bold text-gray-900">
                      {orders.length === 0
                        ? 'No orders yet'
                        : 'No matching orders'}
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                      {orders.length === 0
                        ? "You haven't placed any orders yet. Your purchases will appear here once you do."
                        : 'Try adjusting your search or filters to find the order you are looking for.'}
                    </p>

                    <div className="mt-6">
                      {orders.length === 0 ? (
                        <Link href="/products">
                          <Button className="bg-gray-950 hover:bg-gray-800">
                            Browse Products
                          </Button>
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="rounded-xl bg-gray-950 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}