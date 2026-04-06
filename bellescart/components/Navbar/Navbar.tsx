'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { clearAuthSession, getAuthUser } from '@/utils/auth';

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in on component mount
    const storedUser = getAuthUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    setUser(null);
    router.push('/');
  };

  const isLoggedIn = !!user;

  return (
    <nav className="bg-black text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-pink-500">
              BellesCart
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/products" className="text-gray-200 hover:text-pink-400 transition">
              Products
            </Link>
            {isLoggedIn && (
              <>
                <Link href="/wishlist" className="text-gray-200 hover:text-pink-400 transition">
                  Wishlist
                </Link>
                <Link href="/orders" className="text-gray-200 hover:text-pink-400 transition">
                  Orders
                </Link>
                <Link href="/profile" className="text-gray-200 hover:text-pink-400 transition">
                  Profile
                </Link>
              </>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {isLoggedIn && (
              <Link href="/cart" className="relative">
                <svg
                  className="w-6 h-6 text-gray-200 hover:text-pink-400 transition cursor-pointer"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  0
                </span>
              </Link>
            )}

            <div className="hidden md:flex gap-2">
              {isLoggedIn ? (
                <div className="flex items-center gap-2">
                  <span className="text-gray-200 text-sm">Welcome, {user?.name}</span>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:text-pink-400"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4">
            <Link href="/products" className="block py-2 text-gray-200 hover:text-pink-400">
              Products
            </Link>
            {isLoggedIn && (
              <>
                <Link href="/wishlist" className="block py-2 text-gray-200 hover:text-pink-400">
                  Wishlist
                </Link>
                <Link href="/orders" className="block py-2 text-gray-200 hover:text-pink-400">
                  Orders
                </Link>
                <Link href="/profile" className="block py-2 text-gray-200 hover:text-pink-400">
                  Profile
                </Link>
              </>
            )}
            <div className="flex gap-2 mt-4">
              {isLoggedIn ? (
                <div className="text-center">
                  <p className="text-gray-200 text-sm mb-2">Welcome, {user?.name}</p>
                  <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              ) : (
                <>
                  <Link href="/login" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup" className="flex-1">
                    <Button size="sm" className="w-full">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}