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

import {
  CreateOrderRequest,
  ShippingAddress,
} from '@/services/orderService';

import { paymentService } from '@/services/paymentService';
import { couponService } from '@/services/couponService';
import { globalToast } from '@/utils/globalToast';

import { Address } from '@/types/auth';

import {
  useCart as useCartQuery,
  useClearCart,
  useValidateStock,
} from '@/hooks/user/useCartQueries';

import { useCreateOrder } from '@/hooks/user/useOrderQueries';
import { useCurrentUser } from '@/hooks/user/useAuthQuery';

import {
  useWalletBalance,
  useDebitWallet,
  useCreditWallet,
} from '@/hooks/user/useWalletQueries';

import { useInvalidatePaymentQueries } from '@/hooks/user/usePaymentQueries';
import { initializeCsrfToken } from '@/services/apiInterceptor';

export default function CheckoutPage() {
  const router = useRouter();

  const {
    loaded,
    isAuthenticated,
  } = useRequireUserAuth();

  // ============================================================
  // QUERIES / MUTATIONS
  // ============================================================

  const {
    data: cartData,
    isLoading: isLoadingCart,
  } = useCartQuery();

  const {
    data: currentUserData,
  } = useCurrentUser();

  const {
    data: walletBalanceData,
  } = useWalletBalance();

  const debitWalletMutation =
    useDebitWallet();

  const creditWalletMutation =
    useCreditWallet();

  const createOrderMutation =
    useCreateOrder();

  const clearCartMutation =
    useClearCart();

  const invalidatePaymentQueries =
    useInvalidatePaymentQueries();

  const validateStockMutation =
    useValidateStock();

  // ============================================================
  // STATE
  // ============================================================

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [processingStep, setProcessingStep] =
    useState<string>('');

  const [orderCompleted, setOrderCompleted] =
    useState(false);

  const [selectedAddressId, setSelectedAddressId] =
    useState<string | null>(null);

  const [showNewAddressForm, setShowNewAddressForm] =
    useState(false);

  const [couponCode, setCouponCode] =
    useState('');

  const [appliedCoupon, setAppliedCoupon] =
    useState<any | null>(null);

  const [couponDiscount, setCouponDiscount] =
    useState<number>(0);

  const [isApplyingCoupon, setIsApplyingCoupon] =
    useState(false);

  // ============================================================
  // CART
  // ============================================================

  const cartItems = React.useMemo(() => {
    return cartData?.data?.items || [];
  }, [cartData]);

  // ============================================================
  // SAVED ADDRESSES
  // ============================================================

  const savedAddresses = React.useMemo(() => {
    return currentUserData?.addresses || [];
  }, [currentUserData]);

  // ============================================================
  // FORM DATA
  // ============================================================

  const [formData, setFormData] = useState<{
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    paymentMethod: 'razorpay' | 'wallet';
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

  // ============================================================
  // INITIALIZE USER DATA
  // ============================================================

  useEffect(() => {
    if (!currentUserData) return;

    setFormData((prev) => ({
      ...prev,
      fullName: currentUserData.name || '',
      email: currentUserData.email || '',
      phone: currentUserData.phone || '',
    }));

    if (
      currentUserData.addresses &&
      currentUserData.addresses.length > 0
    ) {
      const defaultAddress =
        currentUserData.addresses.find(
          (addr: Address) => addr.isDefault
        );

      if (defaultAddress) {
        setSelectedAddressId(
          defaultAddress._id || null
        );

        setFormData((prev) => ({
          ...prev,
          address:
            defaultAddress.address || '',
          city:
            defaultAddress.city || '',
          state:
            defaultAddress.state || '',
          zipCode:
            defaultAddress.zipCode || '',
          country:
            defaultAddress.country || 'IN',
        }));
      }
    }
  }, [currentUserData]);

  // ============================================================
  // REDIRECT EMPTY CART
  // ============================================================

  useEffect(() => {
    // Only redirect to cart if it's empty AND we're not in the middle of processing an order
    // This prevents redirects during the checkout completion process
    if (cartItems.length === 0 && !isSubmitting && !processingStep) {
      router.push('/cart');
    }
  }, [cartItems.length, isSubmitting, processingStep, router]);

  // ============================================================
  // REDIRECT IF NOT AUTHENTICATED
  // ============================================================

  useEffect(() => {
    if (loaded && !isAuthenticated) {
      router.push('/login?redirect=/checkout');
    }
  }, [loaded, isAuthenticated, router]);

  // ============================================================
  // LOAD RAZORPAY
  // ============================================================

  useEffect(() => {
    const script = document.createElement(
      'script'
    );

    script.src =
      'https://checkout.razorpay.com/v1/checkout.js';

    script.async = true;

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // ============================================================
  // INITIALIZE CSRF TOKEN
  // ============================================================

  useEffect(() => {
    // Initialize CSRF token on page load
    initializeCsrfToken();
  }, []);

  // ============================================================
  // SHIPPING CALCULATION
  // ============================================================

  const calculateShippingFee = (
    subtotal: number
  ): number => {
    if (subtotal >= 999) return 0;
    if (subtotal > 499) return 40;
    return 60;
  };

  // ============================================================
  // TOTALS
  // ============================================================

  // ============================================================
  // TOTALS
  // ============================================================

  const subtotal = cartItems.reduce(
    (sum, item) =>
      sum +
      (item.price || 0) *
        item.quantity,
    0
  );

  const shipping =
    calculateShippingFee(subtotal);

  const discount = couponDiscount;

  const grandTotal =
    subtotal +
    shipping -
    discount;

  const walletBalance =
    walletBalanceData?.data?.balance || 0;

  const canUseWallet =
    walletBalance >= grandTotal;

  const totalQuantity =
    cartItems.reduce(
      (sum, item) =>
        sum + (item.quantity || 0),
      0
    );

  // ============================================================
  // FORM CHANGE
  // ============================================================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLSelectElement |
      HTMLTextAreaElement
    >
  ) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ============================================================
  // COUPON
  // ============================================================

  const handleApplyCoupon =
    async () => {
      if (!couponCode.trim()) {
        globalToast.general.error(
          'Invalid Coupon',
          'Please enter a coupon code'
        );
        return;
      }

      setIsApplyingCoupon(true);

      try {
        const response =
          await couponService.applyCoupon(
            couponCode.trim(),
            {
              cartTotal: subtotal,
              cartCategory:
                cartItems[0]?.category
                  ? String(
                      cartItems[0]?.category
                    )
                  : undefined,
            }
          );

        if (
          response.success &&
          response.data?.success
        ) {
          setAppliedCoupon(
            response.data.coupon
          );

          setCouponDiscount(
            response.data.discountAmount
          );

          globalToast.general.success(
            'Coupon Applied',
            `Discount of ₹${response.data.discountAmount.toFixed(
              2
            )} applied!`
          );

          setCouponCode('');
        } else {
          globalToast.general.error(
            'Invalid Coupon',
            response.data?.error ||
              'This coupon is not valid'
          );
        }
      } catch (error: any) {
        console.error(
          'Coupon application error:',
          error
        );

        globalToast.general.error(
          'Error',
          'Failed to apply coupon'
        );
      } finally {
        setIsApplyingCoupon(false);
      }
    };

  const handleRemoveCoupon =
    () => {
      setAppliedCoupon(null);
      setCouponDiscount(0);

      globalToast.general.success(
        'Coupon Removed',
        'Coupon has been removed'
      );
    };

  // ============================================================
  // ADDRESS
  // ============================================================

  const handleAddressSelect =
    (address: Address) => {
      setSelectedAddressId(
        address._id || null
      );

      setFormData((prev) => ({
        ...prev,
        address:
          address.address || '',
        city:
          address.city || '',
        state:
          address.state || '',
        zipCode:
          address.zipCode || '',
        country:
          address.country || 'IN',
      }));

      setShowNewAddressForm(false);
    };

  // ============================================================
  // FORM VALIDATION
  // ============================================================

  const validateForm =
    (): boolean => {
      const requiredFields = [
        'fullName',
        'email',
        'phone',
        'address',
        'city',
        'state',
        'zipCode',
        'country',
      ];

      for (const field of requiredFields) {
        if (
          !formData[
            field as keyof typeof formData
          ]
        ) {
          globalToast.general.error(
            'Validation Error',
            'Please fill in all required fields'
          );

          return false;
        }
      }

      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailRegex.test(
          formData.email
        )
      ) {
        globalToast.general.error(
          'Invalid Email',
          'Please enter a valid email address'
        );

        return false;
      }

      return true;
    };

  // ============================================================
  // STOCK VALIDATION
  // ============================================================

  const validateCartStock =
    async (): Promise<boolean> => {
      try {
        setProcessingStep(
          'Checking stock availability...'
        );

        const stockValidation =
          await validateStockMutation.mutateAsync();

        if (
          stockValidation.success &&
          stockValidation.data?.valid
        ) {
          return true;
        }

        if (
          stockValidation.data
            ?.outOfStockItems &&
          stockValidation.data
            .outOfStockItems.length > 0
        ) {
          const outOfStockMessage =
            stockValidation.data.outOfStockItems
              .map(
                (item) =>
                  `${item.productName} (Requested: ${item.requestedQuantity}, Available: ${item.availableQuantity})`
              )
              .join(', ');

          globalToast.general.error(
            'Out of Stock',
            `${stockValidation.data.message}. Please update your cart: ${outOfStockMessage}`
          );

          return false;
        }

        globalToast.general.error(
          'Stock Validation Failed',
          stockValidation.data
            ?.message ||
            'Unable to validate stock'
        );

        return false;
      } catch (error: any) {
        console.error(
          'Stock validation error:',
          error
        );

        globalToast.general.error(
          'Error',
          'Failed to validate stock availability'
        );

        return false;
      }
    };

  // ============================================================
  // PLACE ORDER
  // ============================================================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      const isStockValid =
        await validateCartStock();

      if (!isStockValid) {
        setIsSubmitting(false);
        setProcessingStep('');
        return;
      }

      const shippingAddress:
        ShippingAddress = {
        street: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
      };

      // ========================================================
      // RAZORPAY
      // ========================================================

      if (
        formData.paymentMethod ===
        'razorpay'
      ) {
        setProcessingStep(
          'Initializing payment...'
        );

        const paymentResponse =
          await paymentService.createPaymentIntent(
            {
              amount: grandTotal,
              currency: 'INR',
              userId:
                currentUserData?.id ||
                currentUserData?._id,
            }
          );

        if (
          paymentResponse.success &&
          paymentResponse.data
        ) {
          const {
            orderId:
              razorpayOrderId,
            keyId,
            amount,
            currency,
          } =
            paymentResponse.data;

          const options = {
            key: keyId,
            amount,
            currency,
            name: 'BellesCart',
            description:
              'Payment for order',
            order_id:
              razorpayOrderId,

            handler:
              async function (
                response: any
              ) {
                setIsSubmitting(true);

                setProcessingStep(
                  'Verifying payment...'
                );

                const verifyResponse =
                  await paymentService.verifyPayment(
                    response.razorpay_order_id,
                    response.razorpay_payment_id,
                    response.razorpay_signature
                  );

                if (
                  verifyResponse.success
                ) {
                  setProcessingStep(
                    'Validating stock availability...'
                  );

                  const isStockValid =
                    await validateCartStock();

                  if (!isStockValid) {
                    globalToast.general.error(
                      'Payment Processed But Order Failed',
                      'Some items in your cart are now out of stock. Your payment will be refunded automatically.'
                    );

                    setIsSubmitting(false);
                    setProcessingStep('');

                    return;
                  }

                  setProcessingStep(
                    'Creating your order...'
                  );

                  const orderRequest:
                    CreateOrderRequest =
                    {
                      shippingAddress,
                      paymentMethod:
                        formData.paymentMethod,
                      notes:
                        formData.notes,
                      paymentId:
                        response.razorpay_payment_id,
                      calculatedShippingFee:
                        shipping,
                      couponCode:
                        appliedCoupon?.code,
                      discountAmount:
                        couponDiscount,
                      processNimbus:
                        false,
                      nimbusCourierId:
                        undefined,
                      nimbusAllRates:
                        undefined,
                    };

                  console.log(
                    '📦 Creating order (admin-managed):',
                    {
                      processNimbus:
                        orderRequest.processNimbus,
                    }
                  );

                  let orderResponse;
                  try {
                    orderResponse =
                      await createOrderMutation.mutateAsync(
                        orderRequest
                      );
                  } catch (orderError) {
                    console.error('❌ Order creation failed after Razorpay payment:', orderError);

                    globalToast.general.error(
                      'Order Creation Failed',
                      'Your payment was successful but order creation failed. Please contact support with your payment details for a refund.'
                    );

                    setIsSubmitting(false);
                    setProcessingStep('');

                    return;
                  }

                  if (
                    orderResponse.success
                  ) {
                    setProcessingStep(
                      'Finalizing order...'
                    );

                    const orderId =
                      orderResponse.data
                        ?.order?._id ||
                      orderResponse.data
                        ?.order?.id;

                    try {
                      await paymentService.createPaymentRecord(
                        {
                          bookingId:
                            razorpayOrderId,
                          razorpayPaymentId:
                            response.razorpay_payment_id,
                          razorpayOrderId:
                            response.razorpay_order_id,
                          amount:
                            grandTotal,
                          currency: 'INR',
                          status:
                            'completed',
                          paymentMethod:
                            'razorpay',
                          userId:
                            currentUserData?.id ||
                            currentUserData?._id,
                          orderId,
                          paymentSignature:
                            response.razorpay_signature,
                          metadata: {
                            verifiedAt:
                              new Date().toISOString(),
                            completedAt:
                              new Date().toISOString(),
                            orderAmount:
                              grandTotal,
                            currency:
                              'INR',
                            userEmail:
                              currentUserData?.email,
                            userName:
                              currentUserData?.name,
                            userPhone:
                              formData.phone,
                            shippingCity:
                              shippingAddress.city,
                            shippingState:
                              shippingAddress.state,
                            paymentMethod:
                              'razorpay',
                          },
                        }
                      );

                      console.log(
                        '✅ Razorpay payment record created with completed status'
                      );
                    } catch (err) {
                      console.error(
                        '❌ Failed to create Razorpay payment record:',
                        err
                      );
                    }

                    invalidatePaymentQueries();

                    router.push(
                      `/order-confirmation?orderId=${orderId}`
                    );

                    // Clear cart after redirect to avoid race conditions
                    await clearCartMutation.mutateAsync();
                  } else {
                    globalToast.general.error(
                      'Order Creation Failed',
                      'Your payment was successful but order creation failed. Please contact support with your payment details for a refund.'
                    );

                    setIsSubmitting(false);
                    setProcessingStep('');
                  }
                } else {
                  globalToast.order.createFailed(
                    'Payment verification failed'
                  );

                  setIsSubmitting(false);
                  setProcessingStep('');
                }
              },

            prefill: {
              name:
                formData.fullName,
              email:
                formData.email,
              contact:
                formData.phone,
            },

            theme: {
              color: '#ec4899',
            },

            modal: {
              ondismiss:
                function () {
                  console.log(
                    'Payment modal closed by user'
                  );

                  globalToast.general.info(
                    'Payment Cancelled',
                    'You cancelled the payment. Try again when ready.'
                  );

                  setIsSubmitting(false);
                  setProcessingStep('');
                },
            },
          };

          const razorpay =
            (window as any).Razorpay(
              options
            );

          razorpay.on(
            'payment.failed',
            async function (
              response: any
            ) {
              console.error(
                'Payment failed:',
                response
              );

              if (
                response.error
                  ?.metadata
                  ?.payment_id
              ) {
                try {
                  await paymentService.createPaymentRecord(
                    {
                      bookingId:
                        razorpayOrderId,
                      razorpayPaymentId:
                        response.error
                          ?.metadata
                          ?.payment_id,
                      razorpayOrderId:
                        response.error
                          ?.metadata
                          ?.order_id,
                      amount:
                        amount / 100,
                      currency,
                      status:
                        'failed',
                      paymentMethod:
                        'razorpay',
                      userId:
                        currentUserData?.id ||
                        currentUserData?._id,
                      metadata: {
                        error:
                          response.error,
                        failedAt:
                          new Date().toISOString(),
                      },
                    }
                  );

                  console.log(
                    '✅ Payment record updated to failed status'
                  );
                } catch (err) {
                  console.error(
                    '❌ Failed to update payment record status:',
                    err
                  );
                }
              }

              const errorCode =
                response.error?.code;

              const errorReason =
                response.error?.reason;

              const errorDescription =
                response.error
                  ?.description;

              let userMessage = '';

              let suggestions: string[] =
                [];

              switch (errorCode) {
                case 'BAD_REQUEST_ERROR':
                  if (
                    errorReason ===
                      'payment_failed' &&
                    response.error
                      ?.source === 'bank'
                  ) {
                    userMessage =
                      'Payment declined by your bank';

                    suggestions = [
                      'Check if you have sufficient funds',
                      'Try a different payment method',
                      'Contact your bank for more details',
                      'Ensure your card is active for online transactions',
                    ];
                  } else {
                    userMessage =
                      'Payment request failed';

                    suggestions = [
                      'Please try again',
                      'Contact support if the issue persists',
                    ];
                  }

                  break;

                case 'GATEWAY_ERROR':
                  userMessage =
                    'Payment gateway error';

                  suggestions = [
                    'Network issue - please try again',
                    'Check your internet connection',
                  ];

                  break;

                case 'AUTHENTICATION_ERROR':
                  userMessage =
                    'Authentication failed';

                  suggestions = [
                    'Check your payment details',
                    'Ensure you entered correct OTP/password',
                  ];

                  break;

                default:
                  userMessage =
                    errorDescription ||
                    'Payment failed';

                  suggestions = [
                    'Please try again',
                    'Use a different payment method',
                  ];
              }

              globalToast.general.error(
                `Payment Failed: ${userMessage}`,
                suggestions.join('. ')
              );

              setIsSubmitting(false);
              setProcessingStep('');
            }
          );

          razorpay.open();

          return;
        }

        globalToast.order.createFailed(
          paymentResponse.error ||
            'Failed to create payment order'
        );

        setIsSubmitting(false);
        setProcessingStep('');

        return;
      }

      // ========================================================
      // WALLET
      // ========================================================

      if (
        formData.paymentMethod ===
        'wallet'
      ) {
        setProcessingStep(
          'Processing wallet payment...'
        );

        const debitResponse =
          await debitWalletMutation.mutateAsync(
            {
              amount: grandTotal,
              description:
                'Payment for order',
            }
          );

        if (
          debitResponse.success
        ) {
          setProcessingStep(
            'Validating stock availability...'
          );

          const isStockValid =
            await validateCartStock();

          if (!isStockValid) {
            // Refund wallet if stock validation fails
            try {
              await creditWalletMutation.mutateAsync(
                {
                  amount: grandTotal,
                  description: 'Refund: Out of stock items',
                }
              );
              console.log('✅ Wallet refunded due to stock validation failure');
            } catch (refundError) {
              console.error('❌ Failed to refund wallet:', refundError);
            }

            globalToast.general.error(
              'Payment Processed But Order Failed',
              'Some items in your cart are now out of stock. Your wallet has been refunded automatically.'
            );

            setIsSubmitting(false);
            setProcessingStep('');

            return;
          }

          setProcessingStep(
            'Creating your order...'
          );

          const orderRequest:
            CreateOrderRequest =
            {
              shippingAddress,
              paymentMethod:
                'wallet',
              notes:
                formData.notes,
              calculatedShippingFee:
                shipping,
              couponCode:
                appliedCoupon?.code,
              discountAmount:
                couponDiscount,
              processNimbus:
                false,
              nimbusCourierId:
                undefined,
              nimbusAllRates:
                undefined,
            };

          let orderResponse;
          try {
            orderResponse =
              await createOrderMutation.mutateAsync(
                orderRequest
              );
          } catch (orderError) {
            console.error('❌ Order creation failed:', orderError);
            
            // Refund wallet if order creation fails
            try {
              await creditWalletMutation.mutateAsync(
                {
                  amount: grandTotal,
                  description: 'Refund: Order creation failed',
                }
              );
              console.log('✅ Wallet refunded due to order creation failure');
            } catch (refundError) {
              console.error('❌ Failed to refund wallet:', refundError);
            }

            globalToast.general.error(
              'Order Creation Failed',
              'Your wallet has been refunded automatically. Please try again or contact support if the issue persists.'
            );

            setIsSubmitting(false);
            setProcessingStep('');

            return;
          }

          if (
            orderResponse.success
          ) {
            setProcessingStep(
              'Finalizing order...'
            );

            const orderId =
              orderResponse.data
                ?.order?._id ||
              orderResponse.data
                ?.order?.id;

            try {
              await paymentService.createPaymentRecord(
                {
                  bookingId:
                    orderId,
                  amount:
                    grandTotal,
                  currency: 'INR',
                  status:
                    'completed',
                  paymentMethod:
                    'wallet',
                  userId:
                    currentUserData?.id ||
                    currentUserData?._id,
                  orderId,
                  metadata: {
                    completedAt:
                      new Date().toISOString(),
                    orderAmount:
                      grandTotal,
                    currency:
                      'INR',
                    userEmail:
                      currentUserData?.email,
                    userName:
                      currentUserData?.name,
                    userPhone:
                      formData.phone,
                    shippingCity:
                      shippingAddress.city,
                    shippingState:
                      shippingAddress.state,
                    paymentMethod:
                      'wallet',
                  },
                }
              );

              console.log(
                '✅ Wallet payment record created with completed status'
              );
            } catch (err) {
              console.error(
                '❌ Failed to create wallet payment record:',
                err
              );
            }

            invalidatePaymentQueries();

            router.push(
              `/order-confirmation?orderId=${orderId}`
            );

            // Clear cart after redirect to avoid race conditions
            await clearCartMutation.mutateAsync();
          } else {
            // Refund wallet if order response indicates failure
            try {
              await creditWalletMutation.mutateAsync(
                {
                  amount: grandTotal,
                  description: 'Refund: Order response failed',
                }
              );
              console.log('✅ Wallet refunded due to order response failure');
            } catch (refundError) {
              console.error('❌ Failed to refund wallet:', refundError);
            }

            globalToast.order.createFailed(
              orderResponse.message
            );

            setIsSubmitting(false);
            setProcessingStep('');
          }
        } else {
          globalToast.order.createFailed(
            'Wallet payment failed'
          );

          setIsSubmitting(false);
          setProcessingStep('');
        }

        return;
      }
    } catch (error) {
      console.error(
        'Error placing order:',
        error
      );

      // If wallet payment was processed, attempt refund
      if (formData.paymentMethod === 'wallet') {
        try {
          await creditWalletMutation.mutateAsync(
            {
              amount: grandTotal,
              description: 'Refund: Unexpected error during checkout',
            }
          );
          console.log('✅ Wallet refunded due to unexpected error');
        } catch (refundError) {
          console.error('❌ Failed to refund wallet:', refundError);
        }

        globalToast.general.error(
          'Checkout Error',
          'An unexpected error occurred. Your wallet has been refunded automatically. Please try again.'
        );
      } else {
        globalToast.order.createFailed();
      }
    } finally {
      setIsSubmitting(false);
      setProcessingStep('');
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  // Early return for loading states
  if (!loaded) {
    return (
      <Loader
        size="lg"
        text="Loading..."
        fullScreen
      />
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (isLoadingCart) {
    return (
      <Loader
        size="lg"
        text="Loading checkout..."
        fullScreen
      />
    );
  }

  if (cartItems.length === 0 && !isSubmitting) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9fb] text-gray-900">

      <Navbar />

      <main className="flex-1">

        {/* ======================================================
            TOP HEADER
        ======================================================= */}

        <div className="border-b border-gray-100 bg-white">

          <div className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">

            <div className="flex items-center justify-between py-4">

              <div>

                <div className="flex items-center gap-2 text-xs text-gray-400">

                  <Link
                    href="/cart"
                    className="transition hover:text-pink-600"
                  >
                    Cart
                  </Link>

                  <span>/</span>

                  <span className="text-gray-600">
                    Checkout
                  </span>

                </div>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
                  Checkout
                </h1>

              </div>

              <Link
                href="/cart"
                className="hidden items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 sm:flex"
              >

                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>

                Back to cart

              </Link>

            </div>

          </div>

        </div>

        {/* ======================================================
            PROGRESS
        ======================================================= */}

        <div className="border-b border-gray-100 bg-white">

          <div className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">

            <div className="flex items-center justify-center py-4">

              {/* Cart */}

              <div className="flex items-center">

                <div className="flex items-center gap-2">

                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                    ✓
                  </div>

                  <span className="hidden text-xs font-semibold text-gray-900 sm:block">
                    Cart
                  </span>

                </div>

                <div className="mx-3 h-px w-8 bg-pink-500 sm:mx-5 sm:w-16" />

              </div>

              {/* Checkout */}

              <div className="flex items-center">

                <div className="flex items-center gap-2">

                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-500 text-xs font-bold text-white shadow-sm">
                    2
                  </div>

                  <span className="hidden text-xs font-bold text-pink-600 sm:block">
                    Checkout
                  </span>

                </div>

                <div className="mx-3 h-px w-8 bg-gray-200 sm:mx-5 sm:w-16" />

              </div>

              {/* Payment */}

              <div className="flex items-center">

                <div className="flex items-center gap-2">

                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-400">
                    3
                  </div>

                  <span className="hidden text-xs font-medium text-gray-400 sm:block">
                    Payment
                  </span>

                </div>

                <div className="mx-3 h-px w-8 bg-gray-200 sm:mx-5 sm:w-16" />

              </div>

              {/* Complete */}

              <div className="flex items-center gap-2">

                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-400">
                  4
                </div>

                <span className="hidden text-xs font-medium text-gray-400 sm:block">
                  Complete
                </span>

              </div>

            </div>

          </div>

        </div>

        {/* ======================================================
            MAIN CONTENT
        ======================================================= */}

        <div className="mx-auto max-w-[1380px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">

          <form onSubmit={handleSubmit}>

            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_390px] xl:gap-8">

              {/* ==================================================
                  LEFT COLUMN
              =================================================== */}

              <div className="min-w-0 space-y-5">

                {/* ==================================================
                    CONTACT
                =================================================== */}

                <section className="rounded-2xl border border-gray-200 bg-white">

                  <div className="border-b border-gray-100 px-5 py-4 sm:px-6">

                    <div className="flex items-center justify-between">

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100">

                          <svg
                            className="h-4 w-4 text-gray-700"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.8}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>

                        </div>

                        <div>

                          <h2 className="text-base font-bold text-gray-950">
                            Contact details
                          </h2>

                          <p className="text-xs text-gray-400">
                            Your order confirmation will be sent here
                          </p>

                        </div>

                      </div>

                      <Badge
                        variant="success"
                        className="text-[10px]"
                      >
                        Verified
                      </Badge>

                    </div>

                  </div>

                  <div className="grid grid-cols-1 divide-y divide-gray-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">

                    {/* Name */}

                    <div className="flex items-center gap-3 px-5 py-4 sm:px-6">

                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink-50">

                        <svg
                          className="h-4 w-4 text-pink-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.8}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>

                      </div>

                      <div className="min-w-0">

                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                          Name
                        </p>

                        <p className="truncate text-sm font-semibold text-gray-900">
                          {formData.fullName}
                        </p>

                      </div>

                    </div>

                    {/* Email */}

                    <div className="flex items-center gap-3 px-5 py-4 sm:px-6">

                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50">

                        <svg
                          className="h-4 w-4 text-blue-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.8}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>

                      </div>

                      <div className="min-w-0">

                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                          Email
                        </p>

                        <p className="truncate text-sm font-semibold text-gray-900">
                          {formData.email}
                        </p>

                      </div>

                    </div>

                    {/* Phone */}

                    <div className="flex items-center gap-3 px-5 py-4 sm:px-6">

                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-50">

                        <svg
                          className="h-4 w-4 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.8}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>

                      </div>

                      <div className="min-w-0">

                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                          Phone
                        </p>

                        <p className="truncate text-sm font-semibold text-gray-900">
                          {formData.phone}
                        </p>

                      </div>

                    </div>

                  </div>

                </section>

                {/* ==================================================
                    DELIVERY ADDRESS
                =================================================== */}

                <section className="rounded-2xl border border-gray-200 bg-white">

                  <div className="border-b border-gray-100 px-5 py-4 sm:px-6">

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-50">

                        <svg
                          className="h-4 w-4 text-pink-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.8}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />

                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.8}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>

                      </div>

                      <div>

                        <h2 className="text-base font-bold text-gray-950">
                          Delivery address
                        </h2>

                        <p className="text-xs text-gray-400">
                          Where should we deliver your order?
                        </p>

                      </div>

                    </div>

                  </div>

                  <div className="p-5 sm:p-6">

                    {/* Saved addresses */}

                    {savedAddresses.length > 0 && (

                      <div>

                        <div className="mb-3 flex items-center justify-between">

                          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Saved addresses
                          </p>

                          <span className="text-[11px] text-gray-400">
                            {savedAddresses.length}{' '}
                            saved
                          </span>

                        </div>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

                          {savedAddresses.map(
                            (address) => {
                              const isSelected =
                                selectedAddressId ===
                                address._id;

                              return (
                                <button
                                  key={address._id}
                                  type="button"
                                  onClick={() =>
                                    handleAddressSelect(
                                      address
                                    )
                                  }
                                  disabled={
                                    isSubmitting
                                  }
                                  className={`group relative w-full rounded-xl border p-4 text-left transition-all ${
                                    isSelected
                                      ? 'border-pink-500 bg-pink-50/50 ring-1 ring-pink-500'
                                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                  }`}
                                >

                                  <div className="flex items-start gap-3">

                                    {/* Radio */}

                                    <div
                                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                                        isSelected
                                          ? 'border-pink-500 bg-pink-500'
                                          : 'border-gray-300 bg-white'
                                      }`}
                                    >

                                      {isSelected && (
                                        <svg
                                          className="h-3 w-3 text-white"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={3}
                                            d="M5 13l4 4L19 7"
                                          />
                                        </svg>
                                      )}

                                    </div>

                                    <div className="min-w-0 flex-1">

                                      <div className="flex items-center justify-between gap-2">

                                        <p className="text-sm font-bold text-gray-900">
                                          {address.label}
                                        </p>

                                        {address.isDefault && (
                                          <Badge
                                            variant="success"
                                            className="shrink-0 text-[9px]"
                                          >
                                            Default
                                          </Badge>
                                        )}

                                      </div>

                                      <p className="mt-2 text-xs leading-5 text-gray-600">
                                        {address.address}
                                      </p>

                                      <p className="mt-0.5 text-xs leading-5 text-gray-500">
                                        {address.city},{' '}
                                        {address.state}{' '}
                                        {address.zipCode}
                                      </p>

                                      <p className="text-xs leading-5 text-gray-500">
                                        {address.country}
                                      </p>

                                    </div>

                                  </div>

                                </button>
                              );
                            }
                          )}

                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setShowNewAddressForm(
                              true
                            )
                          }
                          disabled={
                            isSubmitting
                          }
                          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-3 text-xs font-semibold text-gray-500 transition hover:border-pink-400 hover:bg-pink-50 hover:text-pink-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >

                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>

                          Add a new address

                        </button>

                      </div>
                    )}

                    {/* New address */}

                    {(showNewAddressForm ||
                      savedAddresses.length === 0) && (

                      <div
                        className={
                          savedAddresses.length > 0
                            ? 'mt-5 border-t border-gray-100 pt-5'
                            : ''
                        }
                      >

                        <div className="mb-4 flex items-center justify-between">

                          <div>

                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                              {savedAddresses.length > 0
                                ? 'New address'
                                : 'Shipping address'}
                            </p>

                            <p className="mt-1 text-sm font-semibold text-gray-900">
                              Enter delivery details
                            </p>

                          </div>

                          {savedAddresses.length > 0 && (
                            <button
                              type="button"
                              onClick={() =>
                                setShowNewAddressForm(
                                  false
                                )
                              }
                              disabled={
                                isSubmitting
                              }
                              className="rounded-lg px-2 py-1.5 text-xs font-semibold text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            >
                              Cancel
                            </button>
                          )}

                        </div>

                        <div className="space-y-4">

                          <Input
                            label="Street Address"
                            name="address"
                            placeholder="House number, street, area"
                            value={
                              formData.address
                            }
                            onChange={
                              handleChange
                            }
                            required
                          />

                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                            <Input
                              label="City"
                              name="city"
                              placeholder="City"
                              value={
                                formData.city
                              }
                              onChange={
                                handleChange
                              }
                              required
                            />

                            <Input
                              label="State"
                              name="state"
                              placeholder="State"
                              value={
                                formData.state
                              }
                              onChange={
                                handleChange
                              }
                              required
                            />

                          </div>

                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                            <Input
                              label="ZIP Code"
                              name="zipCode"
                              placeholder="Postal code"
                              value={
                                formData.zipCode
                              }
                              onChange={
                                handleChange
                              }
                              required
                            />

                            <Select
                              label="Country"
                              name="country"
                              value={
                                formData.country
                              }
                              onChange={
                                handleChange
                              }
                              options={[
                                {
                                  value: 'IN',
                                  label: 'India',
                                },
                                {
                                  value: 'US',
                                  label: 'United States',
                                },
                                {
                                  value: 'GB',
                                  label: 'United Kingdom',
                                },
                                {
                                  value: 'CA',
                                  label: 'Canada',
                                },
                              ]}
                              required
                            />

                          </div>

                        </div>

                      </div>
                    )}

                  </div>

                </section>

                {/* ==================================================
                    SHIPPING
                =================================================== */}

                <section className="rounded-2xl border border-gray-200 bg-white">

                  <div className="border-b border-gray-100 px-5 py-4 sm:px-6">

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100">

                        <svg
                          className="h-4 w-4 text-gray-700"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.8}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m-8-4V7m8 4v10M4 7v10l8 4"
                          />
                        </svg>

                      </div>

                      <div>

                        <h2 className="text-base font-bold text-gray-950">
                          Shipping
                        </h2>

                        <p className="text-xs text-gray-400">
                          Your delivery option
                        </p>

                      </div>

                    </div>

                  </div>

                  <div className="p-5 sm:p-6">

                    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">

                        <svg
                          className="h-5 w-5 text-gray-700"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.8}
                            d="M3 7h13v10H3V7zm13 5h3l2 2v3h-5v-5zM7 19a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4z"
                          />
                        </svg>

                      </div>

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <p className="text-sm font-bold text-gray-900">
                            Standard Shipping
                          </p>

                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
                            {shipping === 0
                              ? 'FREE'
                              : `₹${shipping}`}
                          </span>

                        </div>

                        <p className="mt-1 text-xs text-gray-500">
                          Estimated delivery in 3–5 business days
                        </p>

                      </div>

                    </div>

                    <p className="mt-3 text-[11px] leading-5 text-gray-400">
                      {subtotal >= 999
                        ? 'You qualify for free shipping on this order.'
                        : subtotal > 499
                        ? '₹40 shipping applies to orders between ₹500 and ₹998.'
                        : '₹60 shipping applies to orders below ₹500.'}
                    </p>

                  </div>

                </section>

                {/* ==================================================
                    PAYMENT
                =================================================== */}

                <section className="rounded-2xl border border-gray-200 bg-white">

                  <div className="border-b border-gray-100 px-5 py-4 sm:px-6">

                    <div className="flex items-center justify-between gap-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-50">

                          <svg
                            className="h-4 w-4 text-pink-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.8}
                              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            />
                          </svg>

                        </div>

                        <div>

                          <h2 className="text-base font-bold text-gray-950">
                            Payment method
                          </h2>

                          <p className="text-xs text-gray-400">
                            Choose how you'd like to pay
                          </p>

                        </div>

                      </div>

                      <div className="hidden items-center gap-1.5 text-[10px] font-semibold text-gray-400 sm:flex">

                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.8}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>

                        Secure

                      </div>

                    </div>

                  </div>

                  <div className="p-5 sm:p-6">

                    <div className="space-y-3">

                      {/* Razorpay */}

                      <label
                        className={`relative flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all ${
                          formData.paymentMethod ===
                          'razorpay'
                            ? 'border-pink-500 bg-pink-50/50 ring-1 ring-pink-500'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >

                        <input
                          type="radio"
                          name="paymentMethod"
                          value="razorpay"
                          checked={
                            formData.paymentMethod ===
                            'razorpay'
                          }
                          onChange={
                            handleChange
                          }
                          className="sr-only"
                          required
                        />

                        <div
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                            formData.paymentMethod ===
                            'razorpay'
                              ? 'border-pink-500 bg-pink-500'
                              : 'border-gray-300 bg-white'
                          }`}
                        >

                          {formData.paymentMethod ===
                            'razorpay' && (
                            <svg
                              className="h-3 w-3 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}

                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-wrap items-center gap-2">

                            <p className="text-sm font-bold text-gray-900">
                              Card / UPI / Net Banking
                            </p>

                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[9px] font-bold text-gray-500">
                              RAZORPAY
                            </span>

                          </div>

                          <p className="mt-1 text-xs text-gray-500">
                            Pay securely through Razorpay
                          </p>

                        </div>

                        <div className="hidden shrink-0 items-center gap-1 sm:flex">

                          <span className="rounded bg-blue-600 px-1.5 py-1 text-[8px] font-bold text-white">
                            VISA
                          </span>

                          <span className="rounded bg-gray-900 px-1.5 py-1 text-[8px] font-bold text-white">
                            MC
                          </span>

                        </div>

                      </label>

                      {/* Wallet */}

                      {canUseWallet && (
                        <label
                          className={`relative flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all ${
                            formData.paymentMethod ===
                            'wallet'
                              ? 'border-pink-500 bg-pink-50/50 ring-1 ring-pink-500'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >

                          <input
                            type="radio"
                            name="paymentMethod"
                            value="wallet"
                            checked={
                              formData.paymentMethod ===
                              'wallet'
                            }
                            onChange={
                              handleChange
                            }
                            className="sr-only"
                          />

                          <div
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                              formData.paymentMethod ===
                              'wallet'
                                ? 'border-pink-500 bg-pink-500'
                                : 'border-gray-300 bg-white'
                            }`}
                          >

                            {formData.paymentMethod ===
                              'wallet' && (
                              <svg
                                className="h-3 w-3 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={3}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}

                          </div>

                          <div className="min-w-0 flex-1">

                            <div className="flex flex-wrap items-center gap-2">

                              <p className="text-sm font-bold text-gray-900">
                                Wallet
                              </p>

                              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
                                ₹
                                {walletBalance.toFixed(
                                  2
                                )}
                              </span>

                            </div>

                            <p className="mt-1 text-xs text-gray-500">
                              Pay directly from your BellesCart wallet
                            </p>

                          </div>

                        </label>
                      )}

                    </div>

                    <div className="mt-4 flex items-start gap-3 rounded-xl bg-blue-50 p-4">

                      <svg
                        className="mt-0.5 h-4 w-4 shrink-0 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>

                      <div>

                        <p className="text-xs font-bold text-blue-900">
                          Secure payment
                        </p>

                        <p className="mt-1 text-[11px] leading-5 text-blue-700">
                          Your payment information is encrypted and securely processed.
                        </p>

                      </div>

                    </div>

                  </div>

                </section>

                {/* ==================================================
                    NOTES
                =================================================== */}

                <section className="rounded-2xl border border-gray-200 bg-white">

                  <div className="border-b border-gray-100 px-5 py-4 sm:px-6">

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100">

                        <svg
                          className="h-4 w-4 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.8}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>

                      </div>

                      <div>

                        <h2 className="text-base font-bold text-gray-950">
                          Order notes
                        </h2>

                        <p className="text-xs text-gray-400">
                          Optional instructions for your order
                        </p>

                      </div>

                    </div>

                  </div>

                  <div className="p-5 sm:p-6">

                    <textarea
                      name="notes"
                      value={
                        formData.notes
                      }
                      onChange={
                        handleChange
                      }
                      rows={3}
                      disabled={
                        isSubmitting
                      }
                      className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                      placeholder="Any special instructions for your order..."
                    />

                  </div>

                </section>

              </div>

              {/* ==================================================
                  RIGHT COLUMN — SUMMARY
              =================================================== */}

              <aside className="lg:sticky lg:top-24">

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">

                  {/* Summary header */}

                  <div className="border-b border-gray-100 px-5 py-4 sm:px-6">

                    <div className="flex items-center justify-between">

                      <div>

                        <h2 className="text-base font-bold text-gray-950">
                          Order summary
                        </h2>

                        <p className="mt-0.5 text-xs text-gray-400">
                          {totalQuantity}{' '}
                          {totalQuantity === 1
                            ? 'item'
                            : 'items'}
                        </p>

                      </div>

                      <Link
                        href="/cart"
                        className="text-xs font-semibold text-gray-400 transition hover:text-pink-600"
                      >
                        Edit cart
                      </Link>

                    </div>

                  </div>

                  {/* Items */}

                  <div className="max-h-72 overflow-y-auto border-b border-gray-100 px-5 py-4 sm:px-6">

                    <div className="space-y-4">

                      {cartItems.map(
                        (item) => {

                          const itemPrice =
                            item.price || 0;

                          const quantity =
                            item.quantity ||
                            0;

                          const itemTotal =
                            itemPrice *
                            quantity;

                          const image =
                            item.product
                              ?.images?.[0]
                              ?.url;

                          return (
                            <div
                              key={item._id}
                              className="flex items-start gap-3"
                            >

                              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-100">

                                {image ? (
                                  <img
                                    src={image}
                                    alt={
                                      item.name ||
                                      'Product'
                                    }
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center">

                                    <svg
                                      className="h-5 w-5 text-gray-300"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                      />
                                    </svg>

                                  </div>
                                )}

                                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-900 px-1 text-[9px] font-bold text-white">
                                  {quantity}
                                </span>

                              </div>

                              <div className="min-w-0 flex-1">

                                <p className="truncate text-xs font-semibold text-gray-900">
                                  {item.name}
                                </p>

                                <p className="mt-1 text-[11px] text-gray-400">
                                  ₹
                                  {itemPrice.toFixed(
                                    2
                                  )}{' '}
                                  each
                                </p>

                              </div>

                              <span className="shrink-0 text-xs font-bold text-gray-900">
                                ₹
                                {itemTotal.toFixed(
                                  2
                                )}
                              </span>

                            </div>
                          );
                        }
                      )}

                    </div>

                  </div>

                  {/* Price */}

                  <div className="px-5 py-5 sm:px-6">

                    <div className="space-y-3">

                      <div className="flex justify-between text-sm">

                        <span className="text-gray-500">
                          Subtotal
                        </span>

                        <span className="font-semibold text-gray-900">
                          ₹
                          {subtotal.toFixed(
                            2
                          )}
                        </span>

                      </div>

                      <div className="flex justify-between text-sm">

                        <span className="text-gray-500">
                          Shipping
                        </span>

                        <span className="font-semibold">

                          {shipping === 0 ? (
                            <span className="text-green-600">
                              Free
                            </span>
                          ) : (
                            <span className="text-gray-900">
                              ₹
                              {shipping.toFixed(
                                2
                              )}
                            </span>
                          )}

                        </span>

                      </div>

                      {appliedCoupon && (
                        <div className="flex justify-between text-sm">

                          <span className="text-green-600">
                            Discount
                          </span>

                          <span className="font-bold text-green-600">
                            -₹
                            {discount.toFixed(
                              2
                            )}
                          </span>

                        </div>
                      )}

                    </div>

                    <div className="my-5 h-px bg-gray-200" />

                    <div className="flex items-end justify-between gap-3">

                      <div>

                        <p className="text-base font-bold text-gray-950">
                          Total
                        </p>

                        <p className="mt-1 text-[10px] text-gray-400">
                          Final amount
                        </p>

                      </div>

                      <p className="text-2xl font-bold tracking-tight text-gray-950">
                        ₹
                        {grandTotal.toFixed(
                          2
                        )}
                      </p>

                    </div>

                  </div>

                  {/* ==================================================
                      COUPON
                  =================================================== */}

                  <div className="border-t border-gray-100 px-5 py-5 sm:px-6">

                    <p className="mb-3 text-xs font-bold text-gray-900">
                      Have a promo code?
                    </p>

                    {appliedCoupon ? (

                      <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 p-3">

                        <div className="flex min-w-0 items-center gap-2">

                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100">

                            <svg
                              className="h-3.5 w-3.5 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>

                          </div>

                          <div className="min-w-0">

                            <p className="truncate text-xs font-bold text-green-800">
                              {appliedCoupon.code}
                            </p>

                            <p className="text-[10px] text-green-600">
                              {appliedCoupon.discountType ===
                              'percentage'
                                ? `${appliedCoupon.discountValue}% off`
                                : appliedCoupon.discountType ===
                                  'fixed'
                                ? `₹${appliedCoupon.discountValue} off`
                                : 'Free shipping'}
                            </p>

                          </div>

                        </div>

                        <button
                          type="button"
                          onClick={
                            handleRemoveCoupon
                          }
                          disabled={
                            isSubmitting
                          }
                          className="ml-2 shrink-0 text-[11px] font-bold text-red-500 hover:text-red-700 disabled:opacity-50"
                        >
                          Remove
                        </button>

                      </div>

                    ) : (

                      <div className="flex gap-2">

                        <input
                          type="text"
                          placeholder="Enter promo code"
                          value={
                            couponCode
                          }
                          onChange={(e) =>
                            setCouponCode(
                              e.target.value.toUpperCase()
                            )
                          }
                          disabled={
                            isSubmitting ||
                            isApplyingCoupon
                          }
                          className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-500/10 disabled:opacity-50"
                        />

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={
                            handleApplyCoupon
                          }
                          disabled={
                            isSubmitting ||
                            isApplyingCoupon ||
                            !couponCode.trim()
                          }
                          className="shrink-0 rounded-xl px-4"
                        >
                          {isApplyingCoupon
                            ? 'Applying...'
                            : 'Apply'}
                        </Button>

                      </div>

                    )}

                  </div>

                  {/* ==================================================
                      PLACE ORDER
                  =================================================== */}

                  <div className="border-t border-gray-100 p-5 sm:p-6">

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full rounded-xl py-3.5 text-sm font-bold shadow-lg shadow-pink-500/20 transition-all hover:shadow-pink-500/30"
                      disabled={
                        isSubmitting
                      }
                    >

                      {isSubmitting ? (

                        <span className="flex items-center justify-center gap-2">

                          <svg
                            className="h-5 w-5 animate-spin"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />

                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />

                          </svg>

                          {processingStep ||
                            'Processing...'}

                        </span>

                      ) : (

                        <span className="flex items-center justify-center gap-2">

                          Place order

                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 8l4 4m0 0l-4 4m4-4H3"
                            />
                          </svg>

                        </span>

                      )}

                    </Button>

                    <p className="mt-3 text-center text-[10px] leading-4 text-gray-400">
                      By placing your order, you confirm that the information provided is correct.
                    </p>

                  </div>

                </div>

                {/* Security */}

                <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-gray-400">

                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.7}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>

                  Secure checkout

                  <span className="text-gray-300">
                    •
                  </span>

                  <span>
                    Protected payment
                  </span>

                </div>

              </aside>

            </div>

          </form>

        </div>

      </main>

      {/* ========================================================
          MOBILE STICKY PLACE ORDER
      ========================================================= */}

      <div className="sticky bottom-0 z-40 border-t border-gray-200 bg-white/95 px-3 py-3 backdrop-blur-md lg:hidden">

        <div className="mx-auto flex max-w-[1380px] items-center gap-3">

          <div className="min-w-0 flex-1">

            <p className="text-[10px] font-medium text-gray-400">
              Total
            </p>

            <p className="text-lg font-bold text-gray-950">
              ₹
              {grandTotal.toFixed(
                2
              )}
            </p>

          </div>

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="shrink-0 rounded-xl px-6 shadow-lg shadow-pink-500/20"
          >

            {isSubmitting
              ? 'Processing...'
              : 'Place order'}

          </Button>

        </div>

      </div>

      <Footer />

    </div>
  );
}