'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';

import { useToast } from '@/contexts/ToastContext';
import { toastMessages } from '@/utils/toastHelpers';
import {
  useAuth,
  useVerifyOtp,
  useResendOtp,
} from '@/auth/user';

function VerifyOtpContent() {
  const { loaded, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const email = searchParams.get('email') || '';

  const toast = useToast();
  const verifyOtp = useVerifyOtp();
  const resendOtp = useResendOtp();

  const [otp, setOtp] = useState([
    '',
    '',
    '',
    '',
    '',
    '',
  ]);

  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (loaded && isAuthenticated) {
      router.replace('/dashboard');
      return;
    }

    if (!email) {
      router.push('/signup');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loaded, isAuthenticated, email, router]);

  if (!loaded && !isAuthenticated) {
    return (
      <Loader
        size="lg"
        text="Loading..."
        fullScreen
      />
    );
  }

  const handleOtpChange = (
    index: number,
    value: string
  ) => {
    // Only allow numeric input
    if (!/^\d*$/.test(value)) {
      return;
    }

    if (value.length > 1) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;

    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      const nextInput = document.getElementById(
        `otp-${index + 1}`
      ) as HTMLInputElement;

      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      e.key === 'Backspace' &&
      !otp[index] &&
      index > 0
    ) {
      const prevInput = document.getElementById(
        `otp-${index - 1}`
      ) as HTMLInputElement;

      if (prevInput) {
        prevInput.focus();
      }
    }

    if (
      e.key === 'ArrowLeft' &&
      index > 0
    ) {
      const prevInput = document.getElementById(
        `otp-${index - 1}`
      ) as HTMLInputElement;

      if (prevInput) {
        prevInput.focus();
      }
    }

    if (
      e.key === 'ArrowRight' &&
      index < 5
    ) {
      const nextInput = document.getElementById(
        `otp-${index + 1}`
      ) as HTMLInputElement;

      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>
  ) => {
    e.preventDefault();

    const pastedData = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6);

    if (!pastedData) {
      return;
    }

    const newOtp = [...otp];

    pastedData
      .split('')
      .forEach((digit, index) => {
        newOtp[index] = digit;
      });

    setOtp(newOtp);
    setError('');

    const focusIndex = Math.min(
      pastedData.length,
      5
    );

    const input = document.getElementById(
      `otp-${focusIndex}`
    ) as HTMLInputElement;

    if (input) {
      input.focus();
    }
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const otpString = otp.join('');

    if (otpString.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setError('');

    try {
      await verifyOtp.mutateAsync({
        email,
        otp: otpString,
      });

      toast.showToast(
        toastMessages.auth.otpVerified()
      );

      router.replace('/dashboard');
    } catch (err) {
      setError(
        'Invalid OTP. Please try again.'
      );
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || resendOtp.isPending) {
      return;
    }

    setError('');

    try {
      const response =
        await resendOtp.mutateAsync({
          email,
        });

      if (response.success) {
        toast.showToast(
          toastMessages.auth.otpResent()
        );

        setOtp([
          '',
          '',
          '',
          '',
          '',
          '',
        ]);

        setTimeLeft(60);
        setCanResend(false);

        setTimeout(() => {
          const firstInput =
            document.getElementById(
              'otp-0'
            ) as HTMLInputElement;

          if (firstInput) {
            firstInput.focus();
          }
        }, 50);
      } else {
        toast.showToast(
          toastMessages.auth.signupError(
            response.error ||
              'Failed to resend OTP'
          )
        );
      }
    } catch (err) {
      setError(
        'Something went wrong. Please try again.'
      );
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const otpComplete =
    otp.join('').length === 6;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 bg-[#faf8f9]">
        <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">

          <div className="w-full max-w-6xl overflow-hidden rounded-[28px] bg-white shadow-[0_25px_80px_rgba(30,20,30,0.14)] border border-black/[0.04]">

            <div className="grid lg:grid-cols-[0.9fr_1.1fr]">

              {/* =====================================================
                  LEFT — IMAGE PANEL
              ====================================================== */}
              <section className="relative hidden min-h-[650px] overflow-hidden lg:block">

                <img
                  src="https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1400&q=85"
                  alt="Elegant jewelry"
                  className="absolute inset-0 h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-black/40" />

                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

                <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-pink-500/20 blur-3xl" />

                <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />

                <div className="relative z-10 flex min-h-[650px] flex-col justify-between p-10 xl:p-14">

                  {/* Brand */}
                  <Link
                    href="/"
                    className="inline-flex w-fit items-center gap-3 text-white"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-md">
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.7}
                          d="M12 3l2.4 5.1L20 9l-4 3.9.9 5.6L12 16l-4.9 2.5.9-5.6L4 9l5.6-.9L12 3z"
                        />
                      </svg>
                    </div>

                    <div>
                      <div className="text-xl font-semibold tracking-[0.18em]">
                        BELLESCART
                      </div>

                      <div className="text-[10px] uppercase tracking-[0.28em] text-white/60">
                        Beauty · Elegance · Style
                      </div>
                    </div>
                  </Link>

                  {/* Bottom */}
                  <div className="max-w-md">

                    <div className="mb-5 flex items-center gap-3">
                      <span className="h-px w-10 bg-pink-300" />

                      <span className="text-xs font-medium uppercase tracking-[0.3em] text-pink-200">
                        Almost there
                      </span>
                    </div>

                    <h2 className="text-4xl font-semibold leading-[1.08] text-white xl:text-5xl">
                      One step away
                      <br />
                      from your
                      <br />
                      <span className="font-serif italic font-normal text-pink-200">
                        BellesCart journey.
                      </span>
                    </h2>

                    <p className="mt-5 max-w-sm text-sm leading-7 text-white/70">
                      Verify your email to keep your
                      account secure and continue
                      shopping with confidence.
                    </p>

                    <div className="mt-8 flex items-center gap-3">

                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 border border-white/15">
                        <svg
                          className="h-4 w-4 text-pink-200"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.8}
                            d="M4 6h16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.8}
                            d="M22 8l-10 6L2 8"
                          />
                        </svg>
                      </div>

                      <span className="text-sm text-white/70">
                        Secure email verification
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* =====================================================
                  RIGHT — OTP
              ====================================================== */}
              <section className="flex items-center bg-white px-5 py-12 sm:px-10 lg:px-12 xl:px-16">

                <div className="mx-auto w-full max-w-[470px]">

                  {/* Mobile brand */}
                  <div className="mb-9 flex justify-center lg:hidden">

                    <Link
                      href="/"
                      className="inline-flex items-center gap-3"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/20">

                        <svg
                          className="h-6 w-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.7}
                            d="M12 3l2.4 5.1L20 9l-4 3.9.9 5.6L12 16l-4.9 2.5.9-5.6L4 9l5.6-.9L12 3z"
                          />
                        </svg>

                      </div>

                      <div>
                        <div className="text-lg font-semibold tracking-[0.16em] text-gray-900">
                          BELLESCART
                        </div>

                        <div className="text-[9px] uppercase tracking-[0.25em] text-gray-400">
                          Beauty · Elegance · Style
                        </div>
                      </div>
                    </Link>

                  </div>

                  {/* Icon */}
                  <div className="mb-7 flex justify-center">

                    <div className="relative">

                      <div className="absolute inset-0 rounded-2xl bg-pink-500/10 blur-xl" />

                      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-100">

                        <svg
                          className="h-7 w-7 text-pink-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.6}
                            d="M4 6h16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.6}
                            d="M22 8l-10 6L2 8"
                          />
                        </svg>

                      </div>
                    </div>

                  </div>

                  {/* Heading */}
                  <div className="text-center mb-8">

                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-pink-500">
                      Email verification
                    </p>

                    <h1 className="text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">
                      Verify your email
                    </h1>

                    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
                      We've sent a 6-digit verification
                      code to
                    </p>

                    <div className="mt-2 flex items-center justify-center gap-2">

                      <span className="max-w-[280px] truncate text-sm font-semibold text-gray-800">
                        {email}
                      </span>

                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-50">
                        <svg
                          className="h-3 w-3 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                            d="M5 12l4 4L19 7"
                          />
                        </svg>
                      </span>

                    </div>

                  </div>

                  {/* Error */}
                  {error && (
                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3">

                      <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                        <svg
                          className="h-3 w-3 text-red-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>

                      <p className="text-sm leading-5 text-red-600">
                        {error}
                      </p>

                    </div>
                  )}

                  {/* OTP form */}
                  <form onSubmit={handleSubmit}>

                    <div className="mb-6">

                      <div className="mb-3 flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-800">
                          Verification code
                        </label>

                        <span className="text-xs text-gray-400">
                          6 digits
                        </span>
                      </div>

                      <div className="flex justify-center gap-2.5 sm:gap-3">

                        {otp.map((digit, index) => (
                          <input
                            key={index}
                            id={`otp-${index}`}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={1}
                            value={digit}
                            onChange={(e) =>
                              handleOtpChange(
                                index,
                                e.target.value
                              )
                            }
                            onKeyDown={(e) =>
                              handleKeyDown(
                                index,
                                e
                              )
                            }
                            onPaste={handlePaste}
                            autoComplete={
                              index === 0
                                ? 'one-time-code'
                                : 'off'
                            }
                            aria-label={`Verification digit ${
                              index + 1
                            }`}
                            className={`
                              h-12 w-11
                              rounded-xl
                              border-2
                              bg-gray-50/70
                              text-center
                              text-xl
                              font-semibold
                              text-gray-900
                              outline-none
                              transition-all
                              sm:h-14
                              sm:w-12
                              ${
                                error
                                  ? 'border-red-200 focus:border-red-400 focus:ring-red-500/10'
                                  : digit
                                    ? 'border-pink-400 bg-pink-50/30'
                                    : 'border-gray-200'
                              }
                              focus:border-pink-500
                              focus:bg-white
                              focus:ring-4
                              focus:ring-pink-500/10
                            `}
                            required
                          />
                        ))}

                      </div>
                    </div>

                    {/* Verify */}
                    <Button
                      type="submit"
                      disabled={
                        verifyOtp.isPending ||
                        !otpComplete
                      }
                      className="
                        h-13 w-full rounded-xl
                        bg-gradient-to-r
                        from-pink-600
                        via-pink-600
                        to-purple-600
                        text-sm font-semibold
                        text-white
                        shadow-lg
                        shadow-pink-500/20
                        transition-all
                        duration-200
                        hover:-translate-y-[1px]
                        hover:shadow-xl
                        hover:shadow-pink-500/25
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      {verifyOtp.isPending ? (
                        <span className="flex items-center justify-center gap-3">

                          <svg
                            className="h-5 w-5 animate-spin"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />

                            <path
                              className="opacity-90"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>

                          Verifying email...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          Verify email

                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 12h14M13 6l6 6-6 6"
                            />
                          </svg>
                        </span>
                      )}
                    </Button>

                  </form>

                  {/* Resend */}
                  <div className="mt-8 text-center">

                    <p className="text-sm text-gray-500">
                      Didn't receive the code?
                    </p>

                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={
                        !canResend ||
                        resendOtp.isPending
                      }
                      className="
                        mt-2
                        text-sm
                        font-semibold
                        text-pink-600
                        transition-colors
                        hover:text-pink-700
                        disabled:cursor-not-allowed
                        disabled:text-gray-400
                      "
                    >
                      {resendOtp.isPending
                        ? 'Sending a new code...'
                        : canResend
                          ? 'Resend verification code'
                          : `Resend in ${formatTime(
                              timeLeft
                            )}`}
                    </button>

                  </div>

                  {/* Security note */}
                  <div className="mt-7 flex items-center justify-center gap-2 rounded-xl bg-gray-50 px-4 py-3">

                    <svg
                      className="h-4 w-4 flex-shrink-0 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.7}
                        d="M12 3l7 4v5c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V7l7-4z"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.7}
                        d="M9 12l2 2 4-4"
                      />
                    </svg>

                    <span className="text-[11px] text-gray-500">
                      Your verification code keeps
                      your account secure
                    </span>

                  </div>

                  {/* Wrong email */}
                  <div className="mt-6 text-center">

                    <p className="text-sm text-gray-500">
                      Wrong email?{' '}
                      <button
                        type="button"
                        onClick={() =>
                          router.push('/signup')
                        }
                        className="font-semibold text-pink-600 transition-colors hover:text-pink-700"
                      >
                        Sign up again
                      </button>
                    </p>

                  </div>

                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#faf8f9]">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-pink-500" />
            <p className="text-sm text-gray-500">
              Loading...
            </p>
          </div>
        </div>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
}