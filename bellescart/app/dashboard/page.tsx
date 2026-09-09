'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import LoadingOverlay from '@/components/LoadingOverlay/LoadingOverlay';
import WelcomeOverlay from '@/components/WelcomeOverlay/WelcomeOverlay';
import { useAuth } from '@/auth/user';
import { useFeaturedProducts, useProductsByCategory } from '@/hooks/user/useProductQueries';
import { usePublicCategories } from '@/hooks/user/usePublicProductQueries';
import { SearchBar } from '@/components';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, loaded, user } = useAuth();
  const [showLoading, setShowLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check localStorage states when component mounts
  useEffect(() => {
    if (!mounted) return;

    // Show loading overlay only if user just logged in
    const justLoggedIn = localStorage.getItem('justLoggedIn') === 'true';
    setShowLoading(justLoggedIn);

    // Show welcome overlay if not shown before
    const welcomeShown = localStorage.getItem('welcomeShown');
    if (welcomeShown === 'false') {
      setShowWelcome(true);
    }
  }, [mounted, isAuthenticated]);

  // React Query hooks for fetching data
  const { data: featuredData, isLoading: isLoadingFeatured } = useFeaturedProducts(8);
  const { data: categoriesData, isLoading: isLoadingCategories } = usePublicCategories();
  const { data: newArrivalsData, isLoading: isLoadingNewArrivals } = useFeaturedProducts(4);

  const featuredProducts = featuredData?.data?.products || [];
  const categories = categoriesData?.data?.categories || [];
  const newArrivals = newArrivalsData?.data?.products || [];
  const isLoading = isLoadingFeatured || isLoadingCategories || isLoadingNewArrivals;
  const isReady = mounted && loaded;

  // Redirect if not authenticated
  useEffect(() => {
    if (loaded && !isAuthenticated) {
      router.replace('/');
    }
  }, [loaded, isAuthenticated, router]);

  return (
    <>
      <LoadingOverlay isVisible={showLoading} onComplete={() => { setShowLoading(false); localStorage.removeItem('justLoggedIn'); }} />

      <WelcomeOverlay
        isVisible={showWelcome}
        onComplete={() => setShowWelcome(false)}
        userName={user?.name}
      />

      {!isReady ? (
        <Loader size="lg" text="Loading..." fullScreen />
      ) : (
        <div className={`min-h-screen flex flex-col transition-opacity duration-700 ${showLoading ? 'opacity-0' : 'opacity-100'}`}>
          <Navbar />

          <main className="flex-1 bg-white">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-pink-600 via-pink-700 to-purple-900 text-white py-16 px-4 overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-black bg-opacity-20" />
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent transform translate-x-1/2 skew-x-12" />
              </div>

              <div className="relative max-w-7xl mx-auto">
                <div className="text-center space-y-8">
                  {/* Welcome Message */}
                  <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                      {user?.name ? `Welcome back, ${user.name}!` : 'Welcome to BellesCart'}
                    </h1>
                    <p className="text-lg text-gray-100 max-w-2xl mx-auto leading-relaxed">
                      Discover our exclusive jewelry collection and find the perfect piece that speaks to you
                    </p>
                  </div>

                  {/* Search Bar */}
                  <div className="max-w-xl mx-auto">
                    <SearchBar placeholder="Search for jewelry, rings, necklaces..." />
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link href="/products">
                      <Button size="lg" variant="primary" className="bg-white text-pink-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                        Shop Collection
                      </Button>
                    </Link>
                    <Link href="/wishlist">
                      <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-pink-600 px-8 py-4 text-lg font-semibold transition-all duration-300">
                        View Wishlist
                      </Button>
                    </Link>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto pt-8">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">500+</div>
                      <div className="text-xs text-gray-300">Products</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">50+</div>
                      <div className="text-xs text-gray-300">Categories</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">4.9★</div>
                      <div className="text-xs text-gray-300">Rating</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Actions */}
            <section className="container mx-auto px-4 py-8 -mt-8 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/products">
                  <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer border border-gray-100 hover:border-pink-400 transform hover:-translate-y-1">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">Shop Now</h3>
                        <p className="text-sm text-gray-600">Browse all products</p>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/cart">
                  <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer border border-gray-100 hover:border-pink-400 transform hover:-translate-y-1">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">Your Cart</h3>
                        <p className="text-sm text-gray-600">View your items</p>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/orders">
                  <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer border border-gray-100 hover:border-pink-400 transform hover:-translate-y-1">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m-8-4V7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">Orders</h3>
                        <p className="text-sm text-gray-600">Track purchases</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </section>

            {/* Categories Section */}
            <section className="bg-gradient-to-b from-gray-50 to-white py-16 px-4">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Shop by Category</h2>
                  <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                    Explore our curated collections across different categories
                  </p>
                </div>
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader size="lg" text="Loading categories..." />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {categories.slice(0, 6).map((category) => {
                      const colorMap: { [key: string]: string } = {
                        'Rings': 'from-pink-400 to-pink-600',
                        'Necklaces': 'from-purple-400 to-purple-600',
                        'Earrings': 'from-blue-400 to-blue-600',
                        'Bracelets': 'from-green-400 to-green-600',
                        'Anklets': 'from-yellow-400 to-yellow-600',
                        'Pendants': 'from-red-400 to-red-600',
                        'Jewelry': 'from-indigo-400 to-indigo-600'
                      };

                      const iconMap: { [key: string]: string } = {
                        'Rings': '💍',
                        'Necklaces': '📿',
                        'Earrings': '✨',
                        'Bracelets': '⌚',
                        'Anklets': '🦶',
                        'Pendants': '🎀',
                        'Jewelry': '💎'
                      };

                      const color = colorMap[category.name] || 'from-gray-400 to-gray-600';
                      const icon = iconMap[category.name] || '📦';

                      return (
                        <Link key={category._id} href={`/products?category=${category.name}`}>
                          <div className="group bg-white rounded-2xl p-6 text-center hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer border border-gray-100">
                            <div className={`w-16 h-16 mx-auto mb-3 bg-gradient-to-br ${color} rounded-full flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                              {icon}
                            </div>
                            <h3 className="font-semibold text-gray-800 group-hover:text-pink-600 transition-colors">
                              {category.name}
                            </h3>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* Featured Products */}
            <section className="bg-white py-16 px-4">
              <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Featured Products</h2>
                    <p className="text-gray-600">Handpicked items from our collection</p>
                  </div>
                  <Link href="/products">
                    <Button size="md" className="border-2 border-pink-500 text-pink-600 hover:bg-pink-500 hover:text-white px-6 py-2 font-semibold transition-all duration-300">
                      View All
                    </Button>
                  </Link>
                </div>

                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader size="lg" text="Loading featured products..." />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {featuredProducts.map((product: any, index: number) => {
                      const mainImage = product.images?.find((img: any) => img.isMain)?.url || product.images?.[0]?.url || product.image || '';
                      const isAboveFold = index < 4; // First 4 products are likely above the fold
                      return (
                        <Link key={product._id || `product-${index}`} href={`/product/${product._id}`}>
                          <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100 hover:border-pink-400 transform hover:-translate-y-2">
                            <div className="h-56 bg-gray-100 relative">
                              {mainImage ? (
                                <Image
                                  src={mainImage}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                  loading={isAboveFold ? "eager" : "lazy"}
                                  priority={isAboveFold}
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                  <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                              {product.originalPrice && product.originalPrice > product.price && (
                                <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                                </div>
                              )}
                            </div>
                            <div className="p-5">
                              <h3 className="font-semibold text-gray-900 text-base truncate mb-2">{product.name}</h3>
                              <div className="flex items-center gap-2">
                                <p className="text-pink-600 font-bold text-lg">₹{product.price}</p>
                                {product.originalPrice && product.originalPrice > product.price && (
                                  <p className="text-gray-400 line-through text-sm">₹{product.originalPrice}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* New Arrivals */}
            <section className="bg-gradient-to-br from-purple-50 to-pink-50 py-16 px-4">
              <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">New Arrivals</h2>
                    <p className="text-gray-600">Fresh additions to our collection</p>
                  </div>
                  <Link href="/products?sort=newest">
                    <Button size="md" className="border-2 border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white px-6 py-2 font-semibold transition-all duration-300">
                      See All
                    </Button>
                  </Link>
                </div>

                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader size="lg" text="Loading new arrivals..." />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {newArrivals.map((product: any, index: number) => {
                      const mainImage = product.images?.find((img: any) => img.isMain)?.url || product.images?.[0]?.url || product.image || '';
                      const isAboveFold = index < 4; // First 4 products are likely above the fold
                      return (
                        <Link key={product._id || `new-${index}`} href={`/product/${product._id}`}>
                          <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100 hover:border-purple-400 transform hover:-translate-y-2">
                            <div className="h-56 bg-gray-100 relative">
                              {mainImage ? (
                                <Image
                                  src={mainImage}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                  loading={isAboveFold ? "eager" : "lazy"}
                                  priority={isAboveFold}
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                  <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                              <div className="absolute top-3 left-3 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                                NEW
                              </div>
                            </div>
                            <div className="p-5">
                              <h3 className="font-semibold text-gray-900 text-base truncate mb-2">{product.name}</h3>
                              <p className="text-purple-600 font-bold text-lg">₹{product.price}</p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* Special Offers Banner */}
            <section className="bg-gradient-to-r from-pink-600 to-purple-600 py-12 px-4">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center md:text-left">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Special Offer!</h2>
                    <p className="text-pink-100 text-lg">Get 20% off on your first order</p>
                  </div>
                  <Link href="/products">
                    <Button size="lg" variant="primary" className="bg-white text-pink-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                      Shop Now
                    </Button>
                  </Link>
                </div>
              </div>
            </section>

            {/* Trust Section */}
            <section className="bg-white py-16 px-4 border-y border-gray-100">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose BellesCart?</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <span className="text-white text-2xl">✓</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Guaranteed</h3>
                    <p className="text-gray-600 text-sm">Premium products from trusted brands</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <span className="text-white text-2xl">🚚</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast Delivery</h3>
                    <p className="text-gray-600 text-sm">Quick and reliable shipping worldwide</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <span className="text-white text-2xl">💳</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Payment</h3>
                    <p className="text-gray-600 text-sm">Safe and secure payment methods</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <span className="text-white text-2xl">🔄</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Returns</h3>
                    <p className="text-gray-600 text-sm">Hassle-free return policy</p>
                  </div>
                </div>
              </div>
            </section>
          </main>

          <Footer />
        </div>
      )}
    </>
  );
}
