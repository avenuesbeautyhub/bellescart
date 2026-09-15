'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Loader from '@/components/ui/Loader';

import { useToast } from '@/contexts/ToastContext';
import { toastMessages } from '@/utils/toastHelpers';
import { useAuth, useSignup } from '@/auth/user';

export default function SignupPage() {
  const { loaded, isAuthenticated } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const signup = useSignup();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (loaded && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [loaded, isAuthenticated, router]);

  if (!loaded && !isAuthenticated) {
    return <Loader size="lg" text="Loading..." fullScreen />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear individual error while typing
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms =
        'You must agree to the terms and conditions';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const nameParts = formData.name.trim().split(' ');

        const response = await signup.mutateAsync({
          firstName: nameParts[0],
          lastName:
            nameParts.length > 1
              ? nameParts.slice(1).join(' ')
              : '',
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
        });

        if (response.success) {
          toast.showToast(
            toastMessages.auth.signupSuccess()
          );
          toast.showToast(toastMessages.general.info(
            'Check your email for OTP',
            'If you don\'t find the OTP in your inbox, please check your spam/junk folder'
          ));

          setTimeout(() => {
            router.push(
              `/verify-otp?email=${encodeURIComponent(
                formData.email
              )}`
            );
          }, 1500);
        } else {
          toast.showToast(
            toastMessages.auth.signupError(response.error)
          );
        }
      } catch (err) {
        toast.showToast(
          toastMessages.general.networkError()
        );
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 bg-[#faf8f9]">
        <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="w-full max-w-6xl overflow-hidden rounded-[28px] bg-white shadow-[0_25px_80px_rgba(30,20,30,0.14)] border border-black/[0.04]">

            <div className="grid lg:grid-cols-[0.9fr_1.1fr]">

              {/* =====================================================
                  LEFT — IMAGE / BRAND PANEL
              ====================================================== */}
              <section className="relative hidden min-h-[760px] overflow-hidden lg:block">

                <img
                  src="https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1400&q=85"
                  alt="Elegant jewelry"
                  className="absolute inset-0 h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-black/40" />

                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

                {/* Decorative glow */}
                <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-pink-500/20 blur-3xl" />
                <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />

                <div className="relative z-10 flex min-h-[760px] flex-col justify-between p-10 xl:p-14">

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

                  {/* Bottom content */}
                  <div className="max-w-md">

                    <div className="mb-5 flex items-center gap-3">
                      <span className="h-px w-10 bg-pink-300" />

                      <span className="text-xs font-medium uppercase tracking-[0.3em] text-pink-200">
                        Join BellesCart
                      </span>
                    </div>

                    <h2 className="text-4xl font-semibold leading-[1.08] text-white xl:text-5xl">
                      Discover your
                      <br />
                      <span className="font-serif italic font-normal text-pink-200">
                        signature style.
                      </span>
                    </h2>

                    <p className="mt-5 max-w-sm text-sm leading-7 text-white/70">
                      Create your account and make every shopping
                      moment a little more beautiful.
                    </p>

                    <div className="mt-8 space-y-3">

                      <div className="flex items-center gap-3 text-sm text-white/75">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 border border-white/10">
                          <svg
                            className="h-3.5 w-3.5"
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
                        </span>
                        Curated fashion & jewelry collections
                      </div>

                      <div className="flex items-center gap-3 text-sm text-white/75">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 border border-white/10">
                          <svg
                            className="h-3.5 w-3.5"
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
                        </span>
                        A beautiful shopping experience
                      </div>

                      <div className="flex items-center gap-3 text-sm text-white/75">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 border border-white/10">
                          <svg
                            className="h-3.5 w-3.5"
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
                        </span>
                        Secure account & checkout
                      </div>

                    </div>
                  </div>
                </div>
              </section>

              {/* =====================================================
                  RIGHT — SIGNUP FORM
              ====================================================== */}
              <section className="flex items-center bg-white px-5 py-10 sm:px-10 lg:px-12 xl:px-16">
                <div className="mx-auto w-full max-w-[500px]">

                  {/* Mobile brand */}
                  <div className="mb-8 flex justify-center lg:hidden">
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
                            d="M12 3l2.4 5.1L20 9l-4 3.9.9 5.6L12 16l-4.9 2.5.9-5.6L12 3z"
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

                  {/* Heading */}
                  <div className="mb-7">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-pink-500">
                      Create your account
                    </p>

                    <h1 className="text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">
                      Join BellesCart
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-gray-500">
                      Create your account and start shopping
                      something beautiful.
                    </p>
                  </div>

                  <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >

                    {/* Name */}
                    <Input
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Your full name"
                    />

                    {/* Email */}
                    <Input
                      label="Email Address"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="you@example.com"
                    />

                    {/* Phone */}
                    <Input
                      label="Phone Number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="+91 98765 43210"
                    />

                    {/* Password */}
                    <div className="relative">
                      <Input
                        label="Password"
                        type={
                          showPassword
                            ? 'text'
                            : 'password'
                        }
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="Create a password"
                        error={errors.password}
                      />

                      <button
                        type="button"
                        aria-label={
                          showPassword
                            ? 'Hide password'
                            : 'Show password'
                        }
                        onClick={() =>
                          setShowPassword(
                            (prev) => !prev
                          )
                        }
                        className="absolute right-3 top-[37px] rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
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

                    {/* Confirm password */}
                    <div className="relative">
                      <Input
                        label="Confirm Password"
                        type={
                          showConfirmPassword
                            ? 'text'
                            : 'password'
                        }
                        name="confirmPassword"
                        value={
                          formData.confirmPassword
                        }
                        onChange={handleChange}
                        required
                        placeholder="Confirm your password"
                        error={
                          errors.confirmPassword
                        }
                      />

                      <button
                        type="button"
                        aria-label={
                          showConfirmPassword
                            ? 'Hide password'
                            : 'Show password'
                        }
                        onClick={() =>
                          setShowConfirmPassword(
                            (prev) => !prev
                          )
                        }
                        className="absolute right-3 top-[37px] rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                      >
                        {showConfirmPassword ? (
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

                    {/* Terms */}
                    <div className="pt-1">

                      <label className="flex cursor-pointer items-start gap-3">
                        <span className="relative mt-0.5 flex-shrink-0">
                          <input
                            type="checkbox"
                            name="agreeToTerms"
                            checked={
                              formData.agreeToTerms
                            }
                            onChange={handleChange}
                            className="peer h-[18px] w-[18px] cursor-pointer appearance-none rounded-md border border-gray-300 bg-white transition-all checked:border-pink-500 checked:bg-pink-500 focus:outline-none focus:ring-4 focus:ring-pink-500/10"
                          />

                          <svg
                            className="pointer-events-none absolute left-[3px] top-[3px] hidden h-3 w-3 text-white peer-checked:block"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </span>

                        <span className="text-xs leading-5 text-gray-500">
                          I agree to the{' '}
                          <Link
                            href="/terms"
                            className="font-medium text-pink-600 hover:text-pink-700 hover:underline"
                          >
                            Terms and Conditions
                          </Link>{' '}
                          and{' '}
                          <Link
                            href="/privacy"
                            className="font-medium text-pink-600 hover:text-pink-700 hover:underline"
                          >
                            Privacy Policy
                          </Link>
                          .
                        </span>
                      </label>

                      {errors.agreeToTerms && (
                        <p className="mt-2 text-xs font-medium text-red-500">
                          {errors.agreeToTerms}
                        </p>
                      )}
                    </div>

                    {/* Create account */}
                    <Button
                      type="submit"
                      disabled={signup.isPending}
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
                      {signup.isPending ? (
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

                          Creating account...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          Create account

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
                              d="M5 12h14M13 6l6 6-6 6"
                            />
                          </svg>
                        </span>
                      )}
                    </Button>
                  </form>

                  {/* Divider */}
                  <div className="my-6 flex items-center gap-4">
                    <div className="h-px flex-1 bg-gray-200" />

                    <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-gray-400">
                      Or sign up with
                    </span>

                    <div className="h-px flex-1 bg-gray-200" />
                  </div>

                  {/* Social */}
                  <div className="grid grid-cols-2 gap-3">

                    <button
                      type="button"
                      className="
                        flex h-11 items-center justify-center gap-2.5
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
                        flex h-11 items-center justify-center gap-2.5
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

                  {/* Login */}
                  <p className="mt-7 text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link
                      href="/login"
                      className="font-semibold text-pink-600 transition-colors hover:text-pink-700"
                    >
                      Sign in
                    </Link>
                  </p>

                  {/* Security */}
                  <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-gray-400">
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

                    Your information is kept secure
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