import React from 'react';
import { Review, User } from '@/services/reviewService';
import RatingStars from './RatingStars';

interface ReviewCardProps {
  review: Review;
  showProductInfo?: boolean;
  currentUserId?: string;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, showProductInfo = false, currentUserId }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    // Format: "January 15, 2024 at 3:30 PM"
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };

    return date.toLocaleDateString('en-US', options);
  };

  // Get the actual user ID (handle both populated and non-populated userId)
  const getUserId = (): string => {
    const userId = review.userId;
    if (typeof userId === 'string') {
      return userId;
    }
    // Type assertion for populated user object
    if (userId && typeof userId === 'object') {
      return (userId as any)._id;
    }
    return userId as string;
  };

  const actualUserId = getUserId();
  const isOwnReview = currentUserId && String(actualUserId) === String(currentUserId);

  // Get user name - handle both populated and non-populated userId
  const getUserName = () => {
    if (isOwnReview) return 'You';

    // If user data is populated in separate field
    if (review.user?.name) {
      return review.user.name;
    }

    // If userId is populated with user data
    const userId = review.userId;
    if (userId && typeof userId === 'object') {
      return (userId as any).name;
    }

    // Fallback to Customer
    return 'Customer';
  };

  return (
    <div className="border-b border-gray-200/80 py-6 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <RatingStars rating={review.rating} size="sm" />
            {review.isVerifiedPurchase && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700">
                <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified Purchase
              </span>
            )}
          </div>

          {review.title && (
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              {review.title}
            </h4>
          )}

          <p className="text-sm text-gray-600 leading-relaxed">
            {review.comment}
          </p>

          {review.images && review.images.length > 0 && (
            <div className="flex gap-2 mt-3">
              {review.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Review image ${index + 1}`}
                  className="h-16 w-16 rounded-lg object-cover border border-gray-200"
                />
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
            <span className="font-medium text-gray-600">
              {getUserName()}
            </span>
            <span>•</span>
            <span>{formatDate(review.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;