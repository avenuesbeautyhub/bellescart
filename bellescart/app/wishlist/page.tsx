'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRequireUserAuth } from '@/auth/user';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import ProductGrid from '@/components/ProductGrid/ProductGrid';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import { wishlistService } from '@/services/wishlistService';
import { globalToast } from '@/utils/globalToast';

export default function WishlistPage() {
  const { loaded, isAuthenticated } = useRequireUserAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);

  // Load wishlist when authenticated
  useEffect(() => {
    if (loaded && isAuthenticated) {
      loadWishlist();
    }
  }, [loaded, isAuthenticated]);

  const loadWishlist = async () => {
    try {
      setIsLoading(true);
      const response = await wishlistService.getWishlist();
      if (response.success && response.data?.wishlist) {
        setWishlistItems(response.data.wishlist);
      }
    } catch (error) {
      console.error('Failed to load wishlist:', error);
      globalToast.general.error('Error', 'Failed to load wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loader while checking authentication
  if (!loaded) {
    return <Loader size="lg" text="Loading..." fullScreen />;
  }

  if (!isAuthenticated) return null;

  if (isLoading) {
    return <Loader size="lg" text="Loading wishlist..." fullScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">My Wishlist</h1>

          {wishlistItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-6">Your wishlist is empty</p>
              <Link href="/products">
                <Button>Start Shopping</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-800">
                  You have {wishlistItems.length} item(s) in your wishlist
                </p>
              </div>
              <ProductGrid products={wishlistItems} />
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
