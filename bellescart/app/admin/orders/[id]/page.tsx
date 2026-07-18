'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRequireAdminAuth } from '@/auth/admin';
import AdminHeader from '@/components/AdminHeader/AdminHeader';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Loader from '@/components/ui/Loader';
import { adminOrderService } from '@/services/admin/orderService';
import { orderService } from '@/services/orderService';

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { loaded, isAuthenticated } = useRequireAdminAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [isLoadingTracking, setIsLoadingTracking] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (loaded && isAuthenticated && params.id) {
      loadOrderDetails();
    }
  }, [loaded, isAuthenticated, params.id]);

  const loadOrderDetails = async () => {
    try {
      setIsLoading(true);
      const response = await adminOrderService.getOrderById(params.id);
      if (response.success && response.data?.order) {
        const orderData = response.data.order as any;
        setOrder(orderData);
        
        // Load tracking data if order has tracking number
        if (orderData.trackingNumber) {
          loadTrackingData(orderData.trackingNumber);
        }
      } else {
        router.push('/admin/orders');
      }
    } catch (error) {
      console.error('Failed to load order details:', error);
      router.push('/admin/orders');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrackingData = async (trackingNumber: string) => {
    try {
      setIsLoadingTracking(true);
      const response = await orderService.trackOrderByOrderId(params.id);
      if (response.success && response.data) {
        setTrackingData(response.data);
      }
    } catch (error) {
      console.error('Failed to load tracking data:', error);
    } finally {
      setIsLoadingTracking(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      setIsUpdating(true);
      const response = await adminOrderService.updateOrderStatus(params.id, newStatus);
      if (response.success) {
        setOrder((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
      setIsUpdating(true);
      const response = await adminOrderService.cancelOrder(params.id);
      if (response.success) {
        setOrder((prev: any) => ({ ...prev, status: 'cancelled' }));
      }
    } catch (error) {
      console.error('Failed to cancel order:', error);
    } finally {
      setIsUpdating(false);
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
        <AdminHeader />
        <div className="flex-1 flex items-center justify-center">
          <Loader size="lg" text="Loading..." />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <AdminHeader />
        <div className="flex-1 flex items-center justify-center">
          <Loader size="lg" text="Loading order details..." />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <AdminHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h1>
            <Link href="/admin/orders">
              <Button>Back to Orders</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <AdminHeader />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-6">
            <Link href="/admin/orders" className="inline-flex items-center text-pink-600 hover:text-pink-700 mb-4">
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
                      <p className="text-sm text-green-800 font-medium">COD Order - Customer will pay ₹{formatAmount(order.total)} on delivery</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Customer Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium text-gray-900">{order.customer?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{order.customer?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-900">{order.customer?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">User ID</p>
                    <p className="font-medium text-gray-900">{order.userId || 'N/A'}</p>
                  </div>
                </div>
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

              {/* Update Status */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Update Status</h2>
                <div className="space-y-3">
                  <select
                    value={order.status}
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                    disabled={isUpdating}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  {order.status !== 'cancelled' && order.status !== 'delivered' && (
                    <Button
                      variant="danger"
                      className="w-full"
                      onClick={handleCancelOrder}
                      disabled={isUpdating}
                    >
                      Cancel Order
                    </Button>
                  )}
                </div>
              </div>

              {/* Tracking Information */}
              {order.trackingNumber && (
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
                    {order.shiprocket?.courier && (
                      <div>
                        <p className="text-sm text-gray-600">Courier</p>
                        <p className="font-medium text-gray-900">{order.shiprocket.courier}</p>
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
              )}

              {/* Shiprocket Information */}
              {order.shiprocket && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Shiprocket Information</h2>
                  <div className="space-y-3">
                    {order.shiprocket.orderId && (
                      <div>
                        <p className="text-sm text-gray-600">Shiprocket Order ID</p>
                        <p className="font-medium text-gray-900">{order.shiprocket.orderId}</p>
                      </div>
                    )}
                    {order.shiprocket.shipmentId && (
                      <div>
                        <p className="text-sm text-gray-600">Shipment ID</p>
                        <p className="font-medium text-gray-900">{order.shiprocket.shipmentId}</p>
                      </div>
                    )}
                    {order.shiprocket.trackingStatus && (
                      <div>
                        <p className="text-sm text-gray-600">Tracking Status</p>
                        <p className="font-medium text-gray-900">{order.shiprocket.trackingStatus}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
