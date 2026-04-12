'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAdminAuth } from '@/auth/admin';
import { useAdminAuthActions } from '@/auth/admin/actions';

export default function AdminLoginPage() {
  const { loaded, isAuthenticated } = useAdminAuth();
  const { adminLogin } = useAdminAuthActions();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Redirect authenticated admin users to dashboard
  if (loaded && isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Redirecting to admin dashboard...</p>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminLogin({
        email: formData.email,
        password: formData.password
      });
      // Redirect will be handled by useRequireAdminAuth
    } catch (error) {
      console.error('Admin login error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-pink-500">BellesCart</h1>
            <p className="text-gray-600 mt-2">Admin Portal</p>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Admin Login</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="admin@bellescart.com"
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="•••••••"
            />

            <Button type="submit" className="w-full">
              Login to Admin Dashboard
            </Button>
          </form>

          <p className="text-center text-gray-600 mt-6 text-sm">
            For admin access only. Unauthorized access is prohibited.
          </p>
        </div>
      </div>
    </div>
  );
};
