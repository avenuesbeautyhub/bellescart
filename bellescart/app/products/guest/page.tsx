'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import GuestProductGrid from '@/components/ProductGrid/GuestProductGrid';
import Loader from '@/components/ui/Loader';
import { SearchBar } from '@/components';
import { usePublicProducts, usePublicCategories } from '@/hooks/user/usePublicProductQueries';
import { useDebounce } from '@/hooks/useDebounce';

export default function GuestProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);

  // React Query hooks
  const { data: productsData, isLoading: isLoadingProducts } = usePublicProducts({
    category: selectedCategoryId || undefined,
    search: debouncedSearch || undefined
  });
  const { data: categoriesData, isLoading: isLoadingCategories } = usePublicCategories();

  const products = productsData?.data?.products || [];
  const categories = categoriesData?.data?.categories || [];
  const isLoading = isLoadingProducts || isLoadingCategories;

  // Initialize search and category from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    const categoryParam = urlParams.get('category');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
    if (categoryParam && categories.length > 0) {
      const category = categories.find((cat: any) => cat.name.toLowerCase() === categoryParam.toLowerCase());
      if (category) {
        setSelectedCategory(category.name);
        setSelectedCategoryId(category._id);
      }
    }
  }, [categories]);

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

  const filteredProducts = products.filter(product => {
    if (selectedCategory === 'All Products') {
      return true;
    }
    return product.category?.name === selectedCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      default:
        return 0;
    }
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      <main className="flex-1">
        {/* Loading State - Only show loader overlay when no products exist */}
        {isLoading && products.length === 0 && (
          <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading amazing products...</p>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <h1 className="text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Discover Our Products
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Browse our curated collection of premium products
              </p>
              <div className="mt-8 max-w-md mx-auto">
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

        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Enhanced Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden sticky top-8">
                {/* Categories Section */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center mb-6">
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white text-sm font-bold">C</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Categories</h3>
                  </div>
                  <div className="space-y-1">
                    <button
                      key="all"
                      onClick={() => {
                        setSelectedCategory('All Products');
                        setSelectedCategoryId(null);
                      }}
                      className={`group w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center justify-between ${selectedCategory === 'All Products'
                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-50 hover:shadow-md'
                        }`}
                    >
                      <span className="font-medium">All Products</span>
                      {selectedCategory === 'All Products' && (
                        <span className="text-white text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">Active</span>
                      )}
                    </button>
                    {categories.map((category: any) => (
                      <button
                        key={category._id}
                        onClick={() => {
                          setSelectedCategory(category.name);
                          setSelectedCategoryId(category._id);
                        }}
                        className={`group w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center justify-between ${selectedCategory === category.name
                          ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                          : 'text-gray-700 hover:bg-gray-50 hover:shadow-md'
                          }`}
                      >
                        <span className="font-medium">{category.name}</span>
                        {selectedCategory === category.name && (
                          <span className="text-white text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">Active</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Section */}
                <div className="p-6">
                  <div className="flex items-center mb-6">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white text-sm font-bold">S</span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900">Sort By</h4>
                  </div>
                  <div className="space-y-1">
                    {[
                      { value: 'featured', label: 'Featured', icon: 'star' },
                      { value: 'price-low', label: 'Price: Low to High', icon: 'arrow-up' },
                      { value: 'price-high', label: 'Price: High to Low', icon: 'arrow-down' }
                    ].map((option: any) => (
                      <button
                        key={option.value}
                        onClick={() => setSortBy(option.value)}
                        className={`group w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center ${sortBy === option.value
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                            : 'text-gray-700 hover:bg-gray-50 hover:shadow-md'
                          }`}
                      >
                        <span className="font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Products Grid */}
            <div className="lg:col-span-3">
              {/* Loading Indicator */}
              {isLoading && products.length > 0 && (
                <div className="flex items-center justify-center py-12 mb-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500 mx-auto mb-3"></div>
                    <span className="text-gray-600 font-medium">Updating products...</span>
                  </div>
                </div>
              )}

              {/* Products Count */}
              <div className="mb-6 flex items-center justify-between">
                <p className="text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{sortedProducts.length}</span> products
                  {selectedCategory !== 'All Products' && (
                    <span className="text-pink-600 font-medium"> in {selectedCategory}</span>
                  )}
                </p>
                {selectedCategory !== 'All Products' && (
                  <button
                    onClick={() => {
                      setSelectedCategory('All Products');
                      setSelectedCategoryId(null);
                    }}
                    className="text-sm text-pink-600 hover:text-pink-700 font-medium transition-colors"
                  >
                    Clear filter
                  </button>
                )}
              </div>

              {/* Products Grid */}
              <GuestProductGrid
                products={sortedProducts}
                onAddToCart={() => console.log('Add to cart clicked')}
                onAddToWishlist={() => console.log('Add to wishlist clicked')}
              />

              {/* Empty State */}
              {sortedProducts.length === 0 && !isLoading && (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">search</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-600 mb-6">
                    {selectedCategory !== 'All Products'
                      ? `No products available in ${selectedCategory} category.`
                      : 'No products available at the moment.'
                    }
                  </p>
                  {selectedCategory !== 'All Products' && (
                    <button
                      onClick={() => {
                        setSelectedCategory('All Products');
                        setSelectedCategoryId(null);
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                      View All Products
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
