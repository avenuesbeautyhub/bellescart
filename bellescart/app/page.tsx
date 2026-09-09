'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import GuestProductGrid from '@/components/ProductGrid/GuestProductGrid';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import { SearchBar } from '@/components';
import {
  usePublicFeaturedProducts,
  usePublicCategories,
} from '@/hooks/user/usePublicProductQueries';
import { useAuth } from '@/auth/user';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, loaded } = useAuth();

  const {
    data: featuredProductsData,
    isLoading: isLoadingProducts,
  } = usePublicFeaturedProducts(8);

  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
  } = usePublicCategories();

  const featuredProducts = featuredProductsData?.data?.products || [];
  const categories = categoriesData?.data?.categories || [];

  const loading = isLoadingProducts || isLoadingCategories;

  // Keep existing authentication behaviour
  useEffect(() => {
    if (loaded && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [loaded, isAuthenticated, router]);

  if (!loaded || loading) {
    return <Loader size="lg" text="Loading..." fullScreen />;
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />

      <main>

        {/* =====================================================
            HERO
        ====================================================== */}
        <section className="relative isolate overflow-hidden bg-[#160b16]">

          {/* Soft background glow */}
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-pink-500/20 blur-3xl" />
          <div className="absolute -bottom-40 -right-20 h-[30rem] w-[30rem] rounded-full bg-purple-600/20 blur-3xl" />

          {/* Decorative circles */}
          <div className="absolute right-[8%] top-[18%] hidden h-40 w-40 rounded-full border border-white/10 lg:block" />
          <div className="absolute right-[11%] top-[23%] hidden h-24 w-24 rounded-full border border-white/10 lg:block" />

          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">

            <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">

              {/* Hero content */}
              <div className="text-center lg:text-left">

                {/* Brand pill */}
                <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-pink-400 shadow-[0_0_10px_rgba(244,114,182,0.8)]" />
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-pink-200">
                    Belles Avenue
                  </span>
                </div>

                <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[4.25rem]">
                  Everything you love,
                  <span className="mt-2 block bg-gradient-to-r from-pink-300 via-pink-200 to-purple-300 bg-clip-text text-transparent">
                    all in one place.
                  </span>
                </h1>

                <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-white/65 sm:text-lg lg:mx-0">
                  Discover beautiful products, explore curated collections,
                  and enjoy a shopping experience designed around you.
                </p>

                {/* Search */}
                <div className="mx-auto mt-8 max-w-xl lg:mx-0">
                  <div className="rounded-2xl bg-white/10 p-1.5 shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
                    <SearchBar
                      placeholder="Search for products..."
                      onSearch={(query) =>
                        router.push(
                          `/products/guest?search=${encodeURIComponent(query)}`
                        )
                      }
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">

                  <Link href="/products/guest">
                    <Button
                      size="lg"
                      variant="primary"
                      className="
                        min-w-[150px]
                        rounded-xl
                        bg-white
                        px-7 py-3.5
                        font-semibold
                        text-pink-700
                        shadow-xl
                        transition-all duration-300
                        hover:-translate-y-0.5
                        hover:bg-pink-50
                        hover:shadow-2xl
                      "
                    >
                      Shop Now
                      <span className="ml-2">→</span>
                    </Button>
                  </Link>

                  <Link
                    href="/products/guest"
                    className="
                      rounded-xl px-5 py-3.5
                      text-sm font-semibold text-white/80
                      transition-colors
                      hover:text-white
                    "
                  >
                    Explore collection
                  </Link>
                </div>

                {/* Trust stats */}
                <div className="mt-10 flex items-center justify-center gap-7 border-t border-white/10 pt-7 lg:justify-start">

                  <div>
                    <p className="text-xl font-bold text-white sm:text-2xl">
                      10K+
                    </p>
                    <p className="mt-0.5 text-xs text-white/45">
                      Products
                    </p>
                  </div>

                  <div className="h-8 w-px bg-white/10" />

                  <div>
                    <p className="text-xl font-bold text-white sm:text-2xl">
                      5K+
                    </p>
                    <p className="mt-0.5 text-xs text-white/45">
                      Customers
                    </p>
                  </div>

                  <div className="h-8 w-px bg-white/10" />

                  <div>
                    <p className="text-xl font-bold text-white sm:text-2xl">
                      4.8
                    </p>
                    <p className="mt-0.5 text-xs text-white/45">
                      Customer rating
                    </p>
                  </div>
                </div>
              </div>

              {/* Decorative visual */}
              <div className="relative hidden min-h-[430px] lg:block">

                {/* Main card */}
                <div
                  className="
                    absolute right-4 top-1/2
                    w-[330px]
                    -translate-y-1/2
                    rotate-2
                    rounded-[2rem]
                    border border-white/10
                    bg-white/[0.07]
                    p-3
                    shadow-[0_30px_80px_rgba(0,0,0,0.35)]
                    backdrop-blur-xl
                  "
                >
                  <div className="flex h-[390px] flex-col justify-between overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-pink-300 via-pink-500 to-purple-700 p-7">

                    <div className="flex items-center justify-between">
                      <div className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                        New collection
                      </div>

                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white">
                        ♡
                      </div>
                    </div>

                    <div>
                      <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-white/15 text-5xl backdrop-blur-md">
                        ✦
                      </div>

                      <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/70">
                        Belles Avenue
                      </p>

                      <h2 className="mt-2 text-3xl font-bold leading-tight text-white">
                        Find something
                        <br />
                        made for you.
                      </h2>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/20 pt-5">
                      <span className="text-sm text-white/70">
                        Curated with care
                      </span>

                      <span className="text-xl text-white">
                        →
                      </span>
                    </div>
                  </div>
                </div>

                {/* Floating card */}
                <div
                  className="
                    absolute bottom-8 left-0
                    w-52
                    rounded-2xl
                    border border-white/10
                    bg-white/10
                    p-4
                    shadow-xl
                    backdrop-blur-xl
                  "
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-pink-600">
                      ✓
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-white">
                        Quality first
                      </p>
                      <p className="text-xs text-white/50">
                        Carefully selected
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* =====================================================
            FEATURED PRODUCTS
        ====================================================== */}
        <section className="bg-white px-4 py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl sm:px-2 lg:px-4">

            <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-px w-7 bg-pink-500" />
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-pink-600">
                    Curated for you
                  </span>
                </div>

                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Featured products
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
                  Discover some of our most-loved products, selected from the
                  BellesCart collection.
                </p>
              </div>

              <Link
                href="/products/guest"
                className="
                  inline-flex items-center gap-2
                  text-sm font-semibold text-pink-600
                  transition-all duration-200
                  hover:gap-3 hover:text-pink-700
                "
              >
                View all products
                <span>→</span>
              </Link>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute -inset-5 rounded-[2rem] bg-gradient-to-r from-pink-50 to-purple-50 opacity-70 blur-2xl" />

              <div className="relative">
                <GuestProductGrid
                  products={featuredProducts}
                  onAddToCart={() => console.log('Add to cart clicked')}
                  onAddToWishlist={() => console.log('Add to wishlist clicked')}
                />
              </div>
            </div>
          </div>
        </section>


        {/* =====================================================
            CATEGORIES
        ====================================================== */}
        <section className="bg-[#faf8fb] px-4 py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl sm:px-2 lg:px-4">

            <div className="mb-10 text-center">

              <div className="mb-3 flex items-center justify-center gap-2">
                <span className="h-px w-7 bg-pink-500" />
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-pink-600">
                  Explore
                </span>
                <span className="h-px w-7 bg-pink-500" />
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Shop by category
              </h2>

              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
                Find exactly what you're looking for through our curated
                collections.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">

              {categories.map((category) => {

                const colorMap: { [key: string]: string } = {
                  Clothing: 'from-blue-400 to-blue-600',
                  Accessories: 'from-pink-400 to-pink-600',
                  Jewelry: 'from-purple-400 to-purple-600',
                  Footwear: 'from-green-400 to-green-600',
                  Electronics: 'from-red-400 to-red-600',
                  Home: 'from-yellow-400 to-yellow-600',
                  Beauty: 'from-indigo-400 to-indigo-600',
                  Sports: 'from-orange-400 to-orange-600',
                };

                const iconMap: { [key: string]: string } = {
                  Clothing: '👗',
                  Accessories: '👜',
                  Jewelry: '💎',
                  Footwear: '👠',
                  Electronics: '📱',
                  Home: '🏠',
                  Beauty: '💄',
                  Sports: '⚽',
                };

                const color =
                  colorMap[category.name] || 'from-gray-400 to-gray-600';

                const icon = iconMap[category.name] || '📦';

                return (
                  <Link
                    key={category._id}
                    href={`/products/guest?category=${category.name}`}
                    className="group"
                  >
                    <div
                      className="
                        relative h-full overflow-hidden
                        rounded-2xl
                        border border-gray-100
                        bg-white
                        p-5 text-center
                        shadow-sm
                        transition-all duration-300
                        hover:-translate-y-1
                        hover:border-pink-100
                        hover:shadow-xl
                        sm:p-7
                      "
                    >
                      {/* Hover glow */}
                      <div
                        className={`
                          absolute -right-10 -top-10
                          h-24 w-24 rounded-full
                          bg-gradient-to-br ${color}
                          opacity-0 blur-2xl
                          transition-opacity duration-300
                          group-hover:opacity-20
                        `}
                      />

                      <div
                        className={`
                          relative mx-auto mb-4
                          flex h-16 w-16 items-center justify-center
                          rounded-2xl
                          bg-gradient-to-br ${color}
                          text-2xl
                          shadow-md
                          transition-all duration-300
                          group-hover:scale-105
                          group-hover:rotate-2
                          sm:h-20 sm:w-20 sm:text-3xl
                        `}
                      >
                        {icon}
                      </div>

                      <h3
                        className="
                          relative text-sm font-bold text-gray-800
                          transition-colors duration-200
                          group-hover:text-pink-600
                          sm:text-base
                        "
                      >
                        {category.name}
                      </h3>

                      <div
                        className="
                          mt-2
                          text-xs font-semibold text-pink-600
                          opacity-0 transition-all duration-200
                          group-hover:translate-y-0 group-hover:opacity-100
                          -translate-y-1
                        "
                      >
                        Shop now →
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>


        {/* =====================================================
            WHY BELLESCART
        ====================================================== */}
        <section className="border-y border-gray-100 bg-white px-4 py-16 sm:py-20">

          <div className="mx-auto max-w-7xl">

            <div className="mx-auto mb-12 max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-600">
                Shop with confidence
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Why choose BellesCart?
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-500 sm:text-base">
                A simple, secure and enjoyable way to discover the products
                you love.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">

              {/* Quality */}
              <div
                className="
                  group rounded-2xl
                  border border-gray-100
                  bg-gray-50/60
                  p-7
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:bg-white
                  hover:shadow-lg
                "
              >
                <div
                  className="
                    flex h-12 w-12 items-center justify-center
                    rounded-xl
                    bg-emerald-50
                    text-xl
                    text-emerald-600
                    transition-transform duration-300
                    group-hover:scale-105
                  "
                >
                  ✓
                </div>

                <h3 className="mt-5 text-lg font-bold text-gray-900">
                  Quality guaranteed
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Premium products from trusted brands and carefully selected
                  collections.
                </p>
              </div>

              {/* Delivery */}
              <div
                className="
                  group rounded-2xl
                  border border-gray-100
                  bg-gray-50/60
                  p-7
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:bg-white
                  hover:shadow-lg
                "
              >
                <div
                  className="
                    flex h-12 w-12 items-center justify-center
                    rounded-xl
                    bg-blue-50
                    text-xl
                    text-blue-600
                    transition-transform duration-300
                    group-hover:scale-105
                  "
                >
                  🚚
                </div>

                <h3 className="mt-5 text-lg font-bold text-gray-900">
                  Fast delivery
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Quick and reliable shipping so your favorite products reach
                  you without unnecessary delays.
                </p>
              </div>

              {/* Payment */}
              <div
                className="
                  group rounded-2xl
                  border border-gray-100
                  bg-gray-50/60
                  p-7
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:bg-white
                  hover:shadow-lg
                "
              >
                <div
                  className="
                    flex h-12 w-12 items-center justify-center
                    rounded-xl
                    bg-purple-50
                    text-xl
                    text-purple-600
                    transition-transform duration-300
                    group-hover:scale-105
                  "
                >
                  💳
                </div>

                <h3 className="mt-5 text-lg font-bold text-gray-900">
                  Secure payment
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Safe and secure payment methods designed to keep your
                  checkout experience comfortable.
                </p>
              </div>

            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
