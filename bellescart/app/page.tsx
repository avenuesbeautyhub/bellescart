'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import GuestProductGrid from '@/components/ProductGrid/GuestProductGrid';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import { SearchBar } from '@/components';
import { usePublicFeaturedProducts, usePublicCategories } from '@/hooks/user/usePublicProductQueries';
import { useAuth } from '@/auth/user';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, loaded } = useAuth();
  
  // React Query hooks for public data
  const { data: featuredProductsData, isLoading: isLoadingProducts } = usePublicFeaturedProducts(8);
  const { data: categoriesData, isLoading: isLoadingCategories } = usePublicCategories();
  
  const featuredProducts = featuredProductsData?.data?.products || [];
  const categories = categoriesData?.data?.categories || [];
  
  const loading = isLoadingProducts || isLoadingCategories;

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (loaded && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [loaded, isAuthenticated, router]);

  // Show loader while checking auth or loading content
  if (!loaded || loading) {
    return <Loader size="lg" text="Loading..." fullScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-pink-600 via-pink-700 to-gray-900 text-white py-16 px-4 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-black bg-opacity-20" />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent transform translate-x-1/2 skew-x-12" />
          </div>

          <div className="relative max-w-7xl mx-auto">
            <div className="text-center space-y-8">
              {/* Logo */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl">
                    <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-pink-700 rounded-full flex items-center justify-center">
                      <span className="text-white text-3xl font-bold">BA</span>
                    </div>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-lg">
                    <span className="text-pink-600 text-xs font-bold">Belles Avenue</span>
                  </div>
                </div>
              </div>

              {/* Hero Content */}
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                  Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-200 to-white">BellesCart</span>
                </h1>
                <p className="text-lg text-gray-100 max-w-xl mx-auto leading-relaxed">
                  Discover thousands of quality products from Belles Avenue! Your premium shopping experience starts here.
                </p>
                <div className="max-w-md mx-auto">
                  <SearchBar placeholder="Search for products..." onSearch={(query) => router.push(`/products/guest?search=${encodeURIComponent(query)}`)} />
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link href="/products/guest">
                    <Button size="lg" variant="primary" className="bg-pink-900 text-pink-600 hover:bg-gray-100 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                      Shop Now
                    </Button>
                  </Link>
                  <Link href="">
                    <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-pink-600 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold transition-all duration-300">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">10K+</div>
                  <div className="text-xs text-gray-300">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">5K+</div>
                  <div className="text-xs text-gray-300">Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">4.8★</div>
                  <div className="text-xs text-gray-300">Rating</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="bg-gradient-to-b from-gray-50 to-white py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Handpicked items from our collection just for you
              </p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-100 to-purple-100 rounded-3xl opacity-30 blur-3xl" />
              <div className="relative">
                <GuestProductGrid
                  products={featuredProducts}
                  onAddToCart={() => console.log('Add to cart clicked')}
                  onAddToWishlist={() => console.log('Add to wishlist clicked')}
                />
              </div>
            </div>
            <div className="text-center mt-12">
              <Link href="/products/guest">
                <Button variant="outline" className="border-2 border-pink-500 text-pink-600 hover:bg-pink-500 hover:text-white px-8 py-3 font-semibold transition-all duration-300">
                  View All Products
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Categories Preview */}
        <section className="bg-gradient-to-br from-purple-50 to-pink-50 py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Shop by Category</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Explore our curated collections across different categories
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category) => {
                // Define color mapping for different categories
                const colorMap: { [key: string]: string } = {
                  'Clothing': 'from-blue-400 to-blue-600',
                  'Accessories': 'from-pink-400 to-pink-600',
                  'Jewelry': 'from-purple-400 to-purple-600',
                  'Footwear': 'from-green-400 to-green-600',
                  'Electronics': 'from-red-400 to-red-600',
                  'Home': 'from-yellow-400 to-yellow-600',
                  'Beauty': 'from-indigo-400 to-indigo-600',
                  'Sports': 'from-orange-400 to-orange-600'
                };

                // Define icon mapping for different categories
                const iconMap: { [key: string]: string } = {
                  'Clothing': '👗',
                  'Accessories': '👜',
                  'Jewelry': '💎',
                  'Footwear': '👠',
                  'Electronics': '📱',
                  'Home': '🏠',
                  'Beauty': '💄',
                  'Sports': '⚽'
                };

                const color = colorMap[category.name] || 'from-gray-400 to-gray-600';
                const icon = iconMap[category.name] || '📦';

                return (
                  <React.Fragment key={category._id}>
                    <Link href={`/products/guest?category=${category.name}`}>
                      <div className="group relative bg-white rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer overflow-hidden">
                        {/* Background Gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                        {/* Icon */}
                        <div className={`relative w-20 h-20 mx-auto mb-4 bg-gradient-to-br ${color} rounded-full flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          {icon}
                        </div>

                        {/* Category Name */}
                        <h3 className="relative text-xl font-bold text-gray-800 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-pink-600 group-hover:to-purple-600 transition-all duration-300">
                          {category.name}
                        </h3>

                        {/* Shop Now Button */}
                        <div className="relative mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="text-sm font-semibold text-pink-600">Shop Now →</span>
                        </div>
                      </div>
                    </Link>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="bg-white py-16 px-4 border-y border-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose BellesCart?</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">✓</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Guaranteed</h3>
                <p className="text-gray-600">Premium products from trusted brands</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">🚚</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast Delivery</h3>
                <p className="text-gray-600">Quick and reliable shipping worldwide</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">💳</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Payment</h3>
                <p className="text-gray-600">Safe and secure payment methods</p>
              </div>
            </div>
          </div>
        </section>


      </main>

      <Footer />
    </div>
  );
}
