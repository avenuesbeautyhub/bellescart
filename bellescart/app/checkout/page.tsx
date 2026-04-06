'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRequireAuth } from '@/utils/auth';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

export default function CheckoutPage() {
  const { loaded, isAuthenticated } = useRequireAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Order placed:', formData);
    // Handle order submission
  };

  const total = 79.98;
  const shipping = 0;
  const tax = 7.99;
  const grandTotal = total + shipping + tax;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shipping & Billing Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Shipping Address */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Shipping Address</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                    <Input
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <Input
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="City"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                    <Input
                      label="State"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="ZIP Code"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      required
                    />
                    <Select
                      label="Country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      options={[
                        { value: 'US', label: 'United States' },
                        { value: 'CA', label: 'Canada' },
                        { value: 'MX', label: 'Mexico' },
                      ]}
                      required
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Method</h2>
                  <div className="space-y-3">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        defaultChecked
                        className="w-4 h-4"
                      />
                      <span className="ml-3">Credit Card</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" name="payment" value="paypal" className="w-4 h-4" />
                      <span className="ml-3">PayPal</span>
                    </label>
                  </div>
                </div>

                <Button variant="primary" size="lg" className="w-full">
                  Place Order
                </Button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 h-fit">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Summary</h2>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Classic White T-Shirt x 2</span>
                    <span className="text-gray-900 font-semibold">₹5998</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900 font-semibold">₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-600 font-semibold">FREE</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900 font-semibold">₹{tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="font-semibold text-gray-800">Total</span>
                  <span className="text-2xl font-bold text-gray-900">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <Link href="/cart">
                <Button variant="outline" className="w-full">
                  Back to Cart
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}