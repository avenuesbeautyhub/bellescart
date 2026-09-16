import React, { useState } from 'react';
import RatingStars from './RatingStars';
import { Review } from '@/services/reviewService';

interface ReviewFormProps {
  productId: string;
  existingReview?: Review;
  onSubmit: (data: {
    rating: number;
    title?: string;
    comment: string;
    images?: string[];
  }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  productId,
  existingReview,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [title, setTitle] = useState(existingReview?.title || '');
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [errors, setErrors] = useState<{ rating?: string; title?: string; comment?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: { rating?: string; title?: string; comment?: string } = {};
    
    if (rating === 0) {
      newErrors.rating = 'Please select a rating';
    }
    
    if (!comment.trim()) {
      newErrors.comment = 'Please write a review';
    } else if (comment.length > 2000) {
      newErrors.comment = 'Review cannot exceed 2000 characters';
    }
    
    if (title && title.length > 100) {
      newErrors.title = 'Title cannot exceed 100 characters';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    
    await onSubmit({
      rating,
      title: title.trim() || undefined,
      comment: comment.trim(),
      images: [] // Image upload can be added later
    });
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-[0_16px_50px_rgba(35,20,28,0.055)] ring-1 ring-black/[0.055]">
      <h3 className="text-lg font-semibold text-gray-950 mb-6">
        {existingReview ? 'Edit Your Review' : 'Write a Review'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Rating <span className="text-red-500">*</span>
          </label>
          <RatingStars
            rating={rating}
            size="lg"
            interactive
            onRatingChange={setRating}
          />
          {errors.rating && (
            <p className="mt-1 text-xs text-red-600">{errors.rating}</p>
          )}
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Review Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your review"
            maxLength={100}
            className="w-full rounded-full border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#a45b70] focus:outline-none focus:ring-1 focus:ring-[#a45b70]"
          />
          <p className="mt-1 text-xs text-gray-400">
            {title.length}/100 characters
          </p>
          {errors.title && (
            <p className="mt-1 text-xs text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Your Review <span className="text-red-500">*</span>
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product..."
            rows={4}
            maxLength={2000}
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#a45b70] focus:outline-none focus:ring-1 focus:ring-[#a45b70] resize-none"
          />
          <p className="mt-1 text-xs text-gray-400">
            {comment.length}/2000 characters
          </p>
          {errors.comment && (
            <p className="mt-1 text-xs text-red-600">{errors.comment}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 rounded-full bg-[#21151d] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#35232e] disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
                </svg>
                {existingReview ? 'Updating...' : 'Submitting...'}
              </span>
            ) : (
              existingReview ? 'Update Review' : 'Submit Review'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;