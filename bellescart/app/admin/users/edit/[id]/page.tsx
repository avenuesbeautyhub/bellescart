'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { adminUserService, UserData } from '@/services/admin/userService';
import { globalToast } from '@/utils/globalToast';

interface EditUserData {
  name: string;
  email: string;
  phone_number: string;
}

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);

  const [formData, setFormData] = useState<EditUserData>({
    name: '',
    email: '',
    phone_number: ''
  });

  const [user, setUser] = useState<UserData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      const response = await adminUserService.getUsers();
      if (response.success && response.data?.users) {
        const foundUser = response.data.users.find(u => u.id === id);
        if (foundUser) {
          setUser(foundUser);
          setFormData({
            name: foundUser.name,
            email: foundUser.email,
            phone_number: foundUser.phone_number || ''
          });
        } else {
          globalToast.admin.error('Error', 'User not found');
          router.push('/admin/users');
        }
      }
    } catch (error: any) {
      console.error('Failed to load user:', error);
      globalToast.admin.error('Error', 'Failed to load user');
      router.push('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof EditUserData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      globalToast.admin.error('Validation Error', 'Name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await adminUserService.updateUser(id, {
        name: formData.name,
        email: formData.email,
        phone_number: formData.phone_number
      });

      if (response.success) {
        globalToast.admin.success('Success', 'User updated successfully');
        router.push('/admin/users');
      } else {
        globalToast.admin.error('Error', response.message || 'Failed to update user');
      }
    } catch (error: any) {
      console.error('Update user error:', error);
      globalToast.admin.error('Error', 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/users');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading user...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">User not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Edit User</h1>
          <Button variant="outline" onClick={handleCancel}>
            Back to Users
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />

            <Input
              label="Email"
              type="email"
              value={formData.email}
              readOnly
              className="bg-gray-100 cursor-not-allowed"
            />

            <Input
              label="Phone"
              type="tel"
              value={formData.phone_number}
              onChange={(e) => handleInputChange('phone_number', e.target.value)}
              placeholder="Enter phone number"
            />

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">User Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Role:</span>
                  <span className="ml-2 font-medium">{user.role === 'admin' ? 'Admin' : 'User'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className={`ml-2 font-medium ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Join Date:</span>
                  <span className="ml-2 font-medium">{new Date(user.joinDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-gray-500">Orders:</span>
                  <span className="ml-2 font-medium">{user.orders}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
