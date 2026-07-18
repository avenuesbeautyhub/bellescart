'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { useAuth, useAuthActions } from '@/auth/user';
import { useCart } from '@/contexts/CartContext';

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { cartCount } = useCart();
  const { user, isAuthenticated, loaded } = useAuth();
  const { logout } = useAuthActions();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Close drawer when clicking outside or on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const isLoggedIn = isAuthenticated && loaded;

  return (
    <>
      <nav className="bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white shadow-xl border-b border-gray-800 relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="group flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.226.1l7 3a1 1 0 00.788 0l7-3a1 1 0 000-1.84l-5.38-2.31z" />
                  </svg>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent">
                  BellesCart
                </span>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-1">
              <Link href="/products" className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-all duration-200 font-medium">
                Products
              </Link>
              {isLoggedIn && (
                <>
                  <Link href="/wishlist" className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-all duration-200 font-medium">
                    Wishlist
                  </Link>
                  <Link href="/orders" className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-all duration-200 font-medium">
                    Orders
                  </Link>
                  <Link href="/profile" className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-all duration-200 font-medium">
                    Profile
                  </Link>
                </>
              )}
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-3">
              {isLoggedIn && (
                <Link href="/cart" className="relative group">
                  <div className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all duration-200">
                    <svg
                      className="w-5 h-5 text-gray-300 group-hover:text-pink-400 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 12 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-pink-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold shadow-lg">
                    {cartCount}
                  </span>
                </Link>
              )}

              <div className="hidden md:flex items-center space-x-2">
                {isLoggedIn ? (
                  <Link href="/profile">
                  <div className="flex items-center space-x-3 pl-3 border-l border-gray-700">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="hidden lg:block">
                        <p className="text-sm text-gray-300">Welcome back</p>
                        <p className="text-xs text-gray-400 font-medium">{user?.name || 'User'}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                      className="border-gray-600 text-gray-300 hover:border-pink-500 hover:text-pink-400 transition-all duration-200"
                    >
                      Logout
                    </Button>
                  </div>
                  </Link>
                ) : (
                  <>
                    <Link href="/login">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-600 text-gray-300 hover:border-pink-500 hover:text-pink-400 transition-all duration-200"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 transition-all duration-200"
                      >
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all duration-200"
                aria-label="Toggle menu"
              >
                <svg
                  className="w-6 h-6 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div className={`fixed inset-y-0 right-0 w-80 max-w-[85vw] bg-gradient-to-b from-gray-900 via-black to-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div className="flex items-center space-x-3">
              {/* <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.226.1l7 3a1 1 0 00.788 0l7-3a1 1 0 000-1.84l-5.38-2.31z" />
                </svg>
              </div> */}
              <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent">
                BellesCart
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              {isLoggedIn && (
                <Link href="/cart" className="relative" onClick={() => setIsOpen(false)}>
                  <div className="p-2 rounded-lg bg-gray-800">
                    <svg
                      className="w-5 h-5 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-pink-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold shadow-lg">
                    {cartCount}
                  </span>
                </Link>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all duration-200"
                aria-label="Close menu"
              >
                <svg
                  className="w-5 h-5 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-1">
              <Link 
                href="/products" 
                className="flex items-center px-4 py-4 text-gray-300 hover:text-white hover:bg-gray-800 rounded-xl transition-all duration-200 font-medium text-lg"
                onClick={() => setIsOpen(false)}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Products
              </Link>
              {isLoggedIn && (
                <>
                  <Link 
                    href="/wishlist" 
                    className="flex items-center px-4 py-4 text-gray-300 hover:text-white hover:bg-gray-800 rounded-xl transition-all duration-200 font-medium text-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Wishlist
                  </Link>
                  <Link 
                    href="/orders" 
                    className="flex items-center px-4 py-4 text-gray-300 hover:text-white hover:bg-gray-800 rounded-xl transition-all duration-200 font-medium text-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Orders
                  </Link>
                  <Link 
                    href="/profile" 
                    className="flex items-center px-4 py-4 text-gray-300 hover:text-white hover:bg-gray-800 rounded-xl transition-all duration-200 font-medium text-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </Link>
                </>
              )}
            </div>

            {/* User Section */}
            <div className="p-4 border-t border-gray-800 mt-4">
              {isLoggedIn ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 px-4 py-3 bg-gray-800/50 rounded-xl">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Welcome back</p>
                      <p className="text-base text-gray-200 font-medium">{user?.name || 'User'}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full border-gray-600 text-gray-300 hover:border-pink-500 hover:text-pink-400 transition-all duration-200 py-3"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link href="/login" className="block" onClick={() => setIsOpen(false)}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-gray-600 text-gray-300 hover:border-pink-500 hover:text-pink-400 transition-all duration-200 py-3"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup" className="block" onClick={() => setIsOpen(false)}>
                    <Button
                      size="sm"
                      className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 transition-all duration-200 py-3"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}