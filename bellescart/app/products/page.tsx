'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import ProductGrid from '@/components/ProductGrid/ProductGrid';
import Loader from '@/components/ui/Loader';
import { SearchBar } from '@/components';
import { useAuth } from '@/auth/user';
import { useProducts, useCategories, useBackendSearch } from '@/hooks/user/useProductQueries';
import { useDebounce } from '@/hooks/useDebounce';

export default function ProductsPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('featured');
  const [mounted, setMounted] = useState(false);
  const { user, loaded, isAuthenticated } = useAuth();

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Search state with debouncing
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500); // Increased to 500ms for better performance

  // Initialize search from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, []);

  // Update URL when search query changes
  useEffect(() => {
    const url = new URL(window.location.href);
    if (searchQuery) {
      url.searchParams.set('search', searchQuery);
    } else {
      url.searchParams.delete('search');
    }
    window.history.replaceState({}, '', url.toString());
  }, [searchQuery]);

  // Advanced filters
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // UI state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Use backend search when there's a search query, otherwise use regular products
  const searchParams = debouncedSearch ? {
    search: debouncedSearch,
    category: selectedCategoryId || undefined,
    minPrice: priceRange.min ? parseFloat(priceRange.min) : undefined,
    maxPrice: priceRange.max ? parseFloat(priceRange.max) : undefined,
    sort: sortBy === 'featured' ? 'createdAt' : sortBy === 'price-low' ? 'price' : sortBy === 'price-high' ? 'price' : sortBy === 'name-asc' ? 'name' : sortBy === 'name-desc' ? 'name' : 'createdAt',
    order: sortBy === 'price-high' || sortBy === 'name-desc' ? 'desc' : 'asc',
    page: currentPage,
    limit: itemsPerPage
  } : undefined;

  const { data: searchResults, isLoading: isSearchLoading } = useBackendSearch(searchParams);

  const { data: productsData, isLoading: isLoadingProducts } = useProducts({
    category: selectedCategoryId || undefined,
    sort: sortBy === 'featured' ? 'createdAt' : sortBy === 'price-low' ? 'price' : sortBy === 'price-high' ? 'price' : sortBy === 'name-asc' ? 'name' : sortBy === 'name-desc' ? 'name' : 'createdAt',
    order: sortBy === 'price-high' || sortBy === 'name-desc' ? 'desc' : 'asc',
    page: currentPage,
    limit: itemsPerPage
  });

  const { data: categoriesData, isLoading: isLoadingCategories } = useCategories();

  // Use search results when searching, otherwise use regular products
  const products = debouncedSearch ? (searchResults?.data?.products || []) : (productsData?.data?.products || []);
  const pagination = debouncedSearch ? (searchResults?.data?.pagination) : (productsData?.data?.pagination);
  const categories = categoriesData?.data?.categories || [];
  const isLoading = (debouncedSearch ? isSearchLoading : isLoadingProducts) || isLoadingCategories;

  // Initialize category from URL when categories are loaded
  useEffect(() => {
    if (categories.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const categoryParam = urlParams.get('category');

      if (categoryParam) {
        const category = categories.find((cat: any) => cat.name.toLowerCase() === categoryParam.toLowerCase());
        if (category) {
          setSelectedCategory(category.name);
          setSelectedCategoryId(category._id);
        }
      }
    }
  }, [categories]);

  // Redirect guests to guest products page with preserved search params
  useEffect(() => {
    if (loaded && !isAuthenticated) {
      const urlParams = new URLSearchParams(window.location.search);
      const searchParam = urlParams.get('search');
      const categoryParam = urlParams.get('category');
      
      let redirectUrl = '/products/guest';
      const params = new URLSearchParams();
      if (searchParam) params.set('search', searchParam);
      if (categoryParam) params.set('category', categoryParam);
      
      if (params.toString()) {
        redirectUrl += `?${params.toString()}`;
      }
      
      router.replace(redirectUrl);
    }
  }, [loaded, isAuthenticated, router]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedCategoryId, sortBy]);


  // Update URL when category changes
  useEffect(() => {
    const url = new URL(window.location.href);
    if (selectedCategoryId && selectedCategory !== 'All Products') {
      url.searchParams.set('category', selectedCategory.toLowerCase());
    } else {
      url.searchParams.delete('category');
    }
    window.history.replaceState({}, '', url.toString());
  }, [selectedCategory, selectedCategoryId]);

  // Extract unique brands from products (only when not searching to get all available brands)
  const brands = React.useMemo(() => {
    if (debouncedSearch) return []; // Don't show brands when searching
    const brandSet = new Set<string>();
    products.forEach(product => {
      if (product.brand) brandSet.add(product.brand);
    });
    return Array.from(brandSet).sort();
  }, [products, debouncedSearch]);

  // Pagination from backend
  const totalPages = pagination?.totalPages || 1;
  const paginatedProducts = products; // Backend already handles pagination

  const clearFilters = () => {
    setSelectedCategory('All Products');
    setSelectedCategoryId(null);
    setSortBy('featured');
    setSearchQuery('');
    setPriceRange({ min: '', max: '' });
    setSelectedBrands([]);
    setInStockOnly(false);
    setCurrentPage(1);

    // Clear URL parameters
    const url = new URL(window.location.href);
    url.searchParams.delete('search');
    url.searchParams.delete('category');
    window.history.replaceState({}, '', url.toString());
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const hasActiveFilters = selectedCategory !== 'All Products' ||
    searchQuery ||
    priceRange.min ||
    priceRange.max ||
    selectedBrands.length > 0 ||
    inStockOnly;

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

  // Don't render if not authenticated (redirecting)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader size="lg" text="Redirecting..." />
        </div>
        <Footer />
      </div>
    );
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1" />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      <main className="flex-1">
        {/* Loading State - Only show loader overlay when no products exist and not searching */}
        {isLoading && products.length === 0 && !debouncedSearch && (
          <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
            <Loader size="lg" text="Loading products..." />
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">Products</h1>
            <p className="text-gray-600 text-lg">Discover our curated collection of premium items</p>
            <div className="mt-6">
              <SearchBar 
                value={searchQuery} 
                onChange={setSearchQuery} 
                onSearch={handleSearch} 
                className="max-w-md" 
                realTime={true} 
                debounceMs={300} 
              />
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
              <div className="lg:sticky lg:top-8 space-y-5">
                {/* Clear Filters Button */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-50 to-rose-50 text-pink-600 rounded-2xl hover:from-pink-100 hover:to-rose-100 transition-all duration-200 font-semibold border border-pink-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear All Filters
                  </button>
                )}
                {/* Categories */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">Categories</h3>
                  </div>
                  <div className="p-4 space-y-2">
                    <button
                      key="all"
                      onClick={() => {
                        setSelectedCategory('All Products');
                        setSelectedCategoryId(null);
                      }}
                      className={`block w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${selectedCategory === 'All Products'
                        ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">All Products</span>
                        {selectedCategory === 'All Products' && (
                          <span className="text-white text-xs font-medium">Active</span>
                        )}
                      </div>
                    </button>
                    {categories.map((category: any) => (
                      <button
                        key={category._id}
                        onClick={() => {
                          setSelectedCategory(category.name);
                          setSelectedCategoryId(category._id);
                        }}
                        className={`block w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${selectedCategory === category.name
                          ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{category.name}</span>
                          {selectedCategory === category.name && (
                            <span className="text-white text-xs font-medium">Active</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Options */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">Sort By</h3>
                  </div>
                  <div className="p-4 space-y-2">
                    {[
                      { value: 'featured', label: 'Featured' },
                      { value: 'price-low', label: 'Price: Low to High' },
                      { value: 'price-high', label: 'Price: High to Low' },
                      { value: 'name-asc', label: 'Name: A to Z' },
                      { value: 'name-desc', label: 'Name: Z to A' },
                      { value: 'newest', label: 'Newest First' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSortBy(option.value)}
                        className={`block w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${sortBy === option.value
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{option.label}</span>
                          {sortBy === option.value && (
                            <span className="text-white text-xs font-medium">Active</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div className="bg-white text-black rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">Price Range</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-medium">₹</span>
                        <input
                          type="number"
                          placeholder="Min"
                          value={priceRange.min}
                          onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                      </div>
                      <span className="text-gray-400 font-medium">-</span>
                      <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-medium">₹</span>
                        <input
                          type="number"
                          placeholder="Max"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Brand Filter */}
                {brands.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900">Brand</h3>
                    </div>
                    <div className="p-4 space-y-3 max-h-48 overflow-y-auto">
                      {brands.map((brand) => (
                        <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(brand)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedBrands([...selectedBrands, brand]);
                              } else {
                                setSelectedBrands(selectedBrands.filter(b => b !== brand));
                              }
                            }}
                            className="w-5 h-5 text-pink-500 border-gray-300 rounded focus:ring-pink-500 focus:ring-offset-0"
                          />
                          <span className={`text-sm ${selectedBrands.includes(brand) ? 'text-gray-900 font-semibold' : 'text-gray-600 group-hover:text-gray-900'}`}>
                            {brand}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* In Stock Filter */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">Availability</h3>
                  </div>
                  <div className="p-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={(e) => setInStockOnly(e.target.checked)}
                        className="w-5 h-5 text-pink-500 border-gray-300 rounded focus:ring-pink-500 focus:ring-offset-0"
                      />
                      <span className={`text-sm ${inStockOnly ? 'text-gray-900 font-semibold' : 'text-gray-600 group-hover:text-gray-900'}`}>
                        In Stock Only
                      </span>
                    </label>
                  </div>
                </div>

                {/* Product Count */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-2">Products Found</p>
                    <p className="text-4xl font-bold text-gray-900">{pagination?.total || products.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {/* Loading Indicator - Only show during initial load, not during search */}
              {isLoading && !debouncedSearch && products.length > 0 && (
                <div className="flex items-center justify-center py-8 mb-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500 mr-3"></div>
                  <span className="text-gray-600 text-sm">Updating...</span>
                </div>
              )}

              {/* Search Loading Indicator - Subtle loading during search */}
              {debouncedSearch && isSearchLoading && (
                <div className="flex items-center justify-center py-4 mb-4">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500 mr-2"></div>
                  <span className="text-sm text-gray-500">Searching...</span>
                </div>
              )}

              {/* Results Header */}
              <div className="mb-6 p-5 bg-white rounded-2xl shadow-md border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      Showing <span className="font-bold text-gray-900">{products.length}</span> products
                      {hasActiveFilters && (
                        <span className="text-gray-400 ml-2">(filtered)</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {selectedCategory === 'All Products' ? 'All categories' : `Category: ${selectedCategory}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* View Mode Toggle */}
                    <div className="flex items-center bg-gray-100 rounded-xl p-1">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2.5 rounded-lg transition-colors duration-200 ${viewMode === 'grid' ? 'bg-white shadow-md text-pink-500' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2.5 rounded-lg transition-colors duration-200 ${viewMode === 'list' ? 'bg-white shadow-md text-pink-500' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                      </button>
                    </div>
                    {/* Items Per Page */}
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(parseInt(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="text-black px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
                    >
                      <option value={12}>12 per page</option>
                      <option value={24}>24 per page</option>
                      <option value={48}>48 per page</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Product Grid */}
              {paginatedProducts.length > 0 ? (
                <>
                  <ProductGrid
                    products={paginatedProducts}
                    onAddToCart={() => console.log('Add to cart clicked')}
                    onAddToWishlist={() => console.log('Add to wishlist clicked')}
                  />
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                      <div className="text-sm text-gray-600">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, pagination?.total || 0)} of {pagination?.total || 0} products
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    We couldn't find any products matching your current filters.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition-colors duration-200"
                  >
                    Clear All Filters
                  </button>
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