'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAdminProducts, useAdminUsers, useAdminStats, useAdminOrders } from '@/hooks/user/useAdminQueries';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
  totalUsers: number;
  loading: boolean;
  pendingOrders?: number;
  processingOrders?: number;
  shippedOrders?: number;
  deliveredOrders?: number;
  cancelledOrders?: number;
  todayOrders?: number;
  todayRevenue?: number;
  thisMonthOrders?: number;
  thisMonthRevenue?: number;
  averageOrderValue?: number;
  lowStockProducts?: number;
  outOfStockProducts?: number;
}

interface RecentProduct {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  status: string;
  images?: { url: string }[];
  category?: { name: string };
  featured?: boolean;
}

const ADMIN_BASE = '/belles-portel-25';

const Icon = ({
  name,
  className = 'h-5 w-5',
}: {
  name: 'box' | 'users' | 'orders' | 'revenue' | 'plus' | 'arrow' | 'eye' | 'package' | 'chevron' | 'alert';
  className?: string;
}) => {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  const paths = {
    box: (
      <>
        <path {...common} d="m21 8-9 5-9-5 9-5 9 5Z" />
        <path {...common} d="M3 8v9l9 5 9-5V8" />
        <path {...common} d="M12 13v9" />
      </>
    ),
    users: (
      <>
        <circle {...common} cx="9" cy="8" r="3" />
        <path {...common} d="M3 20v-1a6 6 0 0 1 12 0v1" />
        <path {...common} d="M16 5.5a3 3 0 0 1 0 5.8M18 20v-1a5.5 5.5 0 0 0-2.5-4.6" />
      </>
    ),
    orders: (
      <>
        <path {...common} d="M6 3h12v18H6z" />
        <path {...common} d="M9 7h6M9 11h6M9 15h3" />
      </>
    ),
    revenue: (
      <>
        <circle {...common} cx="12" cy="12" r="9" />
        <path {...common} d="M12 7v10M15 9.5c-.7-.7-1.7-1-3-1-1.7 0-3 .8-3 2s1.3 2 3 2 3 .8 3 2-1.3 2-3 2c-1.3 0-2.3-.3-3-1" />
      </>
    ),
    plus: <path {...common} d="M12 5v14M5 12h14" />,
    arrow: (
      <>
        <path {...common} d="M5 12h14" />
        <path {...common} d="m13 6 6 6-6 6" />
      </>
    ),
    eye: (
      <>
        <path {...common} d="M2.5 12s3.3-6 9.5-6 9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6Z" />
        <circle {...common} cx="12" cy="12" r="2.5" />
      </>
    ),
    package: (
      <>
        <path {...common} d="m21 8-9 5-9-5 9-5 9 5Z" />
        <path {...common} d="M3 8v9l9 5 9-5V8M12 13v9" />
        <path {...common} d="m7.5 5.5 9 5" />
      </>
    ),
    chevron: <path {...common} d="m9 5 7 7-7 7" />,
    alert: (
      <>
        <path {...common} d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <path {...common} d="M12 9v4M12 17h.01" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {paths[name]}
    </svg>
  );
};

export default function AdminDashboard() {
  const router = useRouter();

  const { data: productsData, isLoading: isLoadingProducts } =
    useAdminProducts({ limit: 1000 });

  const { data: usersData, isLoading: isLoadingUsers } =
    useAdminUsers();

  const { data: statsData, isLoading: isLoadingStats } = useAdminStats();

  const { data: ordersData, isLoading: isLoadingOrders } =
    useAdminOrders({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' });

  const allProducts = productsData?.data?.products || [];
  const allUsers = usersData?.data?.users || [];
  const recentOrders = ordersData?.data?.orders || [];
  const backendStats = statsData?.data?.stats;

  const isLoading = isLoadingProducts || isLoadingUsers || isLoadingStats || isLoadingOrders;

  const activeProducts = allProducts.filter(
    (product: RecentProduct) => product.status === 'active'
  ).length;

  const lowStockProducts = allProducts.filter(
    (product: RecentProduct) => product.quantity > 0 && product.quantity <= 5
  ).length;

  const outOfStockProducts = allProducts.filter(
    (product: RecentProduct) => product.quantity <= 0
  ).length;

  const stats: DashboardStats = {
    totalProducts: allProducts.length,
    totalOrders: backendStats?.totalOrders || 0,
    totalRevenue: backendStats?.totalRevenue || 0,
    activeUsers: backendStats?.activeUsers || allUsers.filter((user: any) => user.isActive === true).length,
    totalUsers: backendStats?.totalUsers || allUsers.length,
    loading: isLoading,
    pendingOrders: backendStats?.pendingOrders,
    processingOrders: backendStats?.processingOrders,
    shippedOrders: backendStats?.shippedOrders,
    deliveredOrders: backendStats?.deliveredOrders,
    cancelledOrders: backendStats?.cancelledOrders,
    todayOrders: backendStats?.todayOrders,
    todayRevenue: backendStats?.todayRevenue,
    thisMonthOrders: backendStats?.thisMonthOrders,
    thisMonthRevenue: backendStats?.thisMonthRevenue,
    averageOrderValue: backendStats?.averageOrderValue,
    lowStockProducts,
    outOfStockProducts,
  };

  const recentProducts = allProducts.slice(0, 4);

  const formatCurrency = (value: number) =>
    `₹${value.toLocaleString('en-IN')}`;

  const statusClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'inactive':
        return 'bg-red-50 text-red-700 border-red-100';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-100';
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f3f1] text-[#30222b]">

      {/* =========================================================
          TOP HEADER
      ========================================================== */}
      <header className="border-b border-[#e9dfe2] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto max-w-[1500px] px-5 py-5 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <div className="mb-2 flex items-center gap-2.5">
                <span className="h-px w-7 bg-[#bd8798]" />
                <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#997481]">
                  BellesCart Administration
                </span>
              </div>

              <h1 className="font-serif text-3xl leading-tight text-[#30222b] sm:text-4xl">
                Welcome back.
              </h1>

              <p className="mt-1.5 text-sm text-[#80747b]">
                Here's an overview of your store today.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/"
                target="_blank"
                className="hidden items-center gap-2 rounded-xl border border-[#e5dadd] bg-white px-4 py-2.5 text-xs font-semibold text-[#5d4c55] transition hover:border-[#cdb8c0] hover:bg-[#fbf8f9] sm:flex"
              >
                <Icon name="eye" className="h-4 w-4" />
                View Store
              </Link>

              <button
                type="button"
                onClick={() => router.push(`${ADMIN_BASE}/products/add`)}
                className="group flex items-center gap-2 rounded-xl bg-[#35232e] px-4 py-2.5 text-xs font-semibold text-white shadow-[0_8px_22px_rgba(53,35,46,0.15)] transition hover:-translate-y-0.5 hover:bg-[#442d3a]"
              >
                <Icon name="plus" className="h-4 w-4" />
                Add Product
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9">

        {/* =========================================================
            STAT CARDS
        ========================================================== */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <div className="group rounded-2xl border border-[#e7dfe1] bg-white p-5 shadow-[0_8px_30px_rgba(53,35,46,0.045)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(53,35,46,0.08)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#94878e]">
                  Total Products
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-[#30222b]">
                  {stats.loading ? '—' : stats.totalProducts.toLocaleString('en-IN')}
                </p>
                <p className="mt-2 text-xs text-[#94878e]">
                  {stats.loading ? 'Loading inventory' : `${activeProducts} active • ${stats.lowStockProducts} low stock`}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f4eaee] text-[#78505f]">
                <Icon name="box" className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="group rounded-2xl border border-[#e7dfe1] bg-white p-5 shadow-[0_8px_30px_rgba(53,35,46,0.045)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(53,35,46,0.08)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#94878e]">
                  Total Orders
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-[#30222b]">
                  {stats.loading ? '—' : stats.totalOrders.toLocaleString('en-IN')}
                </p>
                <p className="mt-2 text-xs text-[#94878e]">
                  {stats.loading ? 'Loading orders' : `${stats.pendingOrders || 0} pending • ${stats.processingOrders || 0} processing`}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f4f0] text-[#4a7c6f]">
                <Icon name="orders" className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="group rounded-2xl border border-[#e7dfe1] bg-white p-5 shadow-[0_8px_30px_rgba(53,35,46,0.045)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(53,35,46,0.08)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#94878e]">
                  Total Users
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-[#30222b]">
                  {stats.loading ? '—' : stats.totalUsers.toLocaleString('en-IN')}
                </p>
                <p className="mt-2 text-xs text-[#94878e]">
                  {stats.loading ? 'Loading users' : `${stats.activeUsers} active accounts`}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eee9f5] text-[#655078]">
                <Icon name="users" className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="group rounded-2xl border border-[#e7dfe1] bg-white p-5 shadow-[0_8px_30px_rgba(53,35,46,0.045)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(53,35,46,0.08)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#94878e]">
                  Total Revenue
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-[#30222b]">
                  {stats.loading ? '—' : formatCurrency(stats.totalRevenue)}
                </p>
                <p className="mt-2 text-xs text-[#94878e]">
                  {stats.loading ? 'Loading revenue' : `Today: ${formatCurrency(stats.todayRevenue || 0)} • Avg: ${formatCurrency(stats.averageOrderValue || 0)}`}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f6eee7] text-[#8a6346]">
                <Icon name="revenue" className="h-5 w-5" />
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            MANAGEMENT BANNER
        ========================================================== */}
        <section className="relative mt-6 overflow-hidden rounded-[26px] bg-[#35232e] shadow-[0_18px_45px_rgba(53,35,46,0.12)]">
          <div className="absolute -right-28 -top-32 h-80 w-80 rounded-full border border-white/10" />
          <div className="absolute -bottom-36 right-20 h-72 w-72 rounded-full border border-white/[0.06]" />
          <div className="absolute right-1/3 top-1/2 h-52 w-52 -translate-y-1/2 rounded-full bg-[#c99aa8]/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-7 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:p-9">
            <div className="max-w-xl">
              <div className="mb-3 flex items-center gap-3">
                <span className="h-px w-8 bg-[#d6a7b5]" />
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#d6a7b5]">
                  Store management
                </span>
              </div>

              <h2 className="font-serif text-2xl text-white sm:text-3xl">
                Keep your catalogue beautifully curated.
              </h2>

              <p className="mt-2.5 max-w-lg text-sm leading-6 text-white/50">
                Add products, manage inventory, update your catalogue,
                and keep your storefront ready for customers.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={() => router.push(`${ADMIN_BASE}/products/add`)}
                className="group flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-bold text-[#35232e] transition hover:bg-[#f8eef1]"
              >
                <Icon name="plus" className="h-4 w-4" />
                Add New Product
              </button>

              <button
                type="button"
                onClick={() => router.push(`${ADMIN_BASE}/products`)}
                className="group flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-xs font-semibold text-white transition hover:bg-white/10"
              >
                View Catalogue
                <Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                type="button"
                onClick={() => router.push(`${ADMIN_BASE}/coupons`)}
                className="flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-xs font-semibold text-white transition hover:bg-white/10"
              >
                Coupons
              </button>
            </div>
          </div>
        </section>

        {/* =========================================================
            LOWER GRID
        ========================================================== */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">

          {/* Recent Orders */}
          <section className="overflow-hidden rounded-[24px] border border-[#e7dfe1] bg-white shadow-[0_8px_30px_rgba(53,35,46,0.045)] lg:col-span-2">
            <div className="flex items-center justify-between gap-4 border-b border-[#eee5e7] px-5 py-5 sm:px-6">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#bd8798]" />
                  <h2 className="font-serif text-xl text-[#30222b]">
                    Recent Orders
                  </h2>
                </div>
                <p className="mt-1 text-xs text-[#94878e]">
                  Latest customer orders
                </p>
              </div>

              <Link
                href={`${ADMIN_BASE}/orders`}
                className="group flex items-center gap-1.5 text-xs font-semibold text-[#694653] transition hover:text-[#35232e]"
              >
                View all
                <Icon name="chevron" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="p-5 sm:p-6">
              {recentOrders.length === 0 ? (
                <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#ddd1d5] bg-[#fcfaf9] px-6 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f1e7ea] text-[#795260]">
                    <Icon name="orders" className="h-6 w-6" />
                  </div>

                  <h3 className="mt-4 font-serif text-lg text-[#30222b]">
                    No orders yet
                  </h3>

                  <p className="mt-1 max-w-xs text-xs leading-5 text-[#94878e]">
                    Orders will appear here when customers make purchases.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order: any) => (
                    <div
                      key={order._id}
                      className="flex items-center justify-between rounded-xl border border-[#e8dfe2] bg-white p-4 transition hover:border-[#d5bcc5] hover:shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4eaee] text-[#78505f]">
                          <Icon name="orders" className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#30222b]">
                            {order.customer?.name || 'Unknown Customer'}
                          </p>
                          <p className="text-xs text-[#94878e]">
                            {order.items?.length || 0} items • {formatCurrency(order.totalAmount)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] ${
                          order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          order.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          order.status === 'cancelled' ? 'bg-red-50 text-red-700 border border-red-100' :
                          'bg-blue-50 text-blue-700 border border-blue-100'
                        }`}>
                          {order.status}
                        </span>
                        <p className="mt-1 text-[10px] text-[#94878e]">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Recent products */}
          <section className="overflow-hidden rounded-[24px] border border-[#e7dfe1] bg-white shadow-[0_8px_30px_rgba(53,35,46,0.045)]">
            <div className="flex items-center justify-between gap-4 border-b border-[#eee5e7] px-5 py-5 sm:px-6">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#bd8798]" />
                  <h2 className="font-serif text-xl text-[#30222b]">
                    Recent Products
                  </h2>
                </div>
                <p className="mt-1 text-xs text-[#94878e]">
                  Your latest additions to the catalogue
                </p>
              </div>

              <Link
                href={`${ADMIN_BASE}/products`}
                className="group flex items-center gap-1.5 text-xs font-semibold text-[#694653] transition hover:text-[#35232e]"
              >
                View all
                <Icon name="chevron" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="p-5 sm:p-6">
              {recentProducts.length === 0 ? (
                <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#ddd1d5] bg-[#fcfaf9] px-6 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f1e7ea] text-[#795260]">
                    <Icon name="package" className="h-6 w-6" />
                  </div>

                  <h3 className="mt-4 font-serif text-lg text-[#30222b]">
                    No products yet
                  </h3>

                  <p className="mt-1 max-w-xs text-xs leading-5 text-[#94878e]">
                    Start building your catalogue by adding your first product.
                  </p>

                  <button
                    type="button"
                    onClick={() => router.push(`${ADMIN_BASE}/products/add`)}
                    className="mt-5 rounded-xl bg-[#35232e] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#442d3a]"
                  >
                    Add Your First Product
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentProducts.map((product: RecentProduct) => (
                    <button
                      type="button"
                      key={product._id}
                      onClick={() =>
                        router.push(`${ADMIN_BASE}/products/edit/${product._id}`)
                      }
                      className="flex items-center justify-between rounded-xl border border-[#e8dfe2] bg-white p-4 transition hover:border-[#d5bcc5] hover:shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#f3eeeb] overflow-hidden">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Icon name="package" className="h-6 w-6 text-[#aaa0a5]" />
                          )}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-semibold text-[#30222b] truncate max-w-[150px]">
                            {product.name}
                          </p>
                          <p className="text-xs text-[#94878e]">
                            {formatCurrency(product.price)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] ${
                          product.quantity <= 0
                            ? 'bg-red-50 text-red-700 border border-red-100'
                            : product.quantity <= 5
                              ? 'bg-amber-50 text-amber-700 border border-amber-100'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        }`}>
                          {product.quantity <= 0
                            ? 'Out of stock'
                            : product.quantity <= 5
                              ? `${product.quantity} left`
                              : 'In stock'
                          }
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Inventory Alerts */}
          {((stats.lowStockProducts ?? 0) > 0 || (stats.outOfStockProducts ?? 0) > 0) && (
            <section className="overflow-hidden rounded-[24px] border border-[#e7dfe1] bg-white shadow-[0_8px_30px_rgba(53,35,46,0.045)]">
              <div className="flex items-center justify-between gap-4 border-b border-[#eee5e7] px-5 py-5 sm:px-6">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#d97706]" />
                    <h2 className="font-serif text-xl text-[#30222b]">
                      Inventory Alerts
                    </h2>
                  </div>
                  <p className="mt-1 text-xs text-[#94878e]">
                    Products that need attention
                  </p>
                </div>
              </div>

              <div className="p-5 sm:p-6 space-y-3">
                {(stats.outOfStockProducts ?? 0) > 0 && (
                  <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600">
                        <span className="text-xs font-bold">!</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-red-900">
                          {stats.outOfStockProducts} out of stock
                        </p>
                        <p className="text-xs text-red-700">
                          These products are unavailable for purchase
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => router.push(`${ADMIN_BASE}/products?status=out%20of%20stock`)}
                      className="text-xs font-semibold text-red-700 hover:text-red-900"
                    >
                      View →
                    </button>
                  </div>
                )}

                {(stats.lowStockProducts ?? 0) > 0 && (
                  <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                        <span className="text-xs font-bold">!</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-amber-900">
                          {stats.lowStockProducts} low stock
                        </p>
                        <p className="text-xs text-amber-700">
                          5 or fewer items remaining
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => router.push(`${ADMIN_BASE}/products?status=low%20stock`)}
                      className="text-xs font-semibold text-amber-700 hover:text-amber-900"
                    >
                      View →
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Business Insights */}
          <section className="overflow-hidden rounded-[24px] border border-[#e7dfe1] bg-white shadow-[0_8px_30px_rgba(53,35,46,0.045)]">
            <div className="flex items-center justify-between gap-4 border-b border-[#eee5e7] px-5 py-5 sm:px-6">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#bd8798]" />
                  <h2 className="font-serif text-xl text-[#30222b]">
                    Business Insights
                  </h2>
                </div>
                <p className="mt-1 text-xs text-[#94878e]">
                  Key performance metrics
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-[#e8dfe2] bg-[#fcfaf9] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#94878e]">
                    Today's Orders
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[#30222b]">
                    {stats.todayOrders || 0}
                  </p>
                </div>
                <div className="rounded-xl border border-[#e8dfe2] bg-[#fcfaf9] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#94878e]">
                    Today's Revenue
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[#30222b]">
                    {formatCurrency(stats.todayRevenue || 0)}
                  </p>
                </div>
                <div className="rounded-xl border border-[#e8dfe2] bg-[#fcfaf9] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#94878e]">
                    This Month
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[#30222b]">
                    {stats.thisMonthOrders || 0}
                  </p>
                </div>
                <div className="rounded-xl border border-[#e8dfe2] bg-[#fcfaf9] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#94878e]">
                    Monthly Revenue
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[#30222b]">
                    {formatCurrency(stats.thisMonthRevenue || 0)}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-[#e8dfe2] bg-[#fcfaf9] p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#94878e]">
                  Average Order Value
                </p>
                <p className="mt-2 text-2xl font-semibold text-[#30222b]">
                  {formatCurrency(stats.averageOrderValue || 0)}
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* =========================================================
            FOOTER
        ========================================================== */}
        <footer className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-[#e8dfe1] py-6 text-center sm:flex-row sm:text-left">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#aaa0a5]">
            BellesCart Admin Console
          </p>

          <p className="text-[10px] text-[#aaa0a5]">
            Store management workspace
          </p>
        </footer>
      </div>
    </main>
  );
}
