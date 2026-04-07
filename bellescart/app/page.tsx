'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import ProductGrid from '@/components/ProductGrid/ProductGrid';
import Button from '@/components/ui/Button';
import { mockProducts } from '@/utils/mockData';
import { useAuth } from '@/utils/auth';

export default function Home() {
  const router = useRouter();
  const featuredProducts = mockProducts.slice(0, 8);
  const { isAuthenticated, loaded } = useAuth();

  useEffect(() => {
    if (loaded && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [loaded, isAuthenticated, router]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-pink-500 via-pink-600 to-black text-white py-20 px-4" style={{ backgroundImage: 'radial-gradient(circle at top, rgba(255,77,166,0.75), rgba(190,24,93,0.35), rgba(11,11,13,1))' }}>
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-4">Welcome to BellesCart</h1>
            <p className="text-xl mb-8">
              Discover thousands of quality products from Belles Avenue
            </p>
            <Link href="/products">
              <Button size="lg" variant="primary">
                Shop Now
              </Button>
            </Link>
          </div>
        </section>

        {/* Featured Products */}
        <section className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Featured Products</h2>
          <ProductGrid products={featuredProducts} isLoggedIn={isAuthenticated} />
        </section>

        {/* Categories Preview */}
        <section className="bg-gray-100 py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Shop by Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {['Clothing', 'Accessories', 'Jewelry', 'Footwear'].map(category => (
                <Link key={category} href={`/products?category=${category}`}>
                  <div className="bg-white p-8 rounded-lg text-center hover:shadow-lg transition cursor-pointer">
                    <h3 className="text-xl font-semibold text-gray-800">{category}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="bg-black text-white py-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
            <p className="mb-8">Get exclusive offers and updates delivered to your inbox</p>
            <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none"
              />
              <Button variant="primary" className="w-full sm:w-auto">Subscribe</Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
