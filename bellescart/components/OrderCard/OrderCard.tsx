import React from 'react';
import { Order } from '@/utils/types';
import Badge from '@/components/ui/Badge';

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
}

export default function OrderCard({ order, onClick }: OrderCardProps) {
  const statusColors = {
    pending: 'warning',
    shipped: 'primary',
    delivered: 'success',
    cancelled: 'danger',
  } as const;

  return (
    <div
      onClick={onClick}
      className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Order #{order.id}</h3>
          <p className="text-gray-600 text-sm mt-1">{order.date}</p>
        </div>
        <Badge variant={statusColors[order.status]}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </Badge>
      </div>

      <div className="mb-4">
        <p className="text-gray-600 text-sm">Shipping Address</p>
        <p className="text-gray-800">{order.shippingAddress}</p>
      </div>

      <div className="flex justify-between items-end">
        <div>
          <p className="text-gray-600 text-sm">Items</p>
          <p className="font-semibold text-gray-800">{order.items.length} item(s)</p>
        </div>
        <div className="text-right">
          <p className="text-gray-600 text-sm">Total</p>
          <p className="text-2xl font-bold text-gray-900">₹{order.total.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
