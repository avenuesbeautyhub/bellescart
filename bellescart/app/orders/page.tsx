'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
import { initializeCsrfToken } from '@/services/apiInterceptor';

type IconProps = {
  className?: string;
};

const Icon = {
  Search: ({ className = 'h-5 w-5' }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),

  ShoppingBag: ({ className = 'h-5 w-5' }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),

  Package: ({ className = 'h-5 w-5' }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
    </svg>
  ),

  Clock: ({ className = 'h-5 w-5' }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M12 7v5l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),

  Check: ({ className = 'h-5 w-5' }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m5 12 4 4L19 6" />
    </svg>
  ),

  Filter: ({ className = 'h-5 w-5' }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.59a1 1 0 01-.29.7l-6.42 6.42a1 1 0 00-.29.71V17l-4 4v-6.58a1 1 0 00-.29-.71L3.29 7.29A1 1 0 013 6.59V4z" />
    </svg>
  ),

  Calendar: ({ className = 'h-5 w-5' }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M8 2v4m8-4v4M4 9h16M6 4h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" />
    </svg>
  ),

  Sliders: ({ className = 'h-5 w-5' }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  ),

  X: ({ className = 'h-4 w-4' }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),

  ArrowRight: ({ className = 'h-4 w-4' }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  ),

  ChevronLeft: ({ className = 'h-4 w-4' }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m15 19-7-7 7-7" />
    </svg>
  ),

  ChevronRight: ({ className = 'h-4 w-4' }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m9 5 7 7-7 7" />
    </svg>
  ),

  Rotate: ({ className = 'h-4 w-4' }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v6h6M20 20v-6h-6M19.07 8.93A8 8 0 006.34 5.34L4 7M4.93 15.07a8 8 0 0012.73 3.59L20 16" />
    </svg>
  ),
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatDate = (value?: string) => {
  if (!value) return 'Date unavailable';

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
};

const normalizeStatus = (status?: string) =>
  (status || 'unknown').toLowerCase().replace(/[_-]+/g, ' ');

const getStatusTone = (status?: string) => {
  const value = normalizeStatus(status);

  if (value.includes('cancel') || value.includes('fail') || value.includes('refund')) {
    return 'bg-red-50 text-red-700 border-red-100';
  }

  if (value.includes('deliver') || value.includes('complete') || value.includes('success')) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  }

  if (value.includes('ship') || value.includes('process') || value.includes('confirm')) {
    return 'bg-blue-50 text-blue-700 border-blue-100';
  }

  return 'bg-amber-50 text-amber-700 border-amber-100';
};

