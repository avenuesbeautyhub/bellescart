'use client';

import React from 'react';

interface ProductSkeletonProps {
  viewMode?: 'grid' | 'list';
  count?: number;
}

const ProductSkeleton: React.FC<ProductSkeletonProps> = ({ 
  viewMode = 'grid',
  count = 8
}) => {
  const skeletonItems = Array.from({ length: count });

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {skeletonItems.map((_, index) => (
          <div
            key={index}
            className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-200"
          >
            <div className="w-24 h-24 bg-gray-200 rounded-xl animate-pulse" />
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
              <div className="h-5 bg-gray-200 rounded w-1/4 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {skeletonItems.map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
        >
          <div className="aspect-square bg-gray-200 animate-pulse" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
            <div className="h-5 bg-gray-200 rounded w-1/4 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductSkeleton;
