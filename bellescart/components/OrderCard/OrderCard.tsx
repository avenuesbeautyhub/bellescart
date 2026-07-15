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
  const statusColors: { [key: string]: any } = {
    pending: 'warning',
    confirmed: 'primary',
    processing: 'primary',
    shipped: 'primary',
    delivered: 'success',
    cancelled: 'danger',
    refunded: 'danger',
  };

  const orderId = order._id || order.id;
  const orderNumber = order.orderNumber || order.id;
  const status = order.status || 'pending';
  const canCancel = status === 'pending' || status === 'confirmed';

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format shipping address
  const formatAddress = (address: any) => {
    if (!address) return 'N/A';
    if (typeof address === 'string') return address;
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`;
  };

  return (
    <div
      onClick={onClick}
      className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Order #{orderNumber}
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            {formatDate(order.createdAt || order.date)}
          </p>
        </div>
        <Badge variant={statusColors[status] || 'info'}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      </div>

      <div className="mb-4">
        <p className="text-gray-600 text-sm">Shipping Address</p>
        <p className="text-gray-800 text-sm">
          {formatAddress(order.shippingAddress)}
        </p>
      </div>

      <div className="mb-4">
        <p className="text-gray-600 text-sm">Items</p>
        <p className="font-semibold text-gray-800">
          {order.items?.length || 0} item(s)
        </p>
      </div>

      <div className="flex justify-between items-end">
        <div>
          <p className="text-gray-600 text-sm">Payment Status</p>
          <Badge variant={order.paymentStatus === 'paid' ? 'success' : 'warning'}>
            {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1) || 'Pending'}
          </Badge>
        </div>
        <div className="text-right">
          <p className="text-gray-600 text-sm">Total</p>
          <p className="text-2xl font-bold text-gray-900">
            ₹{order.total?.toFixed(2) || '0.00'}
          </p>
        </div>
      </div>

      {canCancel && onCancel && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button
            variant="danger"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onCancel(orderId);
            }}
            className="w-full"
          >
            Cancel Order
          </Button>
        </div>
      )}
    </div>
  );
}