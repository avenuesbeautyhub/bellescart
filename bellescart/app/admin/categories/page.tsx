'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function CategoryManagementPage() {
  const [categories] = useState([
    { id: '1', name: 'Clothing', description: 'Apparel and clothing items', productCount: 45 },
    { id: '2', name: 'Accessories', description: 'Bags, belts, and accessories', productCount: 32 },
    { id: '3', name: 'Jewelry', description: 'Rings, necklaces, and earrings', productCount: 28 },
    { id: '4', name: 'Footwear', description: 'Shoes and boots', productCount: 56 },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });

  const handleAddCategory = () => {
    console.log('Adding category:', newCategory);
    setNewCategory({ name: '', description: '' });
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Category Management</h1>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Add New Category'}
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Add Category Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Category</h2>
            <div className="space-y-4">
              <Input
                label="Category Name"
                value={newCategory.name}
                onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="e.g., Electronics"
              />
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Category Description"
                rows={3}
                value={newCategory.description}
                onChange={e => setNewCategory({ ...newCategory, description: e.target.value })}
              ></textarea>
              <div className="flex gap-4">
                <Button onClick={handleAddCategory}>Add Category</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(category => (
            <div key={category.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{category.name}</h3>
              <p className="text-gray-600 text-sm mb-3">{category.description}</p>
              <div className="mb-4 p-2 bg-blue-50 rounded">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">{category.productCount}</span> products
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="primary" className="flex-1">
                  Edit
                </Button>
                <Button size="sm" variant="danger" className="flex-1">
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
