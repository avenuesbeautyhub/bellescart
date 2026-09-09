'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useAdminProducts, useDeleteProduct, useAdminCategories } from '@/hooks/user/useAdminQueries';
import { globalToast } from '@/utils/globalToast';

interface Product {
  _id: string;
  id?: string;
  name: string;
  description: string;
  price: number;
  category?: {
    _id: string;
    name: string;
  };
  quantity: number;
  status: 'active' | 'inactive' | 'draft';
  featured?: boolean;
  images?: {
    url: string;
    alt: string;
    isMain: boolean;
  }[];
  tags?: string[];
  brand?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function ProductManagementPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);

  // React Query hooks
  const { data: productsData, isLoading } = useAdminProducts({
    page: currentPage,
    limit: 10,
    search: searchTerm.trim() || undefined,
    category: selectedCategory || undefined,
    status: selectedStatus || undefined,
  });
  const { data: categoriesData } = useAdminCategories();
  const deleteProduct = useDeleteProduct();

  const products: Product[] = productsData?.data?.products || [];
  const categories = categoriesData?.data?.categories || [];
  const totalProducts = products.length;

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await deleteProduct.mutateAsync(id);
      globalToast.admin.success('Product Deleted', `Product "${name}" has been deleted`);
    } catch (error: any) {
      console.error('Failed to delete product:', error);
      globalToast.admin.error('Network Error', error.message || 'Network error occurred');
    }
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-0 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-gray-500">Loading products...</div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                    <path d="M8 16h.01M8 24h.01M8 32h.01M16 8h.01M16 16h.01M16 24h.01M16 32h.01M24 8h.01M24 16h.01M24 24h.01M24 32h.01M32 8h.01M32 16h.01M32 24h.01M32 32h.01M40 8h.01M40 16h.01M40 24h.01M40 32h.01" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="mt-2 text-lg font-medium text-gray-900">No products found</p>
                  <p className="text-sm text-gray-500">Get started by creating your first product</p>
                  <Button onClick={() => router.push('/admin/products/add')} className="mt-4">
                    Add New Product
                  </Button>
                </div>
              </div>
            ) : (
              <table className="min-w-[720px] w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">
                      #
                    </th>
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

                  </tr>
                </thead>
                <tbody>
                  {products.map((product: Product, index: number) => (
                    <tr
                      key={product._id}
                      className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleProductClick(product)}
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                        {(currentPage - 1) * 10 + index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {product.category?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                        ${product.price}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {product.quantity || 0}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Badge variant={product.status === 'active' ? 'success' : product.status === 'inactive' ? 'danger' : 'warning'}>
                          {product.status === 'active'
                            ? 'Active'
                            : product.status === 'inactive'
                              ? 'Inactive'
                              : 'Draft'}
                        </Badge>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* Product Detail Modal */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Product Details</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Images */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Product Images</h3>
                  <div className="space-y-3">
                    {selectedProduct.images && selectedProduct.images.length > 0 ? (
                      selectedProduct.images.map((image: any, index: number) => (
                        <div key={index} className="relative group">
                          <img
                            src={image.url || '/placeholder-image.jpg'}
                            alt={image.alt || `Product image ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg border border-gray-200"
                          />
                          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                            {index === 0 ? 'Main' : `Image ${index + 1}`}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                        <div className="text-center">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="mt-2 text-sm text-gray-500">No images available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Product Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedProduct.name}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                        {selectedProduct.description || 'No description available'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Category</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedProduct.category?.name || 'Unknown'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Brand</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedProduct.brand || 'Not specified'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Price</label>
                        <p className="mt-1 text-sm text-gray-900">₹{selectedProduct.price}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Stock</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedProduct.quantity || 0} pcs</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <div className="mt-1">
                        <Badge variant={selectedProduct.status === 'active' ? 'success' : selectedProduct.status === 'inactive' ? 'danger' : 'warning'}>
                          {selectedProduct.status === 'active'
                            ? 'Active'
                            : selectedProduct.status === 'inactive'
                              ? 'Inactive'
                              : 'Draft'}
                        </Badge>
                      </div>
                    </div>

                    {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tags</label>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {selectedProduct.tags.map((tag: string, index: number) => (
                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Featured</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedProduct.featured ? 'Yes' : 'No'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                      <div>
                        <label className="block font-medium text-gray-700">Created</label>
                        <p className="mt-1">
                          {selectedProduct.createdAt ? new Date(selectedProduct.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block font-medium text-gray-700">Updated</label>
                        <p className="mt-1">
                          {selectedProduct.updatedAt ? new Date(selectedProduct.updatedAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end gap-3">
                <Button variant="outline" onClick={closeModal}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    router.push(`/admin/products/edit/${selectedProduct._id}`);
                    closeModal();
                  }}
                >
                  Edit Product
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
