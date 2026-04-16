'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { adminCategoryService, CategoryData } from '@/services/admin/categoryService';
import { globalToast } from '@/utils/globalToast';

export default function CategoryManagementPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newCategory, setNewCategory] = useState<CategoryData>({ name: '', description: '' });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await adminCategoryService.getAllCategories();
      if (response.success && response.data?.categories) {
        setCategories(response.data.categories);
      }
    } catch (error: any) {
      console.error('Failed to load categories:', error);
      globalToast.admin.error('Load Failed', 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      globalToast.admin.error('Validation Error', 'Category name is required');
      return;
    }

    try {
      const response = await adminCategoryService.createCategory(newCategory);
      if (response.success) {
        globalToast.admin.success('Category Created', 'Category has been created successfully');
        setNewCategory({ name: '', description: '' });
        setShowForm(false);
        loadCategories(); // Refresh the list
      } else {
        globalToast.admin.error('Creation Failed', response.message || 'Failed to create category');
      }
    } catch (error: any) {
      console.error('Failed to create category:', error.message);
      globalToast.admin.error('Network Error', error.message || 'Network error occurred');
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the category "${name}"?`)) {
      return;
    }

    try {
      const response = await adminCategoryService.deleteCategory(id);
      if (response.success) {
        globalToast.admin.success('Category Deleted', `Category "${name}" has been deleted`);
        loadCategories(); // Refresh the list
      } else {
        // Handle specific error for category being used by products
        if (response.message?.includes('being used by one or more products')) {
          globalToast.admin.error(
            'Cannot Delete Category',
            `Category "${name}" is being used by products. Please reassign or delete those products first.`
          );
        } else {
          globalToast.admin.error('Deletion Failed', response.message || 'Failed to delete category');
        }
      }
    } catch (error: any) {
      console.error('Failed to delete category:', error);
      // Handle specific error for category being used by products
      if (error.message?.includes('being used by one or more products')) {
        globalToast.admin.error(
          'Cannot Delete Category',
          `Category "${name}" is being used by products. Please reassign or delete those products first.`
        );
      } else {
        globalToast.admin.error('Network Error', error.message || 'Network error occurred');
      }
    }
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
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
        {categories.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                <path d="M8 16h.01M8 24h.01M8 32h.01M16 8h.01M16 16h.01M16 24h.01M16 32h.01M24 8h.01M24 16h.01M24 24h.01M24 32h.01M32 8h.01M32 16h.01M32 24h.01M32 32h.01M40 8h.01M40 16h.01M40 24h.01M40 32h.01" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="mt-2 text-lg font-medium text-gray-900">No categories found</p>
              <p className="text-sm text-gray-500">Get started by creating your first category</p>
              <Button onClick={() => setShowForm(true)} className="mt-4">
                Add New Category
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map(category => (
              <div key={category._id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{category.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{category.description}</p>
                <div className="mb-4 p-2 bg-blue-50 rounded">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">{category.productCount || 0}</span> products
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    className="flex-1"
                    onClick={() => router.push(`/admin/categories/edit/${category._id}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    className="flex-1"
                    onClick={() => handleDeleteCategory(category._id, category.name)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
