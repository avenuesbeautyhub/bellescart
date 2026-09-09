'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import { useRequireUserAuth } from '@/auth/user';
import { globalToast } from '@/utils/globalToast';
import { useOrder } from '@/hooks/user/useOrderQueries';

function OrderConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  // React Query hook
  const { data: orderData, isLoading } = useOrder(orderId || '');
  
  const [showConfetti, setShowConfetti] = useState(true);
  const [countdown, setCountdown] = useState(6);

  // Redirect if no order ID
  useEffect(() => {
    if (!orderId) {
      router.push('/orders');
    }
  }, [orderId, router]);

  // Hide confetti after 6 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  // Countdown timer
  useEffect(() => {
    const countdownTimer = setInterval(() => {
      setCountdown(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(countdownTimer);
  }, []);

  // Redirect when countdown reaches 0
  useEffect(() => {
    if (countdown === 0) {
      router.push('/orders');
    }
  }, [countdown, router]);

  // Process order data from React Query
  const order = React.useMemo(() => {
    if (!orderData?.data) return null;
    return orderData.data.order || null;
  }, [orderData]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader size="lg" text="Loading order details..." />
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAddress = (address: any) => {
    if (!address) return 'N/A';
    if (typeof address === 'string') return address;
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'][Math.floor(Math.random() * 5)],
                }}
              />
            </div>
          ))}
        </div>
      )}

      <Navbar />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Success Message */}
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full blur-xl opacity-50 animate-pulse" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Order Placed Successfully!
            </h1>
            <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto">
              Thank you for your purchase. Your order has been confirmed and will be shipped soon.
            </p>
            
            {/* Countdown Timer */}
            <div className="mt-6 inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-pink-200">
              <svg className="w-5 h-5 text-pink-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-700 font-medium">
                Redirecting to orders in <span className="text-pink-600 font-bold text-xl">{countdown}</span> seconds
              </span>
            </div>
          </div>

          {/* Order Details Card */}
          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/50 mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Order Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-4 rounded-xl border border-pink-100">
                <p className="text-pink-600 text-xs font-semibold uppercase tracking-wider mb-1">Order Number</p>
                <p className="font-bold text-gray-800 text-lg">{order.orderNumber}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-100">
                <p className="text-purple-600 text-xs font-semibold uppercase tracking-wider mb-1">Order Date</p>
                <p className="font-bold text-gray-800 text-lg">
                  {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
                <p className="text-blue-600 text-xs font-semibold uppercase tracking-wider mb-1">Status</p>
                <p className="font-bold text-green-600 text-lg capitalize flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  {order.status}
                </p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-100">
                <p className="text-emerald-600 text-xs font-semibold uppercase tracking-wider mb-1">Payment Method</p>
                <p className="font-bold text-gray-800 text-lg capitalize">
                  {order.paymentMethod?.replace('_', ' ')}
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-100">
              <p className="text-amber-600 text-xs font-semibold uppercase tracking-wider mb-2">Shipping Address</p>
              <p className="text-gray-800 font-medium">{formatAddress(order.shippingAddress)}</p>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-100">
              <p className="text-gray-600 text-xs font-semibold uppercase tracking-wider mb-3">Order Items</p>
              <div className="space-y-3">
                {order.items?.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{item.product?.name || 'Product'}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-lg text-pink-600">
                      ₹{item.total?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-800">₹{order.subtotal?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-gray-800">
                    ₹{order.shipping?.toFixed(2) || '0.00'}
                    {order.shipping === 0 && <span className="text-green-600 ml-2 font-medium">(Free)</span>}
                  </span>
                </div>
                {order.coupon && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Coupon Discount ({order.coupon.code})</span>
                    <span className="font-semibold text-green-600">-₹{order.discountAmount?.toFixed(2) || '0.00'}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold pt-4 border-t-2 border-green-200">
                  <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Total</span>
                  <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent text-2xl">
                    ₹{order.total?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Link href="/orders" className="flex-1 sm:flex-none">
              <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white/80 backdrop-blur-xl border-2 border-pink-200 hover:border-pink-400 hover:bg-pink-50 transition-all shadow-lg">
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  View All Orders
                </span>
              </Button>
            </Link>
            <Link href="/products" className="flex-1 sm:flex-none">
              <Button variant="primary" size="lg" className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-xl hover:shadow-2xl transition-all">
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Continue Shopping
                </span>
              </Button>
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <div className="bg-white/60 backdrop-blur-xl p-4 rounded-xl border border-white/50 inline-block">
              <p className="text-gray-600 text-sm">
                <span className="font-semibold">Order confirmation email</span> has been sent to your email address.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <style jsx global>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader size="lg" text="Loading..." /></div>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}