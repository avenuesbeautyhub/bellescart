'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import {
  useAdminProducts,
  useDeleteProduct,
  useAdminCategories,
} from '@/hooks/user/useAdminQueries';
import { globalToast } from '@/utils/globalToast';

interface Product {
  _id: string;
  id?: string;
  name: string;
  description: string;
  price: number;
  category?: {
    _id: string;
    name: string;
  };
  quantity: number;
  status: 'active' | 'inactive' | 'draft';
  featured?: boolean;
  images?: {
    url: string;
    alt: string;
    isMain: boolean;
  }[];
  tags?: string[];
  brand?: string;
  createdAt?: string;
  updatedAt?: string;
}

const ADMIN_BASE = '/belles-portel-25';

function SearchIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="m21 21-4.35-4.35m1.35-5.4a6.75 6.75 0 1 1-13.5 0 6.75 6.75 0 0 1 13.5 0Z"
      />
    </svg>
  );
}

function PlusIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M12 5v14M5 12h14"
      />
    </svg>
  );
}

function FilterIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M4 6h16M7 12h10M10 18h4"
      />
    </svg>
  );
}

function PackageIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.7}
        d="m21 8-9-5-9 5m18 0-9 5m9-5v9l-9 5m0-9L3 8m9 5v9M3 8v9l9 5"
      />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="m15 19-7-7 7-7"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="m9 5 7 7-7 7"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="m6 6 12 12M18 6 6 18"
      />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.7}
        d="m16.862 3.487 3.651 3.651M5 19l3.5-.75L19.5 7.25a2.121 2.121 0 0 0-3-3L5.5 15.25 5 19Z"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.7}
        d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"
      />
    </svg>
  );
}

function StarIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg
      className="w-3.5 h-3.5"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.7}
        d="m12 3 2.78 5.63 6.22.9-4.5 4.39 1.06 6.2L12 17.2l-5.56 2.92 1.06-6.2L3 9.53l6.22-.9L12 3Z"
      />
    </svg>
  );
}

function ImagePlaceholder() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-[#f5f0eb]">
      <PackageIcon className="w-8 h-8 text-[#b7aaa1]" />
    </div>
  );
}

function getMainImage(product: Product) {
  if (!product.images?.length) return null;

  return (
    product.images.find((image) => image.isMain)?.url ||
    product.images[0]?.url ||
    null
  );
}

function getStockState(quantity: number) {
  if (quantity <= 0) {
    return {
      label: 'Out of stock',
      className: 'bg-red-50 text-red-700 border-red-100',
      dot: 'bg-red-500',
    };
  }

  if (quantity <= 5) {
    return {
      label: 'Low stock',
      className: 'bg-amber-50 text-amber-700 border-amber-100',
      dot: 'bg-amber-500',
    };
  }

  return {
    label: 'In stock',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    dot: 'bg-emerald-500',
  };
}

function getStatusConfig(status: Product['status']) {
  switch (status) {
    case 'active':
      return {
        label: 'Active',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        dot: 'bg-emerald-500',
      };

    case 'inactive':
      return {
        label: 'Inactive',
        className: 'bg-red-50 text-red-700 border-red-100',
        dot: 'bg-red-500',
      };

    default:
      return {
        label: 'Draft',
        className: 'bg-amber-50 text-amber-700 border-amber-100',
        dot: 'bg-amber-500',
      };
  }
}

