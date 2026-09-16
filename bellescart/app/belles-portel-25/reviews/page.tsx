'use client';

import React, { useState } from 'react';
import AdminHeader from '@/components/AdminHeader/AdminHeader';
import Loader from '@/components/ui/Loader';
import { globalToast } from '@/utils/globalToast';
import { useAdminReviews, useUpdateReviewStatus, useDeleteAdminReview } from '@/hooks/admin/useAdminReviewQueries';
import { AdminReview } from '@/services/admin/reviewService';

export default function AdminReviewsPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [page, setPage] = useState(1);

  const { data: reviewsData, isLoading } = useAdminReviews({
    page,
    limit: 20,
    status: filter === 'all' ? undefined : filter
  });

  const updateStatusMutation = useUpdateReviewStatus();
  const deleteReviewMutation = useDeleteAdminReview();

  const reviews = reviewsData?.data?.reviews || [];
  const pagination = reviewsData?.data?.pagination || { page: 1, totalPages: 1 };

  const handleStatusChange = async (reviewId: string, newStatus: 'pending' | 'approved' | 'rejected') => {
    try {
      await updateStatusMutation.mutateAsync({ reviewId, status: newStatus });
      globalToast.general.success('Updated', `Review ${newStatus} successfully`);
    } catch (error) {
      console.error('Failed to update review status:', error);
      globalToast.general.error('Error', 'Failed to update review status');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await deleteReviewMutation.mutateAsync(reviewId);
      globalToast.general.success('Deleted', 'Review deleted successfully');
    } catch (error) {
      console.error('Failed to delete review:', error);
      globalToast.general.error('Error', 'Failed to delete review');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f5f3]">
      <AdminHeader />

      <main className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[#30222b]">
            Reviews Management
          </h1>
          <p className="mt-2 text-sm text-[#756a72]">
            Manage and moderate customer reviews
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              filter === 'all'
                ? 'bg-[#30222b] text-white'
                : 'bg-white text-[#66565e] hover:bg-gray-100'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter('pending')}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              filter === 'pending'
                ? 'bg-[#30222b] text-white'
                : 'bg-white text-[#66565e] hover:bg-gray-100'
            }`}
          >
            Pending
          </button>
          <button
            type="button"
            onClick={() => setFilter('approved')}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              filter === 'approved'
                ? 'bg-[#30222b] text-white'
                : 'bg-white text-[#66565e] hover:bg-gray-100'
            }`}
          >
            Approved
          </button>
          <button
            type="button"
            onClick={() => setFilter('rejected')}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              filter === 'rejected'
                ? 'bg-[#30222b] text-white'
                : 'bg-white text-[#66565e] hover:bg-gray-100'
            }`}
          >
            Rejected
          </button>
        </div>

        {/* Reviews Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader size="lg" text="Loading reviews..." />
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <svg
              className="mx-auto h-12 w-12 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              No reviews found
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {filter === 'all' 
                ? 'There are no reviews yet.' 
                : `There are no ${filter} reviews.`}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <table className="w-full">
              <thead className="bg-[#faf7f8] border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#66565e]">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#66565e]">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#66565e]">
                    Rating
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#66565e]">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#66565e]">
                    Date
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[#66565e]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reviews.map((review) => (
                  <tr key={review._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {review.product?.name || 'Unknown Product'}
                      </div>
                      {review.isVerifiedPurchase && (
                        <span className="inline-flex items-center gap-1 mt-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700">
                          Verified
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {review.user?.name || 'Unknown User'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {review.user?.email || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating 
                                ? 'text-[#bd9250]' 
                                : 'text-gray-200'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusColor(review.status)}`}>
                        {review.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(review.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {review.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(review._id, 'approved')}
                              disabled={updateStatusMutation.isPending}
                              className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(review._id, 'rejected')}
                              disabled={updateStatusMutation.isPending}
                              className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteReview(review._id)}
                          disabled={deleteReviewMutation.isPending}
                          className="rounded-full bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
                <div className="text-sm text-gray-500">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={pagination.page === 1}
                    className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                    disabled={pagination.page === pagination.totalPages}
                    className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}