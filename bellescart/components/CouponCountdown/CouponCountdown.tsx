'use client';

import React, { useEffect, useState } from 'react';

interface CouponCountdownProps {
  validUntil: string;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export default function CouponCountdown({
  validUntil,
  className = '',
}: CouponCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const calculateTimeLeft = (): TimeLeft => {
      const now = Date.now();
      const expiration = new Date(validUntil).getTime();
      const difference = expiration - now;

      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        };
      }

      return {
        days: Math.floor(
          difference / (1000 * 60 * 60 * 24)
        ),
        hours: Math.floor(
          (difference % (1000 * 60 * 60 * 24)) /
            (1000 * 60 * 60)
        ),
        minutes: Math.floor(
          (difference % (1000 * 60 * 60)) /
            (1000 * 60)
        ),
        seconds: Math.floor(
          (difference % (1000 * 60)) / 1000
        ),
        isExpired: false,
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = window.setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [validUntil]);

  /* ============================================================
     EXPIRED
  ============================================================ */

  if (timeLeft.isExpired) {
    return (
      <div
        className={`
          flex items-center gap-3
          rounded-2xl
          border border-gray-200
          bg-gray-50
          px-4 py-3
          ${className}
        `}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-200 text-gray-500">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.7}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-gray-400">
            Offer status
          </p>

          <p className="mt-0.5 text-xs font-semibold text-gray-500">
            Coupon expired
          </p>
        </div>
      </div>
    );
  }

  /* ============================================================
     DIGITAL TIME UNIT
  ============================================================ */

  const DigitalUnit = ({
    value,
    label,
  }: {
    value: number;
    label: string;
  }) => (
    <div className="flex flex-col items-center">
      <div
        className="
          relative
          min-w-[42px]
          overflow-hidden
          rounded-lg
          border border-gray-800
          bg-[#171318]
          px-2.5
          py-1.5
          shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]
          sm:min-w-[46px]
        "
      >
        {/* Digital scan line */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-white/[0.035]" />

        <span
          className="
            relative
            block
            text-center
            font-mono
            text-lg
            font-bold
            leading-none
            tracking-[0.05em]
            text-pink-300
            drop-shadow-[0_0_7px_rgba(244,114,182,0.35)]
            tabular-nums
            sm:text-xl
          "
        >
          {value.toString().padStart(2, '0')}
        </span>
      </div>

      <span className="mt-1.5 text-[8px] font-bold uppercase tracking-[0.14em] text-gray-400">
        {label}
      </span>
    </div>
  );

  return (
    <div
      className={`
        overflow-hidden
        rounded-2xl
        border border-pink-100
        bg-gradient-to-br from-[#fff8fb] via-white to-[#faf7ff]
        p-3
        ${className}
      `}
    >
      {/* Header */}
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-100 text-[#b63c71]">
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </span>

          <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-gray-500">
            Offer ends in
          </span>
        </div>

        {/* Live indicator */}
        <span className="flex items-center gap-1.5 text-[8px] font-semibold uppercase tracking-wider text-pink-500">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink-400 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-pink-500" />
          </span>
          Live
        </span>
      </div>

      {/* Digital clock */}
      <div className="flex items-center justify-center gap-1.5 rounded-xl bg-white/70 px-2 py-2.5">
        {timeLeft.days > 0 && (
          <>
            <DigitalUnit
              value={timeLeft.days}
              label="Days"
            />

            <span className="mb-4 font-mono text-lg font-bold text-pink-300">
              :
            </span>
          </>
        )}

        <DigitalUnit
          value={timeLeft.hours}
          label="Hrs"
        />

        <span className="mb-4 font-mono text-lg font-bold text-pink-300">
          :
        </span>

        <DigitalUnit
          value={timeLeft.minutes}
          label="Min"
        />

        <span className="mb-4 font-mono text-lg font-bold text-pink-300">
          :
        </span>

        <DigitalUnit
          value={timeLeft.seconds}
          label="Sec"
        />
      </div>

      {/* Bottom hint */}
      <p className="mt-2 text-center text-[8px] font-medium uppercase tracking-[0.12em] text-gray-400">
        Don't wait — this offer won't last forever
      </p>
    </div>
  );
}
