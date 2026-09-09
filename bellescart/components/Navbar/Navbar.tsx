'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, useAuthActions } from '@/auth/user';
import { useCart as useCartQuery } from '@/hooks/user/useCartQueries';
import { useProfile } from '@/hooks/user/useProfileQueries';
import { useWalletBalance } from '@/hooks/user/useWalletQueries';
import { SearchBar } from '@/components';
import Badge from '@/components/ui/Badge';

export default function Navbar() {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);

  const { user, isAuthenticated, loaded } = useAuth();
  const { logout } = useAuthActions();

  const { data: profileData } = useProfile({
    enabled: isAuthenticated && loaded,
  });

  const { data: cartData } = useCartQuery({
    enabled: isAuthenticated && loaded,
  });

  const { data: walletBalanceData } = useWalletBalance({
    enabled: isAuthenticated && loaded,
  });

  const cartCount = useMemo(() => {
    if (!cartData?.data?.items) return 0;

    return cartData.data.items.reduce(
      (sum: number, item: any) => sum + (item.quantity || 1),
      0
    );
  }, [cartData]);

  const profileAvatar = profileData?.data?.avatar;
  const walletBalance = walletBalanceData?.data?.balance ?? 0;

  const isLoggedIn = isAuthenticated && loaded;

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    router.push('/login');
  };

  const handleSearch = (query: string) => {
    router.push(
      `${isLoggedIn ? '/products' : '/products/guest'}?search=${encodeURIComponent(query)}`
    );
  };

  // Lock body scroll while mobile drawer is open
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
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

  const closeMobileMenu = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* =========================================================
          MAIN NAVBAR
      ========================================================== */}
      <nav className="sticky top-0 z-50 border-b border-gray-100/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-[72px] items-center justify-between gap-4">

            {/* ---------------------------------------------------
                LOGO
            ---------------------------------------------------- */}
            <Link
              href={isLoggedIn ? '/dashboard' : '/'}
              className="group flex shrink-0 items-center gap-2.5"
              aria-label="BellesCart Home"
            >
              <div
                className="
                  flex h-10 w-10 items-center justify-center
                  rounded-xl
                  bg-gradient-to-br from-pink-500 via-pink-500 to-purple-600
                  shadow-[0_6px_18px_rgba(236,72,153,0.22)]
                  transition-all duration-300
                  group-hover:-translate-y-0.5
                  group-hover:shadow-[0_8px_22px_rgba(236,72,153,0.3)]
                "
              >
                <svg
                  className="h-5.5 w-5.5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.226.1l7 3a1 1 0 00.788 0l7-3a1 1 0 000-1.84l-5.38-2.31z" />
                </svg>
              </div>

              <span
                className="
                  hidden text-[22px] font-extrabold tracking-tight
                  bg-gradient-to-r from-pink-600 to-purple-600
                  bg-clip-text text-transparent
                  sm:block
                "
              >
                BellesCart
              </span>
            </Link>

            {/* ---------------------------------------------------
                DESKTOP CENTER AREA
            ---------------------------------------------------- */}
            <div className="hidden min-w-0 flex-1 items-center justify-center gap-5 md:flex">

              {/* Search */}
              <div className="w-full max-w-md">
                <SearchBar
                  className="w-full"
                  onSearch={handleSearch}
                />
              </div>

              {/* Navigation */}
              {isLoggedIn && (
                <div className="flex shrink-0 items-center gap-0.5">

                  <Link
                    href="/products"
                    className="
                      rounded-lg px-3 py-2
                      text-sm font-medium text-gray-600
                      transition-all duration-200
                      hover:bg-pink-50 hover:text-pink-600
                    "
                  >
                    Products
                  </Link>

                  <Link
                    href="/wishlist"
                    className="
                      rounded-lg px-3 py-2
                      text-sm font-medium text-gray-600
                      transition-all duration-200
                      hover:bg-pink-50 hover:text-pink-600
                    "
                  >
                    Wishlist
                  </Link>

                  <Link
                    href="/orders"
                    className="
                      rounded-lg px-3 py-2
                      text-sm font-medium text-gray-600
                      transition-all duration-200
                      hover:bg-pink-50 hover:text-pink-600
                    "
                  >
                    Orders
                  </Link>

                  <Link
                    href="/payments"
                    className="
                      rounded-lg px-3 py-2
                      text-sm font-medium text-gray-600
                      transition-all duration-200
                      hover:bg-pink-50 hover:text-pink-600
                    "
                  >
                    Payments
                  </Link>

                  <Link
                    href="/wallet"
                    className="
                      flex items-center gap-1.5
                      rounded-lg px-3 py-2
                      text-sm font-medium text-gray-600
                      transition-all duration-200
                      hover:bg-pink-50 hover:text-pink-600
                    "
                  >
                    Wallet

                    {walletBalance > 0 && (
                      <Badge
                        variant="success"
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      >
                        ₹{walletBalance.toFixed(0)}
                      </Badge>
                    )}
                  </Link>
                </div>
              )}
            </div>

            {/* ---------------------------------------------------
                RIGHT ACTIONS
            ---------------------------------------------------- */}
            <div className="flex shrink-0 items-center gap-2">

              {/* Cart */}
              {isLoggedIn && (
                <Link
                  href="/cart"
                  className="
                    group relative flex h-10 w-10 items-center justify-center
                    rounded-xl
                    text-gray-600
                    transition-all duration-200
                    hover:bg-pink-50 hover:text-pink-600
                    focus:outline-none focus:ring-2 focus:ring-pink-500/30
                  "
                  aria-label={`Shopping cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}
                >
                  <svg
                    className="h-5 w-5 transition-transform duration-200 group-hover:scale-105"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>

                  {cartCount > 0 && (
                    <span
                      className="
                        absolute -right-0.5 -top-0.5
                        flex h-[19px] min-w-[19px] items-center justify-center
                        rounded-full
                        bg-gradient-to-r from-pink-500 to-purple-600
                        px-1
                        text-[10px] font-bold text-white
                        shadow-[0_3px_8px_rgba(236,72,153,0.35)]
                        ring-2 ring-white
                      "
                    >
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>
              )}

              {/* -------------------------------------------------
                  DESKTOP PROFILE / AUTH
              -------------------------------------------------- */}
              <div className="hidden items-center md:flex">
                {isLoggedIn ? (
                  <div className="ml-1 flex items-center border-l border-gray-200 pl-3">

                    {/* Profile */}
                    <Link
                      href="/profile"
                      className="
                        group flex items-center gap-2.5
                        rounded-xl px-2 py-1.5
                        transition-all duration-200
                        hover:bg-gray-50
                      "
                    >
                      {profileAvatar ? (
                        <img
                          src={profileAvatar}
                          alt="Profile"
                          className="
                            h-9 w-9 rounded-full object-cover
                            shadow-sm ring-2 ring-white
                            transition-transform duration-200
                            group-hover:scale-105
                          "
                        />
                      ) : (
                        <div
                          className="
                            flex h-9 w-9 items-center justify-center
                            rounded-full
                            bg-gradient-to-br from-pink-500 to-purple-600
                            shadow-sm ring-2 ring-white
                          "
                        >
                          <span className="text-sm font-bold text-white">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}

                      <div className="hidden lg:block">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                          Welcome back
                        </p>

                        <p className="max-w-[110px] truncate text-sm font-semibold text-gray-800">
                          {user?.name || 'User'}
                        </p>
                      </div>
                    </Link>

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="
                        ml-1 rounded-lg px-3 py-2
                        text-sm font-medium text-gray-500
                        transition-all duration-200
                        hover:bg-red-50 hover:text-red-500
                        focus:outline-none focus:ring-2 focus:ring-red-500/20
                      "
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="ml-1 flex items-center gap-1 border-l border-gray-200 pl-3">

                    <Link
                      href="/login"
                      className="
                        rounded-lg px-3.5 py-2
                        text-sm font-medium text-gray-600
                        transition-all duration-200
                        hover:bg-gray-50 hover:text-gray-900
                      "
                    >
                      Login
                    </Link>

                    <Link
                      href="/signup"
                      className="
                        rounded-xl
                        bg-gradient-to-r from-pink-500 to-purple-600
                        px-4 py-2.5
                        text-sm font-semibold text-white
                        shadow-[0_5px_15px_rgba(236,72,153,0.22)]
                        transition-all duration-200
                        hover:-translate-y-0.5
                        hover:shadow-[0_7px_20px_rgba(236,72,153,0.3)]
                      "
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>

              {/* -------------------------------------------------
                  MOBILE MENU BUTTON
              -------------------------------------------------- */}
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="
                  flex h-10 w-10 items-center justify-center
                  rounded-xl
                  bg-gray-50 text-gray-600
                  transition-all duration-200
                  hover:bg-pink-50 hover:text-pink-600
                  focus:outline-none focus:ring-2 focus:ring-pink-500/30
                  md:hidden
                "
                aria-label={isOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isOpen}
              >
                <svg
                  className="h-5.5 w-5.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d={
                      isOpen
                        ? 'M6 18L18 6M6 6l12 12'
                        : 'M4 6h16M4 12h16M4 18h16'
                    }
                  />
                </svg>
                
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* =========================================================
          MOBILE OVERLAY
      ========================================================== */}
      {isOpen && (
        <div
          className="
            fixed inset-0 z-40
            bg-black/35
            backdrop-blur-[2px]
            md:hidden
          "
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* =========================================================
          MOBILE DRAWER
      ========================================================== */}
      <aside
        className={`
          fixed inset-y-0 right-0 z-50
          flex w-[330px] max-w-[88vw] flex-col
          bg-white
          shadow-[-15px_0_50px_rgba(0,0,0,0.12)]
          transition-transform duration-300 ease-out
          md:hidden
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
        aria-hidden={!isOpen}
      >

        {/* -------------------------------------------------------
            DRAWER HEADER
        -------------------------------------------------------- */}
        <div className="flex h-[72px] items-center justify-between border-b border-gray-100 px-5">

          <Link
            href={isLoggedIn ? '/dashboard' : '/'}
            onClick={closeMobileMenu}
            className="flex items-center gap-2.5"
          >
            <div
              className="
                flex h-9 w-9 items-center justify-center
                rounded-xl
                bg-gradient-to-br from-pink-500 to-purple-600
                shadow-sm
              "
            >
              <svg
                className="h-5 w-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.226.1l7 3a1 1 0 00.788 0l7-3a1 1 0 000-1.84l-5.38-2.31z" />
              </svg>
            </div>

            <span
              className="
                text-xl font-extrabold tracking-tight
                bg-gradient-to-r from-pink-600 to-purple-600
                bg-clip-text text-transparent
              "
            >
              BellesCart
            </span>
          </Link>

          <div className="flex items-center gap-1">

            {isLoggedIn && (
              <Link
                href="/cart"
                onClick={closeMobileMenu}
                className="
                  relative flex h-9 w-9 items-center justify-center
                  rounded-lg text-gray-600
                  hover:bg-pink-50 hover:text-pink-600
                "
                aria-label="Cart"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>

                {cartCount > 0 && (
                  <span
                    className="
                      absolute right-0 top-0
                      flex h-4 min-w-4 items-center justify-center
                      rounded-full
                      bg-pink-500 px-1
                      text-[9px] font-bold text-white
                      ring-2 ring-white
                    "
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            )}

            <button
              type="button"
              onClick={closeMobileMenu}
              className="
                flex h-9 w-9 items-center justify-center
                rounded-lg
                text-gray-500
                transition-colors
                hover:bg-gray-100 hover:text-gray-800
              "
              aria-label="Close menu"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* -------------------------------------------------------
            DRAWER CONTENT
        -------------------------------------------------------- */}
        <div className="flex-1 overflow-y-auto">

          <div className="p-5">

            {/* Mobile Search */}
            <div className="mb-6">
              <SearchBar
                className="w-full"
                onSearch={(query) => {
                  closeMobileMenu();
                  handleSearch(query);
                }}
              />
            </div>

            {/* Main navigation */}
            <div className="space-y-1">

              <Link
                href={isLoggedIn ? '/products' : '/products/guest'}
                onClick={closeMobileMenu}
                className="
                  flex items-center gap-3
                  rounded-xl px-4 py-3
                  text-sm font-semibold text-gray-700
                  transition-all duration-200
                  hover:bg-pink-50 hover:text-pink-600
                "
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </span>
                Products
              </Link>

              {isLoggedIn && (
                <>
                  <Link
                    href="/wishlist"
                    onClick={closeMobileMenu}
                    className="
                      flex items-center gap-3
                      rounded-xl px-4 py-3
                      text-sm font-semibold text-gray-700
                      transition-all duration-200
                      hover:bg-pink-50 hover:text-pink-600
                    "
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </span>
                    Wishlist
                  </Link>

                  <Link
                    href="/orders"
                    onClick={closeMobileMenu}
                    className="
                      flex items-center gap-3
                      rounded-xl px-4 py-3
                      text-sm font-semibold text-gray-700
                      transition-all duration-200
                      hover:bg-pink-50 hover:text-pink-600
                    "
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a3 3 0 016 0M9 5h6"
                        />
                      </svg>
                    </span>
                    Orders
                  </Link>

                  <Link
                    href="/payments"
                    onClick={closeMobileMenu}
                    className="
                      flex items-center gap-3
                      rounded-xl px-4 py-3
                      text-sm font-semibold text-gray-700
                      transition-all duration-200
                      hover:bg-pink-50 hover:text-pink-600
                    "
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                    </span>
                    Payments
                  </Link>

                  <Link
                    href="/wallet"
                    onClick={closeMobileMenu}
                    className="
                      flex items-center gap-3
                      rounded-xl px-4 py-3
                      text-sm font-semibold text-gray-700
                      transition-all duration-200
                      hover:bg-pink-50 hover:text-pink-600
                    "
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                    </span>

                    <span className="flex-1">Wallet</span>

                    {walletBalance > 0 && (
                      <Badge
                        variant="success"
                        className="rounded-full px-2 py-0.5 text-[10px]"
                      >
                        ₹{walletBalance.toFixed(0)}
                      </Badge>
                    )}
                  </Link>

                  <Link
                    href="/profile"
                    onClick={closeMobileMenu}
                    className="
                      flex items-center gap-3
                      rounded-xl px-4 py-3
                      text-sm font-semibold text-gray-700
                      transition-all duration-200
                      hover:bg-pink-50 hover:text-pink-600
                    "
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </span>
                    Profile
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------
            MOBILE USER / AUTH SECTION
        -------------------------------------------------------- */}
        <div className="border-t border-gray-100 bg-gray-50/70 p-5">

          {isLoggedIn ? (
            <div className="space-y-3">

              {/* User profile card */}
              <Link
                href="/profile"
                onClick={closeMobileMenu}
                className="
                  flex items-center gap-3
                  rounded-2xl
                  border border-pink-100
                  bg-gradient-to-br from-pink-50 via-white to-purple-50
                  p-3
                  transition-all duration-200
                  hover:border-pink-200
                "
              >
                {profileAvatar ? (
                  <img
                    src={profileAvatar}
                    alt="Profile"
                    className="h-11 w-11 rounded-full object-cover shadow-sm"
                  />
                ) : (
                  <div
                    className="
                      flex h-11 w-11 shrink-0 items-center justify-center
                      rounded-full
                      bg-gradient-to-br from-pink-500 to-purple-600
                      shadow-sm
                    "
                  >
                    <span className="text-base font-bold text-white">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}

                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                    Signed in as
                  </p>

                  <p className="truncate text-sm font-semibold text-gray-800">
                    {user?.name || 'User'}
                  </p>
                </div>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="
                  flex w-full items-center justify-center
                  rounded-xl
                  border border-gray-200
                  bg-white
                  px-4 py-3
                  text-sm font-semibold text-gray-600
                  transition-all duration-200
                  hover:border-red-100
                  hover:bg-red-50
                  hover:text-red-500
                "
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">

              <Link
                href="/login"
                onClick={closeMobileMenu}
                className="
                  flex w-full items-center justify-center
                  rounded-xl
                  border border-gray-200
                  bg-white
                  px-4 py-3
                  text-sm font-semibold text-gray-700
                  transition-all duration-200
                  hover:border-pink-200
                  hover:bg-pink-50
                  hover:text-pink-600
                "
              >
                Login
              </Link>

              <Link
                href="/signup"
                onClick={closeMobileMenu}
                className="
                  flex w-full items-center justify-center
                  rounded-xl
                  bg-gradient-to-r from-pink-500 to-purple-600
                  px-4 py-3
                  text-sm font-semibold text-white
                  shadow-[0_5px_15px_rgba(236,72,153,0.2)]
                  transition-all duration-200
                  hover:-translate-y-0.5
                  hover:shadow-[0_7px_20px_rgba(236,72,153,0.28)]
                "
              >
                Create Account
              </Link>

            </div>
          )}
        </div>
      </aside>
    </>
  );
}