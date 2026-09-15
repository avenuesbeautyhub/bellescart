'use client';

import React, { useEffect, useState, useRef } from 'react';
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
  const [retryCount, setRetryCount] = useState(0);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchTimeRef = useRef<number>(0);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

  useEffect(() => {
    const fetchActiveCoupons = async () => {
      // Rate limiting: Don't fetch if we fetched less than 1 second ago
      const now = Date.now();
      if (now - lastFetchTimeRef.current < 1000) {
        console.log('Rate limiting: Skipping coupon fetch');
        return;
      }
      
      // Check cache
      const cachedData = localStorage.getItem('cached_coupons');
      const cacheTime = localStorage.getItem('cached_coupons_time');
      
      if (cachedData && cacheTime) {
        const cacheAge = now - parseInt(cacheTime);
        if (cacheAge < CACHE_DURATION) {
          console.log('Using cached coupons data');
          try {
            const parsedData = JSON.parse(cachedData);
            const sortedCoupons = parsedData
              .sort((a: Coupon, b: Coupon) => new Date(a.validUntil).getTime() - new Date(b.validUntil).getTime())
              .slice(0, maxCoupons);
            setCoupons(sortedCoupons);
            setIsLoading(false);
            return;
          } catch (e) {
            console.error('Error parsing cached coupons:', e);
          }
        }
      }

      try {
        setIsLoading(true);
        lastFetchTimeRef.current = now;
        const response = await couponService.getActiveCoupons();
        
        if (response.success && response.data?.coupons) {
          // Sort by expiration date (soonest expiring first)
          const sortedCoupons = response.data.coupons
            .sort((a, b) => new Date(a.validUntil).getTime() - new Date(b.validUntil).getTime())
            .slice(0, maxCoupons);
          setCoupons(sortedCoupons);
          
          // Cache the results
          localStorage.setItem('cached_coupons', JSON.stringify(response.data.coupons));
          localStorage.setItem('cached_coupons_time', now.toString());
          
          setError(null);
          setRetryCount(0);
        } else {
          setError('Failed to load coupons');
        }
      } catch (err: any) {
        console.error('Error fetching active coupons:', err);
        
        // Handle rate limiting (429 errors)
        if (err?.message?.includes('Too many requests') || err?.message?.includes('429')) {
          setError('Too many requests. Please wait a moment.');
          setRetryCount(prev => prev + 1);
          
          // Exponential backoff for retries
          if (retryCount < 3) {
            const backoffTime = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
            fetchTimeoutRef.current = setTimeout(() => {
              fetchActiveCoupons();
            }, backoffTime);
          }
        } else {
          setError('Failed to load coupons');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveCoupons();

    // Cleanup timeout on unmount
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [maxCoupons, retryCount]);

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