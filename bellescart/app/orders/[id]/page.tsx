'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRequireUserAuth } from '@/auth/user';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Loader from '@/components/ui/Loader';
import { orderService } from '@/services/orderService';
import { globalToast } from '@/utils/globalToast';

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { loaded, isAuthenticated } = useRequireUserAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [isLoadingTracking, setIsLoadingTracking] = useState(false);
  const { id } = React.use(params);

  useEffect(() => {
    if (loaded && isAuthenticated && id) {
      loadOrderDetails();
    }
  }, [loaded, isAuthenticated, id]);

  const loadOrderDetails = async () => {
    try {
      setIsLoading(true);
      const response = await orderService.getOrderById(id);
      if (response.success && response.data?.order) {
        setOrder(response.data.order);
        
        // Load tracking data if order has tracking number
        if (response.data.order.trackingNumber) {
          loadTrackingData(response.data.order.trackingNumber);
        }
      } else {
        globalToast.order.loadFailed();
        router.push('/orders');
      }
    } catch (error) {
      console.error('Failed to load order details:', error);
      globalToast.order.loadFailed();
      router.push('/orders');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrackingData = async (trackingNumber: string) => {
    try {
      setIsLoadingTracking(true);
      const response = await orderService.trackOrderByOrderId(id);
      if (response.success && response.data) {
        setTrackingData(response.data);
      }
    } catch (error) {
      console.error('Failed to load tracking data:', error);
    } finally {
      setIsLoadingTracking(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
      const response = await orderService.cancelOrder(id);
      if (response.success) {
        globalToast.order.cancelSuccess();
        loadOrderDetails();
      } else {
        globalToast.order.cancelFailed();
      }
    } catch (error) {
      console.error('Failed to cancel order:', error);
      globalToast.order.cancelFailed();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'success';
      case 'shipped':
        return 'primary';
      case 'processing':
        return 'secondary';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Show loader while checking authentication
  if (!loaded) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader size="lg" text="Loading..." />
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) return null;

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
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h1>
            <Link href="/orders">
              <Button>Back to Orders</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-6">
            <Link href="/orders" className="inline-flex items-center text-pink-600 hover:text-pink-700 mb-4">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Orders
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Details</h1>
            <p className="text-gray-600">Order ID: {order.orderNumber || order._id}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Status */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Order Status</h2>
                  <Badge variant={getStatusColor(order.status)}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Order Date</p>
                    <p className="font-semibold text-gray-900">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="font-semibold text-gray-900 capitalize">
                      {order.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : order.paymentMethod}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Payment Status</p>
                    <p className="font-semibold text-gray-900 capitalize">{order.paymentStatus || 'Paid'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="font-semibold text-gray-900">{formatAmount(order.total)}</p>
                  </div>
                </div>
                {order.paymentMethod === 'cash_on_delivery' && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <p className="text-sm text-green-800 font-medium">Pay ₹{formatAmount(order.total)} on delivery</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>
                <div className="space-y-4">
                  {order.items?.map((item: any, index: number) => (
                    <div key={index} className="flex items-center gap-4 border-b border-gray-100 pb-4 last:border-0">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                        {item.product?.image ? (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{item.product?.name || item.name}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-sm text-gray-600">Price: {formatAmount(item.price)}</p>
                      </div>
                      <p className="font-semibold text-gray-900">{formatAmount(item.total)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Address</h2>
                <div className="text-gray-700">
                  <p className="font-medium">{order.shippingAddress?.street}</p>
                  <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
                  <p>{order.shippingAddress?.country}</p>
                </div>
              </div>

              {/* Order Notes */}
              {order.notes && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Notes</h2>
                  <p className="text-gray-700">{order.notes}</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">{formatAmount(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium text-gray-900">{formatAmount(order.tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-gray-900">{formatAmount(order.shipping)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span className="font-medium">-{formatAmount(order.discount)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-lg font-bold text-gray-900">{formatAmount(order.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tracking Information */}
              {order.trackingNumber ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Tracking Information</h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Tracking Number</p>
                      <p className="font-medium text-gray-900">{order.trackingNumber}</p>
                    </div>
                    {order.estimatedDelivery && (
                      <div>
                        <p className="text-sm text-gray-600">Estimated Delivery</p>
                        <p className="font-medium text-gray-900">{formatDate(order.estimatedDelivery)}</p>
                      </div>
                    )}
                    {order.nimbus?.courier && (
                      <div>
                        <p className="text-sm text-gray-600">Courier</p>
                        <p className="font-medium text-gray-900">{order.nimbus.courier}</p>
                      </div>
                    )}
                    {order.nimbus?.shipmentStatus && (
                      <div>
                        <p className="text-sm text-gray-600">Tracking Status</p>
                        <Badge variant={getStatusColor(order.nimbus.shipmentStatus.toLowerCase())}>
                          {order.nimbus.shipmentStatus}
                        </Badge>
                      </div>
                    )}
                  </div>
                  {isLoadingTracking ? (
                    <Loader size="sm" text="Loading tracking..." />
                  ) : trackingData ? (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-3">Tracking History</h3>
                      <div className="space-y-2">
                        {trackingData.trackingHistory?.map((track: any, index: number) => (
                          <div key={index} className="flex gap-3 text-sm">
                            <div className="w-2 h-2 bg-pink-500 rounded-full mt-1.5 flex-shrink-0"></div>
                            <div>
                              <p className="font-medium text-gray-900">{track.status}</p>
                              <p className="text-gray-600">{track.description}</p>
                              <p className="text-gray-500">{track.date}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full mt-4"
                      onClick={() => loadTrackingData(order.trackingNumber)}
                    >
                      Refresh Tracking
                    </Button>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Information</h2>
                  <div className="space-y-3">
                    {order.nimbus?.airwayBill ? (
                      <div>
                        <p className="text-sm text-gray-600">Airway Bill Number</p>
                        <p className="font-medium text-gray-900">{order.nimbus.airwayBill}</p>
                      </div>
                    ) : (
                      <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                        <p className="text-sm text-yellow-800">
                          <span className="font-medium">Shipping not yet assigned</span>
                          <br />
                          Your order is being processed and will be shipped soon.
                        </p>
                      </div>
                    )}
                    {order.nimbus?.courier && (
                      <div>
                        <p className="text-sm text-gray-600">Courier</p>
                        <p className="font-medium text-gray-900">{order.nimbus.courier}</p>
                      </div>
                    )}
                    {order.nimbus?.shipmentStatus && (
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <Badge variant={getStatusColor(order.nimbus.shipmentStatus.toLowerCase())}>
                          {order.nimbus.shipmentStatus}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
                <div className="space-y-3">
                  {order.status !== 'cancelled' && order.status !== 'delivered' && (
                    <Button
                      variant="danger"
                      className="w-full"
                      onClick={handleCancelOrder}
                    >
                      Cancel Order
                    </Button>
                  )}
                  <Link href="/products">
                    <Button variant="secondary" className="w-full">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