export default function ProductManagementPage() {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);

  const { data: productsData, isLoading } = useAdminProducts({
    page: currentPage,
    limit: 10,
    search: searchTerm.trim() || undefined,
    category: selectedCategory || undefined,
    status: selectedStatus || undefined,
  });

  const { data: categoriesData } = useAdminCategories();
  const deleteProduct = useDeleteProduct();

  const products: Product[] = productsData?.data?.products || [];
  const categories = categoriesData?.data?.categories || [];

  const totalProducts = products.length;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedStatus]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await deleteProduct.mutateAsync(id);

      globalToast.admin.success(
        'Product Deleted',
        `Product "${name}" has been deleted`
      );
    } catch (error: any) {
      console.error('Failed to delete product:', error);

      globalToast.admin.error(
        'Network Error',
        error.message || 'Network error occurred'
      );
    }
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedStatus('');
    setCurrentPage(1);
  };

  const hasFilters =
    searchTerm.trim() || selectedCategory || selectedStatus;

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      {/* Page Header */}
      <header className="border-b border-[#e8e1dc] bg-white">
        <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[#9b8b82]">
                <span>Catalog</span>
                <span className="text-[#d1c6bf]">/</span>
                <span>Products</span>
              </div>

              <h1 className="font-serif text-3xl font-medium tracking-tight text-[#211b1d] sm:text-4xl">
                Product Management
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#786c67]">
                Manage your jewelry collection, inventory, visibility and
                product information from one place.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push(`${ADMIN_BASE}/products/add`)
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#351d2d] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#47263d] active:scale-[0.98]"
            >
              <PlusIcon className="h-4 w-4" />
              Add New Product
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Overview Strip */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-[#e9e1dc] bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-[#9a8d87]">
              Showing
            </p>
            <p className="mt-1 text-2xl font-semibold text-[#2b2225]">
              {totalProducts}
            </p>
            <p className="mt-0.5 text-xs text-[#8b7e78]">
              products on this page
            </p>
          </div>

          <div className="rounded-2xl border border-[#e9e1dc] bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-[#9a8d87]">
              Active
            </p>
            <p className="mt-1 text-2xl font-semibold text-[#2b2225]">
              {products.filter((p) => p.status === 'active').length}
            </p>
            <p className="mt-0.5 text-xs text-[#8b7e78]">
              currently visible
            </p>
          </div>

          <div className="rounded-2xl border border-[#e9e1dc] bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-[#9a8d87]">
              Low Stock
            </p>
            <p className="mt-1 text-2xl font-semibold text-[#2b2225]">
              {
                products.filter(
                  (p) => p.quantity > 0 && p.quantity <= 5
                ).length
              }
            </p>
            <p className="mt-0.5 text-xs text-[#8b7e78]">
              need attention
            </p>
          </div>

          <div className="rounded-2xl border border-[#e9e1dc] bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-[#9a8d87]">
              Out of Stock
            </p>
            <p className="mt-1 text-2xl font-semibold text-[#2b2225]">
              {products.filter((p) => p.quantity <= 0).length}
            </p>
            <p className="mt-0.5 text-xs text-[#8b7e78]">
              inventory alerts
            </p>
          </div>
        </div>

        {/* Filters */}
        <section className="mb-6 rounded-2xl border border-[#e9e1dc] bg-white p-4 shadow-[0_4px_20px_rgba(50,30,30,0.03)] sm:p-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f6f0ed] text-[#5b3a4d]">
                <FilterIcon className="h-4 w-4" />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-[#2d2528]">
                  Filter products
                </h2>
                <p className="text-xs text-[#91847e]">
                  Refine your catalog view
                </p>
              </div>
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-left text-xs font-semibold text-[#70455c] transition hover:text-[#351d2d] sm:text-right"
              >
                Clear all filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_220px_180px]">
            {/* Search */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#9a8d87]">
                <SearchIcon className="h-[18px] w-[18px]" />
              </div>

              <input
                type="text"
                placeholder="Search by product name, brand or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11 w-full rounded-xl border border-[#e2d9d4] bg-[#fcfaf9] pl-11 pr-4 text-sm text-[#292225] outline-none transition placeholder:text-[#aaa09b] focus:border-[#8c6376] focus:bg-white focus:ring-4 focus:ring-[#8c6376]/10"
              />
            </div>

            {/* Category */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-11 w-full appearance-none rounded-xl border border-[#e2d9d4] bg-[#fcfaf9] px-4 text-sm text-[#3c3337] outline-none transition focus:border-[#8c6376] focus:bg-white focus:ring-4 focus:ring-[#8c6376]/10"
            >
              <option value="">All Categories</option>

              {categories.map((category: any) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-11 w-full appearance-none rounded-xl border border-[#e2d9d4] bg-[#fcfaf9] px-4 text-sm text-[#3c3337] outline-none transition focus:border-[#8c6376] focus:bg-white focus:ring-4 focus:ring-[#8c6376]/10"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </section>

        {/* Product Listing */}
        <section className="overflow-hidden rounded-2xl border border-[#e9e1dc] bg-white shadow-[0_4px_24px_rgba(50,30,30,0.04)]">
          {/* Listing Header */}
          <div className="flex flex-col gap-3 border-b border-[#eee7e3] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-base font-semibold text-[#292225]">
                Products
              </h2>
              <p className="mt-0.5 text-xs text-[#938681]">
                Select a product to view its complete details.
              </p>
            </div>

            {hasFilters && (
              <div className="flex items-center gap-2 text-xs text-[#786c67]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#8d6177]" />
                Filters applied
              </div>
            )}
          </div>

          {/* Loading */}
          {isLoading ? (
            <div className="p-5 sm:p-6">
              <div className="hidden md:block">
                <div className="space-y-3">
                  {Array.from({ length: 7 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex animate-pulse items-center gap-4 rounded-xl border border-[#f0eae7] p-3"
                    >
                      <div className="h-14 w-14 rounded-lg bg-[#eee8e4]" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-48 rounded bg-[#eee8e4]" />
                        <div className="h-2.5 w-28 rounded bg-[#f2edeb]" />
                      </div>
                      <div className="h-7 w-20 rounded-full bg-[#eee8e4]" />
                      <div className="h-3 w-16 rounded bg-[#eee8e4]" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 md:hidden">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse rounded-xl border border-[#eee8e4] p-3"
                  >
                    <div className="flex gap-3">
                      <div className="h-20 w-20 rounded-lg bg-[#eee8e4]" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-40 rounded bg-[#eee8e4]" />
                        <div className="h-2.5 w-24 rounded bg-[#f2edeb]" />
                        <div className="h-6 w-16 rounded-full bg-[#eee8e4]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : products.length === 0 ? (
            /* Empty */
            <div className="flex min-h-[420px] flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f5efec] text-[#8f777d]">
                <PackageIcon className="h-7 w-7" />
              </div>

              <h3 className="mt-5 font-serif text-xl text-[#302629]">
                No products found
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-[#8e817c]">
                {hasFilters
                  ? 'Try adjusting your search or filters to find what you are looking for.'
                  : 'Your catalog is empty. Start by adding your first jewelry product.'}
              </p>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="h-10 rounded-xl border border-[#ded5d0] px-4 text-sm font-semibold text-[#55484c] transition hover:bg-[#faf7f5]"
                  >
                    Clear Filters
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    router.push(`${ADMIN_BASE}/products/add`)
                  }
                  className="h-10 rounded-xl bg-[#351d2d] px-4 text-sm font-semibold text-white transition hover:bg-[#47263d]"
                >
                  Add New Product
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-[#eee7e3] bg-[#fcfaf9]">
                      <th className="w-16 px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-[#988b85]">
                        #
                      </th>

                      <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-[#988b85]">
                        Product
                      </th>

                      <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-[#988b85]">
                        Category
                      </th>

                      <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-[#988b85]">
                        Price
                      </th>

                      <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-[#988b85]">
                        Inventory
                      </th>

                      <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-[#988b85]">
                        Status
                      </th>

                      <th className="w-24 px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.14em] text-[#988b85]">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#f0eae7]">
                    {products.map((product, index) => {
                      const image = getMainImage(product);
                      const stock = getStockState(product.quantity);
                      const status = getStatusConfig(product.status);

                      return (
                        <tr
                          key={product._id}
                          onClick={() => handleProductClick(product)}
                          className="group cursor-pointer transition hover:bg-[#fdfbf9]"
                        >
                          <td className="px-5 py-4 text-xs font-medium text-[#aaa09b]">
                            {(currentPage - 1) * 10 + index + 1}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex min-w-[260px] items-center gap-3.5">
                              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border border-[#e9e1dc] bg-[#f5f0ec]">
                                {image ? (
                                  <img
                                    src={image}
                                    alt={product.name}
                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                  />
                                ) : (
                                  <ImagePlaceholder />
                                )}

                                {product.featured && (
                                  <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#351d2d] text-white">
                                    <StarIcon filled />
                                  </span>
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-[#2d2528]">
                                  {product.name}
                                </p>

                                {product.brand && (
                                  <p className="mt-0.5 truncate text-xs text-[#968984]">
                                    {product.brand}
                                  </p>
                                )}

                                {product.tags &&
                                  product.tags.length > 0 && (
                                    <p className="mt-1 truncate text-[10px] text-[#b0a49f]">
                                      {product.tags
                                        .slice(0, 2)
                                        .join(' • ')}
                                    </p>
                                  )}
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className="text-sm text-[#65595d]">
                              {product.category?.name || 'Uncategorized'}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span className="font-serif text-base font-medium text-[#302629]">
                              ₹{Number(product.price || 0).toLocaleString('en-IN')}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div>
                              <p className="text-sm font-semibold text-[#393033]">
                                {product.quantity || 0}
                                <span className="ml-1 text-xs font-normal text-[#968984]">
                                  pcs
                                </span>
                              </p>

                              <span
                                className={`mt-1 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${stock.className}`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${stock.dot}`}
                                />
                                {stock.label}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${status.className}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                              />
                              {status.label}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div
                              className="flex justify-end gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                title="Edit product"
                                onClick={() =>
                                  router.push(
                                    `${ADMIN_BASE}/products/edit/${product._id}`
                                  )
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#776970] transition hover:bg-[#f4eeeb] hover:text-[#351d2d]"
                              >
                                <EditIcon />
                              </button>

                              <button
                                type="button"
                                title="Delete product"
                                disabled={deleteProduct.isPending}
                                onClick={() =>
                                  handleDelete(product._id, product.name)
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9d7474] transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                              >
                                <TrashIcon />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="space-y-3 p-4 md:hidden">
                {products.map((product, index) => {
                  const image = getMainImage(product);
                  const stock = getStockState(product.quantity);
                  const status = getStatusConfig(product.status);

                  return (
                    <article
                      key={product._id}
                      onClick={() => handleProductClick(product)}
                      className="cursor-pointer rounded-2xl border border-[#ebe4df] bg-white p-3 transition active:scale-[0.995] hover:border-[#d9cbc4]"
                    >
                      <div className="flex gap-3">
                        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-[#f5f0ec]">
                          {image ? (
                            <img
                              src={image}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImagePlaceholder />
                          )}

                          {product.featured && (
                            <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#351d2d] text-white">
                              <StarIcon filled />
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-[#2d2528]">
                                {product.name}
                              </p>

                              <p className="mt-0.5 truncate text-xs text-[#948783]">
                                {product.category?.name ||
                                  'Uncategorized'}
                              </p>
                            </div>

                            <span className="flex-shrink-0 text-[10px] text-[#aaa09b]">
                              #{(currentPage - 1) * 10 + index + 1}
                            </span>
                          </div>

                          <div className="mt-2 flex items-center justify-between">
                            <span className="font-serif text-base font-medium text-[#302629]">
                              ₹{Number(product.price || 0).toLocaleString(
                                'en-IN'
                              )}
                            </span>

                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[9px] font-bold uppercase tracking-wide ${status.className}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                              />
                              {status.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-[#f0eae7] pt-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-semibold ${stock.className}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${stock.dot}`}
                          />
                          {product.quantity || 0} pcs · {stock.label}
                        </span>

                        <div
                          className="flex gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              router.push(
                                `${ADMIN_BASE}/products/edit/${product._id}`
                              )
                            }
                            className="flex h-8 items-center gap-1.5 rounded-lg border border-[#e3d9d4] px-2.5 text-xs font-semibold text-[#5c4b52]"
                          >
                            <EditIcon />
                            Edit
                          </button>

                          <button
                            type="button"
                            disabled={deleteProduct.isPending}
                            onClick={() =>
                              handleDelete(product._id, product.name)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 text-red-500 disabled:opacity-40"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}

          {/* Pagination */}
          {!isLoading && products.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-[#eee7e3] bg-[#fcfaf9] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-xs text-[#8f837e]">
                Showing{' '}
                <span className="font-semibold text-[#51454a]">
                  {(currentPage - 1) * 10 + 1}
                </span>{' '}
                –{' '}
                <span className="font-semibold text-[#51454a]">
                  {(currentPage - 1) * 10 + products.length}
                </span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  className="flex h-9 items-center gap-1 rounded-lg border border-[#ded5d0] bg-white px-3 text-xs font-semibold text-[#66595e] transition hover:bg-[#f8f3f0] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeftIcon />
                  Previous
                </button>

                <span className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-[#351d2d] px-3 text-xs font-semibold text-white">
                  {currentPage}
                </span>

                <button
                  type="button"
                  disabled={products.length < 10}
                  onClick={() => setCurrentPage((page) => page + 1)}
                  className="flex h-9 items-center gap-1 rounded-lg border border-[#ded5d0] bg-white px-3 text-xs font-semibold text-[#66595e] transition hover:bg-[#f8f3f0] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRightIcon />
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Product Detail Modal */}
      {showModal && selectedProduct && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1d1518]/70 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:rounded-3xl">
            {/* Modal Header */}
            <div className="flex flex-shrink-0 items-center justify-between border-b border-[#eee7e3] bg-white px-5 py-4 sm:px-7">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9a8b85]">
                  Catalog Preview
                </p>

                <h2 className="mt-1 font-serif text-xl text-[#2b2225] sm:text-2xl">
                  Product Details
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e5ddd8] text-[#7d706c] transition hover:bg-[#f8f4f2] hover:text-[#351d2d]"
                aria-label="Close"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
                {/* Images */}
                <div className="border-b border-[#eee7e3] bg-[#faf8f6] p-5 sm:p-7 lg:border-b-0 lg:border-r">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[#32282c]">
                      Product Images
                    </h3>

                    <span className="text-xs text-[#9b8d87]">
                      {selectedProduct.images?.length || 0} images
                    </span>
                  </div>

                  {selectedProduct.images &&
                  selectedProduct.images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {selectedProduct.images.map((image, index) => (
                        <div
                          key={`${image.url}-${index}`}
                          className={`group relative overflow-hidden rounded-2xl border bg-white ${
                            image.isMain
                              ? 'border-[#9b6f83] ring-2 ring-[#9b6f83]/10'
                              : 'border-[#e7dfda]'
                          }`}
                        >
                          <div className="aspect-square">
                            <img
                              src={image.url || '/placeholder-image.jpg'}
                              alt={
                                image.alt ||
                                `${selectedProduct.name} image ${
                                  index + 1
                                }`
                              }
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                          </div>

                          {image.isMain && (
                            <span className="absolute left-2 top-2 rounded-full bg-[#351d2d] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white">
                              Main
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex aspect-square items-center justify-center rounded-2xl border-2 border-dashed border-[#ded5d0] bg-white">
                      <div className="text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#f5efec] text-[#9d8b87]">
                          <PackageIcon />
                        </div>

                        <p className="mt-3 text-sm font-medium text-[#65595d]">
                          No images available
                        </p>

                        <p className="mt-1 text-xs text-[#9b8f8a]">
                          Add product photography when editing.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Information */}
                <div className="p-5 sm:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9b8b85]">
                        {selectedProduct.brand || 'BellesCart Collection'}
                      </p>

                      <h3 className="mt-1 font-serif text-2xl leading-tight text-[#2b2225]">
                        {selectedProduct.name}
                      </h3>
                    </div>

                    {selectedProduct.featured && (
                      <span className="flex flex-shrink-0 items-center gap-1 rounded-full bg-[#f5ede5] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#765c45]">
                        <StarIcon filled />
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mt-5 rounded-2xl border border-[#ebe2dd] bg-[#fcfaf9] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9a8d87]">
                      Selling Price
                    </p>

                    <p className="mt-1 font-serif text-2xl font-medium text-[#351d2d]">
                      ₹
                      {Number(
                        selectedProduct.price || 0
                      ).toLocaleString('en-IN')}
                    </p>
                  </div>

                  {/* Status / Stock */}
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-[#ebe3de] p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#9b8e88]">
                        Status
                      </p>

                      <div className="mt-2">
                        {(() => {
                          const status = getStatusConfig(
                            selectedProduct.status
                          );

                          return (
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${status.className}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                              />
                              {status.label}
                            </span>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#ebe3de] p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#9b8e88]">
                        Inventory
                      </p>

                      <p className="mt-1 text-base font-semibold text-[#3a3034]">
                        {selectedProduct.quantity || 0}{' '}
                        <span className="text-xs font-normal text-[#958983]">
                          pieces
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Information */}
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-[#332a2e]">
                      Product Information
                    </h4>

                    <div className="mt-3 divide-y divide-[#eee7e3] rounded-2xl border border-[#ebe3de]">
                      <div className="grid grid-cols-[110px_1fr] gap-4 p-3.5">
                        <span className="text-xs text-[#988b85]">
                          Category
                        </span>

                        <span className="text-right text-xs font-medium text-[#4a3e43]">
                          {selectedProduct.category?.name ||
                            'Uncategorized'}
                        </span>
                      </div>

                      <div className="grid grid-cols-[110px_1fr] gap-4 p-3.5">
                        <span className="text-xs text-[#988b85]">
                          Brand
                        </span>

                        <span className="text-right text-xs font-medium text-[#4a3e43]">
                          {selectedProduct.brand || 'Not specified'}
                        </span>
                      </div>

                      <div className="grid grid-cols-[110px_1fr] gap-4 p-3.5">
                        <span className="text-xs text-[#988b85]">
                          Featured
                        </span>

                        <span className="text-right text-xs font-medium text-[#4a3e43]">
                          {selectedProduct.featured ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-[#332a2e]">
                      Description
                    </h4>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#756966]">
                      {selectedProduct.description ||
                        'No description available.'}
                    </p>
                  </div>

                  {/* Tags */}
                  {selectedProduct.tags &&
                    selectedProduct.tags.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-sm font-semibold text-[#332a2e]">
                          Tags
                        </h4>

                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {selectedProduct.tags.map((tag, index) => (
                            <span
                              key={`${tag}-${index}`}
                              className="rounded-full border border-[#e5d9d4] bg-[#faf7f5] px-2.5 py-1 text-[10px] font-medium text-[#6e5c63]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Dates */}
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#9b8e88]">
                        Created
                      </p>

                      <p className="mt-1 text-xs text-[#5f5358]">
                        {selectedProduct.createdAt
                          ? new Date(
                              selectedProduct.createdAt
                            ).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'N/A'}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#9b8e88]">
                        Updated
                      </p>

                      <p className="mt-1 text-xs text-[#5f5358]">
                        {selectedProduct.updatedAt
                          ? new Date(
                              selectedProduct.updatedAt
                            ).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-shrink-0 flex-col-reverse gap-2 border-t border-[#eee7e3] bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
              <button
                type="button"
                onClick={closeModal}
                className="h-10 rounded-xl border border-[#ded5d0] px-5 text-sm font-semibold text-[#62565b] transition hover:bg-[#f8f4f2]"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  router.push(
                    `${ADMIN_BASE}/products/edit/${selectedProduct._id}`
                  );
                  closeModal();
                }}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#351d2d] px-5 text-sm font-semibold text-white transition hover:bg-[#47263d]"
              >
                <EditIcon />
                Edit Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}