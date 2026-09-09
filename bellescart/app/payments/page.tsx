'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireUserAuth } from '@/auth/user';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import Badge from '@/components/ui/Badge';
import { usePaymentHistory } from '@/hooks/user/usePaymentQueries';

export default function PaymentsPage() {
  const router = useRouter();
  const { loaded, isAuthenticated } = useRequireUserAuth();

  // State for filtering and pagination
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  // React Query hook
  const { data: paymentsData, isLoading, error } = usePaymentHistory({
    page: currentPage,
    limit: 10,
    status: selectedStatus !== 'all' ? selectedStatus as any : undefined
  });

  const payments = paymentsData?.data?.payments || [];
  const pagination = paymentsData?.data?.pagination;
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Handle initial load state
  useEffect(() => {
    if (!isLoading && payments.length > 0) {
      setIsInitialLoad(false);
    }
  }, [isLoading, payments.length]);

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader size="lg" text="Loading..." fullScreen />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (isInitialLoad && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader size="lg" text="Loading payment history..." fullScreen />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'danger';
      case 'refunded':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'razorpay':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      case 'wallet':
        return (
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      case 'cash_on_delivery':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-gray-800">Payment History</h1>
            <Button
              variant="outline"
              onClick={() => router.push('/profile')}
            >
              Back to Profile
            </Button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              {isLoading && !isInitialLoad && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Updating...</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment List */}
          {payments.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-500 text-lg mb-2">No payment history found</p>
              <p className="text-gray-400 text-sm">Your payment transactions will appear here</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {payments.map((payment: any) => (
                      <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {payment.bookingId}
                          </div>
                          {payment.razorpayPaymentId && (
                            <div className="text-xs text-gray-500">
                              Razorpay: {payment.razorpayPaymentId.slice(0, 8)}...
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(payment.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₹{payment.amount.toFixed(2)}
                          {payment.refundAmount && (
                            <div className="text-xs text-green-600">
                              Refunded: ₹{payment.refundAmount.toFixed(2)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getPaymentMethodIcon(payment.paymentMethod)}
                            <span className="text-sm text-gray-700 capitalize">
                              {payment.paymentMethod.replace('_', ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={getStatusColor(payment.status) as any}>
                            {payment.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedPayment(payment)}
                          >
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Page {pagination.current} of {pagination.pages} ({pagination.total} total)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={pagination.current === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                      disabled={pagination.current === pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Payment Details</h2>
              <button
                onClick={() => setSelectedPayment(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Booking ID</p>
                  <p className="font-medium text-gray-900">{selectedPayment.bookingId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Payment ID</p>
                  <p className="font-medium text-gray-900">{selectedPayment._id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Amount</p>
                  <p className="font-medium text-gray-900">₹{selectedPayment.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Currency</p>
                  <p className="font-medium text-gray-900">{selectedPayment.currency}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <Badge variant={getStatusColor(selectedPayment.status) as any}>
                    {selectedPayment.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Payment Method</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {selectedPayment.paymentMethod.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Created At</p>
                  <p className="font-medium text-gray-900">{formatDate(selectedPayment.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Updated At</p>
                  <p className="font-medium text-gray-900">{formatDate(selectedPayment.updatedAt)}</p>
                </div>
              </div>

              {/* Customer Information */}
              {selectedPayment.user && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <h3 className="font-semibold text-green-800 mb-3">Customer Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-green-700">User ID:</span>
                      <span className="text-sm font-medium text-green-900">{typeof selectedPayment.user === 'object' ? selectedPayment.user._id || selectedPayment.user.id : selectedPayment.user}</span>
                    </div>
                    {typeof selectedPayment.user === 'object' && selectedPayment.user.name && (
                      <div className="flex justify-between">
                        <span className="text-sm text-green-700">Name:</span>
                        <span className="text-sm font-medium text-green-900">{selectedPayment.user.name}</span>
                      </div>
                    )}
                    {typeof selectedPayment.user === 'object' && selectedPayment.user.email && (
                      <div className="flex justify-between">
                        <span className="text-sm text-green-700">Email:</span>
                        <span className="text-sm font-medium text-green-900">{selectedPayment.user.email}</span>
                      </div>
                    )}
                    {typeof selectedPayment.user === 'object' && selectedPayment.user.phone && (
                      <div className="flex justify-between">
                        <span className="text-sm text-green-700">Phone:</span>
                        <span className="text-sm font-medium text-green-900">{selectedPayment.user.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Shipping Address */}
              {selectedPayment.order && typeof selectedPayment.order === 'object' && selectedPayment.order.shippingAddress && (
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                  <h3 className="font-semibold text-orange-800 mb-3">Shipping Address</h3>
                  <div className="space-y-1">
                    {selectedPayment.order.shippingAddress.fullName && (
                      <p className="text-sm text-orange-900 font-medium">{selectedPayment.order.shippingAddress.fullName}</p>
                    )}
                    {selectedPayment.order.shippingAddress.address && (
                      <p className="text-sm text-orange-700">{selectedPayment.order.shippingAddress.address}</p>
                    )}
                    {(selectedPayment.order.shippingAddress.city || selectedPayment.order.shippingAddress.state || selectedPayment.order.shippingAddress.zipCode) && (
                      <p className="text-sm text-orange-700">
                        {selectedPayment.order.shippingAddress.city}{selectedPayment.order.shippingAddress.city && selectedPayment.order.shippingAddress.state ? ', ' : ''}
                        {selectedPayment.order.shippingAddress.state} {selectedPayment.order.shippingAddress.zipCode}
                      </p>
                    )}
                    {selectedPayment.order.shippingAddress.phone && (
                      <p className="text-sm text-orange-700">Phone: {selectedPayment.order.shippingAddress.phone}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Razorpay Information */}
              {selectedPayment.razorpayPaymentId && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <h3 className="font-semibold text-blue-800 mb-3">Razorpay Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-700">Razorpay Order ID:</span>
                      <span className="text-sm font-medium text-blue-900">{selectedPayment.razorpayOrderId || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-700">Razorpay Payment ID:</span>
                      <span className="text-sm font-medium text-blue-900">{selectedPayment.razorpayPaymentId}</span>
                    </div>
                    {selectedPayment.paymentSignature && (
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-700">Signature Verified:</span>
                        <span className="text-sm font-medium text-green-600">✓ Yes</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Refund Information */}
              {selectedPayment.refundId && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <h3 className="font-semibold text-green-800 mb-3">Refund Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-green-700">Refund ID:</span>
                      <span className="text-sm font-medium text-green-900">{selectedPayment.refundId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-green-700">Refund Amount:</span>
                      <span className="text-sm font-medium text-green-900">₹{selectedPayment.refundAmount?.toFixed(2) || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Metadata */}
              {selectedPayment.metadata && Object.keys(selectedPayment.metadata).length > 0 && (
                <div className={`${selectedPayment.status === 'failed' ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-200'} rounded-lg p-4 border`}>
                  <h3 className={`font-semibold ${selectedPayment.status === 'failed' ? 'text-red-800' : 'text-gray-800'} mb-3`}>
                    {selectedPayment.status === 'failed' ? 'Error Details' : 'Additional Metadata'}
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(selectedPayment.metadata).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-sm font-medium text-gray-700 capitalize mb-1">{key.replace(/_/g, ' ')}:</p>
                        {key === 'error' && typeof value === 'object' && value !== null ? (
                          <div className="bg-white rounded p-3 space-y-1 border border-gray-200">
                            {(value as any).code && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Error Code:</span>
                                <span className="font-medium text-red-600">{(value as any).code}</span>
                              </div>
                            )}
                            {(value as any).description && (
                              <div className="text-sm text-gray-700 mt-1">{(value as any).description}</div>
                            )}
                            {(value as any).reason && (
                              <div className="flex justify-between text-sm mt-1">
                                <span className="text-gray-600">Reason:</span>
                                <span className="font-medium text-gray-900">{(value as any).reason}</span>
                              </div>
                            )}
                            {(value as any).source && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Source:</span>
                                <span className="font-medium text-gray-900 capitalize">{(value as any).source}</span>
                              </div>
                            )}
                            {(value as any).step && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Step:</span>
                                <span className="font-medium text-gray-900">{String((value as any).step).replace(/_/g, ' ')}</span>
                              </div>
                            )}
                          </div>
                        ) : typeof value === 'object' && value !== null ? (
                          <div className="bg-white rounded p-2 border border-gray-200 text-sm">
                            <pre className="whitespace-pre-wrap break-words text-gray-700">{JSON.stringify(value, null, 2)}</pre>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-900 font-medium">
                            {String(value)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Reference */}
              {selectedPayment.order && (
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                  <h3 className="font-semibold text-purple-800 mb-3">Order Reference</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-purple-700">Order ID:</span>
                      <span className="text-sm font-medium text-purple-900">{selectedPayment.order._id || selectedPayment.order}</span>
                    </div>
                    {selectedPayment.order.orderNumber && (
                      <div className="flex justify-between">
                        <span className="text-sm text-purple-700">Order Number:</span>
                        <span className="text-sm font-medium text-purple-900">{selectedPayment.order.orderNumber}</span>
                      </div>
                    )}
                    {selectedPayment.order.status && (
                      <div className="flex justify-between">
                        <span className="text-sm text-purple-700">Order Status:</span>
                        <span className="text-sm font-medium text-purple-900 capitalize">{selectedPayment.order.status}</span>
                      </div>
                    )}
                    {selectedPayment.order.total && (
                      <div className="flex justify-between">
                        <span className="text-sm text-purple-700">Order Total:</span>
                        <span className="text-sm font-medium text-purple-900">₹{selectedPayment.order.total.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end p-6 border-t border-gray-200">
              <Button onClick={() => setSelectedPayment(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}