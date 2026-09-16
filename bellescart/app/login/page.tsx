'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';

import { useToast } from '@/contexts/ToastContext';
import { toastMessages } from '@/utils/toastHelpers';
import { useAuth, useLogin } from '@/auth/user';

export default function LoginPage() {
  const router = useRouter();
  const { loaded, isAuthenticated } = useAuth();
  const toast = useToast();
  const login = useLogin();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (loaded && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [loaded, isAuthenticated, router]);

  if (!loaded && !isAuthenticated) {
    return <Loader size="lg" text="Loading..." fullScreen />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const user = await login.mutateAsync({
        email: formData.email,
        password: formData.password,
      });

      toast.showToast(toastMessages.auth.loginSuccess(user?.name));
   
      router.replace('/dashboard');
    } catch (err) {
      toast.showToast(
        toastMessages.auth.loginError(
          'Login failed. Please check your credentials.'
        )
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 bg-[#faf8f9]">
        <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="w-full max-w-6xl overflow-hidden rounded-[28px] bg-white shadow-[0_25px_80px_rgba(30,20,30,0.14)] border border-black/[0.04]">
            <div className="grid min-h-[650px] lg:grid-cols-[1.02fr_0.98fr]">

              {/* =========================================================
                  LEFT — BRAND / IMAGE PANEL
              ========================================================== */}
              <section className="relative hidden min-h-[650px] overflow-hidden lg:block">

                {/* Background image */}
                <img
                  src="https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1400&q=85"
                  alt="Elegant jewelry"
                  className="absolute inset-0 h-full w-full object-cover"
                />

                {/* Layered overlays */}
                <div className="absolute inset-0 bg-black/35" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />

                {/* Decorative glow */}
                <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-pink-500/20 blur-3xl" />
                <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl" />

                {/* Content */}
                <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">

                  {/* Brand */}
                  <div>
                    <Link
                      href="/"
                      className="inline-flex items-center gap-3 text-white"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md border border-white/20">
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
                        <div className="text-[10px] uppercase tracking-[0.28em] text-white/65">
                          Beauty · Elegance · Style
                        </div>
                      </div>
                    </Link>
                  </div>

                  {/* Bottom message */}
                  <div className="max-w-md">
                    <div className="mb-5 flex items-center gap-3">
                      <span className="h-px w-10 bg-pink-300" />
                      <span className="text-xs font-medium uppercase tracking-[0.3em] text-pink-200">
                        Welcome back
                      </span>
                    </div>

                    <h2 className="text-4xl font-semibold leading-[1.08] text-white xl:text-5xl">
                      Your style,
                      <br />
                      <span className="font-serif italic font-normal text-pink-200">
                        your collection.
                      </span>
                    </h2>

                    <p className="mt-5 max-w-sm text-sm leading-7 text-white/70">
                      Sign in to continue exploring your favourite pieces
                      and keep your BellesCart collection close.
                    </p>

                    {/* Small trust points */}
                    <div className="mt-8 flex flex-wrap gap-3">
                      <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs text-white/80 backdrop-blur-md">
                        Curated collections
                      </div>

                      <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs text-white/80 backdrop-blur-md">
                        Secure checkout
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* =========================================================
                  RIGHT — LOGIN
              ========================================================== */}
              <section className="flex items-center bg-white px-5 py-10 sm:px-10 lg:px-12 xl:px-16">
                <div className="mx-auto w-full max-w-[430px]">

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

                  {/* Header */}
                  <div className="mb-8">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-pink-500">
                      Member access
                    </p>

                    <h1 className="text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">
                      Welcome back
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-gray-500">
                      Sign in to continue to your BellesCart account.
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Email */}
                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-medium text-gray-800"
                      >
                        Email address
                      </label>

                      <div className="group relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                          <svg
                            className="h-[18px] w-[18px] text-gray-400 transition-colors group-focus-within:text-pink-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.7}
                              d="M4 6h16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.7}
                              d="M22 8l-10 6L2 8"
                            />
                          </svg>
                        </div>

                        <input
                          id="email"
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          autoComplete="email"
                          placeholder="you@example.com"
                          className="
                            h-13 w-full rounded-xl border border-gray-200
                            bg-gray-50/70 pl-11 pr-4 text-sm text-gray-900
                            outline-none transition-all
                            placeholder:text-gray-400
                            hover:border-gray-300
                            focus:border-pink-400
                            focus:bg-white
                            focus:ring-4 focus:ring-pink-500/10
                          "
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <label
                          htmlFor="password"
                          className="text-sm font-medium text-gray-800"
                        >
                          Password
                        </label>

                        <Link
                          href="/forgot-password"
                          className="text-xs font-semibold text-pink-600 transition-colors hover:text-pink-700"
                        >
                          Forgot password?
                        </Link>
                      </div>

                      <div className="group relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                          <svg
                            className="h-[18px] w-[18px] text-gray-400 transition-colors group-focus-within:text-pink-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.7}
                              d="M7 10V7a5 5 0 0110 0v3"
                            />
                            <rect
                              x="4"
                              y="10"
                              width="16"
                              height="11"
                              rx="2"
                              strokeWidth="1.7"
                            />
                            <path
                              strokeLinecap="round"
                              strokeWidth="1.7"
                              d="M12 14v3"
                            />
                          </svg>
                        </div>

                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          autoComplete="current-password"
                          placeholder="Enter your password"
                          className="
                            h-13 w-full rounded-xl border border-gray-200
                            bg-gray-50/70 pl-11 pr-12 text-sm text-gray-900
                            outline-none transition-all
                            placeholder:text-gray-400
                            hover:border-gray-300
                            focus:border-pink-400
                            focus:bg-white
                            focus:ring-4 focus:ring-pink-500/10
                          "
                        />

                        <button
                          type="button"
                          aria-label={
                            showPassword
                              ? 'Hide password'
                              : 'Show password'
                          }
                          onClick={() =>
                            setShowPassword((prev) => !prev)
                          }
                          className="
                            absolute right-3 top-1/2 -translate-y-1/2
                            rounded-lg p-2 text-gray-400
                            transition-colors hover:bg-gray-100
                            hover:text-gray-700
                          "
                        >
                          {showPassword ? (
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.7}
                                d="M3 3l18 18"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.7}
                                d="M10.6 10.6a2 2 0 102.8 2.8"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.7}
                                d="M9.9 5.2A10.8 10.8 0 0112 5c5 0 8.5 3.2 10 7-0.5 1.3-1.3 2.5-2.4 3.5M6.2 6.2C4.2 7.4 2.7 9.2 2 12c1.5 3.8 5 7 10 7 1 0 1.9-.1 2.8-.4"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.7}
                                d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
                              />
                              <circle
                                cx="12"
                                cy="12"
                                r="3"
                                strokeWidth="1.7"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Sign in */}
                    <Button
                      type="submit"
                      disabled={login.isPending}
                      className="
                        mt-2 h-13 w-full rounded-xl
                        bg-gradient-to-r from-pink-600 via-pink-600 to-purple-600
                        text-sm font-semibold text-white
                        shadow-lg shadow-pink-500/20
                        transition-all duration-200
                        hover:-translate-y-[1px]
                        hover:shadow-xl hover:shadow-pink-500/25
                        disabled:cursor-not-allowed
                        disabled:opacity-70
                      "
                    >
                      {login.isPending ? (
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

                          Signing in...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          Sign in
                          <svg
                            className="h-4 w-4 transition-transform group-hover:translate-x-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 12h14M13 6l6 6-6 6"
                            />
                          </svg>
                        </span>
                      )}
                    </Button>
                  </form>

                  {/* Divider */}
                  <div className="my-7 flex items-center gap-4">
                    <div className="h-px flex-1 bg-gray-200" />
                    <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-gray-400">
                      Or continue with
                    </span>
                    <div className="h-px flex-1 bg-gray-200" />
                  </div>

                  {/* Social buttons */}
                  <div className="grid grid-cols-2 gap-3">

                    <button
                      type="button"
                      className="
                        flex h-12 items-center justify-center gap-2.5
                        rounded-xl border border-gray-200
                        bg-white text-sm font-medium text-gray-700
                        transition-all
                        hover:-translate-y-[1px]
                        hover:border-gray-300
                        hover:bg-gray-50
                        hover:shadow-sm
                      "
                    >
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>

                      Google
                    </button>

                    <button
                      type="button"
                      className="
                        flex h-12 items-center justify-center gap-2.5
                        rounded-xl border border-gray-200
                        bg-white text-sm font-medium text-gray-700
                        transition-all
                        hover:-translate-y-[1px]
                        hover:border-gray-300
                        hover:bg-gray-50
                        hover:shadow-sm
                      "
                    >
                      <svg
                        className="h-5 w-5"
                        fill="#1877F2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.026 4.388 11.005 10.125 11.927v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.696 4.533-4.696 1.312 0 2.686.236 2.686.236v2.971h-1.514c-1.491 0-1.956.931-1.956 1.886v2.263h3.328l-.532 3.49h-2.796V24C19.612 23.078 24 18.099 24 12.073z" />
                      </svg>

                      Facebook
                    </button>
                  </div>

                  {/* Signup */}
                  <p className="mt-8 text-center text-sm text-gray-500">
                    Don't have an account?{' '}
                    <Link
                      href="/signup"
                      className="font-semibold text-pink-600 transition-colors hover:text-pink-700"
                    >
                      Create an account
                    </Link>
                  </p>

                  {/* Terms & Privacy */}
                  <p className="mt-4 text-center text-[11px] text-gray-400">
                    By signing in, you agree to our{' '}
                    <Link
                      href="/terms-and-conditions"
                      className="font-medium text-pink-600 hover:text-pink-700 hover:underline"
                    >
                      Terms & Conditions
                    </Link>{' '}
                    and{' '}
                    <Link
                      href="/privacy-policy"
                      className="font-medium text-pink-600 hover:text-pink-700 hover:underline"
                    >
                      Privacy Policy
                    </Link>
                  </p>

                  {/* Bottom reassurance */}
                  <div className="mt-7 flex items-center justify-center gap-2 text-[11px] text-gray-400">
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M12 3l7 4v5c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V7l7-4z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M9 12l2 2 4-4"
                      />
                    </svg>

                    Secure and private sign in
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