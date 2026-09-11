'use client';

import React, { useState } from 'react';
import { useAdminAuth } from '@/auth/admin';
import { useAdminAuthActions } from '@/auth/admin/actions';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function AdminLoginPage() {
  const { loaded, isAuthenticated } = useAdminAuth();
  const { adminLogin } = useAdminAuthActions();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect authenticated admin users to dashboard
  // AdminAuthWrapper handles the actual navigation.
  if (loaded && isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#f8f5f3] flex items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#3a2431] text-white shadow-lg">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-6 w-6"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                d="M5 12.5 9.5 17 19 7.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h2 className="text-lg font-semibold text-[#2d2028]">
            Authentication successful
          </h2>

          <p className="mt-2 text-sm text-[#756a72]">
            Redirecting to your admin dashboard…
          </p>
        </div>
      </main>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      await adminLogin({
        email: formData.email,
        password: formData.password,
      });
    } catch (error) {
      console.error('Admin login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f3f1] text-[#2d2028]">
      <div className="min-h-screen lg:grid lg:grid-cols-[1.05fr_0.95fr]">

        {/* =========================================================
            BRAND PANEL
        ========================================================== */}
        <section className="relative hidden overflow-hidden bg-[#35232e] lg:flex">
          {/* Decorative circles */}
          <div className="absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full border border-white/10" />
          <div className="absolute -left-20 -top-20 h-[280px] w-[280px] rounded-full border border-white/[0.06]" />

          <div className="absolute -bottom-40 -right-40 h-[560px] w-[560px] rounded-full border border-white/10" />
          <div className="absolute bottom-[-70px] right-[-70px] h-[360px] w-[360px] rounded-full border border-white/[0.06]" />

          {/* Soft decorative glow */}
          <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c99aa8]/10 blur-3xl" />

          <div className="relative z-10 flex min-h-screen w-full flex-col justify-between px-12 py-12 xl:px-16">

            {/* Logo */}
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur">
                  <span className="font-serif text-xl italic text-[#f5dce3]">
                    B
                  </span>
                </div>

                <div>
                  <div className="font-serif text-2xl tracking-wide text-white">
                    BellesCart
                  </div>

                  <div className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.28em] text-white/45">
                    Administration
                  </div>
                </div>
              </div>
            </div>

            {/* Editorial content */}
            <div className="max-w-xl">
              <div className="mb-6 flex items-center gap-3">
                <span className="h-px w-10 bg-[#d6a7b5]" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#d6a7b5]">
                  Private workspace
                </span>
              </div>

              <h1 className="font-serif text-5xl leading-[1.05] text-white xl:text-6xl">
                Manage your
                <br />
                <span className="italic text-[#e8c4ce]">
                  BellesCart
                </span>
                <br />
                experience.
              </h1>

              <p className="mt-7 max-w-md text-sm leading-7 text-white/55">
                A secure workspace for managing products, orders,
                customers, bookings, and the day-to-day operations
                behind your store.
              </p>

              {/* Feature row */}
              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4">
                <div className="flex items-center gap-2.5 text-xs text-white/60">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-3.5 w-3.5"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    >
                      <path
                        d="M12 3 5 6v5c0 4.6 2.9 8.3 7 10 4.1-1.7 7-5.4 7-10V6l-7-3Z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="m9 12 2 2 4-4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>

                  Secure access
                </div>

                <div className="flex items-center gap-2.5 text-xs text-white/60">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-3.5 w-3.5"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    >
                      <path
                        d="M4 6.5h16M4 12h16M4 17.5h10"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>

                  Store management
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-end justify-between gap-6">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">
                BellesCart Admin Console
              </p>

              <div className="h-px w-20 bg-white/10" />
            </div>
          </div>
        </section>

        {/* =========================================================
            LOGIN PANEL
        ========================================================== */}
        <section className="relative flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">

          {/* Mobile branding */}
          <div className="absolute left-6 top-7 lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#35232e] text-white">
                <span className="font-serif text-lg italic">
                  B
                </span>
              </div>

              <div>
                <div className="font-serif text-xl text-[#35232e]">
                  BellesCart
                </div>

                <div className="text-[8px] font-semibold uppercase tracking-[0.22em] text-[#927a84]">
                  Administration
                </div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-[430px]">

            {/* Login heading */}
            <div className="mb-9">
              <div className="mb-4 flex items-center gap-3">
                <span className="h-px w-8 bg-[#c995a5]" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#9a7481]">
                  Admin portal
                </span>
              </div>

              <h2 className="font-serif text-4xl leading-tight text-[#30222b] sm:text-[44px]">
                Welcome back.
              </h2>

              <p className="mt-3 max-w-sm text-sm leading-6 text-[#766b72]">
                Sign in to access your BellesCart administration
                workspace.
              </p>
            </div>

            {/* Form card */}
            <div className="rounded-[28px] border border-[#e8dedf] bg-white p-6 shadow-[0_20px_70px_rgba(53,35,46,0.08)] sm:p-8">

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* Email */}
                <div>
                  <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="admin@bellescart.com"
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="relative">
                    <Input
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-[34px] text-[#9a7481] hover:text-[#6b4d5a] transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          className="h-5 w-5"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path
                            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7Z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          className="h-5 w-5"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path
                            d="M9.88 9.88a3 3 0 1 0 4.24 4.24"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M10.73 5.08A10.43 10.43 0 0 1 12 5c4.478 0 8.268 2.943 9.542 7a10.47 10.47 0 0 1-3.35 4.11"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M3.42 12.33A10.43 10.43 0 0 1 5.08 10.73"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M2 2l20 20"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Security indicator */}
                <div className="flex items-center gap-2 rounded-xl bg-[#faf7f8] px-3.5 py-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#eee4e8] text-[#694653]">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-3.5 w-3.5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <rect
                        x="5"
                        y="10"
                        width="14"
                        height="10"
                        rx="2"
                      />
                      <path
                        d="M8 10V7a4 4 0 0 1 8 0v3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  <p className="text-[11px] leading-4 text-[#756a72]">
                    Your administrator credentials are used only
                    for authorized BellesCart access.
                  </p>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="!mt-6 w-full !rounded-xl !py-3.5 text-sm font-semibold shadow-[0_10px_25px_rgba(53,35,46,0.15)] transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Signing in…
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Login to Admin Dashboard

                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-4 w-4"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path
                          d="M5 12h13"
                          strokeLinecap="round"
                        />
                        <path
                          d="m13 6 6 6-6 6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  )}
                </Button>
              </form>
            </div>

            {/* Security footer */}
            <div className="mt-7 text-center">
              <div className="flex items-center justify-center gap-2 text-[#8c7e86]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-3.5 w-3.5"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <path
                    d="M12 3 5 6v5c0 4.6 2.9 8.3 7 10 4.1-1.7 7-5.4 7-10V6l-7-3Z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <span className="text-[10px] font-medium uppercase tracking-[0.16em]">
                  Restricted administrator access
                </span>
              </div>

              <p className="mx-auto mt-2 max-w-xs text-[10px] leading-5 text-[#a1969c]">
                Unauthorized access to this portal is prohibited.
              </p>
            </div>

            {/* Mobile bottom brand */}
            <div className="mt-12 text-center lg:hidden">
              <p className="font-serif text-sm italic text-[#a18b94]">
                Curated with intention.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}