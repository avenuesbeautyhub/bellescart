'use client';

import React, { useEffect, useState } from 'react';
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
import CouponSection from '@/components/CouponSection/CouponSection';


/**
 * Automatically cycles through all available product images with a
 * smooth cross-fade. Rotation pauses while the customer hovers the card.
 */
function ProductImageCarousel({
  product,
  priority = false,
}: {
  product: any;
  priority?: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const images = React.useMemo(() => {
    const productImages = Array.isArray(product?.images)
      ? product.images
        .filter((img: any) => img?.url)
        .sort(
          (a: any, b: any) =>
            Number(Boolean(b?.isMain)) - Number(Boolean(a?.isMain))
        )
        .map((img: any) => img.url)
      : [];

    const fallback = product?.image;

    // Remove duplicate URLs while preserving the main-image-first order.
    return Array.from(
      new Set<string>(
        productImages.length > 0
          ? productImages
          : fallback
            ? [fallback]
            : []
      )
    );
  }, [product]);

  useEffect(() => {
    if (images.length <= 1 || isHovered) return;

    // Add random initial delay (0-5000ms) so carousels don't all change at once
    const randomDelay = Math.random() * 5000;

    const timeout = window.setTimeout(() => {
      const interval = window.setInterval(() => {
        setActiveIndex((current) => (current + 1) % images.length);
      }, 5000);

      return () => window.clearInterval(interval);
    }, randomDelay);

    return () => window.clearTimeout(timeout);
  }, [images.length, isHovered]);

  useEffect(() => {
    setActiveIndex(0);
  }, [product?._id]);

  if (images.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-gray-300">
        No image
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {images.map((image: string, index: number) => (
        <Image
          key={`${image}-${index}`}
          src={image}
          alt={product?.name || "Product image"}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
          priority={priority && index === 0}
          loading={priority && index === 0 ? "eager" : "lazy"}
          className={`
            object-cover
            transition-opacity duration-1000 ease-in-out
            ${index === activeIndex ? "opacity-100" : "opacity-0"}
          `}
        />
      ))}

      {images.length > 1 && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/20 px-2.5 py-1.5 backdrop-blur-sm">
          {images.map((_: string, index: number) => (
            <span
              key={index}
              className={`
                h-1.5 rounded-full transition-all duration-500
                ${index === activeIndex
                  ? "w-4 bg-white"
                  : "w-1.5 bg-white/50"
                }
              `}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  const { isAuthenticated, loaded, user } = useAuth();

  const [showLoading, setShowLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [mounted, setMounted] = useState(false);

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

  // Randomly select 4 featured products each time
  const randomFeaturedProducts = React.useMemo(() => {
    if (featuredProducts.length === 0) return [];

    // Shuffle array using Fisher-Yates algorithm
    const shuffled = [...featuredProducts];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Return first 4 items
    return shuffled.slice(0, 4);
  }, [featuredProducts]);

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
  }, [loaded, isAuthenticated, router]);

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
    const categoryImages: Record<string, string> = {
      Ring:
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=85',

      Necklace:
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85',

      Earring:
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=85',

      Bracelet:
        'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=85',

      Anklet:
        'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=85',

      Pendants:
        'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=900&q=85',

      Jewelry:
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=85',
    };

    return (
      categoryImages[categoryName] ||
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=85'
    );
  };

  const getDiscount = (product: any) => {
    if (
      !product.originalPrice ||
      product.originalPrice <= product.price
    ) {
      return null;
    }

    return Math.round(
      ((product.originalPrice - product.price) /
        product.originalPrice) *
      100
    );
  };

  const getRating = (product: any) => {
    return (
      product.rating ??
      product.averageRating ??
      4.8
    );
  };

  return (
    <>
      <LoadingOverlay
        isVisible={showLoading}
        onComplete={() => {
          setShowLoading(false);
          localStorage.removeItem('justLoggedIn');
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
            bg-[#faf8f9]
            text-gray-950
            transition-opacity
            duration-700
            ${showLoading
              ? 'opacity-0'
              : 'opacity-100'
            }
          `}
        >
          <Navbar />

          <main className="flex-1 overflow-hidden">

            {/* =========================================================
                HERO
            ========================================================== */}
            <section className="relative isolate min-h-[680px] overflow-hidden bg-[#1d1119] sm:min-h-[720px]">

              <Image
                src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=2200&q=90"
                alt="BellesCart jewelry collection"
                fill
                priority
                sizes="100vw"
                className="object-cover object-center"
              />

              {/* Editorial overlays */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#160d13]/95 via-[#21131c]/65 to-[#21131c]/15" />

              <div className="absolute inset-0 bg-gradient-to-t from-[#160d13]/90 via-transparent to-[#160d13]/20" />

              {/* Ambient decoration */}
              <div className="absolute -left-40 top-32 h-96 w-96 rounded-full bg-fuchsia-500/15 blur-[100px]" />

              <div className="absolute -right-40 bottom-10 h-[500px] w-[500px] rounded-full bg-purple-500/15 blur-[120px]" />

              <div className="relative mx-auto flex min-h-[680px] max-w-7xl items-center px-5 py-20 sm:min-h-[720px] sm:px-8 lg:px-10">

                <div className="w-full max-w-3xl">

                  {/* Eyebrow */}
                  <div className="mb-7 flex items-center gap-3">
                    <span className="h-px w-12 bg-pink-300/80" />

                    <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-pink-200 sm:text-xs">
                      The new season collection
                    </span>
                  </div>

                  {/* Heading */}
                  <h1 className="max-w-3xl text-5xl font-medium leading-[0.98] tracking-[-0.04em] text-white sm:text-6xl lg:text-8xl">
                    Jewelry that
                    <span className="block font-serif italic text-pink-200">
                      feels like you.
                    </span>
                  </h1>

                  <p className="mt-7 max-w-xl text-sm leading-7 text-white/65 sm:text-base sm:leading-8">
                    Welcome back
                    {user?.name
                      ? `, ${user.name}`
                      : ''}.
                    Discover timeless pieces,
                    contemporary designs, and
                    little details made to become
                    part of your story.
                  </p>

                  {/* Search */}
                  <div className="mt-9 max-w-2xl">
                    <div className="rounded-[20px] border border-white/15 bg-white/10 p-1.5 shadow-2xl backdrop-blur-xl">
                      <div className="overflow-hidden rounded-[14px] bg-white">
                        <SearchBar
                          placeholder="Search rings, earrings, necklaces..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">

                    <Link
                      href="/products"
                      className="w-full sm:w-auto"
                    >
                      <Button
                        size="lg"
                        className="
                          w-full
                          rounded-full
                          border-0
                          bg-white
                          px-8
                          py-3.5
                          font-semibold
                          text-[#8f315f]
                          shadow-xl
                          transition-all
                          duration-300
                          hover:-translate-y-1
                          hover:bg-pink-50
                          hover:shadow-2xl
                          sm:w-auto
                        "
                      >
                        Explore collection
                        <span className="ml-2">
                          →
                        </span>
                      </Button>
                    </Link>

                    <Link
                      href="/wishlist"
                      className="w-full sm:w-auto"
                    >
                      <Button
                        size="lg"
                        variant="outline"
                        className="
                          w-full
                          rounded-full
                          border-white/25
                          bg-white/5
                          px-8
                          py-3.5
                          font-semibold
                          text-white
                          backdrop-blur-md
                          transition-all
                          duration-300
                          hover:-translate-y-1
                          hover:border-white
                          hover:bg-white
                          hover:text-[#8f315f]
                          sm:w-auto
                        "
                      >
                        View wishlist
                      </Button>
                    </Link>

                  </div>

                  {/* Stats */}
                  <div className="mt-12 flex max-w-xl divide-x divide-white/15 border-t border-white/15 pt-7">

                    <div className="flex-1 pr-5">
                      <p className="text-xl font-semibold text-white sm:text-2xl">
                        500+
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-wider text-white/40">
                        Pieces
                      </p>
                    </div>

                    <div className="flex-1 px-5">
                      <p className="text-xl font-semibold text-white sm:text-2xl">
                        50+
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-wider text-white/40">
                        Collections
                      </p>
                    </div>

                    <div className="flex-1 pl-5">
                      <p className="text-xl font-semibold text-white sm:text-2xl">
                        4.9
                        <span className="ml-1 text-sm text-pink-300">
                          ★
                        </span>
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-wider text-white/40">
                        Loved by customers
                      </p>
                    </div>

                  </div>

                </div>

                {/* Floating editorial card */}
                <div className="absolute bottom-10 right-8 hidden w-64 overflow-hidden rounded-2xl border border-white/15 bg-white/10 shadow-2xl backdrop-blur-xl lg:block xl:right-16">

                  <div className="relative h-32">
                    <Image
                      src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=700&q=85"
                      alt="Featured jewelry"
                      fill
                      sizes="256px"
                      className="object-cover"
                    />

                    <div className="absolute inset-0 bg-black/15" />

                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-gray-800">
                      Featured
                    </span>
                  </div>

                  <div className="p-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">
                      Curated for you
                    </p>

                    <p className="mt-1 text-sm font-semibold text-white">
                      Everyday elegance
                    </p>

                    <Link
                      href="/products"
                      className="mt-3 inline-flex text-xs font-semibold text-pink-200 transition-colors hover:text-white"
                    >
                      Discover pieces →
                    </Link>
                  </div>

                </div>

              </div>
            </section>

            {/* =========================================================
                QUICK ACCESS
            ========================================================== */}
            <section className="relative z-10 -mt-8 px-4 sm:px-8 lg:px-10">

              <div className="mx-auto max-w-7xl">

                <div className="grid overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_25px_70px_rgba(30,15,30,0.12)] sm:grid-cols-3">

                  <Link
                    href="/products"
                    className="group relative p-6 transition-all duration-300 hover:bg-[#fff8fb] sm:p-7"
                  >
                    <div className="flex items-center gap-4">

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fdf0f6] text-[#b63c71] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#f8dce9]">
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

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                          Discover
                        </p>

                        <h3 className="mt-1 text-sm font-semibold text-gray-900">
                          Shop collection
                        </h3>
                      </div>

                      <span className="ml-auto text-gray-300 transition-all group-hover:translate-x-1 group-hover:text-[#b63c71]">
                        →
                      </span>

                    </div>
                  </Link>

                  <Link
                    href="/wishlist"
                    className="group border-y border-gray-100 p-6 transition-all duration-300 hover:bg-[#faf7ff] sm:border-x sm:border-y-0 sm:p-7"
                  >
                    <div className="flex items-center gap-4">

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-purple-100">
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
                            d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"
                          />
                        </svg>
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                          Your picks
                        </p>

                        <h3 className="mt-1 text-sm font-semibold text-gray-900">
                          Wishlist
                        </h3>
                      </div>

                      <span className="ml-auto text-gray-300 transition-all group-hover:translate-x-1 group-hover:text-purple-600">
                        →
                      </span>

                    </div>
                  </Link>

                  <Link
                    href="/orders"
                    className="group p-6 transition-all duration-300 hover:bg-[#f7faff] sm:p-7"
                  >
                    <div className="flex items-center gap-4">

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-100">
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
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                          Purchases
                        </p>

                        <h3 className="mt-1 text-sm font-semibold text-gray-900">
                          Your orders
                        </h3>
                      </div>

                      <span className="ml-auto text-gray-300 transition-all group-hover:translate-x-1 group-hover:text-blue-600">
                        →
                      </span>

                    </div>
                  </Link>

                </div>
              </div>
            </section>

            {/* =========================================================
                ACTIVE COUPONS SECTION
            ========================================================== */}
            <section className="relative overflow-hidden bg-gradient-to-b from-[#fff7fa] via-white to-white px-5 py-16 sm:px-8 lg:px-10">
              {/* Ambient decoration */}
              <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-pink-200/20 blur-3xl" />
              <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-purple-200/20 blur-3xl" />

              <div className="relative mx-auto max-w-7xl">
                {/* Section heading */}
                <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                  <div>
                    <div className="mb-4 flex items-center gap-3">
                      <span className="h-px w-10 bg-gradient-to-r from-pink-500 to-purple-500" />

                      <span className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#b63c71]">
                        Limited time offers
                      </span>
                    </div>

                    <h2 className="text-3xl font-medium tracking-[-0.04em] text-gray-950 sm:text-4xl">
                      Save a little,
                      <span className="ml-2 font-serif italic text-[#b63c71]">
                        shop beautifully.
                      </span>
                    </h2>

                    <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
                      Exclusive offers curated for you. Use these coupons before
                      they disappear.
                    </p>
                  </div>

                  {/* Decorative offer indicator */}
                  <div className="hidden items-center gap-2 rounded-full border border-pink-100 bg-white px-4 py-2 shadow-sm sm:flex">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink-400 opacity-60" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-pink-500" />
                    </span>

                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                      Offers ending soon
                    </span>
                  </div>
                </div>

                <CouponSection maxCoupons={3} />
              </div>
            </section>


            {/* =========================================================
                CATEGORY DISCOVERY
            ========================================================== */}
            <section className="px-5 py-24 sm:px-8 lg:px-10">

              <div className="mx-auto max-w-7xl">

                <div className="mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

                  <div>
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-[#b63c71]">
                      Explore your style
                    </p>

                    <h2 className="text-3xl font-medium tracking-[-0.03em] text-gray-950 sm:text-4xl lg:text-5xl">
                      Find your
                      <span className="font-serif italic">
                        {" "}signature.
                      </span>
                    </h2>

                    <p className="mt-4 max-w-xl text-sm leading-7 text-gray-500">
                      From everyday essentials to
                      statement pieces, discover
                      collections designed for every
                      version of you.
                    </p>
                  </div>

                  <Link
                    href="/products"
                    className="group inline-flex items-center text-sm font-semibold text-gray-900"
                  >
                    View all collections
                    <span className="ml-2 transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </Link>

                </div>

                {isLoading ? (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                    {[1, 2, 3, 4, 5, 6].map(
                      (item) => (
                        <div
                          key={item}
                          className="overflow-hidden rounded-3xl bg-white"
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
                      .map((category, index) => {

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
                            <article className="relative overflow-hidden rounded-3xl bg-gray-100">

                              <div className="relative aspect-[0.88] overflow-hidden">

                                <Image
                                  src={image}
                                  alt={category.name}
                                  fill
                                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">

                                  <span className="text-[9px] uppercase tracking-[0.2em] text-white/55">
                                    Collection 0{index + 1}
                                  </span>

                                  <h3 className="mt-1 text-sm font-semibold text-white sm:text-base">
                                    {category.name}
                                  </h3>

                                  <span className="mt-2 block translate-y-2 text-[10px] font-medium text-white/0 transition-all duration-300 group-hover:translate-y-0 group-hover:text-white/80">
                                    Explore →
                                  </span>

                                </div>

                              </div>

                            </article>
                          </Link>
                        );
                      })}

                  </div>
                )}

                <Link
                  href="/products"
                  className="mt-8 block text-center text-sm font-semibold text-[#b63c71] sm:hidden"
                >
                  Explore all collections →
                </Link>

              </div>
            </section>

            {/* =========================================================
                FEATURED PRODUCTS (WITH CAROUSEL)
            ========================================================== */}
            <section className="relative bg-white px-5 py-24 sm:px-8 lg:px-10">

              <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

              <div className="mx-auto max-w-7xl">

                <div className="mb-12 flex items-end justify-between gap-5">

                  <div>
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-[#b63c71]">
                      Curated selection
                    </p>

                    <h2 className="text-3xl font-medium tracking-[-0.03em] text-gray-950 sm:text-4xl lg:text-5xl">
                      Pieces worth
                      <span className="font-serif italic">
                        {" "}keeping.
                      </span>
                    </h2>

                    <p className="mt-4 text-sm text-gray-500">
                      Our most-loved pieces, selected
                      for you.
                    </p>
                  </div>

                  <Link
                    href="/products"
                    className="group hidden items-center text-sm font-semibold text-gray-900 sm:flex"
                  >
                    Shop all
                    <span className="ml-2 transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </Link>

                </div>

                {isLoading ? (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-6">
                    {[1, 2, 3, 4].map(
                      (item) => (
                        <div key={item}>
                          <div className="aspect-[4/5] animate-pulse rounded-3xl bg-gray-100" />
                          <div className="mt-4 space-y-3">
                            <div className="h-4 animate-pulse rounded bg-gray-100" />
                            <div className="h-5 w-24 animate-pulse rounded bg-gray-100" />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4 lg:gap-7">

                    {randomFeaturedProducts.map(
                      (
                        product: any,
                        index: number
                      ) => {

                        const mainImage =
                          getProductImage(product);

                        const discount =
                          getDiscount(product);

                        const rating =
                          getRating(product);

                        return (
                          <Link
                            key={
                              product._id ||
                              `featured-${index}`
                            }
                            href={`/product/${product._id}`}
                            className="group"
                          >
                            <article>

                              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-[#f5f3f4]">

                                <ProductImageCarousel
                                  product={product}
                                  priority={true}
                                />

                                {/* Image overlay */}
                                <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5" />

                                {/* Badge */}
                                {discount && (
                                  <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-[#b63c71] shadow-lg">
                                    {discount}% off
                                  </span>
                                )}

                                {/* Floating arrow */}
                                <div className="absolute bottom-4 right-4 flex h-10 w-10 translate-y-3 items-center justify-center rounded-full bg-white/95 text-gray-900 opacity-0 shadow-xl transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                  →
                                </div>

                              </div>

                              <div className="pt-5">

                                <div className="flex items-start justify-between gap-3">

                                  <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-gray-900 transition-colors group-hover:text-[#b63c71]">
                                    {product.name}
                                  </h3>

                                </div>

                                <div className="mt-2 flex items-center gap-2">

                                  <span className="text-base font-bold text-gray-950">
                                    ₹{product.price}
                                  </span>

                                  {discount && (
                                    <span className="text-xs text-gray-400 line-through">
                                      ₹
                                      {
                                        product.originalPrice
                                      }
                                    </span>
                                  )}

                                </div>

                                <div className="mt-2 flex items-center gap-1.5">

                                  <span className="text-[11px] font-medium text-gray-500">
                                    {rating}
                                  </span>

                                  <span className="text-[11px] text-amber-400">
                                    ★
                                  </span>

                                  <span className="text-[10px] text-gray-400">
                                    Loved by customers
                                  </span>

                                </div>

                              </div>

                            </article>
                          </Link>
                        );
                      }
                    )}

                  </div>
                )}

                <Link
                  href="/products"
                  className="mt-10 block rounded-full border border-gray-200 py-3 text-center text-sm font-semibold text-gray-900 transition-colors hover:border-gray-900 hover:bg-gray-950 hover:text-white sm:hidden"
                >
                  Shop all pieces →
                </Link>

              </div>
            </section>

            {/* =========================================================
                EDITORIAL COLLECTION
            ========================================================== */}
            <section className="px-5 py-16 sm:px-8 lg:px-10">

              <div className="mx-auto max-w-7xl">

                <div className="relative min-h-[480px] overflow-hidden rounded-[32px] bg-[#21131c]">

                  <Image
                    src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=2000&q=90"
                    alt="Jewelry collection"
                    fill
                    sizes="100vw"
                    className="object-cover object-center"
                  />

                  <div className="absolute inset-0 bg-gradient-to-r from-[#1b1017] via-[#1b1017]/65 to-transparent" />

                  <div className="relative flex min-h-[480px] items-center px-7 py-14 sm:px-12 lg:px-16">

                    <div className="max-w-xl">

                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-pink-200">
                        The art of everyday
                      </p>

                      <h2 className="mt-4 text-4xl font-medium leading-tight tracking-[-0.04em] text-white sm:text-5xl">
                        Little details
                        <span className="block font-serif italic text-pink-200">
                          make a statement.
                        </span>
                      </h2>

                      <p className="mt-5 max-w-md text-sm leading-7 text-white/60">
                        Discover pieces that quietly
                        elevate the everyday and make
                        special moments feel even more
                        yours.
                      </p>

                      <Link
                        href="/products"
                        className="mt-8 inline-flex items-center rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#8f315f] shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-pink-50"
                      >
                        Discover the collection
                        <span className="ml-2">
                          →
                        </span>
                      </Link>

                    </div>

                  </div>
                </div>

              </div>
            </section>

            {/* =========================================================
                NEW ARRIVALS (WITHOUT CAROUSEL)
            ========================================================== */}
            <section className="relative bg-[#faf8f9] px-5 py-24 sm:px-8 lg:px-10">

              <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

              <div className="mx-auto max-w-7xl">

                <div className="mb-12 flex items-end justify-between gap-5">

                  <div>
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-[#b63c71]">
                      Just arrived
                    </p>

                    <h2 className="text-3xl font-medium tracking-[-0.03em] text-gray-950 sm:text-4xl lg:text-5xl">
                      New
                      <span className="font-serif italic">
                        {" "}additions.
                      </span>
                    </h2>

                    <p className="mt-4 text-sm text-gray-500">
                      Fresh pieces we know you'll love.
                    </p>
                  </div>

                  <Link
                    href="/products"
                    className="group hidden items-center text-sm font-semibold text-gray-900 sm:flex"
                  >
                    View all
                    <span className="ml-2 transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </Link>

                </div>

                {isLoading ? (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-6">
                    {[1, 2, 3, 4].map(
                      (item) => (
                        <div key={item}>
                          <div className="aspect-[4/5] animate-pulse rounded-3xl bg-gray-100" />
                          <div className="mt-4 space-y-3">
                            <div className="h-4 animate-pulse rounded bg-gray-100" />
                            <div className="h-5 w-24 animate-pulse rounded bg-gray-100" />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4 lg:gap-7">

                    {newArrivals.map(
                      (
                        product: any,
                        index: number
                      ) => {

                        const mainImage =
                          getProductImage(product);

                        const discount =
                          getDiscount(product);

                        const rating =
                          getRating(product);

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

                              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-[#f5f3f4]">

                                {/* Static image (no carousel) */}
                                <Image
                                  src={mainImage}
                                  alt={product.name}
                                  fill
                                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                />

                                {/* Image overlay */}
                                <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5" />

                                {/* New badge */}
                                <span className="absolute left-3 top-3 rounded-full bg-[#b63c71] px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-lg">
                                  New
                                </span>

                                {/* Badge */}
                                {discount && (
                                  <span className="absolute right-3 top-3 rounded-full bg-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-[#b63c71] shadow-lg">
                                    {discount}% off
                                  </span>
                                )}

                                {/* Floating arrow */}
                                <div className="absolute bottom-4 right-4 flex h-10 w-10 translate-y-3 items-center justify-center rounded-full bg-white/95 text-gray-900 opacity-0 shadow-xl transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                  →
                                </div>

                              </div>

                              <div className="pt-5">

                                <div className="flex items-start justify-between gap-3">

                                  <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-gray-900 transition-colors group-hover:text-[#b63c71]">
                                    {product.name}
                                  </h3>

                                </div>

                                <div className="mt-2 flex items-center gap-2">

                                  <span className="text-base font-bold text-gray-950">
                                    ₹{product.price}
                                  </span>

                                  {discount && (
                                    <span className="text-xs text-gray-400 line-through">
                                      ₹
                                      {
                                        product.originalPrice
                                      }
                                    </span>
                                  )}

                                </div>

                                <div className="mt-2 flex items-center gap-1.5">

                                  <span className="text-[11px] font-medium text-gray-500">
                                    {rating}
                                  </span>

                                  <span className="text-[11px] text-amber-400">
                                    ★
                                  </span>

                                  <span className="text-[10px] text-gray-400">
                                    Loved by customers
                                  </span>

                                </div>

                              </div>

                            </article>
                          </Link>
                        );
                      }
                    )}

                  </div>
                )}

                <Link
                  href="/products"
                  className="mt-10 block rounded-full border border-gray-200 py-3 text-center text-sm font-semibold text-gray-900 transition-colors hover:border-gray-900 hover:bg-gray-950 hover:text-white sm:hidden"
                >
                  View all new arrivals →
                </Link>

              </div>
            </section>

            {/* =========================================================
                SPECIAL OFFER
            ========================================================== */}
            <section className="px-5 py-20 sm:px-8 lg:px-10">

              <div className="mx-auto max-w-7xl">

                <div className="relative overflow-hidden rounded-[32px] bg-[#24131d]">

                  <Image
                    src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=2000&q=85"
                    alt=""
                    fill
                    sizes="100vw"
                    className="object-cover opacity-40"
                  />

                  <div className="absolute inset-0 bg-gradient-to-r from-[#24131d] via-[#24131d]/90 to-[#24131d]/25" />

                  <div className="relative grid min-h-[390px] items-center lg:grid-cols-2">

                    <div className="px-7 py-14 sm:px-12 lg:px-16">

                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-pink-200">
                        A little something for you
                      </p>

                      <h2 className="mt-4 text-4xl font-medium tracking-[-0.04em] text-white sm:text-5xl">
                        Your first piece
                        <span className="block font-serif italic text-pink-200">
                          deserves a little love.
                        </span>
                      </h2>

                      <p className="mt-5 max-w-md text-sm leading-7 text-white/60">
                        Enjoy 20% off your first
                        order and find something
                        beautiful to call yours.
                      </p>

                      <Link
                        href="/products"
                        className="mt-8 inline-flex rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#8f315f] shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-pink-50"
                      >
                        Shop the offer
                        <span className="ml-2">
                          →
                        </span>
                      </Link>

                    </div>

                    <div className="hidden h-full min-h-[390px] lg:block">

                      <div className="relative h-full w-full">

                        <div className="absolute right-16 top-1/2 h-60 w-60 -translate-y-1/2 rounded-full border border-white/10" />

                        <div className="absolute right-28 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full border border-white/10" />

                        <div className="absolute right-40 top-1/2 flex h-24 w-24 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 backdrop-blur-md">
                          <span className="text-center text-xs font-semibold uppercase tracking-widest text-white">
                            20%
                            <span className="block text-[9px] font-normal tracking-normal text-white/50">
                              OFF
                            </span>
                          </span>
                        </div>

                      </div>

                    </div>

                  </div>
                </div>

              </div>
            </section>

            {/* =========================================================
                TRUST
            ========================================================== */}
            <section className="border-t border-gray-100 bg-white px-5 py-20 sm:px-8 lg:px-10">

              <div className="mx-auto max-w-7xl">

                <div className="mx-auto mb-14 max-w-xl text-center">

                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-[#b63c71]">
                    The BellesCart promise
                  </p>

                  <h2 className="text-3xl font-medium tracking-[-0.03em] text-gray-950 sm:text-4xl">
                    Shop beautifully.
                    <span className="block font-serif italic">
                      Shop confidently.
                    </span>
                  </h2>

                </div>

                <div className="grid grid-cols-2 gap-y-12 lg:grid-cols-4 lg:gap-8">

                  {/* Quality */}
                  <div className="group text-center">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-green-100">

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

                    <h3 className="mt-5 text-sm font-semibold text-gray-900">
                      Quality assured
                    </h3>

                    <p className="mx-auto mt-2 max-w-[190px] text-xs leading-5 text-gray-500">
                      Carefully selected pieces you
                      can feel good about wearing.
                    </p>

                  </div>

                  {/* Delivery */}
                  <div className="group text-center">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-100">

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

                    <h3 className="mt-5 text-sm font-semibold text-gray-900">
                      Fast delivery
                    </h3>

                    <p className="mx-auto mt-2 max-w-[190px] text-xs leading-5 text-gray-500">
                      Reliable delivery from our
                      collection to your door.
                    </p>

                  </div>

                  {/* Secure */}
                  <div className="group text-center">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-purple-50 text-purple-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-purple-100">

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

                    <h3 className="mt-5 text-sm font-semibold text-gray-900">
                      Secure checkout
                    </h3>

                    <p className="mx-auto mt-2 max-w-[190px] text-xs leading-5 text-gray-500">
                      Your shopping experience
                      stays safe and secure.
                    </p>

                  </div>

                  {/* Returns */}
                  <div className="group text-center">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-pink-50 text-pink-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-pink-100">

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

                    <h3 className="mt-5 text-sm font-semibold text-gray-900">
                      Easy returns
                    </h3>

                    <p className="mx-auto mt-2 max-w-[190px] text-xs leading-5 text-gray-500">
                      Hassle-free support when
                      something isn't quite right.
                    </p>

                  </div>

                </div>

              </div>
            </section>

            {/* =========================================================
                FINAL CTA
            ========================================================== */}
            <section className="bg-[#faf8f9] px-5 pb-24 pt-8 sm:px-8 lg:px-10">

              <div className="mx-auto max-w-5xl text-center">

                <div className="mx-auto mb-7 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                  <span className="font-serif text-lg italic text-[#b63c71]">
                    B
                  </span>
                </div>

                <h2 className="text-3xl font-medium tracking-[-0.03em] text-gray-950 sm:text-4xl lg:text-5xl">
                  Something beautiful is
                  <span className="font-serif italic">
                    {" "}waiting for you.
                  </span>
                </h2>

                <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-gray-500">
                  Take your time. Explore the collection,
                  find your favorites, and choose something
                  that feels unmistakably yours.
                </p>

                <Link
                  href="/products"
                  className="mt-8 inline-flex rounded-full bg-gray-950 px-8 py-3.5 text-sm font-semibold text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-[#b63c71]"
                >
                  Start exploring
                  <span className="ml-2">
                    →
                  </span>
                </Link>

              </div>

            </section>

          </main>

          <Footer />
        </div>
      )}
    </>
  );
}