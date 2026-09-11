'use client';

import React, {
  useState,
  useEffect,
  useMemo,
} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  useAuth,
  useAuthActions,
} from '@/auth/user';

import { useCart as useCartQuery } from '@/hooks/user/useCartQueries';
import { useProfile } from '@/hooks/user/useProfileQueries';
import { useWalletBalance } from '@/hooks/user/useWalletQueries';

import { SearchBar } from '@/components';
import Badge from '@/components/ui/Badge';

export default function Navbar() {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);

  const {
    user,
    isAuthenticated,
    loaded,
  } = useAuth();

  const { logout } = useAuthActions();

  const {
    data: profileData,
  } = useProfile({
    enabled:
      isAuthenticated && loaded,
  });

  const {
    data: cartData,
  } = useCartQuery({
    enabled:
      isAuthenticated && loaded,
  });

  const {
    data: walletBalanceData,
  } = useWalletBalance({
    enabled:
      isAuthenticated && loaded,
  });

  const cartCount = useMemo(() => {
    if (!cartData?.data?.items) {
      return 0;
    }

    return cartData.data.items.reduce(
      (sum: number, item: any) =>
        sum + (item.quantity || 1),
      0
    );
  }, [cartData]);

  const profileAvatar =
    profileData?.data?.avatar;

  const walletBalance =
    walletBalanceData?.data?.balance ?? 0;

  const isLoggedIn =
    isAuthenticated && loaded;

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    router.push('/login');
  };

  const handleSearch = (query: string) => {
    const target = isLoggedIn
      ? '/products'
      : '/products/guest';

    router.push(
      `${target}?search=${encodeURIComponent(query)}`
    );
  };

  /*
   * Lock page scrolling when mobile drawer
   * is open.
   */
  useEffect(() => {
    const handleEscape = (
      event: KeyboardEvent
    ) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener(
        'keydown',
        handleEscape
      );

      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener(
        'keydown',
        handleEscape
      );

      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const closeMobileMenu = () => {
    setIsOpen(false);
  };

  const navItems = [
    {
      label: 'Shop',
      href: '/products',
    },
    {
      label: 'Wishlist',
      href: '/wishlist',
    },
    {
      label: 'Orders',
      href: '/orders',
    },
    {
      label: 'Payments',
      href: '/payments',
    },
  ];

  return (
    <>
      {/* =========================================================
          DESKTOP / MAIN NAVBAR
      ========================================================== */}

      <header className="sticky top-0 z-50">

        {/* Subtle top announcement */}
        <div className="hidden h-8 items-center justify-center bg-[#21131c] px-4 text-[9px] font-semibold uppercase tracking-[0.28em] text-white/70 sm:flex">
          Complimentary delivery on selected orders
        </div>

        <nav
          className="
            border-b
            border-gray-100/80
            bg-white/95
            backdrop-blur-2xl
          "
        >
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">

            <div className="flex h-[72px] items-center gap-4 lg:h-[78px]">

              {/* =================================================
                  LOGO
              ================================================== */}

              <Link
                href={
                  isLoggedIn
                    ? '/dashboard'
                    : '/'
                }
                className="
                  group
                  flex
                  shrink-0
                  items-center
                  gap-2.5
                "
                aria-label="BellesCart Home"
              >

                {/* Logo mark */}
                <div
                  className="
                    relative
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-full
                    bg-[#21131c]
                    shadow-[0_5px_18px_rgba(33,19,28,0.15)]
                    transition-all
                    duration-300
                    group-hover:-translate-y-0.5
                    group-hover:shadow-[0_8px_25px_rgba(33,19,28,0.2)]
                  "
                >

                  <div className="absolute inset-[3px] rounded-full border border-white/20" />

                  <span className="relative font-serif text-lg italic text-white">
                    B
                  </span>

                </div>

                {/* Wordmark */}
                <div className="hidden sm:block">

                  <div className="text-[20px] font-semibold tracking-[-0.035em] text-gray-950">
                    BellesCart
                  </div>

                  <div className="-mt-0.5 text-[7px] font-medium uppercase tracking-[0.35em] text-gray-400">
                    Jewelry & more
                  </div>

                </div>

              </Link>

              {/* =================================================
                  DESKTOP NAVIGATION
              ================================================== */}

              {isLoggedIn && (
                <div className="ml-4 hidden items-center lg:flex">

                  <div className="h-6 w-px bg-gray-200" />

                  <div className="ml-4 flex items-center gap-1">

                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="
                          group
                          relative
                          rounded-full
                          px-4
                          py-2.5
                          text-[13px]
                          font-medium
                          text-gray-600
                          transition-all
                          duration-200
                          hover:bg-gray-50
                          hover:text-gray-950
                        "
                      >
                        {item.label}

                        <span
                          className="
                            absolute
                            bottom-1
                            left-1/2
                            h-0.5
                            w-0
                            -translate-x-1/2
                            rounded-full
                            bg-[#b63c71]
                            transition-all
                            duration-200
                            group-hover:w-4
                          "
                        />
                      </Link>
                    ))}

                    {/* Wallet */}
                    <Link
                      href="/wallet"
                      className="
                        group
                        flex
                        items-center
                        gap-2
                        rounded-full
                        px-4
                        py-2.5
                        text-[13px]
                        font-medium
                        text-gray-600
                        transition-all
                        duration-200
                        hover:bg-gray-50
                        hover:text-gray-950
                      "
                    >

                      <span>
                        Wallet
                      </span>

                      {walletBalance > 0 && (
                        <span
                          className="
                            rounded-full
                            bg-[#f8edf3]
                            px-2
                            py-0.5
                            text-[9px]
                            font-bold
                            text-[#a63368]
                          "
                        >
                          ₹
                          {walletBalance.toFixed(0)}
                        </span>
                      )}

                    </Link>

                  </div>

                </div>
              )}

              {/* =================================================
                  SEARCH
              ================================================== */}

              <div className="ml-auto hidden min-w-0 max-w-[390px] flex-1 md:block lg:ml-auto lg:max-w-[360px] xl:max-w-[420px]">

                <div
                  className="
                    rounded-full
                    border
                    border-gray-200
                    bg-gray-50/80
                    px-1
                    transition-all
                    duration-200
                    focus-within:border-gray-300
                    focus-within:bg-white
                    focus-within:shadow-[0_5px_25px_rgba(20,20,20,0.06)]
                  "
                >
                  <SearchBar
                    className="w-full"
                    onSearch={handleSearch}
                  />
                </div>

              </div>

              {/* =================================================
                  RIGHT ACTIONS
              ================================================== */}

              <div className="ml-auto flex shrink-0 items-center gap-1.5 md:ml-3">

                {/* Mobile search */}
                <button
                  type="button"
                  onClick={() => {
                    if (!isOpen) {
                      setIsOpen(true);
                    }
                  }}
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    text-gray-600
                    transition-all
                    hover:bg-gray-50
                    hover:text-gray-950
                    md:hidden
                  "
                  aria-label="Search"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      cx="11"
                      cy="11"
                      r="7"
                      strokeWidth="1.7"
                    />

                    <path
                      strokeLinecap="round"
                      strokeWidth="1.7"
                      d="m20 20-4-4"
                    />
                  </svg>
                </button>

                {/* Cart */}
                {isLoggedIn && (
                  <Link
                    href="/cart"
                    className="
                      group
                      relative
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-full
                      text-gray-600
                      transition-all
                      duration-200
                      hover:bg-[#fff4f8]
                      hover:text-[#b63c71]
                    "
                    aria-label={`Shopping cart${
                      cartCount > 0
                        ? `, ${cartCount} items`
                        : ''
                    }`}
                  >

                    <svg
                      className="
                        h-[19px]
                        w-[19px]
                        transition-transform
                        duration-200
                        group-hover:scale-105
                      "
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.7"
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>

                    {cartCount > 0 && (
                      <span
                        className="
                          absolute
                          right-0
                          top-0
                          flex
                          h-[18px]
                          min-w-[18px]
                          items-center
                          justify-center
                          rounded-full
                          bg-[#b63c71]
                          px-1
                          text-[9px]
                          font-bold
                          text-white
                          shadow-sm
                          ring-2
                          ring-white
                        "
                      >
                        {cartCount > 99
                          ? '99+'
                          : cartCount}
                      </span>
                    )}

                  </Link>
                )}

                {/* Profile */}
                {isLoggedIn ? (
                  <Link
                    href="/profile"
                    className="
                      group
                      ml-1
                      flex
                      items-center
                      gap-2.5
                      rounded-full
                      border
                      border-gray-100
                      bg-white
                      py-1
                      pl-1
                      pr-2
                      transition-all
                      duration-200
                      hover:border-gray-200
                      hover:bg-gray-50
                    "
                  >

                    {profileAvatar ? (
                      <img
                        src={profileAvatar}
                        alt="Profile"
                        className="
                          h-8
                          w-8
                          rounded-full
                          object-cover
                          ring-1
                          ring-gray-100
                          transition-transform
                          group-hover:scale-105
                        "
                      />
                    ) : (
                      <div
                        className="
                          flex
                          h-8
                          w-8
                          items-center
                          justify-center
                          rounded-full
                          bg-[#21131c]
                        "
                      >
                        <span className="text-xs font-semibold text-white">
                          {user?.name
                            ?.charAt(0)
                            ?.toUpperCase() ||
                            'U'}
                        </span>
                      </div>
                    )}

                    <div className="hidden min-w-0 xl:block">

                      <p className="max-w-[100px] truncate text-[11px] font-semibold text-gray-800">
                        {user?.name ||
                          'Account'}
                      </p>

                      <p className="text-[8px] uppercase tracking-[0.15em] text-gray-400">
                        Account
                      </p>

                    </div>

                    <svg
                      className="
                        hidden
                        h-3.5
                        w-3.5
                        text-gray-300
                        transition-transform
                        group-hover:translate-y-0.5
                        xl:block
                      "
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d="m6 9 6 6 6-6"
                      />
                    </svg>

                  </Link>
                ) : (
                  <div className="hidden items-center gap-1 md:flex">

                    <Link
                      href="/login"
                      className="
                        rounded-full
                        px-4
                        py-2.5
                        text-[13px]
                        font-medium
                        text-gray-600
                        transition-colors
                        hover:text-gray-950
                      "
                    >
                      Login
                    </Link>

                    <Link
                      href="/signup"
                      className="
                        rounded-full
                        bg-gray-950
                        px-5
                        py-2.5
                        text-[13px]
                        font-semibold
                        text-white
                        shadow-sm
                        transition-all
                        duration-200
                        hover:-translate-y-0.5
                        hover:bg-[#b63c71]
                        hover:shadow-lg
                      "
                    >
                      Create account
                    </Link>

                  </div>
                )}

                {/* Mobile menu */}
                <button
                  type="button"
                  onClick={() =>
                    setIsOpen(!isOpen)
                  }
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    bg-gray-50
                    text-gray-700
                    transition-all
                    hover:bg-gray-100
                    md:hidden
                  "
                  aria-label={
                    isOpen
                      ? 'Close menu'
                      : 'Open menu'
                  }
                  aria-expanded={isOpen}
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.7"
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
      </header>

      {/* =========================================================
          MOBILE BACKDROP
      ========================================================== */}

      <div
        className={`
          fixed
          inset-0
          z-[55]
          bg-black/30
          backdrop-blur-sm
          transition-opacity
          duration-300
          md:hidden
          ${
            isOpen
              ? 'pointer-events-auto opacity-100'
              : 'pointer-events-none opacity-0'
          }
        `}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      {/* =========================================================
          MOBILE DRAWER
      ========================================================== */}

      <aside
        className={`
          fixed
          inset-y-0
          right-0
          z-[60]
          flex
          w-[350px]
          max-w-[92vw]
          flex-col
          bg-white
          shadow-[-25px_0_70px_rgba(0,0,0,0.16)]
          transition-transform
          duration-300
          ease-out
          md:hidden
          ${
            isOpen
              ? 'translate-x-0'
              : 'translate-x-full'
          }
        `}
        aria-hidden={!isOpen}
      >

        {/* =======================================================
            DRAWER HEADER
        ======================================================== */}

        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-gray-100 px-5">

          <Link
            href={
              isLoggedIn
                ? '/dashboard'
                : '/'
            }
            onClick={closeMobileMenu}
            className="flex items-center gap-2.5"
          >

            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                bg-[#21131c]
              "
            >
              <span className="font-serif text-base italic text-white">
                B
              </span>
            </div>

            <div>
              <div className="text-[19px] font-semibold tracking-tight text-gray-950">
                BellesCart
              </div>

              <div className="-mt-0.5 text-[7px] uppercase tracking-[0.3em] text-gray-400">
                Jewelry & more
              </div>
            </div>

          </Link>

          <button
            type="button"
            onClick={closeMobileMenu}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              bg-gray-50
              text-gray-500
              transition-colors
              hover:bg-gray-100
              hover:text-gray-900
            "
            aria-label="Close menu"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

        </div>

        {/* =======================================================
            DRAWER BODY
        ======================================================== */}

        <div className="flex-1 overflow-y-auto">

          <div className="p-5">

            {/* Mobile search */}
            <div className="mb-7">

              <p className="mb-2.5 px-1 text-[9px] font-bold uppercase tracking-[0.25em] text-gray-400">
                Search
              </p>

              <div className="rounded-2xl border border-gray-200 bg-gray-50 px-1">
                <SearchBar
                  className="w-full"
                  onSearch={(query) => {
                    closeMobileMenu();
                    handleSearch(query);
                  }}
                />
              </div>

            </div>

            {/* Navigation label */}
            <p className="mb-3 px-1 text-[9px] font-bold uppercase tracking-[0.25em] text-gray-400">
              Explore
            </p>

            {/* Navigation */}
            <div className="space-y-1">

              {/* Shop */}
              <Link
                href={
                  isLoggedIn
                    ? '/products'
                    : '/products/guest'
                }
                onClick={closeMobileMenu}
                className="
                  group
                  flex
                  items-center
                  gap-4
                  rounded-2xl
                  px-3
                  py-3
                  transition-all
                  hover:bg-[#fff6f9]
                "
              >

                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#fdf0f5]
                    text-[#b63c71]
                    transition-transform
                    group-hover:scale-105
                  "
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.7"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>

                <div className="flex-1">

                  <p className="text-sm font-semibold text-gray-800">
                    Shop
                  </p>

                  <p className="mt-0.5 text-[10px] text-gray-400">
                    Explore our collection
                  </p>

                </div>

                <span className="text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-[#b63c71]">
                  →
                </span>

              </Link>

              {isLoggedIn && (
                <>
                  {/* Wishlist */}
                  <Link
                    href="/wishlist"
                    onClick={closeMobileMenu}
                    className="
                      group
                      flex
                      items-center
                      gap-4
                      rounded-2xl
                      px-3
                      py-3
                      transition-all
                      hover:bg-[#fff6f9]
                    "
                  >

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.7"
                          d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"
                        />
                      </svg>
                    </div>

                    <div className="flex-1">

                      <p className="text-sm font-semibold text-gray-800">
                        Wishlist
                      </p>

                      <p className="mt-0.5 text-[10px] text-gray-400">
                        Your saved favorites
                      </p>

                    </div>

                    <span className="text-gray-300 group-hover:translate-x-1 group-hover:text-pink-500">
                      →
                    </span>

                  </Link>

                  {/* Orders */}
                  <Link
                    href="/orders"
                    onClick={closeMobileMenu}
                    className="
                      group
                      flex
                      items-center
                      gap-4
                      rounded-2xl
                      px-3
                      py-3
                      transition-all
                      hover:bg-blue-50/60
                    "
                  >

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.7"
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a3 3 0 016 0M9 5h6"
                        />
                      </svg>
                    </div>

                    <div className="flex-1">

                      <p className="text-sm font-semibold text-gray-800">
                        Orders
                      </p>

                      <p className="mt-0.5 text-[10px] text-gray-400">
                        Track your purchases
                      </p>

                    </div>

                    <span className="text-gray-300 group-hover:translate-x-1 group-hover:text-blue-500">
                      →
                    </span>

                  </Link>

                  {/* Payments */}
                  <Link
                    href="/payments"
                    onClick={closeMobileMenu}
                    className="
                      group
                      flex
                      items-center
                      gap-4
                      rounded-2xl
                      px-3
                      py-3
                      transition-all
                      hover:bg-purple-50/60
                    "
                  >

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.7"
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                    </div>

                    <div className="flex-1">

                      <p className="text-sm font-semibold text-gray-800">
                        Payments
                      </p>

                      <p className="mt-0.5 text-[10px] text-gray-400">
                        Payment history
                      </p>

                    </div>

                    <span className="text-gray-300 group-hover:translate-x-1 group-hover:text-purple-500">
                      →
                    </span>

                  </Link>

                  {/* Wallet */}
                  <Link
                    href="/wallet"
                    onClick={closeMobileMenu}
                    className="
                      group
                      flex
                      items-center
                      gap-4
                      rounded-2xl
                      px-3
                      py-3
                      transition-all
                      hover:bg-green-50/60
                    "
                  >

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.7"
                          d="M3 7h18a2 2 0 012 2v8a2 2 0 01-2 2H3a2 2 0 01-2-2V9a2 2 0 012-2z"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.7"
                          d="M16 13h.01"
                        />
                      </svg>
                    </div>

                    <div className="flex-1">

                      <p className="text-sm font-semibold text-gray-800">
                        Wallet
                      </p>

                      <p className="mt-0.5 text-[10px] text-gray-400">
                        Your BellesCart balance
                      </p>

                    </div>

                    {walletBalance > 0 ? (
                      <span className="rounded-full bg-green-50 px-2.5 py-1 text-[9px] font-bold text-green-600">
                        ₹
                        {walletBalance.toFixed(0)}
                      </span>
                    ) : (
                      <span className="text-gray-300 group-hover:translate-x-1">
                        →
                      </span>
                    )}

                  </Link>

                </>
              )}

            </div>

            {/* Divider */}
            <div className="my-7 h-px bg-gray-100" />

            {/* Account */}
            {isLoggedIn && (
              <>
                <p className="mb-3 px-1 text-[9px] font-bold uppercase tracking-[0.25em] text-gray-400">
                  Account
                </p>

                <Link
                  href="/profile"
                  onClick={closeMobileMenu}
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-2xl
                    border
                    border-gray-100
                    bg-gray-50/70
                    p-3
                    transition-all
                    hover:border-gray-200
                    hover:bg-white
                  "
                >

                  {profileAvatar ? (
                    <img
                      src={profileAvatar}
                      alt="Profile"
                      className="h-11 w-11 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#21131c]">
                      <span className="text-sm font-semibold text-white">
                        {user?.name
                          ?.charAt(0)
                          ?.toUpperCase() ||
                          'U'}
                      </span>
                    </div>
                  )}

                  <div className="min-w-0 flex-1">

                    <p className="text-[9px] uppercase tracking-[0.18em] text-gray-400">
                      Signed in as
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold text-gray-900">
                      {user?.name ||
                        'Account'}
                    </p>

                  </div>

                  <span className="text-gray-300">
                    →
                  </span>

                </Link>
              </>
            )}

          </div>

        </div>

        {/* =======================================================
            DRAWER FOOTER
        ======================================================== */}

        <div className="shrink-0 border-t border-gray-100 bg-gray-50/80 p-5">

          {isLoggedIn ? (
            <div className="space-y-2.5">

              {/* Cart shortcut */}
              <Link
                href="/cart"
                onClick={closeMobileMenu}
                className="
                  flex
                  items-center
                  justify-between
                  rounded-2xl
                  bg-white
                  px-4
                  py-3.5
                  text-sm
                  font-semibold
                  text-gray-800
                  shadow-sm
                  transition-all
                  hover:shadow-md
                "
              >

                <span className="flex items-center gap-2.5">

                  <svg
                    className="h-4.5 w-4.5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.7"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17"
                    />
                  </svg>

                  Cart

                </span>

                {cartCount > 0 && (
                  <span className="rounded-full bg-[#f9eaf1] px-2.5 py-1 text-[9px] font-bold text-[#b63c71]">
                    {cartCount}
                    {' '}
                    {cartCount === 1
                      ? 'item'
                      : 'items'}
                  </span>
                )}

              </Link>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="
                  flex
                  w-full
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-gray-200
                  bg-white
                  px-4
                  py-3.5
                  text-sm
                  font-semibold
                  text-gray-600
                  transition-all
                  hover:border-red-100
                  hover:bg-red-50
                  hover:text-red-500
                "
              >
                Sign out
              </button>

            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">

              <Link
                href="/login"
                onClick={closeMobileMenu}
                className="
                  flex
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-gray-200
                  bg-white
                  px-4
                  py-3.5
                  text-sm
                  font-semibold
                  text-gray-700
                  transition-all
                  hover:border-gray-300
                "
              >
                Login
              </Link>

              <Link
                href="/signup"
                onClick={closeMobileMenu}
                className="
                  flex
                  items-center
                  justify-center
                  rounded-2xl
                  bg-gray-950
                  px-4
                  py-3.5
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition-all
                  hover:bg-[#b63c71]
                "
              >
                Sign up
              </Link>

            </div>
          )}

        </div>

      </aside>
    </>
  );
}