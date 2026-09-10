'use client';

import React from 'react';
import Link from 'next/link';
import { useRequireUserAuth } from '@/auth/user';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import {
  useWishlist,
  useRemoveFromWishlist,
} from '@/hooks/user/useWishlistQueries';
import { globalToast } from '@/utils/globalToast';

export default function WishlistPage() {
  const { loaded, isAuthenticated } = useRequireUserAuth();
  const [isRemoving, setIsRemoving] = React.useState<string | null>(null);

  const { data: wishlistData, isLoading, error } = useWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  const wishlistItems = wishlistData?.data?.wishlist || [];

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      setIsRemoving(productId);

      await removeFromWishlist.mutateAsync(productId);

      globalToast.general.success(
        'Removed',
        'Item removed from wishlist'
      );
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);

      globalToast.general.error(
        'Error',
        'Failed to remove item'
      );
    } finally {
      setIsRemoving(null);
    }
  };

  if (!loaded) {
    return <Loader size="lg" text="Loading..." fullScreen />;
  }

  if (!isAuthenticated) return null;

  if (isLoading) {
    return (
      <Loader
        size="lg"
        text="Loading your wishlist..."
        fullScreen
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />

        <main className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
              <svg
                className="h-7 w-7 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M12 9v3.75m0 3.75h.008M10.29 3.86l-8.1 14A2 2 0 003.92 21h16.16a2 2 0 001.73-3.14l-8.1-14a2 2 0 00-3.42 0z"
                />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-gray-900">
              We couldn't load your wishlist
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Something went wrong while fetching your saved items.
            </p>

            <div className="mt-6">
              <Button onClick={() => location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900">
      <Navbar />

      <main className="pb-16">
        {/* Page Header */}
        <section className="border-b border-gray-100 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-start gap-4">
                {/* Heart Icon */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pink-50">
                  <svg
                    className="h-6 w-6 text-pink-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"
                    />
                  </svg>
                </div>

                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-pink-600">
                    Saved for later
                  </p>

                  <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
                    My Wishlist
                  </h1>

                  <p className="mt-1 text-sm text-gray-500">
                    {wishlistItems.length}{' '}
                    {wishlistItems.length === 1 ? 'item' : 'items'} saved
                  </p>
                </div>
              </div>

              {wishlistItems.length > 0 && (
                <Link href="/products" className="w-full sm:w-auto">
                  <Button className="w-full bg-gray-950 px-5 py-2.5 text-sm font-semibold hover:bg-gray-800 sm:w-auto">
                    Continue Shopping
                    <svg
                      className="ml-2 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Content */}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          {wishlistItems.length === 0 ? (
            /* Empty Wishlist */
            <div className="flex min-h-[55vh] items-center justify-center">
              <div className="w-full max-w-lg text-center">
                <div className="relative mx-auto mb-7 flex h-24 w-24 items-center justify-center rounded-full bg-pink-50">
                  <div className="absolute inset-2 rounded-full border border-pink-100" />

                  <svg
                    className="relative h-10 w-10 text-pink-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"
                    />
                  </svg>
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                  Your wishlist is empty
                </h2>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500 sm:text-base">
                  Save the pieces you love and keep them here until
                  you're ready to make them yours.
                </p>

                <div className="mt-7">
                  <Link href="/products">
                    <Button className="bg-gray-950 px-7 py-3 text-sm font-semibold hover:bg-gray-800">
                      Explore Products
                      <svg
                        className="ml-2 h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Small section label */}
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">
                    Your saved pieces
                  </h2>

                  <p className="mt-0.5 text-sm text-gray-500">
                    Keep an eye on your favorites.
                  </p>
                </div>
              </div>

              {/* Wishlist Grid */}
              <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 sm:gap-y-9 lg:grid-cols-3 xl:grid-cols-4">
                {wishlistItems.map((item) => (
                  <article
                    key={item._id}
                    className="group min-w-0"
                  >
                    {/* Image */}
                    <div className="relative overflow-hidden rounded-2xl bg-white ring-1 ring-black/[0.05]">
                      <Link href={`/product/${item._id}`}>
                        <div className="relative aspect-[0.92] overflow-hidden bg-gray-100">
                          {item.images && item.images.length > 0 ? (
                            <img
                              src={item.images[0]}
                              alt={item.name}
                              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
                              <svg
                                className="h-12 w-12 text-pink-300"
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
                        </div>
                      </Link>

                      {/* Discount */}
                      {item.discount && (
                        <div className="absolute left-3 top-3 rounded-full bg-gray-950 px-2.5 py-1 text-[10px] font-bold tracking-wide text-white shadow-sm sm:text-xs">
                          {item.discount}% OFF
                        </div>
                      )}

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveFromWishlist(item._id)
                        }
                        disabled={isRemoving === item._id}
                        aria-label={`Remove ${item.name} from wishlist`}
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-gray-700 shadow-sm backdrop-blur transition-all duration-200 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isRemoving === item._id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-pink-500 border-t-transparent" />
                        ) : (
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.8}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        )}
                      </button>
                    </div>

                    {/* Product Info */}
                    <div className="pt-3">
                      <Link href={`/product/${item._id}`}>
                        <h3 className="line-clamp-2 min-h-[2.75rem] text-sm font-medium leading-5 text-gray-900 transition-colors group-hover:text-pink-600 sm:text-[15px]">
                          {item.name}
                        </h3>
                      </Link>

                      {/* Rating */}
                      <div className="mt-2 flex items-center gap-1.5">
                        <div className="flex items-center gap-0.5">
                          <svg
                            className="h-3.5 w-3.5 text-yellow-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>

                          <span className="text-xs font-medium text-gray-600">
                            {item.rating || 4.5}
                          </span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-base font-bold text-gray-950 sm:text-lg">
                          ${item.price?.toFixed(2)}
                        </span>

                        {item.originalPrice && (
                          <span className="text-xs text-gray-400 line-through sm:text-sm">
                            ${item.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* View Product */}
                      <Link
                        href={`/product/${item._id}`}
                        className="mt-3 block"
                      >
                        <Button className="w-full bg-gray-950 py-2 text-xs font-semibold hover:bg-gray-800 sm:text-sm">
                          View Product
                        </Button>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}