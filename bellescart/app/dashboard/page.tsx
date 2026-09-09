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
import {
  useFeaturedProducts,
  useProductsByCategory,
} from '@/hooks/user/useProductQueries';
import { usePublicCategories } from '@/hooks/user/usePublicProductQueries';
import { SearchBar } from '@/components';

export default function DashboardPage() {
  const router = useRouter();

  const {
    isAuthenticated,
    loaded,
    user,
  } = useAuth();

  const [showLoading, setShowLoading] =
    useState(false);

  const [showWelcome, setShowWelcome] =
    useState(false);

  const [mounted, setMounted] =
    useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const justLoggedIn =
      localStorage.getItem('justLoggedIn') === 'true';

    setShowLoading(justLoggedIn);

    const welcomeShown =
      localStorage.getItem('welcomeShown');

    if (welcomeShown === 'false') {
      setShowWelcome(true);
    }
  }, [mounted, isAuthenticated]);

  const {
    data: featuredData,
    isLoading: isLoadingFeatured,
  } = useFeaturedProducts(8);

  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
  } = usePublicCategories();

  const {
    data: newArrivalsData,
    isLoading: isLoadingNewArrivals,
  } = useFeaturedProducts(4);

  const featuredProducts =
    featuredData?.data?.products || [];

  const categories =
    categoriesData?.data?.categories || [];

  const newArrivals =
    newArrivalsData?.data?.products || [];

  const isLoading =
    isLoadingFeatured ||
    isLoadingCategories ||
    isLoadingNewArrivals;

  const isReady =
    mounted && loaded;

  useEffect(() => {
    if (loaded && !isAuthenticated) {
      router.replace('/');
    }
  }, [
    loaded,
    isAuthenticated,
    router,
  ]);

  const getProductImage = (product: any) => {
    return (
      product.images?.find(
        (img: any) => img.isMain
      )?.url ||
      product.images?.[0]?.url ||
      product.image ||
      ''
    );
  };

  const getCategoryImage = (
    categoryName: string
  ) => {
    const categoryImages: Record<
      string,
      string
    > = {
      Rings:
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=700&q=80',

      Necklaces:
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=700&q=80',

      Earrings:
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=700&q=80',

      Bracelets:
        'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=700&q=80',

      Anklets:
        'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=700&q=80',

      Pendants:
        'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=700&q=80',

      Jewelry:
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=700&q=80',
    };

    return (
      categoryImages[categoryName] ||
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=700&q=80'
    );
  };

  return (
    <>
      <LoadingOverlay
        isVisible={showLoading}
        onComplete={() => {
          setShowLoading(false);
          localStorage.removeItem(
            'justLoggedIn'
          );
        }}
      />

      <WelcomeOverlay
        isVisible={showWelcome}
        onComplete={() =>
          setShowWelcome(false)
        }
        userName={user?.name}
      />

      {!isReady ? (
        <Loader
          size="lg"
          text="Loading..."
          fullScreen
        />
      ) : (
        <div
          className={`
            min-h-screen
            flex
            flex-col
            bg-[#fcfafb]
            transition-opacity
            duration-700
            ${
              showLoading
                ? 'opacity-0'
                : 'opacity-100'
            }
          `}
        >
          <Navbar />

          <main className="flex-1">

            {/* =====================================================
                HERO
            ====================================================== */}
            <section className="relative overflow-hidden bg-[#21151d]">

              <div className="absolute inset-0">
                <img
                  src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=2000&q=85"
                  alt=""
                  className="h-full w-full object-cover object-center opacity-75"
                />

                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/20" />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
              </div>

              {/* Decorative glow */}
              <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-pink-500/20 blur-3xl" />

              <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />

              <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-32">

                <div className="max-w-2xl">

                  <div className="mb-6 flex items-center gap-3">
                    <span className="h-px w-10 bg-pink-300" />

                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-pink-200">
                      Welcome back
                    </span>
                  </div>

                  <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                    {user?.name
                      ? `Hello, ${user.name}`
                      : 'Welcome to BellesCart'}
                  </h1>

                  <p className="mt-6 max-w-xl text-base leading-7 text-white/70 sm:text-lg">
                    Discover beautiful pieces,
                    explore new collections, and
                    find something made for your
                    style.
                  </p>

                  {/* Search */}
                  <div className="mt-8 max-w-xl">
                    <div className="rounded-2xl bg-white/10 p-2 backdrop-blur-md border border-white/15">
                      <div className="overflow-hidden rounded-xl bg-white text-gray-900">
                        <SearchBar
                          placeholder="Search jewelry, rings, necklaces..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">

                    <Link href="/products">
                      <Button
                        size="lg"
                        className="
                          w-full
                          rounded-xl
                          bg-white
                          px-7
                          py-3.5
                          font-semibold
                          text-pink-700
                          shadow-xl
                          transition-all
                          hover:-translate-y-0.5
                          hover:bg-pink-50
                          sm:w-auto
                        "
                      >
                        Explore collection
                      </Button>
                    </Link>

                    <Link href="/wishlist">
                      <Button
                        size="lg"
                        variant="outline"
                        className="
                          w-full
                          rounded-xl
                          border-white/40
                          bg-white/5
                          px-7
                          py-3.5
                          font-semibold
                          text-white
                          backdrop-blur-sm
                          transition-all
                          hover:bg-white
                          hover:text-pink-700
                          sm:w-auto
                        "
                      >
                        View wishlist
                      </Button>
                    </Link>

                  </div>
                </div>

                {/* Hero bottom stats */}
                <div className="mt-16 grid max-w-lg grid-cols-3 border-t border-white/15 pt-7">

                  <div>
                    <div className="text-xl font-semibold text-white">
                      500+
                    </div>

                    <div className="mt-1 text-xs text-white/50">
                      Products
                    </div>
                  </div>

                  <div className="border-l border-white/15 pl-5">
                    <div className="text-xl font-semibold text-white">
                      50+
                    </div>

                    <div className="mt-1 text-xs text-white/50">
                      Categories
                    </div>
                  </div>

                  <div className="border-l border-white/15 pl-5">
                    <div className="text-xl font-semibold text-white">
                      4.9
                      <span className="ml-1 text-pink-300">
                        ★
                      </span>
                    </div>

                    <div className="mt-1 text-xs text-white/50">
                      Customer rating
                    </div>
                  </div>

                </div>

              </div>
            </section>

            {/* =====================================================
                QUICK ACCESS
            ====================================================== */}
            <section className="relative z-10 -mt-8 px-5 sm:px-8 lg:px-10">

              <div className="mx-auto max-w-7xl">

                <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_18px_50px_rgba(30,20,30,0.10)] sm:grid-cols-3">

                  <Link
                    href="/products"
                    className="group border-b border-gray-100 p-5 transition-colors hover:bg-pink-50/40 sm:border-b-0 sm:border-r"
                  >
                    <div className="flex items-center gap-4">

                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-pink-50 text-pink-600 transition-transform group-hover:scale-105">
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.7}
                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                          />
                        </svg>
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900">
                          Shop now
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                          Browse the collection
                        </p>
                      </div>

                      <svg
                        className="ml-auto h-4 w-4 text-gray-300 transition-all group-hover:translate-x-1 group-hover:text-pink-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.7}
                          d="M5 12h14M13 6l6 6-6 6"
                        />
                      </svg>

                    </div>
                  </Link>

                  <Link
                    href="/cart"
                    className="group border-b border-gray-100 p-5 transition-colors hover:bg-purple-50/40 sm:border-b-0 sm:border-r"
                  >
                    <div className="flex items-center gap-4">

                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition-transform group-hover:scale-105">
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.7}
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Your cart
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                          View saved items
                        </p>
                      </div>

                      <svg
                        className="ml-auto h-4 w-4 text-gray-300 transition-all group-hover:translate-x-1 group-hover:text-purple-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.7}
                          d="M5 12h14M13 6l6 6-6 6"
                        />
                      </svg>

                    </div>
                  </Link>

                  <Link
                    href="/orders"
                    className="group p-5 transition-colors hover:bg-blue-50/40"
                  >
                    <div className="flex items-center gap-4">

                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-transform group-hover:scale-105">
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.7}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m-8-4V7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Your orders
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                          Track your purchases
                        </p>
                      </div>

                      <svg
                        className="ml-auto h-4 w-4 text-gray-300 transition-all group-hover:translate-x-1 group-hover:text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.7}
                          d="M5 12h14M13 6l6 6-6 6"
                        />
                      </svg>

                    </div>
                  </Link>

                </div>
              </div>
            </section>

            {/* =====================================================
                CATEGORIES
            ====================================================== */}
            <section className="px-5 py-20 sm:px-8 lg:px-10">

              <div className="mx-auto max-w-7xl">

                <div className="mb-10 flex items-end justify-between gap-5">

                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-pink-500">
                      Explore
                    </p>

                    <h2 className="text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">
                      Shop by category
                    </h2>

                    <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
                      Explore our curated collections
                      and find pieces that match your
                      personal style.
                    </p>
                  </div>

                  <Link
                    href="/products"
                    className="hidden text-sm font-semibold text-pink-600 hover:text-pink-700 sm:block"
                  >
                    View all
                    <span className="ml-2">→</span>
                  </Link>

                </div>

                {isLoading ? (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">

                    {[1, 2, 3, 4, 5, 6].map(
                      (item) => (
                        <div
                          key={item}
                          className="overflow-hidden rounded-2xl bg-white"
                        >
                          <div className="aspect-square animate-pulse bg-gray-100" />

                          <div className="p-4">
                            <div className="h-4 animate-pulse rounded bg-gray-100" />
                          </div>
                        </div>
                      )
                    )}

                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">

                    {categories
                      .slice(0, 6)
                      .map((category) => {

                        const image =
                          getCategoryImage(
                            category.name
                          );

                        return (
                          <Link
                            key={category._id}
                            href={`/products?category=${category.name}`}
                            className="group"
                          >
                            <div className="overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">

                              <div className="relative aspect-square overflow-hidden bg-gray-100">

                                <Image
                                  src={image}
                                  alt={category.name}
                                  fill
                                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-70" />

                              </div>

                              <div className="p-4">

                                <h3 className="truncate text-sm font-semibold text-gray-900 transition-colors group-hover:text-pink-600">
                                  {category.name}
                                </h3>

                                <div className="mt-1 text-xs text-gray-400">
                                  Explore collection →
                                </div>

                              </div>

                            </div>
                          </Link>
                        );
                      })}

                  </div>
                )}

                <Link
                  href="/products"
                  className="mt-6 block text-center text-sm font-semibold text-pink-600 sm:hidden"
                >
                  View all categories →
                </Link>

              </div>
            </section>

            {/* =====================================================
                FEATURED
            ====================================================== */}
            <section className="border-y border-gray-100 bg-white px-5 py-20 sm:px-8 lg:px-10">

              <div className="mx-auto max-w-7xl">

                <div className="mb-10 flex items-end justify-between gap-5">

                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-pink-500">
                      Curated for you
                    </p>

                    <h2 className="text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">
                      Featured pieces
                    </h2>

                    <p className="mt-3 text-sm text-gray-500">
                      Handpicked from our collection.
                    </p>
                  </div>

                  <Link
                    href="/products"
                    className="hidden text-sm font-semibold text-pink-600 hover:text-pink-700 sm:block"
                  >
                    View all →
                  </Link>

                </div>

                {isLoading ? (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    {[1, 2, 3, 4].map(
                      (item) => (
                        <div
                          key={item}
                          className="overflow-hidden rounded-2xl bg-white"
                        >
                          <div className="aspect-[4/5] animate-pulse bg-gray-100" />

                          <div className="space-y-3 p-4">
                            <div className="h-4 animate-pulse rounded bg-gray-100" />
                            <div className="h-5 w-24 animate-pulse rounded bg-gray-100" />
                          </div>
                        </div>
                      )
                    )}

                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">

                    {featuredProducts.map(
                      (
                        product: any,
                        index: number
                      ) => {

                        const mainImage =
                          getProductImage(product);

                        const isAboveFold =
                          index < 4;

                        const hasDiscount =
                          product.originalPrice &&
                          product.originalPrice >
                            product.price;

                        return (
                          <Link
                            key={
                              product._id ||
                              `product-${index}`
                            }
                            href={`/product/${product._id}`}
                            className="group"
                          >

                            <article>

                              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-gray-100">

                                {mainImage ? (
                                  <Image
                                    src={mainImage}
                                    alt={
                                      product.name
                                    }
                                    fill
                                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    loading={
                                      isAboveFold
                                        ? 'eager'
                                        : 'lazy'
                                    }
                                    priority={
                                      isAboveFold
                                    }
                                  />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                    <svg
                                      className="h-12 w-12 text-gray-300"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                      />
                                    </svg>
                                  </div>
                                )}

                                {hasDiscount && (
                                  <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-pink-600 shadow-sm">
                                    {Math.round(
                                      ((product.originalPrice -
                                        product.price) /
                                        product.originalPrice) *
                                        100
                                    )}
                                    % off
                                  </span>
                                )}

                              </div>

                              <div className="pt-4">

                                <h3 className="truncate text-sm font-semibold text-gray-900 transition-colors group-hover:text-pink-600">
                                  {product.name}
                                </h3>

                                <div className="mt-2 flex items-center gap-2">

                                  <span className="text-base font-bold text-gray-950">
                                    ₹
                                    {product.price}
                                  </span>

                                  {hasDiscount && (
                                    <span className="text-xs text-gray-400 line-through">
                                      ₹
                                      {
                                        product.originalPrice
                                      }
                                    </span>
                                  )}

                                </div>

                              </div>

                            </article>

                          </Link>
                        );
                      }
                    )}

                  </div>
                )}

              </div>
            </section>

            {/* =====================================================
                NEW ARRIVALS
            ====================================================== */}
            <section className="bg-[#f8f4f7] px-5 py-20 sm:px-8 lg:px-10">

              <div className="mx-auto max-w-7xl">

                <div className="mb-10 flex items-end justify-between gap-5">

                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-purple-500">
                      Just arrived
                    </p>

                    <h2 className="text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">
                      New arrivals
                    </h2>

                    <p className="mt-3 text-sm text-gray-500">
                      Fresh additions to the collection.
                    </p>
                  </div>

                  <Link
                    href="/products?sort=newest"
                    className="hidden text-sm font-semibold text-purple-600 hover:text-purple-700 sm:block"
                  >
                    See all →
                  </Link>

                </div>

                {isLoading ? (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    {[1, 2, 3, 4].map(
                      (item) => (
                        <div
                          key={item}
                          className="overflow-hidden rounded-2xl bg-white"
                        >
                          <div className="aspect-[4/5] animate-pulse bg-gray-100" />

                          <div className="space-y-3 p-4">
                            <div className="h-4 animate-pulse rounded bg-gray-100" />
                            <div className="h-5 w-24 animate-pulse rounded bg-gray-100" />
                          </div>
                        </div>
                      )
                    )}

                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">

                    {newArrivals.map(
                      (
                        product: any,
                        index: number
                      ) => {

                        const mainImage =
                          getProductImage(product);

                        const isAboveFold =
                          index < 4;

                        return (
                          <Link
                            key={
                              product._id ||
                              `new-${index}`
                            }
                            href={`/product/${product._id}`}
                            className="group"
                          >

                            <article>

                              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-white">

                                {mainImage ? (
                                  <Image
                                    src={mainImage}
                                    alt={
                                      product.name
                                    }
                                    fill
                                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    loading={
                                      isAboveFold
                                        ? 'eager'
                                        : 'lazy'
                                    }
                                    priority={
                                      isAboveFold
                                    }
                                  />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                    <svg
                                      className="h-12 w-12 text-gray-300"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                      />
                                    </svg>
                                  </div>
                                )}

                                <span className="absolute left-3 top-3 rounded-full bg-gray-950 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white">
                                  New
                                </span>

                              </div>

                              <div className="pt-4">

                                <h3 className="truncate text-sm font-semibold text-gray-900 transition-colors group-hover:text-purple-600">
                                  {product.name}
                                </h3>

                                <p className="mt-2 text-base font-bold text-gray-950">
                                  ₹
                                  {product.price}
                                </p>

                              </div>

                            </article>

                          </Link>
                        );
                      }
                    )}

                  </div>
                )}

              </div>
            </section>

            {/* =====================================================
                OFFER
            ====================================================== */}
            <section className="px-5 py-16 sm:px-8 lg:px-10">

              <div className="mx-auto max-w-7xl">

                <div className="relative overflow-hidden rounded-3xl bg-[#25151f]">

                  <img
                    src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1800&q=80"
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover opacity-35"
                  />

                  <div className="absolute inset-0 bg-gradient-to-r from-[#25151f] via-[#25151f]/80 to-transparent" />

                  <div className="relative px-7 py-14 sm:px-12 sm:py-16 lg:px-16">

                    <div className="max-w-xl">

                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-pink-300">
                        A little something for you
                      </p>

                      <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                        Special offer
                      </h2>

                      <p className="mt-3 text-base text-white/65">
                        Get 20% off on your first
                        order.
                      </p>

                      <Link
                        href="/products"
                        className="mt-7 inline-block"
                      >
                        <Button
                          size="lg"
                          className="rounded-xl bg-white px-7 font-semibold text-pink-700 shadow-xl hover:bg-pink-50"
                        >
                          Shop now
                        </Button>
                      </Link>

                    </div>

                  </div>
                </div>

              </div>
            </section>

            {/* =====================================================
                TRUST
            ====================================================== */}
            <section className="border-t border-gray-100 bg-white px-5 py-16 sm:px-8 lg:px-10">

              <div className="mx-auto max-w-7xl">

                <div className="mb-12 text-center">

                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-pink-500">
                    BellesCart promise
                  </p>

                  <h2 className="text-3xl font-semibold tracking-tight text-gray-950">
                    Shopping with confidence
                  </h2>

                </div>

                <div className="grid grid-cols-2 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">

                  <div className="text-center">

                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">

                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.7}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>

                    </div>

                    <h3 className="mt-4 text-sm font-semibold text-gray-900">
                      Quality guaranteed
                    </h3>

                    <p className="mx-auto mt-2 max-w-[180px] text-xs leading-5 text-gray-500">
                      Premium products from trusted brands
                    </p>

                  </div>

                  <div className="text-center">

                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">

                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.7}
                          d="M3 7h11v10H3zM14 10h4l3 3v4h-7zM7 20a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4z"
                        />
                      </svg>

                    </div>

                    <h3 className="mt-4 text-sm font-semibold text-gray-900">
                      Fast delivery
                    </h3>

                    <p className="mx-auto mt-2 max-w-[180px] text-xs leading-5 text-gray-500">
                      Quick and reliable shipping
                    </p>

                  </div>

                  <div className="text-center">

                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-purple-600">

                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.7}
                          d="M12 3l7 4v5c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V7l7-4z"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.7}
                          d="M9 12l2 2 4-4"
                        />
                      </svg>

                    </div>

                    <h3 className="mt-4 text-sm font-semibold text-gray-900">
                      Secure payment
                    </h3>

                    <p className="mx-auto mt-2 max-w-[180px] text-xs leading-5 text-gray-500">
                      Safe and secure payment methods
                    </p>

                  </div>

                  <div className="text-center">

                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-pink-50 text-pink-600">

                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.7}
                          d="M4 12a8 8 0 0113.9-5.3L20 9M20 4v5h-5M20 12a8 8 0 01-13.9 5.3L4 15m0 5v-5h5"
                        />
                      </svg>

                    </div>

                    <h3 className="mt-4 text-sm font-semibold text-gray-900">
                      Easy returns
                    </h3>

                    <p className="mx-auto mt-2 max-w-[180px] text-xs leading-5 text-gray-500">
                      Hassle-free return policy
                    </p>

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