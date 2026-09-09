'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireUserAuth } from '@/auth/user';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import Badge from '@/components/ui/Badge';
import { useWallet, useWalletBalance } from '@/hooks/user/useWalletQueries';
import { globalToast } from '@/utils/globalToast';

export default function WalletPage() {
  const router = useRouter();
  const { loaded, isAuthenticated } = useRequireUserAuth();

  // React Query hooks
  const { data: walletData, isLoading: isLoadingWallet } = useWallet({
    enabled: isAuthenticated && loaded
  });
  const { data: balanceData, isLoading: isLoadingBalance } = useWalletBalance({
    enabled: isAuthenticated && loaded
  });

  const wallet = walletData?.data?.wallet;
  const balance = balanceData?.data?.balance || 0;
  const transactions = wallet?.transactions || [];

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader size="lg" text="Loading..." fullScreen />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (isLoadingWallet || isLoadingBalance) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader size="lg" text="Loading wallet..." fullScreen />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: 'credit' | 'debit') => {
    return type === 'credit' ? (
      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
      </svg>
    ) : (
      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
      </svg>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-gray-800">My Wallet</h1>
            <Button
              variant="outline"
              onClick={() => router.push('/profile')}
            >
              Back to Profile
            </Button>
          </div>

          {/* Wallet Balance Card */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-lg mb-2">Available Balance</p>
                <p className="text-5xl font-bold mb-1">₹{balance.toFixed(2)}</p>
                <p className="text-pink-100 text-sm">Instant refunds & secure payments</p>
              </div>
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Transaction History</h2>

            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-500 text-lg mb-2">No transactions yet</p>
                <p className="text-gray-400 text-sm">Your wallet transactions will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{transaction.description}</p>
                        <p className="text-sm text-gray-500">{formatDate(transaction.createdAt)}</p>
                        {transaction.orderId && (
                          <p className="text-xs text-gray-400 mt-1">
                            Order ID: {transaction.orderId}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${
                        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Balance: ₹{transaction.balance.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Wallet Info Card */}
          <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-start space-x-4">
              <svg className="w-6 h-6 text-blue-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold text-blue-800 mb-2">How Wallet Works</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• <strong>Automatic Refunds:</strong> Return delivered orders and get instant refunds to your wallet</li>
                  <li>• <strong>Easy Payments:</strong> Use wallet balance during checkout for quick purchases</li>
                  <li>• <strong>Transaction History:</strong> Track all your credits and debits in one place</li>
                  <li>• <strong>Secure:</strong> Your wallet balance is protected with bank-grade security</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}