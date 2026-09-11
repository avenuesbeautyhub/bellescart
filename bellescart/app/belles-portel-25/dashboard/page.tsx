'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAdminProducts, useAdminUsers } from '@/hooks/user/useAdminQueries';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
  totalUsers: number;
  loading: boolean;
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
  name: 'box' | 'users' | 'orders' | 'revenue' | 'plus' | 'arrow' | 'eye' | 'package' | 'chevron';
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

  const allProducts = productsData?.data?.products || [];
  const allUsers = usersData?.data?.users || [];
  const isLoading = isLoadingProducts || isLoadingUsers;

  const stats: DashboardStats = {
    totalProducts: allProducts.length,
    totalOrders: 0,
    totalRevenue: 0,
    activeUsers: allUsers.filter((user: any) => user.isActive === true).length,
    totalUsers: allUsers.length,
    loading: isLoading,
  };

  const recentProducts = allProducts.slice(0, 4);

  const activeProducts = allProducts.filter(
    (product: RecentProduct) => product.status === 'active'
  ).length;

  const lowStockProducts = allProducts.filter(
    (product: RecentProduct) => product.quantity > 0 && product.quantity <= 5
  ).length;

  const outOfStockProducts = allProducts.filter(
    (product: RecentProduct) => product.quantity <= 0
  ).length;

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
                  {stats.loading ? 'Loading inventory' : `${activeProducts} active products`}
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
                  Active Users
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-[#30222b]">
                  {stats.loading ? '—' : stats.activeUsers.toLocaleString('en-IN')}
                </p>
                <p className="mt-2 text-xs text-[#94878e]">
                  Currently active accounts
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
                  Total Users
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-[#30222b]">
                  {stats.loading ? '—' : stats.totalUsers.toLocaleString('en-IN')}
                </p>
                <p className="mt-2 text-xs text-[#94878e]">
                  Registered customer accounts
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
                  Revenue
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-[#30222b]">
                  {stats.loading ? '—' : formatCurrency(stats.totalRevenue)}
                </p>
                <p className="mt-2 text-xs text-[#94878e]">
                  Order analytics not connected
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
        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_320px]">

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
                <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#ddd1d5] bg-[#fcfaf9] px-6 text-center">
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
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {recentProducts.map((product: RecentProduct) => (
                    <button
                      type="button"
                      key={product._id}
                      onClick={() =>
                        router.push(`${ADMIN_BASE}/products/edit/${product._id}`)
                      }
                      className="group overflow-hidden rounded-2xl border border-[#e8dfe2] bg-white text-left transition duration-200 hover:-translate-y-1 hover:border-[#d5bcc5] hover:shadow-[0_14px_35px_rgba(53,35,46,0.09)]"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-[#f3eeeb]">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.045]"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[#aaa0a5]">
                            <Icon name="package" className="h-10 w-10" />
                          </div>
                        )}

                        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
                          {product.featured ? (
                            <span className="rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#694653] shadow-sm backdrop-blur">
                              Featured
                            </span>
                          ) : (
                            <span />
                          )}

                          <span className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] shadow-sm backdrop-blur ${statusClass(product.status)}`}>
                            {product.status}
                          </span>
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center bg-[#35232e]/0 transition group-hover:bg-[#35232e]/10">
                          <span className="translate-y-2 rounded-full bg-white/95 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#4d3540] opacity-0 shadow-lg transition group-hover:translate-y-0 group-hover:opacity-100">
                            Edit Product
                          </span>
                        </div>
                      </div>

                      <div className="p-4">
                        <p className="truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a18f97]">
                          {product.category?.name || 'Uncategorized'}
                        </p>

                        <h3 className="mt-1.5 truncate font-serif text-[17px] text-[#30222b]">
                          {product.name}
                        </h3>

                        <div className="mt-3 flex items-end justify-between gap-3">
                          <p className="text-base font-semibold text-[#30222b]">
                            {formatCurrency(product.price)}
                          </p>

                          <p
                            className={`text-[10px] font-semibold ${
                              product.quantity <= 0
                                ? 'text-red-600'
                                : product.quantity <= 5
                                  ? 'text-amber-600'
                                  : 'text-[#8b7c83]'
                            }`}
                          >
                            {product.quantity <= 0
                              ? 'Out of stock'
                              : `${product.quantity} in stock`}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Inventory overview */}
          <aside className="rounded-[24px] border border-[#e7dfe1] bg-white p-5 shadow-[0_8px_30px_rgba(53,35,46,0.045)] sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#997481]">
                  Inventory
                </p>
                <h2 className="mt-1 font-serif text-xl text-[#30222b]">
                  Catalogue health
                </h2>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4eaee] text-[#78505f]">
                <Icon name="box" className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-[#faf8f7] px-4 py-3.5">
                <div>
                  <p className="text-xs font-semibold text-[#55464e]">
                    Active products
                  </p>
                  <p className="mt-0.5 text-[10px] text-[#9b8f95]">
                    Currently visible
                  </p>
                </div>
                <span className="text-lg font-semibold text-[#30222b]">
                  {isLoading ? '—' : activeProducts}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-[#faf8f7] px-4 py-3.5">
                <div>
                  <p className="text-xs font-semibold text-[#55464e]">
                    Low stock
                  </p>
                  <p className="mt-0.5 text-[10px] text-[#9b8f95]">
                    5 or fewer units
                  </p>
                </div>
                <span className={`text-lg font-semibold ${lowStockProducts > 0 ? 'text-amber-600' : 'text-[#30222b]'}`}>
                  {isLoading ? '—' : lowStockProducts}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-[#faf8f7] px-4 py-3.5">
                <div>
                  <p className="text-xs font-semibold text-[#55464e]">
                    Out of stock
                  </p>
                  <p className="mt-0.5 text-[10px] text-[#9b8f95]">
                    Needs attention
                  </p>
                </div>
                <span className={`text-lg font-semibold ${outOfStockProducts > 0 ? 'text-red-600' : 'text-[#30222b]'}`}>
                  {isLoading ? '—' : outOfStockProducts}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push(`${ADMIN_BASE}/products`)}
              className="group mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#e3d8dc] px-4 py-3 text-xs font-semibold text-[#604652] transition hover:bg-[#fbf7f8]"
            >
              Manage inventory
              <Icon name="arrow" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>

            <div className="mt-6 border-t border-[#eee5e7] pt-5">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9b8f95]">
                Quick access
              </p>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => router.push(`${ADMIN_BASE}/products`)}
                  className="rounded-xl bg-[#faf7f8] px-3 py-3 text-left text-[11px] font-semibold text-[#5f4b55] transition hover:bg-[#f3eaed]"
                >
                  Products
                </button>

                <button
                  type="button"
                  onClick={() => router.push(`${ADMIN_BASE}/coupons`)}
                  className="rounded-xl bg-[#faf7f8] px-3 py-3 text-left text-[11px] font-semibold text-[#5f4b55] transition hover:bg-[#f3eaed]"
                >
                  Coupons
                </button>
              </div>
            </div>
          </aside>
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
