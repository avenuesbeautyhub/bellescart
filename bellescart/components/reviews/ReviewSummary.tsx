import React from 'react';
import type { ReviewSummary } from '@/services/reviewService';
import RatingStars from './RatingStars';

interface ReviewSummaryProps {
  summary: ReviewSummary;
  onWriteReviewClick?: () => void;
  showWriteButton?: boolean;
}

const ReviewSummary: React.FC<ReviewSummaryProps> = ({
  summary,
  onWriteReviewClick,
  showWriteButton = true
}) => {
  const ratingPercentages = {
    5: summary.totalReviews > 0 ? (summary.ratingDistribution['5'] / summary.totalReviews) * 100 : 0,
    4: summary.totalReviews > 0 ? (summary.ratingDistribution['4'] / summary.totalReviews) * 100 : 0,
    3: summary.totalReviews > 0 ? (summary.ratingDistribution['3'] / summary.totalReviews) * 100 : 0,
    2: summary.totalReviews > 0 ? (summary.ratingDistribution['2'] / summary.totalReviews) * 100 : 0,
    1: summary.totalReviews > 0 ? (summary.ratingDistribution['1'] / summary.totalReviews) * 100 : 0,
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-[0_16px_50px_rgba(35,20,28,0.055)] ring-1 ring-black/[0.055]">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <RatingStars rating={summary.averageRating} size="lg" />
            <span className="text-2xl font-semibold text-gray-950">
              {summary.averageRating.toFixed(1)}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Based on {summary.totalReviews} {summary.totalReviews === 1 ? 'review' : 'reviews'}
          </p>
        </div>

        {showWriteButton && onWriteReviewClick && (
          <button
            type="button"
            onClick={onWriteReviewClick}
            className="shrink-0 rounded-full bg-[#21151d] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#35232e]"
          >
            Write a Review
          </button>
        )}
      </div>

      <div className="mt-6 space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => (
          <div key={rating} className="flex items-center gap-3">
            <span className="text-xs font-medium text-gray-600 w-3">{rating}</span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#bd9250] rounded-full transition-all duration-300"
                style={{ width: `${ratingPercentages[rating as keyof typeof ratingPercentages]}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 w-8 text-right">
              {summary.ratingDistribution[rating.toString() as keyof typeof summary.ratingDistribution]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewSummary;