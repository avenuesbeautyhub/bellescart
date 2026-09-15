'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import GuestProductGrid from '@/components/ProductGrid/GuestProductGrid';
import { SearchBar } from '@/components';
import {
  usePublicProducts,
  usePublicCategories,
} from '@/hooks/user/usePublicProductQueries';
import { useDebounce } from '@/hooks/useDebounce';

export default function GuestProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [sortBy, setSortBy] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 500);

  const {
    data: productsData,
    isLoading: isLoadingProducts,
  } = usePublicProducts({
    category: selectedCategoryId || undefined,
    search: debouncedSearch || undefined,
  });

  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
  } = usePublicCategories();

  const products = productsData?.data?.products || [];
  const categories = categoriesData?.data?.categories || [];

  const isLoading = isLoadingProducts || isLoadingCategories;

  // ---------------------------------------------------------
  // Initialize search from URL
  // ---------------------------------------------------------
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');

    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, []);

  // ---------------------------------------------------------
  // Initialize category from URL
  // ---------------------------------------------------------
  useEffect(() => {
    if (categories.length === 0) return;

    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');

    if (!categoryParam) return;

    const category = categories.find(
      (cat: any) =>
        cat.name.toLowerCase() === categoryParam.toLowerCase()
    );

    if (category) {
      setSelectedCategory(category.name);
      setSelectedCategoryId(category._id);
    }
  }, [categories]);

  // ---------------------------------------------------------
  // Update URL when search changes
  // ---------------------------------------------------------
  useEffect(() => {
    const url = new URL(window.location.href);

    if (searchQuery) {
      url.searchParams.set('search', searchQuery);
    } else {
      url.searchParams.delete('search');
    }

    window.history.replaceState({}, '', url.toString());
  }, [searchQuery]);

  // ---------------------------------------------------------
  // Filter + Sort
  // ---------------------------------------------------------
  const sortedProducts = useMemo(() => {
    const filteredProducts = products.filter((product: any) => {
      if (selectedCategory === 'All Products') {
        return true;
      }

      return product.category?.name === selectedCategory;
    });

    return [...filteredProducts].sort((a: any, b: any) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;

        case 'price-high':
          return b.price - a.price;

        default:
          return 0;
      }
    });
  }, [products, selectedCategory, sortBy]);

  // ---------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryChange = (
    categoryName: string,
    categoryId: string | null
  ) => {
    setSelectedCategory(categoryName);
    setSelectedCategoryId(categoryId);
    setMobileFiltersOpen(false);

    const url = new URL(window.location.href);

    if (categoryId) {
      url.searchParams.set('category', categoryName);
    } else {
      url.searchParams.delete('category');
    }

    window.history.replaceState({}, '', url.toString());
  };

  const clearFilters = () => {
    setSelectedCategory('All Products');
    setSelectedCategoryId(null);
    setSearchQuery('');

    const url = new URL(window.location.href);
    url.searchParams.delete('category');
    url.searchParams.delete('search');

    window.history.replaceState({}, '', url.toString());
  };

  const hasActiveFilters =
    selectedCategory !== 'All Products' || searchQuery;

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900">
      <Navbar />

      <main>

        {/* =====================================================
            SHOP HEADER
        ===================================================== */}
        <section className="relative overflow-hidden border-b border-gray-100 bg-white">

          {/* Background decoration */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-pink-100/60 blur-3xl" />
            <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-purple-100/50 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

            <div className="py-10 text-center sm:py-14 lg:py-16">

              {/* Breadcrumb */}
              <div className="mb-5 flex items-center justify-center gap-2 text-xs font-medium text-gray-400 sm:text-sm">
                <span>Home</span>
                <span className="text-gray-300">/</span>
                <span className="text-gray-700">Shop</span>
              </div>

              {/* Heading */}
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
                Discover something
                <span className="block bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  beautiful
                </span>
              </h1>

              <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
                Explore our carefully curated collection and find products
                that are made to fit your style.
              </p>

              {/* Search */}
              <div className="mx-auto mt-7 max-w-2xl">
                <div className="rounded-2xl border border-gray-200 bg-white p-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.07)] transition-shadow focus-within:border-pink-200 focus-within:shadow-[0_10px_40px_rgba(236,72,153,0.12)]">
                  <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    onSearch={handleSearch}
                    realTime={true}
                    debounceMs={300}
                  />
                </div>
              </div>

              {/* Small trust line */}
              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Browse our latest collection</span>
              </div>
            </div>
          </div>
        </section>


        {/* =====================================================
            CATEGORY NAVIGATION
        ===================================================== */}
        <section className="sticky top-[72px] z-30 border-b border-gray-100 bg-white/95 backdrop-blur-xl">

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

            <div className="flex items-center py-3">

              {/* Scrollable category list */}
              <div className="scrollbar-hide flex min-w-0 items-center gap-2 overflow-x-auto">

                {/* All products */}
                <button
                  type="button"
                  onClick={() =>
                    handleCategoryChange('All Products', null)
                  }
                  className={`
                    shrink-0 rounded-full border px-4 py-2
                    text-xs font-semibold
                    transition-all duration-200
                    sm:px-5 sm:py-2.5 sm:text-sm
                    ${selectedCategory === 'All Products'
                      ? 'border-gray-900 bg-gray-900 text-white shadow-sm'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  All Products
                </button>

                {categories.map((category: any) => (
                  <button
                    type="button"
                    key={category._id}
                    onClick={() =>
                      handleCategoryChange(
                        category.name,
                        category._id
                      )
                    }
                    className={`
                      shrink-0 rounded-full border px-4 py-2
                      text-xs font-semibold
                      transition-all duration-200
                      sm:px-5 sm:py-2.5 sm:text-sm
                      ${selectedCategory === category.name
                        ? 'border-gray-900 bg-gray-900 text-white shadow-sm'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>


        {/* =====================================================
            SHOP CONTENT
        ===================================================== */}
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">

          {/* ---------------------------------------------------
              TOOLBAR
          ---------------------------------------------------- */}
          <div className="mb-7">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              {/* Product count/title */}
              <div>
                <div className="flex items-center gap-2">

                  <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                    {selectedCategory === 'All Products'
                      ? 'All Products'
                      : selectedCategory}
                  </h2>

                  {!isLoading && (
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold text-gray-500 sm:text-xs">
                      {sortedProducts.length}
                    </span>
                  )}
                </div>

                <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                  {isLoading
                    ? 'Finding products for you...'
                    : sortedProducts.length === 1
                      ? '1 product available'
                      : `${sortedProducts.length} products available`}
                </p>
              </div>

              {/* Desktop sort */}
              <div className="hidden items-center gap-3 sm:flex">

                <span className="text-xs font-medium text-gray-400">
                  Sort by
                </span>

                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="
                      min-w-[180px]
                      appearance-none
                      rounded-xl
                      border border-gray-200
                      bg-white
                      py-2.5 pl-4 pr-10
                      text-sm font-medium text-gray-700
                      shadow-sm
                      outline-none
                      transition-all
                      hover:border-gray-300
                      focus:border-pink-300
                      focus:ring-4
                      focus:ring-pink-500/10
                    "
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">
                      Price: Low to High
                    </option>
                    <option value="price-high">
                      Price: High to Low
                    </option>
                  </select>

                  <svg
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              {/* Mobile filters */}
              <button
                type="button"
                onClick={() =>
                  setMobileFiltersOpen(!mobileFiltersOpen)
                }
                className="
                  flex w-full items-center justify-between
                  rounded-xl border border-gray-200
                  bg-white px-4 py-3
                  text-sm font-semibold text-gray-700
                  shadow-sm
                  transition-all
                  hover:border-gray-300
                  hover:bg-gray-50
                  sm:hidden
                "
              >
                <span className="flex items-center gap-2">

                  <svg
                    className="h-4 w-4 text-gray-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <path d="M4 6h16M7 12h10M10 18h4" />
                  </svg>

                  Filters & Sort
                </span>

                <svg
                  className={`h-4 w-4 text-gray-400 transition-transform ${mobileFiltersOpen ? 'rotate-180' : ''
                    }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>


            {/* Mobile sorting */}
            {mobileFiltersOpen && (
              <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:hidden">

                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                  Sort products
                </p>

                <div className="space-y-2">
                  {[
                    {
                      value: 'featured',
                      label: 'Featured',
                    },
                    {
                      value: 'price-low',
                      label: 'Price: Low to High',
                    },
                    {
                      value: 'price-high',
                      label: 'Price: High to Low',
                    },
                  ].map((option) => (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setMobileFiltersOpen(false);
                      }}
                      className={`
                        flex w-full items-center justify-between
                        rounded-xl px-4 py-3
                        text-left text-sm font-medium
                        transition-all
                        ${sortBy === option.value
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      {option.label}

                      {sortBy === option.value && (
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.704 5.29a1 1 0 010 1.42l-7.25 7.25a1 1 0 01-1.42 0l-3.25-3.25a.75.75 0 011.06-1.06l2.72 2.72 6.72-6.72a.75.75 0 011.42 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>


          {/* ---------------------------------------------------
              ACTIVE FILTERS
          ---------------------------------------------------- */}
          {hasActiveFilters && (
            <div className="mb-7 flex flex-wrap items-center gap-2">

              <span className="mr-1 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">
                Active
              </span>

              {selectedCategory !== 'All Products' && (
                <button
                  type="button"
                  onClick={() =>
                    handleCategoryChange('All Products', null)
                  }
                  className="
                    inline-flex items-center gap-2
                    rounded-full
                    border border-pink-100
                    bg-pink-50
                    px-3 py-1.5
                    text-xs font-semibold text-pink-700
                    transition-colors
                    hover:bg-pink-100
                  "
                >
                  {selectedCategory}
                  <span className="text-sm leading-none text-pink-400">
                    ×
                  </span>
                </button>
              )}

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="
                    inline-flex max-w-full items-center gap-2
                    rounded-full
                    border border-purple-100
                    bg-purple-50
                    px-3 py-1.5
                    text-xs font-semibold text-purple-700
                    transition-colors
                    hover:bg-purple-100
                  "
                >
                  <span className="max-w-[180px] truncate">
                    "{searchQuery}"
                  </span>

                  <span className="text-sm leading-none text-purple-400">
                    ×
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={clearFilters}
                className="
                  ml-1 text-xs font-semibold
                  text-gray-400
                  transition-colors
                  hover:text-gray-900
                "
              >
                Clear all
              </button>
            </div>
          )}


          {/* ===================================================
              INITIAL LOADING
          ==================================================== */}
          {isLoading && products.length === 0 && (
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">

              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse"
                >
                  <div className="aspect-[4/5] rounded-2xl bg-gray-200" />

                  <div className="mt-4 space-y-2.5">
                    <div className="h-2.5 w-1/3 rounded-full bg-gray-200" />
                    <div className="h-4 w-4/5 rounded-full bg-gray-200" />
                    <div className="h-3.5 w-1/3 rounded-full bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          )}


          {/* ===================================================
              UPDATING INDICATOR
          ==================================================== */}
          {isLoading && products.length > 0 && (
            <div className="mb-6 flex items-center justify-center gap-2 rounded-xl bg-white py-3 text-xs text-gray-500 shadow-sm ring-1 ring-gray-100">

              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-pink-500" />

              <span>
                Updating products...
              </span>
            </div>
          )}


          {/* ===================================================
              PRODUCT GRID
          ==================================================== */}
          {!isLoading || products.length > 0 ? (
            <div className="relative">

              {/* Subtle background glow */}
              <div className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-pink-50/40 via-transparent to-purple-50/40 blur-2xl" />

              <div className="relative">
                <GuestProductGrid
                  products={sortedProducts}
                  onAddToCart={() =>
                    console.log('Add to cart clicked')
                  }
                  onAddToWishlist={() =>
                    console.log('Add to wishlist clicked')
                  }
                />
              </div>
            </div>
          ) : null}


          {/* ===================================================
              EMPTY STATE
          ==================================================== */}
          {sortedProducts.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white px-6 py-20 text-center shadow-sm">

              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">

                <svg
                  className="h-7 w-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-4-4" />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-gray-900">
                Nothing found
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                {searchQuery
                  ? `We couldn't find anything matching "${searchQuery}".`
                  : selectedCategory !== 'All Products'
                    ? `There are currently no products in ${selectedCategory}.`
                    : 'There are no products available at the moment.'}
              </p>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="
                    mt-6 rounded-xl
                    bg-gray-900
                    px-6 py-3
                    text-sm font-semibold text-white
                    shadow-sm
                    transition-all duration-200
                    hover:-translate-y-0.5
                    hover:bg-gray-800
                    hover:shadow-md
                  "
                >
                  View all products
                </button>
              )}
            </div>
          )}

        </section>
      </main>

      <Footer />
    </div>
  );
}
