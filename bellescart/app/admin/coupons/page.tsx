'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { useAdminCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon } from '@/hooks/user/useAdminQueries';
import { adminCouponService, CouponData } from '@/services/admin/couponService';
import { globalToast } from '@/utils/globalToast';

export default function CouponManagementPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any | null>(null);
  const [formData, setFormData] = useState<CouponData>({
    code: '',
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    category: '',
    minOrderValue: 0,
    maxDiscount: undefined,
    usageLimit: 0,
    usageLimitPerUser: 1,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
    active: true
  });

  // React Query hooks
  const { data: couponsData, isLoading } = useAdminCoupons();
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const coupons = couponsData?.data?.coupons || [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value
    }));
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      discountType: 'percentage',
      discountValue: 0,
      category: '',
      minOrderValue: 0,
      maxDiscount: undefined,
      usageLimit: 0,
      usageLimitPerUser: 1,
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: '',
      active: true
    });
    setEditingCoupon(null);
    setShowForm(false);
  };

  const handleAddCoupon = async () => {
    if (!formData.code.trim() || !formData.name.trim() || !formData.validFrom || !formData.validUntil) {
      globalToast.admin.error('Validation Error', 'Please fill in all required fields (code, name, valid from, valid until)');
      return;
    }

    // Check for duplicate code on frontend
    const existingCoupon = coupons.find(c => c.code && c.code.toUpperCase() === formData.code.toUpperCase());
    if (existingCoupon) {
      globalToast.admin.error('Duplicate Code', 'A coupon with this code already exists');
      return;
    }

    try {
      const couponData = {
        code: formData.code.toUpperCase().trim(),
        name: formData.name.trim(),
        description: formData.description?.trim(),
        discountType: formData.discountType,
        discountValue: formData.discountValue,
        category: formData.category?.trim(),
        minOrderValue: formData.minOrderValue || 0,
        maxDiscount: formData.maxDiscount,
        usageLimit: formData.usageLimit !== undefined ? formData.usageLimit : 0,
        usageLimitPerUser: formData.usageLimitPerUser || 1,
        validFrom: new Date(formData.validFrom).toISOString(),
        validUntil: new Date(formData.validUntil).toISOString(),
        active: formData.active !== undefined ? formData.active : true
      };
      await createCoupon.mutateAsync(couponData);
      globalToast.admin.success('Coupon Created', 'Coupon has been created successfully');
      resetForm();
    } catch (error: any) {
      console.error('Failed to create coupon:', error);
      if (error.message?.includes('Coupon code already exists')) {
        globalToast.admin.error('Duplicate Code', 'A coupon with this code already exists');
      } else {
        globalToast.admin.error('Network Error', error.message || 'Network error occurred');
      }
    }
  };

  const handleEditCoupon = (coupon: any) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code || '',
      name: coupon.name || '',
      description: coupon.description || '',
      discountType: coupon.discountType || 'percentage',
      discountValue: coupon.discountValue || 0,
      category: coupon.category || '',
      minOrderValue: coupon.minOrderValue || 0,
      maxDiscount: coupon.maxDiscount,
      usageLimit: coupon.usageLimit !== undefined ? coupon.usageLimit : 0,
      usageLimitPerUser: coupon.usageLimitPerUser || 1,
      validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : '',
      active: coupon.active !== undefined ? coupon.active : true
    });
    setShowForm(true);
  };

  const handleUpdateCoupon = async () => {
    if (!editingCoupon) return;

    if (!formData.validFrom || !formData.validUntil) {
      globalToast.admin.error('Validation Error', 'Please fill in all required fields (valid from, valid until)');
      return;
    }

    // Check for duplicate code on frontend (excluding current coupon)
    const existingCoupon = coupons.find(c => c.code && c.code.toUpperCase() === formData.code.toUpperCase() && c._id !== editingCoupon._id);
    if (existingCoupon) {
      globalToast.admin.error('Duplicate Code', 'A coupon with this code already exists');
      return;
    }

    try {
      const couponData = {
        code: formData.code.toUpperCase().trim(),
        name: formData.name.trim(),
        description: formData.description?.trim(),
        discountType: formData.discountType,
        discountValue: formData.discountValue,
        category: formData.category?.trim(),
        minOrderValue: formData.minOrderValue || 0,
        maxDiscount: formData.maxDiscount,
        usageLimit: formData.usageLimit !== undefined ? formData.usageLimit : 0,
        usageLimitPerUser: formData.usageLimitPerUser || 1,
        validFrom: new Date(formData.validFrom).toISOString(),
        validUntil: new Date(formData.validUntil).toISOString(),
        active: formData.active !== undefined ? formData.active : true
      };
      await updateCoupon.mutateAsync({ id: editingCoupon._id, couponData });
      globalToast.admin.success('Coupon Updated', 'Coupon has been updated successfully');
      resetForm();
    } catch (error: any) {
      console.error('Failed to update coupon:', error);
      if (error.message?.includes('Coupon code already exists')) {
        globalToast.admin.error('Duplicate Code', 'A coupon with this code already exists');
      } else {
        globalToast.admin.error('Network Error', error.message || 'Network error occurred');
      }
    }
  };

  const handleDeleteCoupon = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete the coupon "${code}"?`)) {
      return;
    }

    try {
      await deleteCoupon.mutateAsync(id);
      globalToast.admin.success('Coupon Deleted', `Coupon "${code}" has been deleted`);
    } catch (error: any) {
      console.error('Failed to delete coupon:', error);
      globalToast.admin.error('Network Error', error.message || 'Network error occurred');
    }
  };

  const isCouponExpired = (validUntil: string) => {
    if (!validUntil) return false;
    const expiryDate = new Date(validUntil);
    return !isNaN(expiryDate.getTime()) && expiryDate < new Date();
  };

  const isCouponUpcoming = (validFrom: string) => {
    if (!validFrom) return false;
    const startDate = new Date(validFrom);
    return !isNaN(startDate.getTime()) && startDate > new Date();
  };

  const getCouponStatus = (coupon: any) => {
    if (coupon.active === false) return { status: 'Inactive', variant: 'danger' as const };
    if (isCouponExpired(coupon.validUntil)) return { status: 'Expired', variant: 'danger' as const };
    if (isCouponUpcoming(coupon.validFrom)) return { status: 'Upcoming', variant: 'warning' as const };
    return { status: 'Active', variant: 'success' as const };
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Coupon Management</h1>
          <Button onClick={() => { resetForm(); setShowForm(!showForm); }}>
            {showForm ? 'Cancel' : 'Add New Coupon'}
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Add/Edit Coupon Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Coupon Code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                placeholder="e.g., SAVE20"
                required
              />
              <Input
                label="Coupon Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., 20% Off Sale"
                required
              />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  placeholder="Coupon description"
                  rows={2}
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                <select
                  name="discountType"
                  value={formData.discountType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                  <option value="free_shipping">Free Shipping</option>
                </select>
              </div>
              <Input
                label="Discount Value"
                name="discountValue"
                type="number"
                value={formData.discountValue}
                onChange={handleInputChange}
                placeholder="e.g., 20 for 20% or ₹20"
                required
              />
              {formData.discountType === 'percentage' && (
                <Input
                  label="Maximum Discount (₹)"
                  name="maxDiscount"
                  type="number"
                  value={formData.maxDiscount || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., 100"
                />
              )}
              <Input
                label="Category (Optional)"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="e.g., Rings"
              />
              <Input
                label="Minimum Order Value (₹)"
                name="minOrderValue"
                type="number"
                value={formData.minOrderValue}
                onChange={handleInputChange}
                placeholder="e.g., 500"
              />
              <Input
                label="Usage Limit (0 for unlimited)"
                name="usageLimit"
                type="number"
                value={formData.usageLimit}
                onChange={handleInputChange}
                placeholder="e.g., 100"
              />
              <Input
                label="Usage Limit Per User"
                name="usageLimitPerUser"
                type="number"
                value={formData.usageLimitPerUser}
                onChange={handleInputChange}
                placeholder="e.g., 1"
              />
              <Input
                label="Valid From"
                name="validFrom"
                type="date"
                value={formData.validFrom}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Valid Until"
                name="validUntil"
                type="date"
                value={formData.validUntil}
                onChange={handleInputChange}
                required
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  checked={formData.active}
                  onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="active" className="text-sm font-medium text-gray-700">Active</label>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <Button onClick={editingCoupon ? handleUpdateCoupon : handleAddCoupon}>
                {editingCoupon ? 'Update Coupon' : 'Add Coupon'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Coupons Grid */}
        {isLoading ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <div className="text-gray-500">Loading coupons...</div>
          </div>
        ) : coupons.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                <path d="M8 16h.01M8 24h.01M8 32h.01M16 8h.01M16 16h.01M16 24h.01M16 32h.01M24 8h.01M24 16h.01M24 24h.01M24 32h.01M32 8h.01M32 16h.01M32 24h.01M32 32h.01M40 8h.01M40 16h.01M40 24h.01M40 32h.01" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="mt-2 text-lg font-medium text-gray-900">No coupons found</p>
              <p className="text-sm text-gray-500">Get started by creating your first coupon</p>
              <Button onClick={() => { resetForm(); setShowForm(true); }} className="mt-4">
                Add New Coupon
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Code</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Discount</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Usage</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Valid Period</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon: any) => {
                    const { status, variant } = getCouponStatus(coupon);
                    return (
                      <tr key={coupon._id || coupon.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-semibold text-gray-800">{coupon.code || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{coupon.name || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : 
                           coupon.discountType === 'fixed' ? `₹${coupon.discountValue}` : 
                           'Free Shipping'}
                          {coupon.maxDiscount && coupon.discountType === 'percentage' && ` (max ₹${coupon.maxDiscount})`}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{coupon.category || 'All'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {coupon.usageLimit === 0 || coupon.usageLimit === undefined || coupon.usageLimit === null ? 'Unlimited' : `${coupon.usedCount || 0}/${coupon.usageLimit}`}
                          <span className="text-xs text-gray-500 block">per user: {coupon.usageLimitPerUser || 1}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="text-xs">
                            <div>From: {coupon.validFrom ? new Date(coupon.validFrom).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not set'}</div>
                            <div>Until: {coupon.validUntil ? new Date(coupon.validUntil).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not set'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Badge variant={variant}>{status}</Badge>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleEditCoupon(coupon)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDeleteCoupon(coupon._id || coupon.id, coupon.code)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}