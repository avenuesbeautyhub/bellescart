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
import { useCart } from '@/contexts/CartContext';

export default function CheckoutPage() {
  const router = useRouter();
  const { loaded, isAuthenticated } = useRequireUserAuth();
  const { refreshCartCount } = useCart();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [shippingRates, setShippingRates] = useState<any[]>([]);
  const [selectedCourier, setSelectedCourier] = useState<any>(null);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [isRefreshingCart, setIsRefreshingCart] = useState(false);
  const [calculatedShippingFee, setCalculatedShippingFee] = useState<number>(0);
  const [courierAvailabilityError, setCourierAvailabilityError] = useState<string | null>(null);
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

  // Reload cart when page gains focus (in case user updated cart in another tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && loaded && isAuthenticated) {
        loadCart();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
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

  // Recalculate shipping fee when payment method changes
  useEffect(() => {
    if (selectedCourier) {
      const totalShippingFee = formData.paymentMethod === 'cash_on_delivery' 
        ? selectedCourier.rate + (selectedCourier.codCharges || 0)
        : selectedCourier.rate;
      setCalculatedShippingFee(totalShippingFee);
      console.log('💰 Payment method changed, updated shipping fee:', totalShippingFee);
    }
  }, [formData.paymentMethod, selectedCourier]);

  // Recalculate shipping when cart items change (quantity updates)
  useEffect(() => {
    if (formData.zipCode.length >= 6 && cartItems.length > 0 && !isCalculatingShipping) {
      console.log('🛒 Cart items changed, recalculating shipping...');
      calculateShipping(formData.zipCode, formData.paymentMethod);
    }
  }, [cartItems, formData.zipCode, formData.paymentMethod]);

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

  const refreshCart = async () => {
    try {
      setIsRefreshingCart(true);
      const response = await cartService.getCart();
      if (response.success && response.data?.items) {
        setCartItems(response.data.items);
        // Recalculate shipping if zip code is available
        if (formData.zipCode.length >= 6) {
          await calculateShipping(formData.zipCode, formData.paymentMethod);
        }
      }
    } catch (error) {
      console.error('Failed to refresh cart:', error);
      globalToast.cart.loadFailed();
    } finally {
      setIsRefreshingCart(false);
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
            // Calculate shipping for default address
            if (defaultAddress.zipCode) {
              calculateShipping(defaultAddress.zipCode);
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  const calculateShipping = async (pincode: string, paymentMethod?: string) => {
    if (!pincode || pincode.length < 6) return;

    const currentSubtotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
    const effectivePaymentMethod = paymentMethod || formData.paymentMethod;

    console.log('🚀 Calculating shipping for pincode:', pincode);
    console.log('🛒 Cart items:', cartItems.length);
    console.log('💰 Payment method:', effectivePaymentMethod);
    console.log('💵 Subtotal:', currentSubtotal);

    try {
      setIsCalculatingShipping(true);
      const data = await orderService.calculateShipping({
        delivery_postcode: pincode,
        cod: effectivePaymentMethod === 'cash_on_delivery' ? currentSubtotal : 0,
      });

      console.log('📦 Shipping API response:', data);
      console.log('📦 Raw rates data:', JSON.stringify(data.data?.rates, null, 2));

      if (data.success && data.data?.rates) {
        console.log('✅ Shipping rates received:', data.data.rates);
        // Normalize field names to match frontend expectations
        const normalizedRates = data.data.rates.map((rate: any) => ({
          courierId: rate.courierId || rate.courier_id,
          courierName: rate.courierName || rate.courier_name,
          estimatedDays: rate.estimatedDays || rate.estimated_delivery_days,
          rate: rate.rate,
          cod: rate.cod === 1 || rate.cod === true,
          codCharges: rate.cod_charges || 0,
          availability: rate.availability || null,
        }));
        console.log('📋 Normalized rates:', normalizedRates);

        // Check courier availability and filter unavailable ones
        const now = new Date();
        console.log('🕐 Current time:', now.toISOString());
        const availableRates = normalizedRates.filter((rate: any) => {
          if (!rate.availability) return true; // If no availability data, assume available

          const { availability } = rate;

          // Check if courier is blocked
          if (availability.blocked === 1) {
            console.log(`❌ Courier ${rate.courierName} is blocked`);
            return false;
          }

          // Check if courier is suppressed
          // Only filter if suppressDate is more than 1 day in the future (temporary daily cutoff, not long-term suppression)
          if (availability.suppressDate) {
            const suppressDate = new Date(availability.suppressDate);
            console.log(`📅 ${rate.courierName} suppressDate:`, availability.suppressDate, 'parsed:', suppressDate.toISOString(), 'valid:', !isNaN(suppressDate.getTime()));
            const daysUntilSuppress = (suppressDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
            // Only suppress if more than 1 day away (ignore daily cutoffs)
            if (!isNaN(suppressDate.getTime()) && daysUntilSuppress > 1) {
              console.log(`❌ Courier ${rate.courierName} suppressed until ${availability.suppressDate} (${daysUntilSuppress.toFixed(1)} days away)`);
              return false;
            } else if (!isNaN(suppressDate.getTime()) && daysUntilSuppress > 0) {
              console.log(`⚠️ Courier ${rate.courierName} has daily cutoff at ${availability.suppressDate} (${daysUntilSuppress.toFixed(1)} days away) - allowing anyway`);
            }
          }

          // Check cutoff time - ignore this check due to timezone issues with Shiprocket API
          // The cutoff times are likely in IST but compared with UTC, causing false positives
          if (availability.cutoffTime) {
            console.log(`⚠️ Courier ${rate.courierName} has cutoff time (${availability.cutoffTime}) - ignoring due to timezone issues`);
          }

          // Check pickup availability - ignore this check as it's often outdated
          if (availability.pickupAvailability === "0") {
            console.log(`⚠️ Courier ${rate.courierName} pickup availability shows 0 - allowing anyway (may be outdated)`);
          }

          // Check pickup time window - ignore negative values as they're often temporary
          if (availability.secondsLeftForPickup < 0) {
            console.log(`⚠️ Courier ${rate.courierName} pickup time window expired (${availability.secondsLeftForPickup}s) - allowing anyway (may be temporary)`);
          }

          return true;
        });

        console.log('📋 Available couriers after filtering:', availableRates.length);
        console.log('📋 Unavailable couriers:', normalizedRates.length - availableRates.length);

        // Set all rates (including unavailable ones) for UI display
        setShippingRates(normalizedRates);

        // Show error if no couriers available
        if (availableRates.length === 0) {
          // Check if all couriers are suppressed
          const allSuppressed = normalizedRates.every((rate: any) =>
            rate.availability?.suppressDate && new Date() < new Date(rate.availability.suppressDate)
          );

          if (allSuppressed) {
            const earliestAvailable = normalizedRates
              .map((r: any) => r.availability?.suppressDate ? new Date(r.availability.suppressDate) : null)
              .filter((d: Date | null) => d !== null)
              .sort((a: Date, b: Date) => a.getTime() - b.getTime())[0];

            const availableDate = earliestAvailable
              ? earliestAvailable.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
              : 'tomorrow';

            setCourierAvailabilityError(
              `All couriers are currently suppressed for this route. Shipping will be available starting ${availableDate}. Please try placing your order after that date.`
            );
          } else {
            setCourierAvailabilityError('No couriers are currently available for this delivery route. Please try a different delivery address or contact support.');
          }

          setSelectedCourier(null);
          setCalculatedShippingFee(0);
          globalToast.general.error('No Shipping Available', 'No couriers are currently available for this delivery route');
        } else {
          setCourierAvailabilityError(null);
          // Auto-select the cheapest available courier only if no courier is already selected
          if (!selectedCourier) {
            const cheapest = availableRates.reduce((min: any, curr: any) =>
              curr.rate < min.rate ? curr : min
            );
            setSelectedCourier(cheapest);
            // Include COD charges if COD is selected
            const totalShippingFee = effectivePaymentMethod === 'cash_on_delivery'
              ? cheapest.rate + (cheapest.codCharges || 0)
              : cheapest.rate;
            setCalculatedShippingFee(totalShippingFee);
            console.log('🏆 Auto-selected cheapest available courier:', cheapest);
            console.log('💰 Total shipping fee:', totalShippingFee);
          } else {
            console.log('🔒 Courier already selected, skipping auto-selection:', selectedCourier);
          }
        }
      } else {
        console.error('❌ Shipping calculation failed:', data);
        globalToast.general.error('Shipping Error', data.error || 'Could not calculate shipping rates');
      }
    } catch (error: any) {
      console.error('❌ Failed to calculate shipping:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Could not calculate shipping rates';
      globalToast.general.error('Shipping Error', errorMessage);
    } finally {
      setIsCalculatingShipping(false);
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

  // Redirect to cart page if cart is empty
  if (cartItems.length === 0) {
    router.push('/cart');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Calculate shipping when pincode changes
    if (name === 'zipCode' && value.length >= 6) {
      calculateShipping(value);
    }

    // Recalculate shipping when payment method changes (COD vs online)
    if (name === 'paymentMethod' && formData.zipCode.length >= 6) {
      calculateShipping(formData.zipCode, value);
    }
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

    // Calculate shipping for selected address
    if (address.zipCode) {
      calculateShipping(address.zipCode);
    }
  };

  const handleCourierSelect = (courier: any) => {
    console.log('🎯 Manual courier selection:', courier.courierName, 'ID:', courier.courierId);

    // Check if courier is available before selection (using lenient logic)
    if (courier.availability) {
      const now = new Date();
      const { availability } = courier;

      if (availability.blocked === 1) {
        globalToast.general.error('Courier Unavailable', 'This courier is currently blocked');
        return;
      }

      if (availability.suppressDate) {
        const suppressDate = new Date(availability.suppressDate);
        const daysUntilSuppress = (suppressDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        if (!isNaN(suppressDate.getTime()) && daysUntilSuppress > 1) {
          globalToast.general.error('Courier Unavailable', `This courier is suppressed until ${availability.suppressDate}`);
          return;
        }
      }

      // Ignore cutoff time, pickup availability and seconds left checks - they're often outdated/temporary or have timezone issues
    }

    setSelectedCourier(courier);
    // Include COD charges if COD is selected
    const totalShippingFee = formData.paymentMethod === 'cash_on_delivery'
      ? courier.rate + (courier.codCharges || 0)
      : courier.rate;
    setCalculatedShippingFee(totalShippingFee);
    console.log('✅ Courier selected successfully:', courier.courierName, 'Total fee:', totalShippingFee);
  };

  const isCourierAvailable = (courier: any): boolean => {
    if (!courier.availability) return true;

    const now = new Date();
    const { availability } = courier;

    if (availability.blocked === 1) return false;
    if (availability.suppressDate) {
      const suppressDate = new Date(availability.suppressDate);
      const daysUntilSuppress = (suppressDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      if (!isNaN(suppressDate.getTime()) && daysUntilSuppress > 1) return false;
    }
    // Ignore cutoff time, pickup availability and seconds left checks - they're often outdated/temporary or have timezone issues

    return true;
  };

  const getCourierAvailabilityMessage = (courier: any): string | null => {
    if (!courier.availability) return null;

    const { availability } = courier;

    if (availability.blocked === 1) return 'Courier blocked';
    // Don't show suppressDate message - it's just a pickup date, not an availability restriction
    // if (availability.suppressDate) return `Available after ${availability.suppressDate}`;
    // Don't show cutoff time - it's for same-day pickup, not order placement
    // if (availability.cutoffTime) return `Cutoff: ${availability.cutoffTime}`;
    // Don't show pickup availability - it's often outdated
    // if (availability.pickupAvailability === "0") return 'Pickup unavailable';
    // Don't show pickup window - it's often temporary
    // if (availability.secondsLeftForPickup < 0) return 'Pickup window expired';

    return null;
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

    // Validate courier selection if shipping rates are available
    if (shippingRates.length > 0 && !selectedCourier) {
      globalToast.general.error('Validation Error', 'Please select a shipping courier');
      return false;
    }

    // Prevent order submission if no courier is available
    if (courierAvailabilityError) {
      globalToast.general.error('Shipping Unavailable', courierAvailabilityError);
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
        setProcessingStep('Initializing payment...');
        const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
        const shipping = calculatedShippingFee || (subtotal > 50 ? 0 : 10);
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
              // Show loading state immediately
              setIsSubmitting(true);
              setProcessingStep('Verifying payment...');
              
              // Verify payment signature on backend
              const verifyResponse = await paymentService.verifyPayment(
                response.razorpay_order_id,
                response.razorpay_payment_id,
                response.razorpay_signature
              );

              if (verifyResponse.success) {
                setProcessingStep('Creating your order...');
                // Create order after successful payment
                const orderRequest: CreateOrderRequest = {
                  shippingAddress,
                  paymentMethod: formData.paymentMethod,
                  notes: formData.notes,
                  paymentId: response.razorpay_payment_id,
                  calculatedShippingFee: calculatedShippingFee,
                  processShiprocket: true,
                  shiprocketCourierId: selectedCourier?.courierId,
                  shiprocketAllRates: shippingRates, // Send all rates for fallback
                };

                console.log('📦 Creating order with Shiprocket:', {
                  processShiprocket: orderRequest.processShiprocket,
                  shiprocketCourierId: orderRequest.shiprocketCourierId,
                  selectedCourier: selectedCourier
                });

                const orderResponse = await orderService.createOrder(orderRequest);

                if (orderResponse.success) {
                  setProcessingStep('Finalizing order...');
                  await cartService.clearCart();
                  await refreshCartCount();
                  const orderId = orderResponse.data?.order?._id || orderResponse.data?.order?.id;
                  // Immediate redirect without toast to avoid delay
                  router.push(`/order-confirmation?orderId=${orderId}`);
                } else {
                  globalToast.order.createFailed(orderResponse.message);
                  setIsSubmitting(false);
                  setProcessingStep('');
                }
              } else {
                globalToast.order.createFailed('Payment verification failed');
                setIsSubmitting(false);
                setProcessingStep('');
              }
            },
            prefill: {
              name: formData.fullName,
              email: formData.email,
              contact: formData.phone,
            },
            theme: {
              color: '#ec4899',
            },
            modal: {
              ondismiss: function() {
                setIsSubmitting(false);
                setProcessingStep('');
              }
            }
          };

          const razorpay = (window as any).Razorpay(options);
          razorpay.on('payment.failed', function (response: any) {
            console.error('Payment failed:', response);
            const errorDescription = response.error?.description || response.error?.reason || 'Payment failed';
            globalToast.general.error('Payment Failed', errorDescription);
            setIsSubmitting(false);
            setProcessingStep('');
          });
          razorpay.open();
          return;
        } else {
          globalToast.order.createFailed(paymentResponse.error || 'Failed to create payment order');
          setIsSubmitting(false);
          setProcessingStep('');
          return;
        }
      }

      // For other payment methods (COD, etc.)
      setProcessingStep('Creating your order...');
      const orderRequest: CreateOrderRequest = {
        shippingAddress,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        calculatedShippingFee: calculatedShippingFee,
        processShiprocket: true,
        shiprocketCourierId: selectedCourier?.courierId,
        shiprocketAllRates: shippingRates, // Send all rates for fallback
      };

      const response = await orderService.createOrder(orderRequest);

      if (response.success) {
        setProcessingStep('Finalizing order...');
        globalToast.order.createSuccess();
        await cartService.clearCart();
        await refreshCartCount();
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
      setProcessingStep('');
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  const shipping = calculatedShippingFee || (subtotal > 50 ? 0 : 10);
  const grandTotal = subtotal + shipping;

  return (
    <div className="min-h-screen  flex flex-col">
      <Navbar />

      <main className="flex-1 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Progress Steps */}
          <div className="mb-8">
            {/* Desktop Progress */}
            <div className="hidden sm:block">
              <div className="flex items-center justify-center max-w-2xl mx-auto">
                <div className="flex items-center w-full">
                  <div className="flex flex-col items-center flex-1">
                    <div className="w-10 h-10 rounded-full bg-pink-500 text-white flex items-center justify-center font-semibold mb-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-pink-600">Cart</span>
                  </div>
                  <div className="flex-1 h-1 bg-pink-500 mx-2"></div>
                  <div className="flex flex-col items-center flex-1">
                    <div className="w-10 h-10 rounded-full bg-pink-500 text-white flex items-center justify-center font-semibold mb-2">2</div>
                    <span className="text-sm font-medium text-pink-600">Checkout</span>
                  </div>
                  <div className="flex-1 h-1 bg-gray-200 mx-2"></div>
                  <div className="flex flex-col items-center flex-1">
                    <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-semibold mb-2">3</div>
                    <span className="text-sm font-medium text-gray-500">Payment</span>
                  </div>
                  <div className="flex-1 h-1 bg-gray-200 mx-2"></div>
                  <div className="flex flex-col items-center flex-1">
                    <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-semibold mb-2">4</div>
                    <span className="text-sm font-medium text-gray-500">Complete</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Mobile Progress */}
            <div className="sm:hidden">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-600">Step 2 of 4</span>
                  <span className="text-sm font-semibold text-pink-600">Checkout</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-pink-500 h-2 rounded-full" style={{ width: '50%' }}></div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>Cart</span>
                  <span>Checkout</span>
                  <span>Payment</span>
                  <span>Complete</span>
                </div>
              </div>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600 mb-8">Complete your order details below</p>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Shipping & Billing Form */}
              <div className="lg:col-span-2 space-y-6 order-1 lg:order-1">
                {/* Contact Information */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                      <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Contact Information
                    </h2>
                    <Badge variant="success" className="text-xs">Verified</Badge>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Full Name</p>
                        <p className="text-sm font-medium text-gray-900">{formData.fullName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm font-medium text-gray-900">{formData.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm font-medium text-gray-900">{formData.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Saved Addresses */}
                {savedAddresses.length > 0 && (
                  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Select Delivery Address
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {savedAddresses.map((address) => (
                        <div
                          key={address._id}
                          onClick={() => handleAddressSelect(address)}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${selectedAddressId === address._id
                            ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-rose-50 shadow-md'
                            : 'border-gray-200 hover:border-pink-300 hover:bg-gray-50'
                            }`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedAddressId === address._id
                                ? 'border-pink-500 bg-pink-500'
                                : 'border-gray-300'
                                }`}>
                                {selectedAddressId === address._id && (
                                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                              <h3 className="font-semibold text-gray-800">{address.label}</h3>
                            </div>
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
                      disabled={isSubmitting}
                      className="mt-4 w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-pink-400 hover:text-pink-600 hover:bg-pink-50 transition-all font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:text-gray-600 disabled:hover:bg-transparent"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add New Address
                    </button>
                  </div>
                )}

                {/* New Address Form */}
                {(showNewAddressForm || savedAddresses.length === 0) && (
                  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {savedAddresses.length > 0 ? 'Add New Address' : 'Shipping Address'}
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
                          disabled={isSubmitting}
                          className="text-gray-600 hover:text-gray-800 font-medium text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Shipping Options */}
                {shippingRates.length > 0 && (
                  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m-8-4V7m8 4v10M4 7v10l8 4" />
                        </svg>
                        Shipping Options
                        {isCalculatingShipping && (
                          <Loader size="sm" text="Calculating..." />
                        )}
                      </h2>
                      <button
                        type="button"
                        onClick={() => refreshCart()}
                        disabled={isCalculatingShipping || isRefreshingCart || isSubmitting}
                        className="text-sm text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isRefreshingCart ? (
                          <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Refreshing...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.003 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh Cart & Shipping
                          </>
                        )}
                      </button>
                    </div>

                    {/* Error message when no couriers available */}
                    {courierAvailabilityError && (
                      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-red-800">No Shipping Available</p>
                            <p className="text-xs text-red-600 mt-1">{courierAvailabilityError}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      {shippingRates.map((rate, index) => {
                        const available = isCourierAvailable(rate);
                        const availabilityMessage = getCourierAvailabilityMessage(rate);

                        // Format suppression date for display
                        const suppressDate = rate.availability?.suppressDate
                          ? new Date(rate.availability.suppressDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : null;

                        return (
                          <div
                            key={index}
                            onClick={() => available && handleCourierSelect(rate)}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              !available
                                ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                                : selectedCourier?.courierId === rate.courierId
                                  ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-rose-50 shadow-md cursor-pointer hover:shadow-lg'
                                  : 'border-gray-200 hover:border-pink-300 hover:bg-gray-50 cursor-pointer hover:shadow-lg'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  !available
                                    ? 'border-gray-300 bg-gray-200'
                                    : selectedCourier?.courierId === rate.courierId
                                      ? 'border-pink-500 bg-pink-500'
                                      : 'border-gray-300'
                                }`}>
                                  {selectedCourier?.courierId === rate.courierId && available && (
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                                <div>
                                  <p className={`font-semibold ${!available ? 'text-gray-500' : 'text-gray-800'}`}>{rate.courierName}</p>
                                  <p className="text-sm text-gray-500">Estimated delivery: {rate.estimatedDays} days</p>
                                  {availabilityMessage && (
                                    <p className="text-xs text-red-600 mt-1 font-medium">{availabilityMessage}</p>
                                  )}
                                  {suppressDate && !available && (
                                    <p className="text-xs text-orange-600 mt-1 font-medium">
                                      Available from {suppressDate}
                                    </p>
                                  )}
                                  {rate.cod && (
                                    <div className="flex items-center gap-1 mt-1">
                                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                        COD Available
                                      </span>
                                      {rate.codCharges > 0 && (
                                        <span className="text-xs text-gray-500">
                                          (+₹{rate.codCharges} COD charges)
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={`text-lg font-bold ${!available ? 'text-gray-400' : 'text-pink-600'}`}>₹{rate.rate}</p>
                                {formData.paymentMethod === 'cash_on_delivery' && rate.codCharges > 0 && (
                                  <p className="text-xs text-gray-500">+ ₹{rate.codCharges} COD</p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Payment Method */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Payment Method
                  </h2>
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all hover:border-pink-300 hover:bg-pink-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="razorpay"
                        checked={formData.paymentMethod === 'razorpay'}
                        onChange={handleChange}
                        className="w-4 h-4 text-pink-500"
                        required
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800">Credit/Debit Card</span>
                          <div className="flex items-center gap-1 ml-2">
                            <div className="w-8 h-5 bg-blue-600 rounded flex items-center justify-center">
                              <span className="text-white text-xs font-bold">VISA</span>
                            </div>
                            <div className="w-8 h-5 bg-red-500 rounded flex items-center justify-center">
                              <span className="text-white text-xs font-bold">MC</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Pay securely with Razorpay</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.paymentMethod === 'razorpay'
                        ? 'border-pink-500 bg-pink-500'
                        : 'border-gray-300'
                        }`}>
                        {formData.paymentMethod === 'razorpay' && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </label>

                    <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all hover:border-pink-300 hover:bg-pink-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash_on_delivery"
                        checked={formData.paymentMethod === 'cash_on_delivery'}
                        onChange={handleChange}
                        className="w-4 h-4 text-pink-500"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800">Cash on Delivery</span>
                          <div className="flex items-center gap-1 ml-2">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Pay when you receive your order</p>
                        <p className="text-xs text-gray-400 mt-1">Additional COD charges may apply based on courier</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.paymentMethod === 'cash_on_delivery'
                        ? 'border-pink-500 bg-pink-500'
                        : 'border-gray-300'
                        }`}>
                        {formData.paymentMethod === 'cash_on_delivery' && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </label>
                  </div>
                  
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-blue-800">Secure Payment</p>
                        <p className="text-xs text-blue-600 mt-1">Your payment information is encrypted and secure. We use Razorpay for secure transactions.</p>
                      </div>
                    </div>
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
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-fit lg:sticky lg:top-4 order-2 lg:order-last z-10">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Order Summary
                </h2>

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl mb-6 max-h-64 overflow-y-auto">
                  <div className="space-y-4">
                    {cartItems.map(item => (
                      <div key={item._id} className="flex justify-between items-start pb-3 border-b border-gray-200 last:border-0 last:pb-0">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{item.name}</p>
                          <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
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
                      {shipping === 0 && <span className="text-green-600 ml-2 font-medium">(Free)</span>}
                    </span>
                  </div>
                  <div className="border-t-2 border-gray-200 pt-4 flex justify-between items-center">
                    <span className="font-semibold text-gray-800 text-lg">Total</span>
                    <span className="text-3xl font-bold text-pink-600">₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Promo Code Section */}
                <div className="mb-6">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Promo code"
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto px-4"
                      disabled={isSubmitting}
                    >
                      Apply
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full shadow-lg shadow-pink-500/30 hover:shadow-pink-500/40 transition-all"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {processingStep || 'Processing...'}
                    </span>
                  ) : 'Place Order'}
                </Button>

                <Link href="/cart" className="block mt-3">
                  <Button variant="outline" className="w-full hover:bg-gray-50 transition-colors" disabled={isSubmitting}>
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back to Cart
                    </span>
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