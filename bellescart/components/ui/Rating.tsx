import React from 'react';

interface RatingProps {
  rating: number;
  reviews?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export default function Rating({
  rating,
  reviews,
  size = 'md',
  interactive = false,
  onRate,
}: RatingProps) {
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }[size];

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => interactive && onRate && onRate(star)}
            className={`${sizeClass} cursor-pointer transition-transform ${
              interactive ? 'hover:scale-110' : ''
            }`}
            disabled={!interactive}
          >
            <svg
              className={`${sizeClass} ${
                star <= Math.round(rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-300 text-gray-300'
              }`}
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
          </button>
        ))}
      </div>
      {reviews !== undefined && <span className="text-gray-600 text-sm">({reviews})</span>}
    </div>
  );
}
