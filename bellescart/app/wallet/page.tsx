'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import { useRequireUserAuth } from '@/auth/user';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import { useWallet, useWalletBalance } from '@/hooks/user/useWalletQueries';

export default function WalletPage() {
  const router = useRouter();
  const { loaded, isAuthenticated } = useRequireUserAuth();

  const {
    data: walletData,
    isLoading: isLoadingWallet,
  } = useWallet({
    enabled: isAuthenticated && loaded,
  });

  const {
    data: balanceData,
    isLoading: isLoadingBalance,
  } = useWalletBalance({
    enabled: isAuthenticated && loaded,
  });

  const wallet = walletData?.data?.wallet;
  const balance = balanceData?.data?.balance || 0;
  const transactions = wallet?.transactions || [];

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <Loader size="lg" text="Loading..." fullScreen />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (isLoadingWallet || isLoadingBalance) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <Loader
          size="lg"
          text="Loading wallet..."
          fullScreen
        />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (
    type: 'credit' | 'debit'
  ) => {
    if (type === 'credit') {
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M7 11l5-5m0 0l5 5m-5-5v12"
          />
        </svg>
      );
    }

    return (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M17 13l-5 5m0 0l-5-5m5 5V6"
        />
      </svg>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] text-gray-900">
      <Navbar />

      <main className="flex-1 pb-16">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-9">

          {/* Header */}
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-start gap-4">
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
                    strokeWidth={1.7}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-pink-600">
                  Your account
                </p>

                <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
                  My Wallet
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Manage your balance and wallet transactions
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => router.push('/profile')}
              className="w-full sm:w-auto"
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>

              Back to Profile
            </Button>
          </div>

          {/* Balance + Quick Info */}
          <div className="mb-7 grid grid-cols-1 gap-5 lg:grid-cols-3">

            {/* Balance */}
            <div className="relative overflow-hidden rounded-3xl bg-gray-950 p-6 text-white shadow-sm sm:p-7 lg:col-span-2">
              {/* Decorative elements */}
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-pink-500/20 blur-2xl" />
              <div className="absolute -bottom-20 left-1/2 h-40 w-40 rounded-full bg-purple-500/20 blur-2xl" />

              <div className="relative">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
                      Available balance
                    </p>

                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-4xl font-bold tracking-tight sm:text-5xl">
                        ₹{balance.toFixed(2)}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-gray-400">
                      Available for eligible wallet payments and refunds
                    </p>
                  </div>

                  <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-white/10 sm:flex">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.7}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                  </div>
                </div>

                <div className="mt-7 flex items-center gap-2 text-xs text-gray-400">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/15">
                    <svg
                      className="h-3 w-3 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>

                  Secure wallet balance
                </div>
              </div>
            </div>

            {/* Wallet Stats */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Transactions
                    </p>

                    <p className="mt-2 text-2xl font-bold text-gray-950">
                      {transactions.length}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50">
                    <svg
                      className="h-5 w-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.7}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a3 3 0 006 0"
                      />
                    </svg>
                  </div>
                </div>

                <p className="mt-1 text-xs text-gray-400">
                  Wallet activity
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Wallet status
                    </p>

                    <p className="mt-2 text-base font-bold text-gray-950">
                      Active
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                    <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                  </div>
                </div>

                <p className="mt-1 text-xs text-gray-400">
                  Ready to use
                </p>
              </div>
            </div>
          </div>

          {/* Transactions */}
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-2 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <h2 className="text-base font-bold text-gray-950">
                  Transaction history
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Your wallet credits and debits
                </p>
              </div>

              {transactions.length > 0 && (
                <span className="text-xs font-medium text-gray-400">
                  {transactions.length}{' '}
                  {transactions.length === 1
                    ? 'transaction'
                    : 'transactions'}
                </span>
              )}
            </div>

            {transactions.length === 0 ? (
              <div className="flex min-h-[330px] items-center justify-center px-5 py-12">
                <div className="max-w-sm text-center">
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
                    <svg
                      className="h-7 w-7 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.6}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a3 3 0 006 0M9 5a3 3 0 013-3 3 3 0 013 3"
                      />
                    </svg>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900">
                    No transactions yet
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Your wallet credits and payments will appear
                    here when you start using your wallet.
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {transactions.map(
                  (transaction: any, index: number) => {
                    const isCredit =
                      transaction.type === 'credit';

                    return (
                      <div
                        key={index}
                        className="group flex items-center gap-3 px-4 py-4 transition hover:bg-gray-50/70 sm:gap-4 sm:px-6"
                      >
                        {/* Icon */}
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                            isCredit
                              ? 'bg-green-50 text-green-600'
                              : 'bg-red-50 text-red-500'
                          }`}
                        >
                          {getTransactionIcon(
                            transaction.type
                          )}
                        </div>

                        {/* Details */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {transaction.description}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            {formatDate(
                              transaction.createdAt
                            )}
                          </p>

                          {transaction.orderId && (
                            <p className="mt-1 truncate text-[11px] text-gray-400">
                              Order ID: {transaction.orderId}
                            </p>
                          )}
                        </div>

                        {/* Amount */}
                        <div className="shrink-0 text-right">
                          <p
                            className={`text-sm font-bold sm:text-base ${
                              isCredit
                                ? 'text-green-600'
                                : 'text-gray-900'
                            }`}
                          >
                            {isCredit ? '+' : '-'}₹
                            {transaction.amount.toFixed(2)}
                          </p>

                          <p className="mt-1 text-[11px] text-gray-400">
                            Balance ₹
                            {transaction.balance.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </section>

          {/* How Wallet Works */}
          <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                <svg
                  className="h-5 w-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.7}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-gray-900">
                  How your wallet works
                </h3>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Automatic refunds
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Eligible refunds can be credited directly
                      to your wallet.
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Easy payments
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Use your available wallet balance during
                      checkout.
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Full history
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Review wallet credits, debits, and balances
                      in one place.
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Secure
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Your wallet activity is protected within
                      your account.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}