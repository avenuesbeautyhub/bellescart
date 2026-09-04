import React from 'react';
import { Order } from '@/utils/types';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

interface OrderCardProps {
  order: any; // Using any to accommodate backend order structure
  onClick?: () => void;
  onCancel?: (orderId: string) => void;
}

export default function OrderCard({ order, onClick, onCancel }: OrderCardProps) {
  const statusConfig: { [key: string]: { color: string; bg: string; icon: string } } = {
    pending: { color: 'text-amber-600', bg: 'bg-amber-100', icon: '⏳' },
    confirmed: { color: 'text-blue-600', bg: 'bg-blue-100', icon: '✓' },
    processing: { color: 'text-purple-600', bg: 'bg-purple-100', icon: '⚙️' },
    shipped: { color: 'text-indigo-600', bg: 'bg-indigo-100', icon: '🚚' },
    delivered: { color: 'text-green-600', bg: 'bg-green-100', icon: '📦' },
    cancelled: { color: 'text-red-600', bg: 'bg-red-100', icon: '✕' },
    refunded: { color: 'text-orange-600', bg: 'bg-orange-100', icon: '↩️' },
  };

  const orderId = order._id || order.id;
  const orderNumber = order.orderNumber || order.id;
  const status = order.status || 'pending';
  const canCancel = status === 'pending' || status === 'confirmed';
  const statusInfo = statusConfig[status] || statusConfig.pending;

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format shipping address
  const formatAddress = (address: any) => {
    if (!address) return 'N/A';
    if (typeof address === 'string') return address;
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
  };

  return (
    <div
      onClick={onClick}
      className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-xl hover:border-pink-200 transition-all duration-300 cursor-pointer group"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-pink-600 transition-colors">
              Order #{orderNumber}
            </h3>
          </div>
          <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(order.createdAt || order.date)}
          </p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusInfo.bg} ${statusInfo.color} font-semibold text-sm`}>
          <span>{statusInfo.icon}</span>
          <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
        </div>
      </div>

      {/* Order Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Shipping Address */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Shipping Address</p>
            <p className="text-gray-800 text-sm mt-1 line-clamp-2">
              {formatAddress(order.shippingAddress)}
            </p>
          </div>
        </div>

        {/* Items */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Items</p>
            <p className="text-gray-800 text-sm mt-1 font-semibold">
              {order.items?.length || 0} item(s)
            </p>
          </div>
        </div>
      </div>

      {/* Payment and Total */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Payment Status</p>
            <div className={`mt-1 flex items-center gap-2 text-sm font-semibold ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
              {order.paymentStatus === 'paid' ? (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Paid
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Pending
                </>
              )}
            </div>
          </div>
        </div>

        <div className="text-right sm:text-left">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Total</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            ₹{order.total?.toFixed(2) || '0.00'}
          </p>
        </div>
      </div>

      {/* Cancel Button */}
      {canCancel && onCancel && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCancel(orderId);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Cancel Order
          </button>
        </div>
      )}
    </div>
  );
}