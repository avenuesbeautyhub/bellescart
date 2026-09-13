'use client';

import React from 'react';
import CouponCountdown from '../CouponCountdown/CouponCountdown';
import { Coupon } from '@/services/couponService';

interface CouponCardProps {
  coupon: Coupon;
  onCopyCode?: (code: string) => void;
  className?: string;
}

export default function CouponCard({
  coupon,
  onCopyCode,
  className = '',
}: CouponCardProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);

      onCopyCode?.(coupon.code);
    } catch (error) {
      console.error('Failed to copy coupon:', error);
    }
  };

  const getDiscountText = () => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}%`;
    }

    if (coupon.discountType === 'fixed') {
      return `₹${coupon.discountValue}`;
    }

    return 'FREE';
  };

  const getDiscountLabel = () => {
    if (coupon.discountType === 'percentage') {
      return 'OFF';
    }

    if (coupon.discountType === 'fixed') {
      return 'OFF';
    }

    return 'SHIPPING';
  };

  return (
    <article
      className={`
        group relative overflow-hidden rounded-[26px]
        border border-gray-100
        bg-white
        shadow-[0_12px_40px_rgba(45,20,35,0.07)]
        transition-all duration-500
        hover:-translate-y-1
        hover:shadow-[0_22px_55px_rgba(45,20,35,0.12)]
        ${className}
      `}
    >
      {/* Top gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#a92f68] via-[#c13f78] to-[#70418f] px-5 pb-5 pt-5">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-10 -top-14 h-32 w-32 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-4 -bottom-16 h-28 w-28 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-white/5 blur-2xl" />

        <div className="relative flex items-start justify-between gap-4">
          {/* Discount */}
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-white/60">
              Special offer
            </p>

            <div className="mt-1 flex items-end gap-2">
              <span className="text-4xl font-bold tracking-[-0.05em] text-white">
                {getDiscountText()}
              </span>

              <span className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-white/80">
                {getDiscountLabel()}
              </span>
            </div>
          </div>

          {/* Coupon icon */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white backdrop-blur-sm">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.6}
                d="M20 12a2 2 0 010 4 2 2 0 000 4H4a2 2 0 000-4 2 2 0 010-4 2 2 0 000-4 2 2 0 000-4h16a2 2 0 000 4 2 2 0 000 4z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.6}
                d="M13 5v14"
              />
            </svg>
          </div>
        </div>

        {/* Coupon code */}
        <div className="relative mt-5 flex items-center justify-between rounded-xl border border-white/15 bg-black/10 px-3.5 py-2.5 backdrop-blur-sm">
          <div>
            <p className="text-[8px] uppercase tracking-[0.2em] text-white/50">
              Coupon code
            </p>

            <p className="mt-0.5 font-mono text-sm font-bold tracking-[0.12em] text-white">
              {coupon.code}
            </p>
          </div>

          <span className="rounded-full bg-white/15 px-2.5 py-1 text-[8px] font-semibold uppercase tracking-wider text-white/80">
            Limited
          </span>
        </div>
      </div>

      {/* Ticket separation */}
      <div className="relative h-3 bg-white">
        <div className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white shadow-inner" />
        <div className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white shadow-inner" />

        <div className="mx-5 border-t border-dashed border-gray-200" />
      </div>

      {/* Content */}
      <div className="px-5 pb-5 pt-2">
        <h3 className="text-base font-semibold tracking-tight text-gray-900">
          {coupon.name}
        </h3>

        {coupon.description && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-gray-500">
            {coupon.description}
          </p>
        )}

        {/* Conditions */}
        <div className="mt-4 space-y-2">
          {coupon.minOrderValue > 0 && (
            <div className="flex items-center gap-2.5 text-xs text-gray-500">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-pink-50 text-[#b63c71]">
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.7}
                    d="M3 3h18v18H3z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.7}
                    d="M7 12h10M7 8h6M7 16h4"
                  />
                </svg>
              </span>

              <span>
                Min. order{' '}
                <strong className="font-semibold text-gray-700">
                  ₹{coupon.minOrderValue}
                </strong>
              </span>
            </div>
          )}

          {coupon.category && (
            <div className="flex items-center gap-2.5 text-xs text-gray-500">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.7}
                    d="M20 13l-7 7-9-9V4h7l9 9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.7}
                    d="M7 7h.01"
                  />
                </svg>
              </span>

              <span>
                Category{' '}
                <strong className="font-semibold text-gray-700">
                  {coupon.category}
                </strong>
              </span>
            </div>
          )}

          {coupon.maxDiscount &&
            coupon.discountType === 'percentage' && (
              <div className="flex items-center gap-2.5 text-xs text-gray-500">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  ₹
                </span>

                <span>
                  Max discount{' '}
                  <strong className="font-semibold text-gray-700">
                    ₹{coupon.maxDiscount}
                  </strong>
                </span>
              </div>
            )}
        </div>

        {/* Countdown */}
        <div className="mt-5">
          <CouponCountdown validUntil={coupon.validUntil} />
        </div>

        {/* Copy button */}
        <button
          type="button"
          onClick={handleCopyCode}
          className={`
            mt-4 flex w-full items-center justify-center gap-2
            rounded-xl py-3
            text-xs font-bold uppercase tracking-[0.12em]
            transition-all duration-300
            ${
              copied
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'bg-gray-950 text-white shadow-lg shadow-gray-950/10 hover:-translate-y-0.5 hover:bg-[#b63c71] hover:shadow-[#b63c71]/20'
            }
          `}
        >
          {copied ? (
            <>
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Copied successfully
            </>
          ) : (
            <>
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <rect
                  x="9"
                  y="9"
                  width="11"
                  height="11"
                  rx="2"
                  strokeWidth={1.7}
                />
                <path
                  strokeLinecap="round"
                  strokeWidth={1.7}
                  d="M15 9V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7a2 2 0 002 2h3"
                />
              </svg>
              Copy coupon code
            </>
          )}
        </button>
      </div>
    </article>
  );
}