export default function OrdersPage() {
  const router = useRouter();

  const { loaded, isAuthenticated } = useRequireUserAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
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

  useEffect(() => {
    initializeCsrfToken();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, dateRange.start, dateRange.end, sortBy, itemsPerPage]);

  const handleCancelOrder = async (orderId: string) => {
    try {
      await cancelOrder.mutateAsync(orderId);
      globalToast.order.cancelSuccess();
    } catch (error) {
      console.error('Failed to cancel order:', error);
      globalToast.order.cancelFailed();
    }
  };

  const statuses = useMemo(() => {
    const set = new Set<string>();

    orders.forEach((order) => {
      if (order.status) set.add(order.status);
    });

    return Array.from(set).sort();
  }, [orders]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    orders.forEach((order) => {
      const status = order.status || 'unknown';
      counts[status] = (counts[status] || 0) + 1;
    });

    return counts;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();

        const matchesId =
          order._id?.toLowerCase().includes(query) ||
          order.id?.toLowerCase().includes(query);

        const matchesStatus =
          order.status?.toLowerCase().includes(query);

        if (!matchesId && !matchesStatus) return false;
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

        if (orderDate < startDate) return false;
      }

      if (dateRange.end && order.createdAt) {
        const orderDate = new Date(order.createdAt);
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999);

        if (orderDate > endDate) return false;
      }

      return true;
    });
  }, [orders, searchQuery, selectedStatus, dateRange]);

  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();

        case 'amount-desc':
          return (b.totalAmount || 0) - (a.totalAmount || 0);

        case 'amount-asc':
          return (a.totalAmount || 0) - (b.totalAmount || 0);

        case 'status':
          return (a.status || '').localeCompare(b.status || '');

        case 'date-desc':
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });
  }, [filteredOrders, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedOrders.length / itemsPerPage));

  const paginatedOrders = sortedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalSpent = useMemo(
    () => orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
    [orders]
  );

  const activeOrders = useMemo(
    () =>
      orders.filter((order) => {
        const status = normalizeStatus(order.status);
        return !(
          status.includes('cancel') ||
          status.includes('deliver') ||
          status.includes('complete') ||
          status.includes('refund')
        );
      }).length,
    [orders]
  );

  const completedOrders = useMemo(
    () =>
      orders.filter((order) => {
        const status = normalizeStatus(order.status);
        return status.includes('deliver') || status.includes('complete');
      }).length,
    [orders]
  );

  const clearFilters = () => {
    setSelectedStatus('All Statuses');
    setSearchQuery('');
    setDateRange({ start: '', end: '' });
    setSortBy('date-desc');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    selectedStatus !== 'All Statuses' ||
    !!searchQuery ||
    !!dateRange.start ||
    !!dateRange.end;

  const activeFilterCount = [
    selectedStatus !== 'All Statuses',
    !!searchQuery,
    !!dateRange.start,
    !!dateRange.end,
  ].filter(Boolean).length;

  const pageStart =
    sortedOrders.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;

  const pageEnd = Math.min(
    currentPage * itemsPerPage,
    sortedOrders.length
  );

  if (!loaded) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f8f6f8]">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <Loader size="lg" text="Loading your account..." />
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f8f6f8]">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <Loader size="lg" text="Loading your orders..." />
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f8f6f8]">
        <Navbar />

        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="w-full max-w-lg overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-[0_24px_80px_rgba(24,15,24,0.08)]">
            <div className="bg-[#1d171d] px-7 py-8 text-white">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-pink-300">
                Order history
              </p>
              <h1 className="mt-2 text-2xl font-semibold">
                We couldn't load your orders
              </h1>
            </div>

            <div className="p-7 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                <Icon.Package className="h-7 w-7" />
              </div>

              <p className="mx-auto mt-5 max-w-sm text-sm leading-6 text-gray-500">
                Something went wrong while retrieving your order history.
                Please try again.
              </p>

              <Button
                className="mt-6 rounded-xl"
                onClick={() => window.location.reload()}
              >
                Try again
              </Button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f6f8] text-gray-900">
      <Navbar />

      <main className="pb-16">
        {/* HERO */}
        <section className="relative overflow-hidden bg-[#171217] text-white">
          <div className="absolute -right-24 -top-32 h-96 w-96 rounded-full bg-pink-500/10 blur-3xl" />
          <div className="absolute -bottom-48 left-1/3 h-[30rem] w-[30rem] rounded-full bg-fuchsia-500/10 blur-3xl" />

          <div className="relative mx-auto max-w-[1440px] px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
            <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-end">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-pink-200">
                    Your BellesCart journey
                  </span>
                </div>

                <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.045em] sm:text-5xl lg:text-6xl">
                  Every order,
                  <span className="block text-pink-200">beautifully kept.</span>
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-white/55 sm:text-base">
                  Keep track of your purchases, revisit order details, and
                  manage your complete BellesCart shopping history.
                </p>

                <div className="mt-7 flex flex-wrap gap-2">
                  <Link href="/products">
                    <Button className="rounded-full bg-white px-5 py-2.5 text-xs font-bold text-gray-950 hover:bg-gray-100">
                      Continue shopping
                      <Icon.ArrowRight className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Hero summary */}
              <div className="grid grid-cols-2 gap-2">
                <HeroStat
                  label="Total orders"
                  value={orders.length}
                  icon={<Icon.ShoppingBag className="h-4 w-4" />}
                />
                <HeroStat
                  label="In progress"
                  value={activeOrders}
                  icon={<Icon.Clock className="h-4 w-4" />}
                />
                <HeroStat
                  label="Completed"
                  value={completedOrders}
                  icon={<Icon.Check className="h-4 w-4" />}
                />
                <HeroStat
                  label="Total spent"
                  value={formatCurrency(totalSpent)}
                  compact
                  icon={<span className="text-sm font-semibold">₹</span>}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {/* SEARCH */}
          <div className="-mt-1 mb-6">
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_16px_45px_rgba(24,15,24,0.06)]">
              <div className="flex items-center">
                <div className="pl-4 text-gray-400">
                  <Icon.Search className="h-5 w-5" />
                </div>

                <input
                  type="text"
                  placeholder="Search your order ID or status..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent px-3 py-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 sm:py-5"
                  aria-label="Search orders"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
                    aria-label="Clear search"
                  >
                    <Icon.X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* QUICK SUMMARY */}
          <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SummaryCard
              label="All orders"
              value={orders.length}
              detail="Complete history"
            />
            <SummaryCard
              label="Showing"
              value={sortedOrders.length}
              detail={hasActiveFilters ? 'After filters' : 'All matching'}
            />
            <SummaryCard
              label="Current page"
              value={sortedOrders.length ? `${pageStart}–${pageEnd}` : '0'}
              detail={`of ${sortedOrders.length}`}
            />
            <SummaryCard
              label="Order value"
              value={formatCurrency(totalSpent)}
              detail="Lifetime total"
            />
          </div>

          {/* MOBILE FILTER BUTTON */}
          <button
            type="button"
            onClick={() => setShowMobileFilters((value) => !value)}
            className="mb-5 flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-semibold text-gray-800 shadow-sm lg:hidden"
          >
            <span className="flex items-center gap-2.5">
              <Icon.Filter className="h-4 w-4 text-gray-500" />
              Filter & refine
              {activeFilterCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-pink-600 px-1.5 text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </span>

            <span className={`text-gray-400 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`}>
              ↓
            </span>
          </button>

          {/* MOBILE FILTER PANEL */}
          {showMobileFilters && (
            <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:hidden">
              <FilterPanel
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
                statuses={statuses}
                statusCounts={statusCounts}
                dateRange={dateRange}
                setDateRange={setDateRange}
                sortBy={sortBy}
                setSortBy={setSortBy}
                clearFilters={clearFilters}
                hasActiveFilters={hasActiveFilters}
                onDone={() => setShowMobileFilters(false)}
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-7 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]">
            {/* DESKTOP SIDEBAR */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-pink-500">
                      Refine
                    </p>
                    <h2 className="mt-1 text-base font-semibold text-gray-950">
                      Order history
                    </h2>
                  </div>

                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-xs font-semibold text-pink-600 hover:text-pink-700"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <FilterPanel
                    selectedStatus={selectedStatus}
                    setSelectedStatus={setSelectedStatus}
                    statuses={statuses}
                    statusCounts={statusCounts}
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    clearFilters={clearFilters}
                    hasActiveFilters={hasActiveFilters}
                  />
                </div>

                <div className="relative overflow-hidden rounded-2xl bg-[#1d171d] p-5 text-white">
                  <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-pink-500/10 blur-2xl" />

                  <p className="relative text-[9px] font-bold uppercase tracking-[0.18em] text-pink-300">
                    Your history
                  </p>

                  <p className="relative mt-2 text-3xl font-semibold tracking-tight">
                    {sortedOrders.length}
                  </p>

                  <p className="relative mt-1 text-[11px] leading-5 text-white/45">
                    {hasActiveFilters
                      ? 'Orders matching your current selection.'
                      : 'Orders across your complete purchase history.'}
                  </p>
                </div>
              </div>
            </aside>

            {/* RESULTS */}
            <section className="min-w-0">
              {/* Toolbar */}
              <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-lg font-semibold tracking-tight text-gray-950">
                      {sortedOrders.length === 1
                        ? '1 order'
                        : `${sortedOrders.length} orders`}
                    </h2>

                    {hasActiveFilters && (
                      <span className="rounded-full bg-pink-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-pink-600">
                        Filtered
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-gray-400">
                    {searchQuery
                      ? `Results for “${searchQuery}”`
                      : 'Your purchases, newest first'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="hidden text-xs text-gray-400 sm:block">
                    Show
                  </label>

                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(parseInt(e.target.value, 10))}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-semibold text-gray-700 outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-500/10"
                    aria-label="Orders per page"
                  >
                    <option value={6}>6 per page</option>
                    <option value={12}>12 per page</option>
                    <option value={24}>24 per page</option>
                  </select>
                </div>
              </div>

              {/* Active chips */}
              {hasActiveFilters && (
                <div className="mb-5 flex flex-wrap items-center gap-2">
                  <span className="mr-1 text-[9px] font-bold uppercase tracking-[0.18em] text-gray-400">
                    Active
                  </span>

                  {selectedStatus !== 'All Statuses' && (
                    <FilterChip
                      label={selectedStatus}
                      onRemove={() => setSelectedStatus('All Statuses')}
                    />
                  )}

                  {searchQuery && (
                    <FilterChip
                      label={`“${searchQuery}”`}
                      onRemove={() => setSearchQuery('')}
                    />
                  )}

                  {dateRange.start && (
                    <FilterChip
                      label={`From ${formatDate(dateRange.start)}`}
                      onRemove={() =>
                        setDateRange((current) => ({ ...current, start: '' }))
                      }
                    />
                  )}

                  {dateRange.end && (
                    <FilterChip
                      label={`To ${formatDate(dateRange.end)}`}
                      onRemove={() =>
                        setDateRange((current) => ({ ...current, end: '' }))
                      }
                    />
                  )}

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="ml-1 text-xs font-semibold text-gray-500 underline decoration-gray-300 underline-offset-4 hover:text-gray-950"
                  >
                    Clear all
                  </button>
                </div>
              )}

              {/* Order list */}
              {paginatedOrders.length > 0 ? (
                <>
                  <div className="space-y-5">
                    {paginatedOrders.map((order, index) => (
                      <div
                        key={order._id || order.id}
                        className="group relative"
                      >
                        <div className="mb-2 flex items-center justify-between px-1 sm:px-2">
                          <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1d171d] text-[9px] font-bold text-white">
                              {(currentPage - 1) * itemsPerPage + index + 1}
                            </span>

                            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                              {formatDate(order.createdAt)}
                            </span>
                          </div>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${getStatusTone(
                              order.status
                            )}`}
                          >
                            {normalizeStatus(order.status)}
                          </span>
                        </div>

                        <div
                          className="cursor-pointer rounded-[22px] transition duration-200 hover:-translate-y-0.5"
                          onClick={() =>
                            router.push(`/orders/${order._id || order.id}`)
                          }
                        >
                          <OrderCard
                            order={order}
                            onClick={() =>
                              router.push(`/orders/${order._id || order.id}`)
                            }
                            onCancel={handleCancelOrder}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-500">
                            Showing{' '}
                            <span className="font-bold text-gray-950">
                              {pageStart}–{pageEnd}
                            </span>{' '}
                            of{' '}
                            <span className="font-bold text-gray-950">
                              {sortedOrders.length}
                            </span>
                          </p>
                          <p className="mt-1 text-[10px] text-gray-400">
                            Page {currentPage} of {totalPages}
                          </p>
                        </div>

                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setCurrentPage((page) => Math.max(1, page - 1))
                            }
                            disabled={currentPage === 1}
                            className="flex h-9 items-center gap-1 rounded-xl border border-gray-200 px-3 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-35"
                          >
                            <Icon.ChevronLeft className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Previous</span>
                          </button>

                          {Array.from(
                            { length: Math.min(5, totalPages) },
                            (_, i) => {
                              let pageNum: number;

                              if (totalPages <= 5) {
                                pageNum = i + 1;
                              } else if (currentPage <= 3) {
                                pageNum = i + 1;
                              } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                              } else {
                                pageNum = currentPage - 2 + i;
                              }

                              return pageNum;
                            }
                          ).map((pageNum) => (
                            <button
                              key={pageNum}
                              type="button"
                              onClick={() => setCurrentPage(pageNum)}
                              className={`h-9 w-9 rounded-xl text-xs font-bold transition ${
                                currentPage === pageNum
                                  ? 'bg-[#1d171d] text-white shadow-sm'
                                  : 'border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-950'
                              }`}
                            >
                              {pageNum}
                            </button>
                          ))}

                          <button
                            type="button"
                            onClick={() =>
                              setCurrentPage((page) =>
                                Math.min(totalPages, page + 1)
                              )
                            }
                            disabled={currentPage === totalPages}
                            className="flex h-9 items-center gap-1 rounded-xl border border-gray-200 px-3 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-35"
                          >
                            <span className="hidden sm:inline">Next</span>
                            <Icon.ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <EmptyOrders
                  hasOrders={orders.length > 0}
                  clearFilters={clearFilters}
                />
              )}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function HeroStat({
  label,
  value,
  icon,
  compact = false,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <span className="text-white/40">{icon}</span>
        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/35">
          {label}
        </span>
      </div>
      <p
        className={`mt-3 font-semibold tracking-tight ${
          compact ? 'text-lg' : 'text-2xl'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: React.ReactNode;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-gray-400">
        {label}
      </p>
      <p className="mt-2 truncate text-xl font-semibold tracking-tight text-gray-950 sm:text-2xl">
        {value}
      </p>
      <p className="mt-1 text-[10px] text-gray-400">{detail}</p>
    </div>
  );
}

function FilterPanel({
  selectedStatus,
  setSelectedStatus,
  statuses,
  statusCounts,
  dateRange,
  setDateRange,
  sortBy,
  setSortBy,
  clearFilters,
  hasActiveFilters,
  onDone,
}: {
  selectedStatus: string;
  setSelectedStatus: React.Dispatch<React.SetStateAction<string>>;
  statuses: string[];
  statusCounts: Record<string, number>;
  dateRange: { start: string; end: string };
  setDateRange: React.Dispatch<
    React.SetStateAction<{ start: string; end: string }>
  >;
  sortBy: string;
  setSortBy: React.Dispatch<React.SetStateAction<string>>;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  onDone?: () => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Icon.Sliders className="h-4 w-4 text-gray-400" />
          <h3 className="text-[10px] font-bold uppercase tracking-[0.17em] text-gray-800">
            Status
          </h3>
        </div>

        <div className="space-y-1">
          <StatusButton
            label="All orders"
            count={Object.values(statusCounts).reduce((sum, value) => sum + value, 0)}
            active={selectedStatus === 'All Statuses'}
            onClick={() => setSelectedStatus('All Statuses')}
          />

          {statuses.map((status) => (
            <StatusButton
              key={status}
              label={normalizeStatus(status)}
              count={statusCounts[status] || 0}
              active={selectedStatus === status}
              onClick={() => setSelectedStatus(status)}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-5">
        <div className="mb-3 flex items-center gap-2">
          <Icon.Calendar className="h-4 w-4 text-gray-400" />
          <h3 className="text-[10px] font-bold uppercase tracking-[0.17em] text-gray-800">
            Date range
          </h3>
        </div>

        <div className="space-y-3">
          <DateInput
            label="From"
            value={dateRange.start}
            onChange={(value) =>
              setDateRange((current) => ({ ...current, start: value }))
            }
          />

          <DateInput
            label="To"
            value={dateRange.end}
            onChange={(value) =>
              setDateRange((current) => ({ ...current, end: value }))
            }
          />
        </div>
      </div>

      <div className="border-t border-gray-100 pt-5">
        <div className="mb-3 flex items-center gap-2">
          <Icon.Sliders className="h-4 w-4 text-gray-400" />
          <h3 className="text-[10px] font-bold uppercase tracking-[0.17em] text-gray-800">
            Sort by
          </h3>
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-xs font-medium text-gray-700 outline-none transition focus:border-pink-300 focus:bg-white focus:ring-4 focus:ring-pink-500/10"
        >
          <option value="date-desc">Newest first</option>
          <option value="date-asc">Oldest first</option>
          <option value="amount-desc">Amount: high to low</option>
          <option value="amount-asc">Amount: low to high</option>
          <option value="status">Status</option>
        </select>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-pink-200 bg-pink-50 px-4 py-3 text-xs font-bold text-pink-600 transition hover:bg-pink-100"
        >
          <Icon.Rotate className="h-3.5 w-3.5" />
          Clear all filters
        </button>
      )}

      {onDone && (
        <button
          type="button"
          onClick={onDone}
          className="w-full rounded-xl bg-[#1d171d] px-4 py-3 text-xs font-bold text-white"
        >
          Done
        </button>
      )}
    </div>
  );
}

function StatusButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs transition ${
        active
          ? 'bg-[#1d171d] font-semibold text-white'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-950'
      }`}
    >
      <span className="capitalize">{label}</span>
      <span
        className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
          active
            ? 'bg-white/10 text-white/60'
            : 'bg-gray-100 text-gray-400'
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function DateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-medium text-gray-500">
        {label}
      </label>

      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs text-gray-800 outline-none transition focus:border-pink-300 focus:bg-white focus:ring-4 focus:ring-pink-500/10"
      />
    </div>
  );
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="group flex max-w-[230px] items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-pink-200 hover:bg-pink-50 hover:text-pink-600"
    >
      <span className="truncate">{label}</span>
      <Icon.X className="h-3 w-3 shrink-0 text-gray-400 group-hover:text-current" />
    </button>
  );
}

function EmptyOrders({
  hasOrders,
  clearFilters,
}: {
  hasOrders: boolean;
  clearFilters: () => void;
}) {
  return (
    <div className="relative flex min-h-[500px] items-center justify-center overflow-hidden rounded-[28px] border border-gray-200 bg-white px-6 py-20 text-center shadow-sm">
      <div className="absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 rounded-full bg-pink-100/60 blur-3xl" />

      <div className="relative max-w-md">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] bg-[#f8f6f8] text-gray-300 ring-8 ring-[#faf9fb]">
          <Icon.ShoppingBag className="h-8 w-8" />
        </div>

        <p className="mt-7 text-[9px] font-bold uppercase tracking-[0.22em] text-pink-500">
          {hasOrders ? 'No matching results' : 'Welcome to your orders'}
        </p>

        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
          {hasOrders ? 'Nothing found here' : 'Your order history is empty'}
        </h2>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
          {hasOrders
            ? 'Try a different search, status, or date range. Your orders are still safely available in your history.'
            : 'Once you place your first order, you’ll be able to follow it, revisit its details, and manage it from here.'}
        </p>

        <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
          {hasOrders ? (
            <>
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1d171d] px-6 py-3 text-sm font-bold text-white transition hover:bg-gray-800"
              >
                <Icon.Rotate className="h-3.5 w-3.5" />
                Reset filters
              </button>

              <Link href="/products">
                <Button
                  variant="outline"
                  className="w-full rounded-xl sm:w-auto"
                >
                  Browse products
                </Button>
              </Link>
            </>
          ) : (
            <Link href="/products">
              <Button className="w-full rounded-xl bg-[#1d171d] px-6 hover:bg-gray-800 sm:w-auto">
                Explore collection
                <Icon.ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
