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
import { useFeaturedProducts } from '@/hooks/user/useProductQueries';

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

  const { data: featuredData } = useFeaturedProducts(4);
  const recentProducts = featuredData?.data?.products || [];
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
        <div className={`min-h-screen flex flex-col transition-opacity duration-700 ${showLoading ? 'opacity-0' : 'opacity-100'
          }`}>
          <Navbar />

          <main className="flex-1 bg-white">
            {/* Welcome Section */}
            <section className="bg-white border-b border-gray-200 py-8">
              <div className="container mx-auto px-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  {user?.name ? `Hello, ${user.name}` : 'Hello'}
                </h1>
                <p className="text-gray-600">Discover our latest jewelry collection</p>
              </div>
            </section>

            {/* Quick Actions */}
            <section className="container mx-auto px-4 py-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/products">
                  <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-200 hover:border-orange-400">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Shop Now</h3>
                        <p className="text-sm text-gray-600">Browse products</p>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/cart">
                  <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-200 hover:border-orange-400">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Your Cart</h3>
                        <p className="text-sm text-gray-600">View items</p>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/orders">
                  <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-200 hover:border-orange-400">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m-8-4V7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Orders</h3>
                        <p className="text-sm text-gray-600">Track purchases</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </section>

            {/* Popular Categories */}
            <section className="container mx-auto px-4 py-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Shop by Category</h2>
              <div className="flex flex-wrap gap-2">
                {['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Anklets', 'Pendants'].map(category => (
                  <Link key={category} href={`/products?category=${category.toLowerCase()}`}>
                    <span className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300 cursor-pointer transition-colors font-medium">
                      {category}
                    </span>
                  </Link>
                ))}
              </div>
            </section>

            {/* Featured Products */}
            <section className="container mx-auto px-4 py-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Featured Products</h2>
                <Link href="/products">
                  <Button size="sm" className="text-orange-600 border-orange-600 hover:bg-orange-50">See more</Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentProducts.map((product: any, index: number) => {
                  const mainImage = product.images?.find((img: any) => img.isMain)?.url || product.images?.[0]?.url || product.image || '';
                  return (
                    <Link key={product._id || `product-${index}`} href={`/product/${product._id}`}>
                      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer border border-gray-200 hover:border-orange-400">
                        <div className="h-48 bg-gray-100 relative">
                          {mainImage ? (
                            <Image
                              src={mainImage}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                              <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium text-gray-900 text-sm truncate">{product.name}</h3>
                          <p className="text-orange-600 font-semibold mt-1">₹{product.price}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          </main>

          <Footer />
        </div>
      )}
    </>
  );
}
