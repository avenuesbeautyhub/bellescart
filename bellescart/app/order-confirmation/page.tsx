'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import { orderService } from '@/services/orderService';

export default function OrderConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (orderId) {
      loadOrderDetails();
    } else {
      // If no order ID, redirect to orders page
      router.push('/orders');
    }
  }, [orderId, router]);

  const loadOrderDetails = async () => {
    try {
      setIsLoading(true);
      const response = await orderService.getOrderById(orderId!);
      if (response.success && response.data?.order) {
        setOrder(response.data.order);
      } else {
        // If order not found, redirect to orders page
        router.push('/orders');
      }
    } catch (error) {
      console.error('Failed to load order details:', error);
      router.push('/orders');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
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
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-12">
          {/* Success Message */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-green-600"
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
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Order Placed Successfully!
            </h1>
            <p className="text-gray-600 text-lg">
              Thank you for your purchase. Your order has been confirmed.
            </p>
          </div>

          {/* Order Details Card */}
          <div className="bg-white p-8 rounded-lg border border-gray-200 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-600 text-sm">Order Number</p>
                <p className="font-semibold text-gray-800">{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Order Date</p>
                <p className="font-semibold text-gray-800">
                  {formatDate(order.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Status</p>
                <p className="font-semibold text-gray-800 capitalize">
                  {order.status}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Payment Method</p>
                <p className="font-semibold text-gray-800 capitalize">
                  {order.paymentMethod?.replace('_', ' ')}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-gray-600 text-sm mb-2">Shipping Address</p>
              <p className="text-gray-800">{formatAddress(order.shippingAddress)}</p>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-gray-600 text-sm mb-2">Order Items</p>
              <div className="space-y-3">
                {order.items?.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-800">
                      {item.product?.name || 'Product'} x {item.quantity}
                    </span>
                    <span className="font-semibold text-gray-800">
                      ₹{item.total?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-800">₹{order.subtotal?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-800">₹{order.shipping?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-800">₹{order.tax?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                  <span className="text-gray-800">Total</span>
                  <span className="text-gray-900">₹{order.total?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Link href="/orders">
              <Button variant="outline" size="lg">
                View All Orders
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="primary" size="lg">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}