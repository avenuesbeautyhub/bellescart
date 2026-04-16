'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRequireUserAuth } from '@/auth/user';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import OrderCard from '@/components/OrderCard/OrderCard';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import { Order } from '@/utils/types';

export default function OrdersPage() {
  const { loaded, isAuthenticated } = useRequireUserAuth();
  const [isLoading, setIsLoading] = useState(false);
  const mockOrders: Order[] = [
    {
      id: 'ORD-001',
      userId: 'user1',
      items: [],
      total: 89.97,
      status: 'delivered',
      date: '2024-03-15',
      shippingAddress: '123 Main St, New York, NY 10001',
    },
    {
      id: 'ORD-002',
      userId: 'user1',
      items: [],
      total: 59.98,
      status: 'shipped',
      date: '2024-04-01',
      shippingAddress: '123 Main St, New York, NY 10001',
    },
    {
      id: 'ORD-003',
      userId: 'user1',
      items: [],
      total: 129.99,
      status: 'pending',
      date: '2024-04-03',
      shippingAddress: '123 Main St, New York, NY 10001',
    },
  ];

  // Simulate loading orders
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 700); // Simulate API delay
    return () => clearTimeout(timer);
  }, []);

  // Show loader while checking authentication
  if (!loaded) {
    return <Loader size="lg" text="Loading..." fullScreen />;
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
            <Loader size="lg" text="Loading orders..." />
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">My Orders</h1>

          {mockOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">You haven't placed any orders yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}