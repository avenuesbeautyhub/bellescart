'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRequireUserAuth } from '@/auth/user';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Loader from '@/components/ui/Loader';
import Badge from '@/components/ui/Badge';
import { cartService } from '@/services/cartService';
import { orderService, CreateOrderRequest, ShippingAddress } from '@/services/orderService';
import { paymentService } from '@/services/paymentService';
import { authService } from '@/services/authService';
import { globalToast } from '@/utils/globalToast';
import { Address } from '@/types/auth';

export default function CheckoutPage() {
  const router = useRouter();
  const { loaded, isAuthenticated } = useRequireUserAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [formData, setFormData] = useState<{
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    paymentMethod: 'razorpay' | 'credit_card' | 'debit_card' | 'paypal' | 'cash_on_delivery';
    notes: string;
  }>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'IN',
    paymentMethod: 'razorpay',
    notes: '',
  });

  // Load cart data and user profile when authenticated
  useEffect(() => {
    if (loaded && isAuthenticated) {
      loadCart();
      loadUserProfile();
    }
  }, [loaded, isAuthenticated]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const loadCart = async () => {
    try {
      setIsLoading(true);
      const response = await cartService.getCart();
      if (response.success && response.data?.items) {
        setCartItems(response.data.items);
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
      globalToast.cart.loadFailed();
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      const response = await authService.getCurrentUser();
      if (response.success && response.data) {
        const userData = response.data;
        setFormData(prev => ({
          ...prev,
          fullName: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
        }));
        if (userData.addresses && userData.addresses.length > 0) {
          setSavedAddresses(userData.addresses);
          const defaultAddress = userData.addresses.find((addr: Address) => addr.isDefault);
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress._id || null);
            setFormData(prev => ({
              ...prev,
              address: defaultAddress.address || '',
              city: defaultAddress.city || '',
              state: defaultAddress.state || '',
              zipCode: defaultAddress.zipCode || '',
              country: defaultAddress.country || 'IN',
            }));
          }
        }
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  // Show loader while checking authentication
  if (!loaded) {
    return <Loader size="lg" text="Loading..." fullScreen />;
  }

  if (!isAuthenticated) return null;

  if (isLoading) {
    return <Loader size="lg" text="Loading checkout..." fullScreen />;
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Add items to your cart before checkout</p>
            <Link href="/products">
              <Button>Browse Products</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressSelect = (address: Address) => {
    setSelectedAddressId(address._id || null);
    setFormData(prev => ({
      ...prev,
      address: address.address || '',
      city: address.city || '',
      state: address.state || '',
      zipCode: address.zipCode || '',
      country: address.country || 'IN',
    }));
    setShowNewAddressForm(false);
  };

  const validateForm = (): boolean => {
    const requiredFields = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'zipCode', 'country'];
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        globalToast.general.error('Validation Error', `Please fill in all required fields`);
        return false;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      globalToast.general.error('Invalid Email', 'Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      const shippingAddress: ShippingAddress = {
        street: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
      };

      // If Razorpay payment, create payment order first
      if (formData.paymentMethod === 'razorpay') {
        const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
        const shipping = subtotal > 50 ? 0 : 10;
        const grandTotal = subtotal + shipping;

        const paymentResponse = await paymentService.createPaymentIntent({
          amount: grandTotal,
          currency: 'INR',
        });

        if (paymentResponse.success && paymentResponse.data) {
          const { orderId: razorpayOrderId, keyId, amount, currency } = paymentResponse.data;

          // Load Razorpay checkout
          const options = {
            key: keyId,
            amount: amount,
            currency: currency,
            name: 'BellesCart',
            description: 'Payment for order',
            order_id: razorpayOrderId,
            handler: async function (response: any) {
              // Verify payment signature on backend
              const verifyResponse = await paymentService.verifyPayment(
                response.razorpay_order_id,
                response.razorpay_payment_id,
                response.razorpay_signature
              );

              if (verifyResponse.success) {
                // Create order after successful payment
                const orderRequest: CreateOrderRequest = {
                  shippingAddress,
                  paymentMethod: formData.paymentMethod,
                  notes: formData.notes,
                  paymentId: response.razorpay_payment_id,
                };

                const orderResponse = await orderService.createOrder(orderRequest);

                if (orderResponse.success) {
                  globalToast.order.createSuccess();
                  await cartService.clearCart();
                  const orderId = orderResponse.data?.order?._id || orderResponse.data?.order?.id;
                  router.push(`/order-confirmation?orderId=${orderId}`);
                } else {
                  globalToast.order.createFailed(orderResponse.message);
                }
              } else {
                globalToast.order.createFailed('Payment verification failed');
              }
              setIsSubmitting(false);
            },
            prefill: {
              name: formData.fullName,
              email: formData.email,
              contact: formData.phone,
            },
            theme: {
              color: '#ec4899',
            },
          };

          const razorpay = (window as any).Razorpay(options);
          razorpay.on('payment.failed', function (response: any) {
            console.error('Payment failed:', response);
            const errorDescription = response.error?.description || response.error?.reason || 'Payment failed';
            globalToast.general.error('Payment Failed', errorDescription);
            setIsSubmitting(false);
          });
          razorpay.open();
          return;
        } else {
          globalToast.order.createFailed(paymentResponse.error || 'Failed to create payment order');
          setIsSubmitting(false);
          return;
        }
      }

      // For other payment methods (COD, etc.)
      const orderRequest: CreateOrderRequest = {
        shippingAddress,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
      };

      const response = await orderService.createOrder(orderRequest);

      if (response.success) {
        globalToast.order.createSuccess();
        await cartService.clearCart();
        const orderId = response.data?.order?._id || response.data?.order?.id;
        router.push(`/order-confirmation?orderId=${orderId}`);
      } else {
        globalToast.order.createFailed(response.message);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      globalToast.order.createFailed();
    } finally {
      setIsSubmitting(false);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  const shipping = subtotal > 50 ? 0 : 10;
  const grandTotal = subtotal + shipping;

  return (
    <div className="min-h-screen  flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Shipping & Billing Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Contact Information */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Contact Information
                  </h2>

                  <div className="space-y-4">
                    <Input
                      label="Full Name"
                      name="fullName"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />
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
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Saved Addresses */}
                {savedAddresses.length > 0 && (
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Saved Addresses
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {savedAddresses.map((address) => (
                        <div
                          key={address._id}
                          onClick={() => handleAddressSelect(address)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${selectedAddressId === address._id
                            ? 'border-pink-500 bg-pink-50'
                            : 'border-gray-200 hover:border-pink-300'
                            }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-gray-800">{address.label}</h3>
                            {address.isDefault && (
                              <Badge variant="success" className="text-xs">Default</Badge>
                            )}
                          </div>
                          <p className="text-gray-700 text-sm mb-1">{address.address}</p>
                          <p className="text-gray-600 text-sm">{address.city}, {address.state} {address.zipCode}</p>
                          <p className="text-gray-600 text-sm">{address.country}</p>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(true)}
                      className="mt-4 text-pink-600 hover:text-pink-700 font-medium text-sm flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add new address
                    </button>
                  </div>
                )}

                {/* New Address Form */}
                {(showNewAddressForm || savedAddresses.length === 0) && (
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {savedAddresses.length > 0 ? 'New Address' : 'Shipping Address'}
                    </h2>

                    <div className="space-y-4">
                      <Input
                        label="Street Address"
                        name="address"
                        placeholder="Enter your street address"
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
                            { value: 'IN', label: 'India' },
                            { value: 'US', label: 'United States' },
                            { value: 'GB', label: 'United Kingdom' },
                            { value: 'CA', label: 'Canada' },
                          ]}
                          required
                        />
                      </div>

                      {savedAddresses.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowNewAddressForm(false)}
                          className="text-gray-600 hover:text-gray-800 font-medium text-sm"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment Method */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Payment Method
                  </h2>
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-pink-300 hover:bg-pink-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="razorpay"
                        checked={formData.paymentMethod === 'razorpay'}
                        onChange={handleChange}
                        className="w-4 h-4 text-pink-500"
                        required
                      />
                      <div className="ml-3">
                        <span className="font-medium text-gray-800">Credit/Debit Card</span>
                        <p className="text-sm text-gray-500">Pay securely with Razorpay</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Additional Notes (Optional)
                  </h2>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all resize-none"
                    placeholder="Any special instructions for your order..."
                  />
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit sticky top-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Order Summary
                </h2>

                <div className="bg-gray-50 p-4 rounded-lg mb-6 max-h-64 overflow-y-auto">
                  <div className="space-y-4">
                    {cartItems.map(item => (
                      <div key={item._id} className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{item.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          ₹{((item.price || 0) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900 font-semibold">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900 font-semibold">
                      ₹{shipping.toFixed(2)}
                      {shipping === 0 && <span className="text-green-600 ml-2">(Free)</span>}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-4 flex justify-between">
                    <span className="font-semibold text-gray-800">Total</span>
                    <span className="text-2xl font-bold text-pink-600">₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Place Order'}
                </Button>

                <Link href="/cart" className="block mt-3">
                  <Button variant="outline" className="w-full">
                    ← Back to Cart
                  </Button>
                </Link>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}