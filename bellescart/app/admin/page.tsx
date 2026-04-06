'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Admin login:', formData);
    // Handle admin login
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
              placeholder="••••••••"
            />

            <Link href="/admin/dashboard">
              <Button type="submit" className="w-full">
                Login to Admin Dashboard
              </Button>
            </Link>
          </form>

          <p className="text-center text-gray-600 mt-6 text-sm">
            For admin access only. Unauthorized access is prohibited.
          </p>
        </div>
      </div>
    </div>
  );
}
