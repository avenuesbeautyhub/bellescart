'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRequireUserAuth } from '@/auth/user';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import OrderCard from '@/components/OrderCard/OrderCard';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import { orderService } from '@/services/orderService';
import { globalToast } from '@/utils/globalToast';

export default function OrdersPage() {
  const { loaded, isAuthenticated } = useRequireUserAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);

  // Load orders when authenticated
  useEffect(() => {
    if (loaded && isAuthenticated) {
      loadOrders();
    }
  }, [loaded, isAuthenticated]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const response = await orderService.getOrders();
      if (response.success && response.data?.orders) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
      globalToast.order.loadFailed();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const response = await orderService.cancelOrder(orderId);
      if (response.success) {
        globalToast.order.cancelSuccess();
        // Reload orders to reflect the cancellation
        await loadOrders();
      } else {
        globalToast.order.cancelFailed();
      }
    } catch (error) {
      console.error('Failed to cancel order:', error);
      globalToast.order.cancelFailed();
    }
  };

  // Show loader while checking authentication
  if (!loaded) {
    return <Loader size="lg" text="Loading..." fullScreen />;
  }

  if (!isAuthenticated) return null;

  if (isLoading) {
    return <Loader size="lg" text="Loading orders..." fullScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">My Orders</h1>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-6">You haven't placed any orders yet</p>
              <Link href="/products">
                <Button>Browse Products</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.map(order => (
                <OrderCard
                  key={order._id || order.id}
                  order={order}
                  onCancel={handleCancelOrder}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}