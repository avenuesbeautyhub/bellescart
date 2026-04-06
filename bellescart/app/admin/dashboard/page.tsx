'use client';

import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export default function AdminDashboard() {
  const stats = [
    { label: 'Total Products', value: '234', color: 'bg-blue-50' },
    { label: 'Total Orders', value: '1,256', color: 'bg-green-50' },
    { label: 'Total Revenue', value: '₹45,89,000', color: 'bg-purple-50' },
    { label: 'Active Users', value: '892', color: 'bg-orange-50' },
  ];

  const recentOrders = [
    { id: 'ORD-001', customer: 'John Doe', amount: '₹8,999', status: 'delivered' },
    { id: 'ORD-002', customer: 'Jane Smith', amount: '₹15,650', status: 'shipped' },
    { id: 'ORD-003', customer: 'Mike Johnson', amount: '₹23,400', status: 'pending' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <Link href="/admin">
            <Button variant="outline">Logout</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className={`${stat.color} p-6 rounded-lg shadow`}>
              <p className="text-gray-600 text-sm font-semibold mb-2">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Link href="/admin/products">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer">
              <div className="text-4xl mb-2">📦</div>
              <h3 className="text-lg font-semibold text-gray-800">Products</h3>
              <p className="text-gray-600 text-sm">Manage inventory</p>
            </div>
          </Link>

          <Link href="/admin/categories">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer">
              <div className="text-4xl mb-2">🏷️</div>
              <h3 className="text-lg font-semibold text-gray-800">Categories</h3>
              <p className="text-gray-600 text-sm">Manage categories</p>
            </div>
          </Link>

          <Link href="/admin/orders">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer">
              <div className="text-4xl mb-2">📋</div>
              <h3 className="text-lg font-semibold text-gray-800">Orders</h3>
              <p className="text-gray-600 text-sm">Manage orders</p>
            </div>
          </Link>

          <Link href="/admin/users">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer">
              <div className="text-4xl mb-2">👥</div>
              <h3 className="text-lg font-semibold text-gray-800">Users</h3>
              <p className="text-gray-600 text-sm">Manage users</p>
            </div>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.customer}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                      {order.amount}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Badge
                        variant={
                          order.status === 'delivered'
                            ? 'success'
                            : order.status === 'shipped'
                            ? 'primary'
                            : 'warning'
                        }
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
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
