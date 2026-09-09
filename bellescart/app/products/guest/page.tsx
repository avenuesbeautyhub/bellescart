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

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900">
      <Navbar />

      <main>
        {/* =====================================================
            HERO
        ===================================================== */}
        <section className="relative overflow-hidden bg-white border-b border-gray-100">
          {/* Decorative background */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-pink-100/50 blur-3xl" />
            <div className="absolute -bottom-32 -left-24 w-96 h-96 rounded-full bg-purple-100/40 blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-12 sm:py-16 lg:py-20 text-center">
              {/* Breadcrumb */}
              <div className="flex justify-center items-center gap-2 text-sm text-gray-500 mb-7">
                <span>Home</span>
                <span className="text-gray-300">/</span>
                <span className="text-gray-900 font-medium">Shop</span>
              </div>

              {/* Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-gray-900">
                Discover something
                <span className="block mt-1 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  beautiful
                </span>
              </h1>

              <p className="mt-5 max-w-2xl mx-auto text-base sm:text-lg text-gray-500 leading-relaxed">
                Explore our carefully curated collection of beautiful
                products, designed to make every moment special.
              </p>

              {/* Search */}
              <div className="mt-8 max-w-xl mx-auto">
                <div className="bg-white rounded-2xl shadow-[0_8px_35px_rgba(0,0,0,0.08)] border border-gray-200 p-1.5">
                  <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    onSearch={handleSearch}
                    realTime={true}
                    debounceMs={300}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            CATEGORY NAVIGATION
        ===================================================== */}
        <section className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-4">
              <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1">
                {/* All Products */}
                <button
                  onClick={() =>
                    handleCategoryChange('All Products', null)
                  }
                  className={`
                    flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium
                    transition-all duration-200 border
                    ${
                      selectedCategory === 'All Products'
                        ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-900'
                    }
                  `}
                >
                  All Products
                </button>

                {categories.map((category: any) => (
                  <button
                    key={category._id}
                    onClick={() =>
                      handleCategoryChange(
                        category.name,
                        category._id
                      )
                    }
                    className={`
                      flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium
                      transition-all duration-200 border
                      ${
                        selectedCategory === category.name
                          ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-900'
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
            MAIN SHOP CONTENT
        ===================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          {/* Top toolbar */}
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Product information */}
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                  {selectedCategory === 'All Products'
                    ? 'All Products'
                    : selectedCategory}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {isLoading
                    ? 'Loading products...'
                    : `${sortedProducts.length} ${
                        sortedProducts.length === 1
                          ? 'product'
                          : 'products'
                      } available`}
                </p>
              </div>

              {/* Desktop sort */}
              <div className="hidden sm:flex items-center gap-3">
                <span className="text-sm text-gray-500">
                  Sort by
                </span>

                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="
                      appearance-none
                      min-w-[170px]
                      pl-4 pr-10 py-2.5
                      rounded-xl
                      border border-gray-200
                      bg-white
                      text-sm font-medium
                      text-gray-700
                      outline-none
                      cursor-pointer
                      hover:border-gray-300
                      focus:border-gray-400
                      transition
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              {/* Mobile filter button */}
              <button
                onClick={() =>
                  setMobileFiltersOpen(!mobileFiltersOpen)
                }
                className="
                  sm:hidden
                  flex items-center justify-center gap-2
                  w-full
                  px-4 py-3
                  rounded-xl
                  border border-gray-200
                  bg-white
                  text-sm font-medium
                  text-gray-700
                  hover:bg-gray-50
                  transition
                "
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 6h16M7 12h10M10 18h4" />
                </svg>

                Filters & Sort

                <svg
                  className={`w-4 h-4 transition-transform ${
                    mobileFiltersOpen ? 'rotate-180' : ''
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Mobile filter panel */}
            {mobileFiltersOpen && (
              <div className="sm:hidden bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <div className="mb-5">
                  <p className="text-sm font-semibold text-gray-900 mb-3">
                    Sort By
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
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setMobileFiltersOpen(false);
                        }}
                        className={`
                          w-full flex items-center justify-between
                          px-4 py-3 rounded-xl
                          text-sm text-left
                          transition
                          ${
                            sortBy === option.value
                              ? 'bg-gray-900 text-white'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }
                        `}
                      >
                        {option.label}

                        {sortBy === option.value && (
                          <svg
                            className="w-4 h-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.704 5.29a1 1 0 010 1.42l-7.25 7.25a1 1 0 01-1.42 0l-3.25-3.25a1 1 0 011.42-1.42l2.54 2.54 6.54-6.54a1 1 0 011.42 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {(selectedCategory !== 'All Products' ||
                  searchQuery) && (
                  <button
                    onClick={clearFilters}
                    className="w-full py-3 text-sm font-medium text-pink-600 hover:text-pink-700"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Active filters */}
          {(selectedCategory !== 'All Products' ||
            searchQuery) && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Filters:
              </span>

              {selectedCategory !== 'All Products' && (
                <button
                  onClick={() =>
                    handleCategoryChange('All Products', null)
                  }
                  className="
                    inline-flex items-center gap-2
                    px-3 py-1.5
                    rounded-full
                    bg-pink-50
                    text-pink-700
                    text-xs font-medium
                    hover:bg-pink-100
                    transition
                  "
                >
                  {selectedCategory}

                  <span className="text-pink-400">×</span>
                </button>
              )}

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="
                    inline-flex items-center gap-2
                    px-3 py-1.5
                    rounded-full
                    bg-purple-50
                    text-purple-700
                    text-xs font-medium
                    hover:bg-purple-100
                    transition
                  "
                >
                  Search: "{searchQuery}"

                  <span className="text-purple-400">×</span>
                </button>
              )}

              <button
                onClick={clearFilters}
                className="text-xs font-medium text-gray-500 hover:text-gray-900 ml-1"
              >
                Clear all
              </button>
            </div>
          )}

          {/* ===================================================
              LOADING
          =================================================== */}
          {isLoading && products.length === 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-8">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="aspect-[4/5] rounded-2xl bg-gray-200" />

                  <div className="mt-4 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-4/5" />
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ===================================================
              UPDATING INDICATOR
          =================================================== */}
          {isLoading && products.length > 0 && (
            <div className="flex items-center justify-center gap-3 mb-6 py-3">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
              <span className="text-sm text-gray-500">
                Updating products...
              </span>
            </div>
          )}

          {/* ===================================================
              PRODUCT GRID
          =================================================== */}
          {!isLoading || products.length > 0 ? (
            <GuestProductGrid
              products={sortedProducts}
              onAddToCart={() =>
                console.log('Add to cart clicked')
              }
              onAddToWishlist={() =>
                console.log('Add to wishlist clicked')
              }
            />
          ) : null}

          {/* ===================================================
              EMPTY STATE
          =================================================== */}
          {sortedProducts.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-white rounded-3xl border border-gray-100">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-5">
                <svg
                  className="w-7 h-7 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-4-4" />
                </svg>
              </div>

              <h3 className="text-xl font-semibold text-gray-900">
                No products found
              </h3>

              <p className="mt-2 max-w-md text-sm text-gray-500 leading-relaxed">
                {searchQuery
                  ? `We couldn't find anything matching "${searchQuery}".`
                  : selectedCategory !== 'All Products'
                  ? `There are currently no products in ${selectedCategory}.`
                  : 'There are no products available at the moment.'}
              </p>

              {(selectedCategory !== 'All Products' ||
                searchQuery) && (
                <button
                  onClick={clearFilters}
                  className="
                    mt-6
                    px-6 py-3
                    rounded-xl
                    bg-gray-900
                    text-white
                    text-sm font-medium
                    hover:bg-gray-800
                    transition
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
