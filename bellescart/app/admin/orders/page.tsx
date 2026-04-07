'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export default function OrderManagementPage() {
  const [orders, setOrders] = useState([
    {
      id: 'ORD-001',
      customer: 'John Doe',
      email: 'john@example.com',
      amount: '₹8,999',
      status: 'delivered',
      date: '2024-03-15',
      items: 2,
    },
    {
      id: 'ORD-002',
      customer: 'Jane Smith',
      email: 'jane@example.com',
      amount: '₹15,650',
      status: 'shipped',
      date: '2024-04-01',
      items: 3,
    },
    {
      id: 'ORD-003',
      customer: 'Mike Johnson',
      email: 'mike@example.com',
      amount: '₹23,400',
      status: 'pending',
      date: '2024-04-03',
      items: 5,
    },
    {
      id: 'ORD-004',
      customer: 'Sarah Williams',
      email: 'sarah@example.com',
      amount: '₹6,750',
      status: 'cancelled',
      date: '2024-04-02',
      items: 1,
    },
  ]);

  const [draftStatus, setDraftStatus] = useState<Record<string, string>>({});

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    setDraftStatus(prev => ({ ...prev, [orderId]: newStatus }));
  };

  const setDraftOrderStatus = (orderId: string, newStatus: string) => {
    setDraftStatus(prev => ({ ...prev, [orderId]: newStatus }));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Order Management</h1>
          <Button variant="secondary">Export Orders</Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder="Search by order ID or customer..."
            className="flex-1 min-w-0 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none">
            <option>All Status</option>
            <option>Pending</option>
            <option>Shipped</option>
            <option>Delivered</option>
            <option>Cancelled</option>
          </select>
          <input
            type="date"
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
          />
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">
                    Items
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <p className="font-semibold text-gray-800">{order.customer}</p>
                        <p className="text-gray-600 text-xs">{order.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.date}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                      {order.amount}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.items}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="space-y-2">
                        <Badge
                          variant={
                            order.status === 'delivered'
                              ? 'success'
                              : order.status === 'shipped'
                              ? 'primary'
                              : order.status === 'pending'
                              ? 'warning'
                              : 'danger'
                          }
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                        <select
                          value={draftStatus[order.id] ?? order.status}
                          onChange={(e) => setDraftOrderStatus(order.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <Button size="sm" variant="primary">
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => updateOrderStatus(order.id, draftStatus[order.id] ?? order.status)}
                        >
                          Save
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
