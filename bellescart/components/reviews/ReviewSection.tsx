import React, { useState, useEffect } from 'react';
import { useProductReviews, useReviewEligibility, useReviewSummary, useCreateReview, useUpdateReview, useDeleteReview } from '@/hooks/user/useReviewQueries';
import { Review } from '@/services/reviewService';
import ReviewSummary from './ReviewSummary';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import Loader from '@/components/ui/Loader';
import { globalToast } from '@/utils/globalToast';
import { useAuth } from '@/auth/user';

interface ReviewSectionProps {
  productId: string;
  isAuthenticated: boolean;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ productId, isAuthenticated }) => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [currentEligibility, setCurrentEligibility] = useState<any>({
    canReview: false,
    hasReviewed: false,
    isVerifiedPurchase: false
  });

  const { data: reviewsData, isLoading: isLoadingReviews, refetch: refetchReviews } = useProductReviews(productId, {
    page: 1,
    limit: 10,
    status: 'approved'
  });

  const { data: summaryData, isLoading: isLoadingSummary, refetch: refetchSummary } = useReviewSummary(productId);
  const { data: eligibilityData, isLoading: isLoadingEligibility, refetch: refetchEligibility } = useReviewEligibility(productId);

  const createReviewMutation = useCreateReview();
  const updateReviewMutation = useUpdateReview();
  const deleteReviewMutation = useDeleteReview();

  // Update current eligibility when initial data loads
  useEffect(() => {
    if (eligibilityData?.data) {
      setCurrentEligibility(eligibilityData.data);
    }
  }, [eligibilityData]);

  const handleWriteReview = async () => {
    if (!isAuthenticated) {
      globalToast.auth.tokenInvalid();
      return;
    }
    
    // Refetch eligibility to get the most up-to-date status
    const { data: freshEligibilityData } = await refetchEligibility();
    const freshEligibility = freshEligibilityData?.data || {
      canReview: false,
      hasReviewed: false,
      isVerifiedPurchase: false
    };
    
    // Update the current eligibility state
    setCurrentEligibility(freshEligibility);
    
    // Check if user is eligible to review (must have purchased the product)
    if (!freshEligibility.canReview) {
      if (freshEligibility.hasReviewed) {
        globalToast.general.error('Already Reviewed', 'You have already reviewed this product');
      } else if (!freshEligibility.isVerifiedPurchase) {
        globalToast.general.error('Purchase Required', 'You can only review products you have purchased');
      } else {
        globalToast.general.error('Unable to Review', 'You are not eligible to review this product');
      }
      return;
    }
    
    setEditingReview(null);
    setShowForm(true);
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setShowForm(true);
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await deleteReviewMutation.mutateAsync(reviewId);
      globalToast.general.success('Deleted', 'Review deleted successfully');
      // Refetch review data to ensure the UI updates immediately
      await Promise.all([
        refetchReviews(),
        refetchSummary(),
        refetchEligibility()
      ]);
    } catch (error) {
      console.error('Failed to delete review:', error);
      globalToast.general.error('Error', 'Failed to delete review');
    }
  };

  const handleSubmitReview = async (data: {
    rating: number;
    title?: string;
    comment: string;
    images?: string[];
  }) => {
    try {
      console.log('[REVIEW SUBMIT] Submitting review:', data);
      if (editingReview) {
        await updateReviewMutation.mutateAsync({
          reviewId: editingReview._id,
          data
        });
        globalToast.general.success('Updated', 'Review updated successfully');
      } else {
        await createReviewMutation.mutateAsync({
          productId,
          ...data
        });
        globalToast.general.success('Submitted', 'Review submitted successfully');
      }
      setShowForm(false);
      setEditingReview(null);
      // Refetch review data to ensure the UI updates immediately
      await Promise.all([
        refetchReviews(),
        refetchSummary(),
        refetchEligibility()
      ]);
    } catch (error: any) {
      console.error('[REVIEW SUBMIT] Failed to submit review:', error);
      console.error('[REVIEW SUBMIT] Error details:', {
        message: error.message,
        response: error.response,
        data: error.data
      });

      // Provide user-friendly error messages
      let errorMessage = 'Failed to submit review';
      if (error.message?.includes('purchased')) {
        errorMessage = 'You can only review products you have purchased and received';
      } else if (error.message?.includes('already reviewed')) {
        errorMessage = 'You have already reviewed this product';
      } else if (error.message) {
        errorMessage = error.message;
      }

      globalToast.general.error('Error', errorMessage);
    }
  };

  const isLoading = isLoadingReviews || isLoadingSummary || isLoadingEligibility;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader size="md" text="Loading reviews..." />
      </div>
    );
  }

  const reviews = reviewsData?.data?.reviews || [];
  const summary = summaryData?.data || {
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
  };
  const eligibility = eligibilityData?.data || {
    canReview: false,
    hasReviewed: false,
    isVerifiedPurchase: false
  };

  // Use user's review from eligibility data if available, otherwise fall back to reviews list
  const userReview = eligibility.userReview || (eligibility.hasReviewed ? reviews[0] : null);

  // Combine user's review with other reviews, avoiding duplicates
  const allReviews = userReview
    ? [userReview, ...reviews.filter(review => review._id !== userReview._id)]
    : reviews;

  return (
    <div className="space-y-8">
      {/* Review Summary */}
      <ReviewSummary
        summary={summary}
        onWriteReviewClick={handleWriteReview}
        showWriteButton={!showForm && !currentEligibility.hasReviewed}
      />

      {/* Review Form */}
      {showForm && (
        <ReviewForm
          productId={productId}
          existingReview={editingReview || undefined}
          onSubmit={handleSubmitReview}
          onCancel={() => {
            setShowForm(false);
            setEditingReview(null);
          }}
          isLoading={createReviewMutation.isPending || updateReviewMutation.isPending}
        />
      )}

      {/* User's existing review actions */}
      {!showForm && currentEligibility.hasReviewed && userReview && (
        <div className="rounded-2xl bg-[#f6e9ed] p-4 ring-1 ring-[#a45b70]/20">
          <p className="text-sm font-medium text-[#a45b70] mb-3">
            You reviewed this product
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleEditReview(userReview)}
              className="rounded-full bg-[#21151d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#35232e]"
            >
              Edit Review
            </button>
            <button
              type="button"
              onClick={() => handleDeleteReview(userReview._id)}
              disabled={deleteReviewMutation.isPending}
              className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              {deleteReviewMutation.isPending ? 'Deleting...' : 'Delete Review'}
            </button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {allReviews.length > 0 ? (
        <div className="space-y-0">
          <h3 className="text-lg font-semibold text-gray-950 mb-4">
            Customer Reviews
          </h3>
          {allReviews.map((review) => (
            <ReviewCard key={review._id} review={review} currentUserId={user?._id || user?.id} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-8 text-center shadow-[0_16px_50px_rgba(35,20,28,0.055)] ring-1 ring-black/[0.055]">
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
          <h3 className="mt-4 text-lg font-semibold text-gray-950">
            No reviews yet
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Be the first to review this product!
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewSection;