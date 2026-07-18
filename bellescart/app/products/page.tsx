'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import ProductGrid from '@/components/ProductGrid/ProductGrid';
import Loader from '@/components/ui/Loader';
import { useAuth } from '@/auth/user';
import { productService } from '@/services/productService';
import { useCart } from '@/contexts/CartContext';

export default function ProductsPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('featured');
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, loaded } = useAuth();
  const { refreshCartCount } = useCart();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  
  // Advanced filters
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  
  // UI state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Redirect guests to guest products page
  useEffect(() => {
    if (loaded && !user) {
      router.replace('/products/guest');
    }
  }, [loaded, user, router]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load categories and products from API
  useEffect(() => {
    if (user) {
      loadCategories();
      loadProducts();
    }
  }, [selectedCategory, sortBy, user]);

  const loadCategories = async () => {
    try {
      const response = await productService.getCategories();
      if (response.success && response.data?.categories) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const response = await productService.getProducts({
        category: selectedCategoryId || undefined
      });

      if (response.success && response.data?.products) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Extract unique brands from products
  const brands = React.useMemo(() => {
    const brandSet = new Set<string>();
    products.forEach(product => {
      if (product.brand) brandSet.add(product.brand);
    });
    return Array.from(brandSet).sort();
  }, [products]);

  const filteredProducts = products.filter(product => {
    // Category filter
    if (selectedCategory !== 'All Products' && product.category?._id !== selectedCategoryId) {
      return false;
    }
    
    // Search filter
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      const matchesName = product.name?.toLowerCase().includes(searchLower);
      const matchesDesc = product.description?.toLowerCase().includes(searchLower);
      const matchesBrand = product.brand?.toLowerCase().includes(searchLower);
      if (!matchesName && !matchesDesc && !matchesBrand) {
        return false;
      }
    }
    
    // Price range filter
    if (priceRange.min && product.price < parseFloat(priceRange.min)) {
      return false;
    }
    if (priceRange.max && product.price > parseFloat(priceRange.max)) {
      return false;
    }
    
    // Brand filter
    if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) {
      return false;
    }
    
    // In-stock filter
    if (inStockOnly && (!product.quantity || product.quantity <= 0)) {
      return false;
    }
    
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name-asc':
        return a.name?.localeCompare(b.name) || 0;
      case 'name-desc':
        return b.name?.localeCompare(a.name) || 0;
      case 'newest':
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const clearFilters = () => {
    setSelectedCategory('All Products');
    setSelectedCategoryId(null);
    setSortBy('featured');
    setSearchQuery('');
    setPriceRange({ min: '', max: '' });
    setSelectedBrands([]);
    setInStockOnly(false);
    setCurrentPage(1);
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
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1">
        {/* Loading State - Only show loader overlay when no products exist */}
        {isLoading && products.length === 0 && (
          <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
            <Loader size="lg" text="Loading products..." />
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Products</h1>
            <p className="text-gray-600">Discover our curated collection of premium items</p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products by name, brand, or description..."
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
                {/* Categories */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
                  </div>
                  <div className="p-4 space-y-1">
                    <button
                      key="all"
                      onClick={() => {
                        setSelectedCategory('All Products');
                        setSelectedCategoryId(null);
                      }}
                      className={`block w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${selectedCategory === 'All Products'
                        ? 'bg-pink-500 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">All Products</span>
                        {selectedCategory === 'All Products' && (
                          <span className="text-white text-xs">Active</span>
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
                        className={`block w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${selectedCategory === category.name
                          ? 'bg-pink-500 text-white shadow-sm'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{category.name}</span>
                          {selectedCategory === category.name && (
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

                {/* Price Range Filter */}
                <div className="bg-white text-black rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Price Range</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">₹</span>
                        <input
                          type="number"
                          placeholder="Min"
                          value={priceRange.min}
                          onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                          className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                      </div>
                      <span className="text-gray-400">-</span>
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">₹</span>
                        <input
                          type="number"
                          placeholder="Max"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                          className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Brand Filter */}
                {brands.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Brand</h3>
                    </div>
                    <div className="p-4 space-y-2 max-h-48 overflow-y-auto">
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
                            className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500 focus:ring-offset-0"
                          />
                          <span className={`text-sm ${selectedBrands.includes(brand) ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
                            {brand}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* In Stock Filter */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Availability</h3>
                  </div>
                  <div className="p-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={(e) => setInStockOnly(e.target.checked)}
                        className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500 focus:ring-offset-0"
                      />
                      <span className={`text-sm ${inStockOnly ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
                        In Stock Only
                      </span>
                    </label>
                  </div>
                </div>

                {/* Product Count */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">Products Found</p>
                    <p className="text-3xl font-bold text-gray-900">{sortedProducts.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {/* Loading Indicator */}
              {isLoading && products.length > 0 && (
                <div className="flex items-center justify-center py-8 mb-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500 mr-3"></div>
                  <span className="text-gray-600 text-sm">Updating...</span>
                </div>
              )}

              {/* Results Header */}
              <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      Showing <span className="font-semibold text-gray-900">{sortedProducts.length}</span> products
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
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition-colors duration-200 ${viewMode === 'grid' ? 'bg-white shadow-sm text-pink-500' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md transition-colors duration-200 ${viewMode === 'list' ? 'bg-white shadow-sm text-pink-500' : 'text-gray-500 hover:text-gray-700'}`}
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
                      className="text-black px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
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
                    onAddToCart={() => refreshCartCount()}
                    onAddToWishlist={() => console.log('Add to wishlist clicked')}
                  />
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                      <div className="text-sm text-gray-600">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedProducts.length)} of {sortedProducts.length} products
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