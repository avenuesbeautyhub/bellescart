'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRequireUserAuth } from '@/auth/user';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import OrderCard from '@/components/OrderCard/OrderCard';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import { orderService } from '@/services/orderService';
import { globalToast } from '@/utils/globalToast';

export default function OrdersPage() {
  const router = useRouter();
  const { loaded, isAuthenticated } = useRequireUserAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Filter state
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Sort state
  const [sortBy, setSortBy] = useState('date-desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // UI state
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Load orders when authenticated
  useEffect(() => {
    if (loaded && isAuthenticated) {
      loadOrders();
    }
  }, [loaded, isAuthenticated]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const response = await orderService.getOrders();
      if (response.success && response.data?.orders) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
      globalToast.order.loadFailed();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const response = await orderService.cancelOrder(orderId);
      if (response.success) {
        globalToast.order.cancelSuccess();
        // Reload orders to reflect the cancellation
        await loadOrders();
      } else {
        globalToast.order.cancelFailed();
      }
    } catch (error) {
      console.error('Failed to cancel order:', error);
      globalToast.order.cancelFailed();
    }
  };

  // Extract unique statuses from orders
  const statuses = React.useMemo(() => {
    const statusSet = new Set<string>();
    orders.forEach(order => {
      if (order.status) statusSet.add(order.status);
    });
    return Array.from(statusSet).sort();
  }, [orders]);

  const filteredOrders = orders.filter(order => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesId = order._id?.toLowerCase().includes(searchLower) || order.id?.toLowerCase().includes(searchLower);
      const matchesStatus = order.status?.toLowerCase().includes(searchLower);
      if (!matchesId && !matchesStatus) {
        return false;
      }
    }

    // Status filter
    if (selectedStatus !== 'All Statuses' && order.status !== selectedStatus) {
      return false;
    }

    // Date range filter
    if (dateRange.start && order.createdAt) {
      const orderDate = new Date(order.createdAt);
      const startDate = new Date(dateRange.start);
      if (orderDate < startDate) return false;
    }
    if (dateRange.end && order.createdAt) {
      const orderDate = new Date(order.createdAt);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59);
      if (orderDate > endDate) return false;
    }

    return true;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      case 'date-asc':
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
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

  // Pagination
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const paginatedOrders = sortedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const clearFilters = () => {
    setSelectedStatus('All Statuses');
    setSearchQuery('');
    setDateRange({ start: '', end: '' });
    setSortBy('date-desc');
    setCurrentPage(1);
  };

  const hasActiveFilters = selectedStatus !== 'All Statuses' ||
    searchQuery ||
    dateRange.start ||
    dateRange.end;

  // Show loader while checking authentication
  if (!loaded) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader size="lg" text="Loading..." />
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader size="lg" text="Loading orders..." />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">My Orders</h1>
            <p className="text-gray-600">Track and manage your order history</p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search orders by ID or status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-4 pl-12 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition-all duration-200"
              />
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-colors duration-200"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span className="font-medium text-gray-700">Filters</span>
                {hasActiveFilters && (
                  <span className="w-2 h-2 bg-pink-500 rounded-full" />
                )}
              </button>
            </div>

            {/* Sidebar */}
            <div className={`lg:col-span-1 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="lg:sticky lg:top-8 space-y-4">
                {/* Clear Filters Button */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-pink-50 text-pink-600 rounded-xl hover:bg-pink-100 transition-colors duration-200 font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear All Filters
                  </button>
                )}

                {/* Status Filter */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Order Status</h3>
                  </div>
                  <div className="p-4 space-y-1">
                    <button
                      key="all"
                      onClick={() => setSelectedStatus('All Statuses')}
                      className={`block w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${selectedStatus === 'All Statuses'
                        ? 'bg-pink-500 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">All Statuses</span>
                        {selectedStatus === 'All Statuses' && (
                          <span className="text-white text-xs">Active</span>
                        )}
                      </div>
                    </button>
                    {statuses.map((status) => (
                      <button
                        key={status}
                        onClick={() => setSelectedStatus(status)}
                        className={`block w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${selectedStatus === status
                          ? 'bg-pink-500 text-white shadow-sm'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium capitalize">{status}</span>
                          {selectedStatus === status && (
                            <span className="text-white text-xs">Active</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Options */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Sort By</h3>
                  </div>
                  <div className="p-4 space-y-1">
                    {[
                      { value: 'date-desc', label: 'Date: Newest First' },
                      { value: 'date-asc', label: 'Date: Oldest First' },
                      { value: 'amount-desc', label: 'Amount: High to Low' },
                      { value: 'amount-asc', label: 'Amount: Low to High' },
                      { value: 'status', label: 'Status' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSortBy(option.value)}
                        className={`block w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${sortBy === option.value
                          ? 'bg-blue-500 text-white shadow-sm'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{option.label}</span>
                          {sortBy === option.value && (
                            <span className="text-white text-xs">Active</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Range Filter */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden text-black">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Date Range</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Order Count */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">Orders Found</p>
                    <p className="text-3xl font-bold text-gray-900">{sortedOrders.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Orders Grid */}
            <div className="lg:col-span-3">
              {/* Results Header */}
              <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      Showing <span className="font-semibold text-gray-900">{sortedOrders.length}</span> orders
                      {hasActiveFilters && (
                        <span className="text-gray-400 ml-2">(filtered)</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(parseInt(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="text-black px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
                    >
                      <option value={6}>6 per page</option>
                      <option value={12}>12 per page</option>
                      <option value={24}>24 per page</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Orders Grid */}
              {paginatedOrders.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {paginatedOrders.map(order => (
                      <OrderCard
                        key={order._id || order.id}
                        order={order}
                        onClick={() => router.push(`/orders/${order._id || order.id}`)}
                        onCancel={handleCancelOrder}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                      <div className="text-sm text-gray-600">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedOrders.length)} of {sortedOrders.length} orders
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium"
                        >
                          Previous
                        </button>

                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }

                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`w-10 h-10 rounded-lg font-medium transition-colors duration-200 ${
                                  currentPage === pageNum
                                    ? 'bg-pink-500 text-white'
                                    : 'border border-gray-200 hover:bg-gray-50 text-gray-700'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>

                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {orders.length === 0 ? 'No orders yet' : 'No orders found'}
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {orders.length === 0
                      ? "You haven't placed any orders yet. Start shopping to see your order history here."
                      : "We couldn't find any orders matching your current filters."
                    }
                  </p>
                  {orders.length === 0 ? (
                    <Link href="/products">
                      <Button>Browse Products</Button>
                    </Link>
                  ) : (
                    <button
                      onClick={clearFilters}
                      className="px-6 py-3 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition-colors duration-200"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}