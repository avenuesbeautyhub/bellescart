'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import LoadingOverlay from '@/components/LoadingOverlay/LoadingOverlay';
import WelcomeOverlay from '@/components/WelcomeOverlay/WelcomeOverlay';
import { useRequireUserAuth } from '@/auth/user';
import { mockProducts } from '@/utils/mockData';

export default function DashboardPage() {
  const { isAuthenticated, loaded } = useRequireUserAuth();
  const [showLoading, setShowLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showWelcome, setShowWelcome] = useState(false);

  // Load current user data
  useEffect(() => {
    const loadCurrentUser = async () => {
      if (isAuthenticated) {
        try {
          const { authService } = await import('@/services/authService');
          const response = await authService.getCurrentUser();
          if (response.success && response.data) {
            setCurrentUser(response.data);
          }
        } catch (error) {
          console.error('Failed to load current user:', error);
        }
      }
    };

    loadCurrentUser();
  }, [isAuthenticated]);

  useEffect(() => {
    if (loaded && isAuthenticated) {
      // Show loading overlay only if user just logged in
      const justLoggedIn = localStorage.getItem('justLoggedIn') === 'true';
      setShowLoading(justLoggedIn);

      // Show welcome overlay if not shown before
      const welcomeShown = localStorage.getItem('welcomeShown');
      if (welcomeShown === 'false') {
        setShowWelcome(true);
      }
    }
  }, [loaded, isAuthenticated]);

  // Show loader only if not loaded AND not already authenticated
  if (!loaded && !isAuthenticated) {
    return <Loader size="lg" text="Loading..." fullScreen />;
  }

  // Don't render dashboard if not authenticated (useRequireAuth will handle redirect)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Redirecting...</p>
      </div>
    );
  }

  const recentProducts = mockProducts.slice(0, 4);

  return (
    <>
      <LoadingOverlay isVisible={showLoading} onComplete={() => { setShowLoading(false); localStorage.removeItem('justLoggedIn'); }} />

      <WelcomeOverlay
        isVisible={showWelcome}
        onComplete={() => setShowWelcome(false)}
        userName={currentUser?.name}
      />

      <div className={`min-h-screen flex flex-col transition-opacity duration-700 ${showLoading ? 'opacity-0' : 'opacity-100'
        }`}>
        <Navbar />

        <main className="flex-1 bg-gray-50">
          {/* Welcome Section */}
          <section className="bg-gradient-to-r from-pink-500 to-pink-600 text-white py-12">
            <div className="container mx-auto px-4">
              <h1 className="text-4xl font-bold mb-4">Welcome back, {currentUser?.name || 'Valued Customer'}!</h1>
              <p className="text-lg text-pink-100">Ready to discover your next favorite piece of jewelry?</p>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Link href="/products">
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer text-center border-2 border-pink-100 hover:border-pink-300">
                  <div className="text-5xl mb-3">🛍️</div>
                  <h3 className="font-semibold text-gray-800 mb-2">Continue Shopping</h3>
                  <p className="text-gray-600 text-sm">Explore our jewelry collection</p>
                </div>
              </Link>

              <Link href="/cart">
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer text-center border-2 border-pink-100 hover:border-pink-300">
                  <div className="text-5xl mb-3">🛒</div>
                  <h3 className="font-semibold text-gray-800 mb-2">View Cart</h3>
                  <p className="text-gray-600 text-sm">Check items in your cart</p>
                </div>
              </Link>

              <Link href="/orders">
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer text-center border-2 border-pink-100 hover:border-pink-300">
                  <div className="text-5xl mb-3">📦</div>
                  <h3 className="font-semibold text-gray-800 mb-2">Order History</h3>
                  <p className="text-gray-600 text-sm">Track your purchases</p>
                </div>
              </Link>
            </div>
          </section>

          {/* Notifications & Search */}
          <section className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Notifications */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Notifications</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-green-50 border-l-4 border-green-400 rounded">
                    <div className="text-green-600 mt-1">✓</div>
                    <div>
                      <p className="font-medium text-gray-800">Welcome to BellesCart!</p>
                      <p className="text-sm text-gray-600">Your account has been successfully created.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                    <div className="text-blue-600 mt-1">🎁</div>
                    <div>
                      <p className="font-medium text-gray-800">Free Shipping</p>
                      <p className="text-sm text-gray-600">Get free shipping on orders over ₹5000</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Search */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Search</h2>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input
                      type="text"
                      placeholder="Search for jewelry, necklaces, rings..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 min-w-0 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <Link href={`/products${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`}>
                      <Button className="w-full sm:w-auto">Search</Button>
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-gray-600">Popular:</span>
                    {['Rings', 'Necklaces', 'Earrings', 'Bracelets'].map(category => (
                      <Link key={category} href={`/products?category=${category.toLowerCase()}`}>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-pink-100 hover:text-pink-700 cursor-pointer">
                          {category}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Recently Viewed & Recommendations */}
          <section className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recently Viewed */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Recently Viewed</h2>
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">👁️</div>
                  <p className="text-gray-500">No recently viewed items</p>
                  <p className="text-sm text-gray-400 mt-2">Items you view will appear here</p>
                </div>
              </div>

              {/* Personalized Recommendations */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Recommended for You</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl">💍</div>
                    <div>
                      <p className="font-medium text-gray-800">Diamond Rings</p>
                      <p className="text-sm text-gray-600">Based on your browsing history</p>
                    </div>
                    <Link href="/products?category=rings">
                      <Button size="sm" variant="outline">View</Button>
                    </Link>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl">📿</div>
                    <div>
                      <p className="font-medium text-gray-800">Necklaces</p>
                      <p className="text-sm text-gray-600">Popular in your region</p>
                    </div>
                    <Link href="/products?category=necklaces">
                      <Button size="sm" variant="outline">View</Button>
                    </Link>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl">✨</div>
                    <div>
                      <p className="font-medium text-gray-800">New Arrivals</p>
                      <p className="text-sm text-gray-600">Fresh jewelry collection</p>
                    </div>
                    <Link href="/products">
                      <Button size="sm" variant="outline">Explore</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Featured Products */}
          <section className="container mx-auto px-4 py-12">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Featured Jewelry</h2>
                <p className="text-gray-600 mt-2">Check out our latest collections</p>
              </div>
              <Link href="/products">
                <Button size="sm">View All</Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentProducts.map(product => (
                <Link key={product.id} href={`/product?id=${product.id}`}>
                  <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden cursor-pointer">
                    <div className="h-48 bg-gray-200 relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 truncate">{product.name}</h3>
                      <p className="text-pink-500 font-bold mt-2">₹{product.price}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
