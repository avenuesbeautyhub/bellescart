'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import ProductGrid from '@/components/ProductGrid/ProductGrid';
import Loader from '@/components/ui/Loader';
import { SearchBar } from '@/components';
import { useAuth } from '@/auth/user';
import {
  useProducts,
  useCategories,
  useBackendSearch,
} from '@/hooks/user/useProductQueries';
import { useDebounce } from '@/hooks/useDebounce';
import {
  useWishlist,
  useAddToWishlist,
  useRemoveFromWishlist,
} from '@/hooks/user/useWishlistQueries';
import { globalToast } from '@/utils/globalToast';

export default function ProductsPage() {
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('featured');
  const [mounted, setMounted] = useState(false);
  const [initialCategoryParam, setInitialCategoryParam] = useState<string | null>(null);

  const { loaded, isAuthenticated } = useAuth();

  // ------------------------------------------------------------
  // SEARCH
  // ------------------------------------------------------------

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);

  // ------------------------------------------------------------
  // FILTERS
  // ------------------------------------------------------------

  const [priceRange, setPriceRange] = useState({
    min: '',
    max: '',
  });

  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);

  // ------------------------------------------------------------
  // PAGINATION
  // ------------------------------------------------------------

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // ------------------------------------------------------------
  // MOUNT
  // ------------------------------------------------------------

  useEffect(() => {
    setMounted(true);
  }, []);

  // ------------------------------------------------------------
  // INITIAL SEARCH FROM URL
  // ------------------------------------------------------------

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    const categoryParam = urlParams.get('category');

    if (searchParam) {
      setSearchQuery(searchParam);
    }

    if (categoryParam) {
      setInitialCategoryParam(categoryParam);
    }
  }, []);

  // ------------------------------------------------------------
  // UPDATE SEARCH URL
  // ------------------------------------------------------------

  useEffect(() => {
    const url = new URL(window.location.href);

    if (searchQuery) {
      url.searchParams.set('search', searchQuery);
    } else {
      url.searchParams.delete('search');
    }

    window.history.replaceState({}, '', url.toString());
  }, [searchQuery]);

  // ------------------------------------------------------------
  // SEARCH PARAMS
  // ------------------------------------------------------------

  const searchParams = debouncedSearch
    ? {
        search: debouncedSearch,
        category: selectedCategoryId || undefined,
        minPrice: priceRange.min
          ? parseFloat(priceRange.min)
          : undefined,
        maxPrice: priceRange.max
          ? parseFloat(priceRange.max)
          : undefined,
        sort:
          sortBy === 'featured'
            ? 'createdAt'
            : sortBy === 'price-low'
              ? 'price'
              : sortBy === 'price-high'
                ? 'price'
                : sortBy === 'name-asc'
                  ? 'name'
                  : sortBy === 'name-desc'
                    ? 'name'
                    : 'createdAt',
        order:
          sortBy === 'price-high' || sortBy === 'name-desc'
            ? 'desc'
            : 'asc',
        page: currentPage,
        limit: itemsPerPage,
      }
    : undefined;

  const {
    data: searchResults,
    isLoading: isSearchLoading,
  } = useBackendSearch(searchParams);

  // ------------------------------------------------------------
  // PRODUCTS
  // ------------------------------------------------------------

  const {
    data: productsData,
    isLoading: isLoadingProducts,
  } = useProducts({
    category: selectedCategoryId || undefined,
    sort:
      sortBy === 'featured'
        ? 'createdAt'
        : sortBy === 'price-low'
          ? 'price'
          : sortBy === 'price-high'
            ? 'price'
            : sortBy === 'name-asc'
              ? 'name'
              : sortBy === 'name-desc'
                ? 'name'
                : 'createdAt',
    order:
      sortBy === 'price-high' || sortBy === 'name-desc'
        ? 'desc'
        : 'asc',
    page: currentPage,
    limit: itemsPerPage,
  });

  // ------------------------------------------------------------
  // CATEGORIES
  // ------------------------------------------------------------

  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
  } = useCategories();

  // ------------------------------------------------------------
  // WISHLIST
  // ------------------------------------------------------------

  const { data: wishlistData } = useWishlist();
  const addToWishlistMutation = useAddToWishlist();
  const removeFromWishlistMutation = useRemoveFromWishlist();

  const wishlistItems = wishlistData?.data?.wishlist || [];

  const products = debouncedSearch
    ? searchResults?.data?.products || []
    : productsData?.data?.products || [];

  const pagination = debouncedSearch
    ? searchResults?.data?.pagination
    : productsData?.data?.pagination;

  const categories = categoriesData?.data?.categories || [];

  const isLoading =
    (debouncedSearch
      ? isSearchLoading
      : isLoadingProducts) || isLoadingCategories;

  // ------------------------------------------------------------
  // CATEGORY FROM URL
  // ------------------------------------------------------------

  useEffect(() => {
    if (!initialCategoryParam || categories.length === 0) return;

    const category = categories.find(
      (cat: any) =>
        cat.name.toLowerCase() === initialCategoryParam.toLowerCase()
    );

    if (category) {
      setSelectedCategory(category.name);
      setSelectedCategoryId(category._id);
      setInitialCategoryParam(null);
    }
  }, [initialCategoryParam, categories]);

  // ------------------------------------------------------------
  // AUTH REDIRECT
  // ------------------------------------------------------------

  useEffect(() => {
    if (loaded && !isAuthenticated) {
      const urlParams = new URLSearchParams(window.location.search);

      const searchParam = urlParams.get('search');
      const categoryParam = urlParams.get('category');

      let redirectUrl = '/products/guest';

      const params = new URLSearchParams();

      if (searchParam) {
        params.set('search', searchParam);
      }

      if (categoryParam) {
        params.set('category', categoryParam);
      }

      if (params.toString()) {
        redirectUrl += `?${params.toString()}`;
      }

      router.replace(redirectUrl);
    }
  }, [loaded, isAuthenticated, router]);

  // ------------------------------------------------------------
  // RESET PAGE
  // ------------------------------------------------------------

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedCategoryId, sortBy]);

  // ------------------------------------------------------------
  // CATEGORY URL
  // ------------------------------------------------------------

  useEffect(() => {
    const url = new URL(window.location.href);

    if (
      selectedCategoryId &&
      selectedCategory !== 'All Products'
    ) {
      url.searchParams.set(
        'category',
        selectedCategory.toLowerCase()
      );
    } else {
      url.searchParams.delete('category');
    }

    window.history.replaceState({}, '', url.toString());
  }, [selectedCategory, selectedCategoryId]);

  // ------------------------------------------------------------
  // BRANDS
  // ------------------------------------------------------------

  const brands = useMemo(() => {
    if (debouncedSearch) return [];

    const brandSet = new Set<string>();

    products.forEach((product: any) => {
      if (product.brand) {
        brandSet.add(product.brand);
      }
    });

    return Array.from(brandSet).sort();
  }, [products, debouncedSearch]);

  // ------------------------------------------------------------
  // PAGINATION
  // ------------------------------------------------------------

  const totalPages = pagination?.totalPages || 1;

  const paginatedProducts = products;

  // ------------------------------------------------------------
  // ACTIVE FILTERS
  // ------------------------------------------------------------

  const hasActiveFilters =
    selectedCategory !== 'All Products' ||
    !!searchQuery ||
    !!priceRange.min ||
    !!priceRange.max ||
    selectedBrands.length > 0 ||
    inStockOnly;

  // ------------------------------------------------------------
  // CLEAR FILTERS
  // ------------------------------------------------------------

  const clearFilters = () => {
    setSelectedCategory('All Products');
    setSelectedCategoryId(null);
    setSortBy('featured');
    setSearchQuery('');
    setPriceRange({
      min: '',
      max: '',
    });
    setSelectedBrands([]);
    setInStockOnly(false);
    setCurrentPage(1);

    const url = new URL(window.location.href);

    url.searchParams.delete('search');
    url.searchParams.delete('category');

    window.history.replaceState({}, '', url.toString());
  };

  // ------------------------------------------------------------
  // SEARCH
  // ------------------------------------------------------------

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // ------------------------------------------------------------
  // WISHLIST
  // ------------------------------------------------------------

  const handleAddToWishlist = async (product: any) => {
    try {
      const isInWishlist = wishlistItems.some(
        (item: any) => item._id === product._id || item === product._id
      );

      if (isInWishlist) {
        await removeFromWishlistMutation.mutateAsync(product._id);
        globalToast.general.success(
          'Removed',
          'Item removed from wishlist'
        );
      } else {
        await addToWishlistMutation.mutateAsync(product._id);
        globalToast.general.success(
          'Added',
          'Item added to wishlist'
        );
      }
    } catch (error) {
      console.error('Failed to update wishlist:', error);
      globalToast.general.error(
        'Error',
        'Failed to update wishlist'
      );
    }
  };

  // ------------------------------------------------------------
  // LOADING AUTH
  // ------------------------------------------------------------

  if (!loaded) {
    return (
      <div className="min-h-screen flex flex-col bg-[#faf9fb]">
        <Navbar />

        <div className="flex-1 flex items-center justify-center">
          <Loader size="lg" text="Loading..." />
        </div>

        <Footer />
      </div>
    );
  }

  // ------------------------------------------------------------
  // REDIRECTING
  // ------------------------------------------------------------

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-[#faf9fb]">
        <Navbar />

        <div className="flex-1 flex items-center justify-center">
          <Loader size="lg" text="Redirecting..." />
        </div>

        <Footer />
      </div>
    );
  }

  // ------------------------------------------------------------
  // HYDRATION
  // ------------------------------------------------------------

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col bg-[#faf9fb]">
        <Navbar />

        <div className="flex-1" />

        <Footer />
      </div>
    );
  }

  // ------------------------------------------------------------
  // PAGE
  // ------------------------------------------------------------

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9fb] text-gray-900">
      <Navbar />

      <main className="flex-1">

        {/* =====================================================
            INITIAL LOADING
        ====================================================== */}

        {isLoading &&
          products.length === 0 &&
          !debouncedSearch && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm">
              <Loader
                size="lg"
                text="Preparing your collection..."
              />
            </div>
          )}

        {/* =====================================================
            PAGE HEADER
        ====================================================== */}

        <section className="border-b border-gray-100 bg-white">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">

            <div className="flex flex-col gap-6 py-8 md:py-10 lg:flex-row lg:items-end lg:justify-between">

              <div className="max-w-2xl">

                <div className="mb-3 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-pink-500" />

                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-pink-600">
                    Your Collection
                  </span>
                </div>

                <h1 className="text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">
                  Explore products
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
                  Browse our collection and find something
                  you'll love.
                </p>

              </div>

              {/* Search */}

              <div className="w-full lg:max-w-md">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onSearch={handleSearch}
                  className="w-full"
                  realTime={true}
                  debounceMs={300}
                />
              </div>

            </div>

          </div>
        </section>

        {/* =====================================================
            CATEGORY QUICK NAVIGATION
        ====================================================== */}

        <section className="sticky top-0 z-30 border-b border-gray-100 bg-white/95 backdrop-blur-md">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">

            <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide">

              <button
                onClick={() => {
                  setSelectedCategory('All Products');
                  setSelectedCategoryId(null);
                }}
                className={`
                  flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5
                  text-sm font-semibold transition-all duration-200
                  ${
                    selectedCategory === 'All Products'
                      ? 'bg-gray-950 text-white shadow-sm'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-950'
                  }
                `}
              >
                <span>All</span>

                {selectedCategory === 'All Products' && (
                  <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-[10px]">
                    ✓
                  </span>
                )}
              </button>

              {categories.map((category: any) => (
                <button
                  key={category._id}
                  onClick={() => {
                    setSelectedCategory(category.name);
                    setSelectedCategoryId(category._id);
                  }}
                  className={`
                    flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5
                    text-sm font-medium transition-all duration-200
                    ${
                      selectedCategory === category.name
                        ? 'bg-pink-500 text-white shadow-sm shadow-pink-200'
                        : 'bg-gray-50 text-gray-600 hover:bg-pink-50 hover:text-pink-600'
                    }
                  `}
                >
                  {category.name}

                  {selectedCategory === category.name && (
                    <span className="text-xs">✓</span>
                  )}
                </button>
              ))}

            </div>

          </div>
        </section>

        {/* =====================================================
            MAIN CONTENT
        ====================================================== */}

        <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

          {/* ===================================================
              MOBILE CONTROL BAR
          ==================================================== */}

          <div className="mb-5 lg:hidden">

            <div className="flex gap-2">

              <button
                onClick={() =>
                  setShowMobileFilters(!showMobileFilters)
                }
                className={`
                  flex flex-1 items-center justify-center gap-2
                  rounded-xl border px-4 py-3 text-sm font-semibold
                  transition-all
                  ${
                    showMobileFilters || hasActiveFilters
                      ? 'border-pink-200 bg-pink-50 text-pink-600'
                      : 'border-gray-200 bg-white text-gray-700'
                  }
                `}
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
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>

                Filters

                {hasActiveFilters && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-pink-500 px-1 text-[10px] font-bold text-white">
                    !
                  </span>
                )}
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-medium text-gray-700 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              >
                <option value="featured">Featured</option>
                <option value="price-low">
                  Price: Low to High
                </option>
                <option value="price-high">
                  Price: High to Low
                </option>
                <option value="name-asc">
                  Name: A to Z
                </option>
                <option value="name-desc">
                  Name: Z to A
                </option>
                <option value="newest">
                  Newest First
                </option>
              </select>

            </div>

          </div>

          {/* ===================================================
              FILTER PANEL
          ==================================================== */}

          <div
            className={`
              ${showMobileFilters ? 'block' : 'hidden'}
              mb-6 lg:block
            `}
          >
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm lg:hidden">

              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-950">
                    Refine results
                  </h3>

                  <p className="mt-0.5 text-xs text-gray-500">
                    Adjust your preferences
                  </p>
                </div>

                <button
                  onClick={() =>
                    setShowMobileFilters(false)
                  }
                  className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">

                {/* Price */}

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
                    Price range
                  </label>

                  <div className="flex items-center gap-2">

                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                        ₹
                      </span>

                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) =>
                          setPriceRange({
                            ...priceRange,
                            min: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-7 pr-3 text-sm outline-none focus:border-pink-400 focus:bg-white focus:ring-2 focus:ring-pink-100"
                      />
                    </div>

                    <span className="text-gray-300">—</span>

                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                        ₹
                      </span>

                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) =>
                          setPriceRange({
                            ...priceRange,
                            max: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-7 pr-3 text-sm outline-none focus:border-pink-400 focus:bg-white focus:ring-2 focus:ring-pink-100"
                      />
                    </div>

                  </div>
                </div>

                {/* Availability */}

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
                    Availability
                  </label>

                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 hover:border-pink-200 hover:bg-pink-50">

                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) =>
                        setInStockOnly(e.target.checked)
                      }
                      className="h-4 w-4 rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                    />

                    <span className="text-sm font-medium text-gray-700">
                      Show in-stock products only
                    </span>

                  </label>
                </div>

              </div>

              {/* Brands */}

              {brands.length > 0 && (
                <div className="mt-5 border-t border-gray-100 pt-5">

                  <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-gray-500">
                    Brands
                  </label>

                  <div className="flex flex-wrap gap-2">

                    {brands.map((brand) => {
                      const active =
                        selectedBrands.includes(brand);

                      return (
                        <button
                          key={brand}
                          onClick={() => {
                            if (active) {
                              setSelectedBrands(
                                selectedBrands.filter(
                                  (b) => b !== brand
                                )
                              );
                            } else {
                              setSelectedBrands([
                                ...selectedBrands,
                                brand,
                              ]);
                            }
                          }}
                          className={`
                            rounded-full border px-3 py-2 text-xs font-medium
                            transition-all
                            ${
                              active
                                ? 'border-pink-500 bg-pink-500 text-white'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-pink-300 hover:text-pink-600'
                            }
                          `}
                        >
                          {brand}
                        </button>
                      );
                    })}

                  </div>

                </div>
              )}

              {hasActiveFilters && (
                <button
                  onClick={() => {
                    clearFilters();
                    setShowMobileFilters(false);
                  }}
                  className="mt-5 w-full rounded-xl border border-pink-200 bg-pink-50 px-4 py-3 text-sm font-semibold text-pink-600 transition hover:bg-pink-100"
                >
                  Clear all filters
                </button>
              )}

            </div>
          </div>

          {/* ===================================================
              DESKTOP LAYOUT
          ==================================================== */}

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[250px_minmax(0,1fr)] xl:grid-cols-[270px_minmax(0,1fr)]">

            {/* =================================================
                DESKTOP SIDEBAR
            ================================================== */}

            <aside className="hidden lg:block">

              <div className="sticky top-24 space-y-4">

                {/* Category */}

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">

                  <div className="border-b border-gray-100 px-5 py-4">
                    <h3 className="font-semibold text-gray-950">
                      Categories
                    </h3>
                  </div>

                  <div className="max-h-[360px] overflow-y-auto p-2">

                    <button
                      onClick={() => {
                        setSelectedCategory('All Products');
                        setSelectedCategoryId(null);
                      }}
                      className={`
                        flex w-full items-center justify-between rounded-xl px-3 py-2.5
                        text-left text-sm transition-all
                        ${
                          selectedCategory === 'All Products'
                            ? 'bg-gray-950 font-semibold text-white'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-950'
                        }
                      `}
                    >
                      <span>All Products</span>

                      {selectedCategory === 'All Products' && (
                        <span className="text-xs opacity-70">
                          ✓
                        </span>
                      )}
                    </button>

                    {categories.map((category: any) => (
                      <button
                        key={category._id}
                        onClick={() => {
                          setSelectedCategory(category.name);
                          setSelectedCategoryId(category._id);
                        }}
                        className={`
                          flex w-full items-center justify-between rounded-xl px-3 py-2.5
                          text-left text-sm transition-all
                          ${
                            selectedCategory === category.name
                              ? 'bg-pink-50 font-semibold text-pink-600'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-950'
                          }
                        `}
                      >
                        <span>{category.name}</span>

                        {selectedCategory === category.name && (
                          <span className="text-xs">
                            ✓
                          </span>
                        )}
                      </button>
                    ))}

                  </div>

                </div>

                {/* Sort */}

                <div className="rounded-2xl border border-gray-200 bg-white p-5">

                  <h3 className="mb-3 font-semibold text-gray-950">
                    Sort products
                  </h3>

                  <div className="space-y-1">

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
                      {
                        value: 'name-asc',
                        label: 'Name: A to Z',
                      },
                      {
                        value: 'name-desc',
                        label: 'Name: Z to A',
                      },
                      {
                        value: 'newest',
                        label: 'Newest First',
                      },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          setSortBy(option.value)
                        }
                        className={`
                          flex w-full items-center justify-between
                          rounded-lg px-3 py-2.5 text-left text-sm
                          transition
                          ${
                            sortBy === option.value
                              ? 'bg-gray-50 font-semibold text-gray-950'
                              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                          }
                        `}
                      >
                        <span>{option.label}</span>

                        {sortBy === option.value && (
                          <span className="text-pink-500">
                            ✓
                          </span>
                        )}
                      </button>
                    ))}

                  </div>

                </div>

                {/* Price */}

                <div className="rounded-2xl border border-gray-200 bg-white p-5">

                  <h3 className="mb-3 font-semibold text-gray-950">
                    Price range
                  </h3>

                  <div className="flex items-center gap-2">

                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                        ₹
                      </span>

                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) =>
                          setPriceRange({
                            ...priceRange,
                            min: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-7 pr-2 text-sm outline-none transition focus:border-pink-400 focus:bg-white focus:ring-2 focus:ring-pink-100"
                      />
                    </div>

                    <span className="text-gray-300">—</span>

                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                        ₹
                      </span>

                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) =>
                          setPriceRange({
                            ...priceRange,
                            max: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-7 pr-2 text-sm outline-none transition focus:border-pink-400 focus:bg-white focus:ring-2 focus:ring-pink-100"
                      />
                    </div>

                  </div>

                </div>

                {/* Brands */}

                {brands.length > 0 && (
                  <div className="rounded-2xl border border-gray-200 bg-white p-5">

                    <h3 className="mb-3 font-semibold text-gray-950">
                      Brands
                    </h3>

                    <div className="max-h-48 space-y-2 overflow-y-auto pr-1">

                      {brands.map((brand) => (
                        <label
                          key={brand}
                          className="group flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(
                              brand
                            )}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedBrands([
                                  ...selectedBrands,
                                  brand,
                                ]);
                              } else {
                                setSelectedBrands(
                                  selectedBrands.filter(
                                    (b) => b !== brand
                                  )
                                );
                              }
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                          />

                          <span
                            className={`
                              text-sm transition
                              ${
                                selectedBrands.includes(brand)
                                  ? 'font-semibold text-gray-900'
                                  : 'text-gray-500 group-hover:text-gray-900'
                              }
                            `}
                          >
                            {brand}
                          </span>
                        </label>
                      ))}

                    </div>

                  </div>
                )}

                {/* Availability */}

                <div className="rounded-2xl border border-gray-200 bg-white p-5">

                  <h3 className="mb-3 font-semibold text-gray-950">
                    Availability
                  </h3>

                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) =>
                        setInStockOnly(e.target.checked)
                      }
                      className="h-4 w-4 rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                    />

                    <span className="text-sm text-gray-600">
                      In Stock Only
                    </span>
                  </label>

                </div>

                {/* Clear */}

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-pink-200 bg-pink-50 px-4 py-3 text-sm font-semibold text-pink-600 transition hover:bg-pink-100"
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

                    Clear filters
                  </button>
                )}

              </div>

            </aside>

            {/* =================================================
                PRODUCTS AREA
            ================================================== */}

            <section className="min-w-0">

              {/* =================================================
                  ACTIVE FILTER CHIPS
              ================================================== */}

              {hasActiveFilters && (
                <div className="mb-5 flex flex-wrap items-center gap-2">

                  <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Active:
                  </span>

                  {selectedCategory !== 'All Products' && (
                    <button
                      onClick={() => {
                        setSelectedCategory('All Products');
                        setSelectedCategoryId(null);
                      }}
                      className="group flex items-center gap-1.5 rounded-full border border-pink-200 bg-pink-50 px-3 py-1.5 text-xs font-medium text-pink-600"
                    >
                      {selectedCategory}

                      <span className="text-pink-400 group-hover:text-pink-700">
                        ×
                      </span>
                    </button>
                  )}

                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="group flex max-w-[220px] items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600"
                    >
                      <span className="truncate">
                        "{searchQuery}"
                      </span>

                      <span className="text-gray-400 group-hover:text-gray-700">
                        ×
                      </span>
                    </button>
                  )}

                  {(priceRange.min || priceRange.max) && (
                    <button
                      onClick={() =>
                        setPriceRange({
                          min: '',
                          max: '',
                        })
                      }
                      className="group flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600"
                    >
                      ₹{priceRange.min || '0'} — ₹
                      {priceRange.max || '∞'}

                      <span className="text-gray-400 group-hover:text-gray-700">
                        ×
                      </span>
                    </button>
                  )}

                  {inStockOnly && (
                    <button
                      onClick={() => setInStockOnly(false)}
                      className="group flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700"
                    >
                      In stock

                      <span className="text-green-500 group-hover:text-green-700">
                        ×
                      </span>
                    </button>
                  )}

                  {selectedBrands.map((brand) => (
                    <button
                      key={brand}
                      onClick={() =>
                        setSelectedBrands(
                          selectedBrands.filter(
                            (b) => b !== brand
                          )
                        )
                      }
                      className="group flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600"
                    >
                      {brand}

                      <span className="text-gray-400 group-hover:text-gray-700">
                        ×
                      </span>
                    </button>
                  ))}

                </div>
              )}

              {/* =================================================
                  RESULTS TOOLBAR
              ================================================== */}

              <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <div className="flex items-baseline gap-2">

                    <span className="text-lg font-semibold text-gray-950">
                      {pagination?.total ??
                        products.length}
                    </span>

                    <span className="text-sm text-gray-500">
                      products
                    </span>

                  </div>

                  <p className="mt-0.5 text-xs text-gray-400">
                    {selectedCategory === 'All Products'
                      ? 'Showing the full collection'
                      : `Browsing ${selectedCategory}`}
                  </p>
                </div>

                <div className="flex items-center gap-2">

                  {/* Updating */}

                  {isLoading && products.length > 0 && (
                    <div className="mr-2 hidden items-center gap-2 text-xs text-gray-400 sm:flex">
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-gray-200 border-t-pink-500" />
                      Updating
                    </div>
                  )}

                  {/* View mode */}

                  <div className="hidden items-center rounded-xl bg-gray-50 p-1 sm:flex">

                    <button
                      onClick={() => setViewMode('grid')}
                      aria-label="Grid view"
                      className={`
                        rounded-lg p-2 transition
                        ${
                          viewMode === 'grid'
                            ? 'bg-white text-gray-950 shadow-sm'
                            : 'text-gray-400 hover:text-gray-700'
                        }
                      `}
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
                          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                        />
                      </svg>
                    </button>

                    <button
                      onClick={() => setViewMode('list')}
                      aria-label="List view"
                      className={`
                        rounded-lg p-2 transition
                        ${
                          viewMode === 'list'
                            ? 'bg-white text-gray-950 shadow-sm'
                            : 'text-gray-400 hover:text-gray-700'
                        }
                      `}
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
                          d="M4 6h16M4 10h16M4 14h16M4 18h16"
                        />
                      </svg>
                    </button>

                  </div>

                  {/* Items */}

                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(
                        parseInt(e.target.value)
                      );
                      setCurrentPage(1);
                    }}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-medium text-gray-600 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                  >
                    <option value={12}>
                      12 / page
                    </option>

                    <option value={24}>
                      24 / page
                    </option>

                    <option value={48}>
                      48 / page
                    </option>
                  </select>

                </div>

              </div>

              {/* =================================================
                  SEARCH LOADING
              ================================================== */}

              {debouncedSearch && isSearchLoading && (
                <div className="mb-5 flex items-center justify-center gap-2 rounded-xl border border-gray-100 bg-white py-3 text-xs text-gray-500">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-200 border-t-pink-500" />
                  Finding the best matches...
                </div>
              )}

              {/* =================================================
                  PRODUCTS
              ================================================== */}

              {paginatedProducts.length > 0 ? (
                <>

                  <div
                    className={
                      viewMode === 'grid'
                        ? 'transition-opacity duration-200'
                        : 'transition-opacity duration-200'
                    }
                  >
                    <ProductGrid
                      products={paginatedProducts}
                      onAddToCart={() =>
                        console.log(
                          'Add to cart clicked'
                        )
                      }
                      onAddToWishlist={handleAddToWishlist}
                      wishlistItems={wishlistItems}
                      viewMode={viewMode}
                    />
                  </div>

                  {/* =================================================
                      PAGINATION
                  ================================================== */}

                  {totalPages > 1 && (
                    <div className="mt-10 flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">

                      <div className="text-center text-xs text-gray-500 sm:text-left">

                        Showing{' '}
                        <span className="font-semibold text-gray-900">
                          {((currentPage - 1) *
                            itemsPerPage) +
                            1}
                        </span>{' '}
                        —{' '}
                        <span className="font-semibold text-gray-900">
                          {Math.min(
                            currentPage *
                              itemsPerPage,
                            pagination?.total || 0
                          )}
                        </span>{' '}
                        of{' '}
                        <span className="font-semibold text-gray-900">
                          {pagination?.total || 0}
                        </span>

                      </div>

                      <div className="flex items-center justify-center gap-1.5">

                        <button
                          onClick={() =>
                            setCurrentPage(
                              Math.max(
                                1,
                                currentPage - 1
                              )
                            )
                          }
                          disabled={currentPage === 1}
                          className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <span className="hidden sm:inline">
                            Previous
                          </span>

                          <span className="sm:hidden">
                            ←
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
                                  totalPages -
                                  4 +
                                  i;
                              } else {
                                pageNum =
                                  currentPage -
                                  2 +
                                  i;
                              }

                              return pageNum;
                            }
                          ).map((pageNum) => (
                            <button
                              key={pageNum}
                              onClick={() =>
                                setCurrentPage(
                                  pageNum
                                )
                              }
                              className={`
                                h-9 w-9 rounded-xl text-sm font-semibold transition
                                ${
                                  currentPage ===
                                  pageNum
                                    ? 'bg-gray-950 text-white shadow-sm'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }
                              `}
                            >
                              {pageNum}
                            </button>
                          ))}

                        </div>

                        <button
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
                          className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <span className="hidden sm:inline">
                            Next
                          </span>

                          <span className="sm:hidden">
                            →
                          </span>
                        </button>

                      </div>

                    </div>
                  )}

                </>
              ) : (

                /* =================================================
                   EMPTY STATE
                ================================================== */

                <div className="rounded-3xl border border-gray-200 bg-white px-6 py-20 text-center">

                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50">

                    <svg
                      className="h-9 w-9 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>

                  </div>

                  <h3 className="text-xl font-semibold text-gray-950">
                    Nothing matched your search
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                    Try changing your search or removing
                    some filters to discover more products.
                  </p>

                  <button
                    onClick={clearFilters}
                    className="mt-6 rounded-xl bg-gray-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                  >
                    Clear filters
                  </button>

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