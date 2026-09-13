'use client';

import React, { useEffect, useState } from 'react';
import CouponCard from '../CouponCard/CouponCard';
import { couponService, Coupon } from '@/services/couponService';
import Loader from '../ui/Loader';

interface CouponSectionProps {
  className?: string;
  maxCoupons?: number;
}

export default function CouponSection({ className = '', maxCoupons = 3 }: CouponSectionProps) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActiveCoupons = async () => {
      try {
        setIsLoading(true);
        const response = await couponService.getActiveCoupons();
        
        if (response.success && response.data?.coupons) {
          // Sort by expiration date (soonest expiring first)
          const sortedCoupons = response.data.coupons
            .sort((a, b) => new Date(a.validUntil).getTime() - new Date(b.validUntil).getTime())
            .slice(0, maxCoupons);
          setCoupons(sortedCoupons);
        } else {
          setError('Failed to load coupons');
        }
      } catch (err) {
        console.error('Error fetching active coupons:', err);
        setError('Failed to load coupons');
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveCoupons();
  }, [maxCoupons]);

  const handleCopyCode = (code: string) => {
    console.log('Coupon code copied:', code);
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <Loader size="md" text="Loading coupons..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-xl p-4 text-center ${className}`}>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (coupons.length === 0) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-xl p-8 text-center ${className}`}>
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <p className="text-gray-600 font-medium">No active coupons available</p>
        <p className="text-gray-500 text-sm mt-1">Check back later for new deals!</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((coupon) => (
          <CouponCard
            key={coupon._id}
            coupon={coupon}
            onCopyCode={handleCopyCode}
          />
        ))}
      </div>
    </div>
  );
}