'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export default function ProductManagementPage() {
  const router = useRouter();
  const [products] = useState([
    {
      id: '1',
      name: 'Gold Bangles Set',
      price: '₹29,999',
      category: 'Jewelry',
      stock: 25,
      status: 'active',
    },
    {
      id: '2',
      name: 'Diamond Necklace',
      price: '₹89,999',
      category: 'Jewelry',
      stock: 5,
      status: 'active',
    },
    {
      id: '3',
      name: 'Silver Earrings',
      price: '₹7,999',
      category: 'Jewelry',
      stock: 50,
      status: 'active',
    },
    {
      id: '4',
      name: 'Perfume Gift Set',
      price: '₹14,999',
      category: 'Perfumes',
      stock: 30,
      status: 'active',
    },
  ]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Product Management</h1>
          <div className="flex gap-4">
            <Button onClick={() => router.push('/admin/products/add')}>Add New Product</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder="Search products..."
            className="flex-1 min-w-0 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none">
            <option>All Categories</option>
            <option>Clothing</option>
            <option>Accessories</option>
            <option>Jewelry</option>
            <option>Footwear</option>
          </select>
          <select className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none">
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
            <option>Out of Stock</option>
          </select>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">
                    Product Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">
                    Stock
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
                {products.map(product => (
                  <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                      {product.price}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.stock}</td>
                    <td className="px-6 py-4 text-sm">
                      <Badge variant={product.status === 'active' ? 'success' : 'danger'}>
                        {product.status === 'active'
                          ? 'Active'
                          : product.status === 'out-of-stock'
                            ? 'Out of Stock'
                            : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <Button size="sm" variant="primary">
                          Edit
                        </Button>
                        <Button size="sm" variant="danger">
                          Delete
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
