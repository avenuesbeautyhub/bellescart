'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import { adminProductService } from '@/services/admin/productService';
import { adminUserService } from '@/services/admin/userService';
import { globalToast } from '@/utils/globalToast';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
  totalUsers: number;
  loading: boolean;
}

interface RecentOrder {
  id: string;
  customer: string;
  amount: string;
  status: string;
}

interface ChartData {
  daily: { label: string; value: number }[];
  monthly: { label: string; value: number }[];
  yearly: { label: string; value: number }[];
}

export default function AdminDashboard() {
  const [timeframe, setTimeframe] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeUsers: 0,
    totalUsers: 0,
    loading: true,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const productsResponse = await adminProductService.getProducts({ limit: 1000 });
      const productCount = productsResponse.success ? productsResponse.data?.products?.length || 0 : 0;

      const usersResponse = await adminUserService.getUsers({ limit: 1000 });
      const users = usersResponse.success ? usersResponse.data?.users || [] : [];
      const activeUsers = users.filter(user => user.isActive === true).length;
      console.log('active users', activeUsers);

      setStats({
        totalProducts: productCount,
        totalOrders: 0,
        totalRevenue: 0,
        activeUsers: activeUsers,
        totalUsers: users.length,
        loading: false,
      });
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      globalToast.admin.error('Load Failed', 'Failed to load dashboard data');
    }
  };

  const chartData = {
    daily: [
      { label: 'Mon', value: 25 },
      { label: 'Tue', value: 32 },
      { label: 'Wed', value: 28 },
      { label: 'Thu', value: 40 },
      { label: 'Fri', value: 35 },
      { label: 'Sat', value: 22 },
      { label: 'Sun', value: 30 },
    ],
    monthly: [
      { label: 'Jan', value: 120 },
      { label: 'Feb', value: 150 },
      { label: 'Mar', value: 180 },
      { label: 'Apr', value: 210 },
      { label: 'May', value: 240 },
      { label: 'Jun', value: 200 },
      { label: 'Jul', value: 260 },
      { label: 'Aug', value: 230 },
      { label: 'Sep', value: 270 },
      { label: 'Oct', value: 290 },
      { label: 'Nov', value: 310 },
      { label: 'Dec', value: 340 },
    ],
    yearly: [
      { label: '2021', value: 1800 },
      { label: '2022', value: 2100 },
      { label: '2023', value: 2400 },
      { label: '2024', value: 2800 },
    ],
  };

  const selectedChart = chartData[timeframe];
  const maxChartValue = Math.max(...selectedChart.map(point => point.value));

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-blue-50 p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm font-semibold mb-2">Total Products</p>
            <p className="text-3xl font-bold text-gray-900">{stats.loading ? '...' : stats.totalProducts}</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm font-semibold mb-2">Total Orders</p>
            <p className="text-3xl font-bold text-gray-900">{stats.loading ? '...' : stats.totalOrders}</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm font-semibold mb-2">Total Revenue</p>
            <p className="text-3xl font-bold text-gray-900">{stats.loading ? '...' : `₹${stats.totalRevenue.toLocaleString()}`}</p>
          </div>
          <div className="bg-orange-50 p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm font-semibold mb-2">Active Users</p>
            <p className="text-3xl font-bold text-gray-900">{stats.loading ? '...' : stats.activeUsers}</p>
          </div>
        </div>

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

        <div className="bg-white rounded-lg shadow p-6 mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Order Trends</h2>
              <p className="text-gray-600 text-sm">Track order volume over time.</p>
            </div>
            <div className="flex gap-2">
              {['daily', 'monthly', 'yearly'].map(option => (
                <button
                  key={option}
                  onClick={() => setTimeframe(option as 'daily' | 'monthly' | 'yearly')}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition ${timeframe === option
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
            <div className="overflow-x-auto">
              <div className="min-w-[320px] sm:min-w-[640px] h-72 flex items-end gap-2 px-2">
                {selectedChart.map((point: any) => (
                  <div key={point.label} className="flex-1 min-w-[48px] max-w-[80px] flex flex-col justify-end items-center gap-2">
                    <div className="w-full bg-gray-100 rounded-full overflow-hidden h-48 flex items-end">
                      <div
                        className="w-full bg-pink-500 rounded-b-full transition-all duration-300"
                        style={{ height: `${(point.value / maxChartValue) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 text-center break-words">{point.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">{timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} Summary</h3>
              <p className="text-gray-600 text-sm mb-4">Latest order volume performance and trend data.</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-700">
                  <span>Total points</span>
                  <span className="font-semibold text-gray-900">{selectedChart.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-700">
                  <span>Highest value</span>
                  <span className="font-semibold text-gray-900">{maxChartValue}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-700">
                  <span>Average</span>
                  <span className="font-semibold text-gray-900">{Math.round(selectedChart.reduce((sum, item) => sum + item.value, 0) / selectedChart.length)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Order management not implemented yet
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
