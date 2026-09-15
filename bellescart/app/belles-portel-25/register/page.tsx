'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { adminAuthService } from '@/services/admin/adminAuth';
import Loader from '@/components/ui/Loader';

export default function AdminRegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    registrationKey: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showRegistrationKey, setShowRegistrationKey] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    else if (formData.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';

    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.registrationKey.trim()) {
      newErrors.registrationKey = 'Registration key is required';
    }

    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await adminAuthService.registerAdmin({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim() || undefined,
        registrationKey: formData.registrationKey.trim(),
      });

      if (response.success) {
        router.push('/admin?registered=true');
      } else {
        setApiError(response.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setApiError('An error occurred during registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    setApiError('');
  };

  const inputClass = (field: string) =>
    `w-full rounded-xl border bg-[#fcfaf9] px-4 py-3.5 text-sm text-[#30222b] outline-none transition-all duration-200 placeholder:text-[#aaa0a5] focus:bg-white focus:ring-4 ${
      errors[field]
        ? 'border-red-300 focus:border-red-400 focus:ring-red-50'
        : 'border-[#e5dadd] focus:border-[#9b7080] focus:ring-[#9b7080]/10'
    } disabled:cursor-not-allowed disabled:opacity-60`;

  const EyeIcon = ({ open }: { open: boolean }) =>
    open ? (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.7">
        <path d="M3 3l18 18" strokeLinecap="round" />
        <path d="M10.6 10.7a2 2 0 0 0 2.7 2.7" strokeLinecap="round" />
        <path d="M9.9 5.3A10.7 10.7 0 0 1 12 5c4.5 0 8.3 2.9 9.6 7a10.7 10.7 0 0 1-3.1 4.5M6.2 6.2A10.7 10.7 0 0 0 2.4 12c1.3 4.1 5.1 7 9.6 7 1.3 0 2.5-.2 3.6-.7" strokeLinecap="round" />
      </svg>
    ) : (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.7">
        <path d="M2.4 12c1.3-4.1 5.1-7 9.6-7s8.3 2.9 9.6 7c-1.3 4.1-5.1 7-9.6 7s-8.3-2.9-9.6-7Z" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="2.7" />
      </svg>
    );

  return (
    <main className="min-h-screen bg-[#f7f3f1] text-[#30222b]">
      <div className="min-h-screen lg:grid lg:grid-cols-[0.9fr_1.1fr]">

        <section className="relative hidden overflow-hidden bg-[#35232e] lg:flex">
          <div className="absolute -left-36 -top-36 h-[460px] w-[460px] rounded-full border border-white/10" />
          <div className="absolute -left-20 -top-20 h-[300px] w-[300px] rounded-full border border-white/[0.06]" />
          <div className="absolute -bottom-44 -right-44 h-[620px] w-[620px] rounded-full border border-white/10" />
          <div className="absolute bottom-[-80px] right-[-80px] h-[380px] w-[380px] rounded-full border border-white/[0.06]" />
          <div className="absolute left-1/2 top-1/2 h-[430px] w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c99aa8]/10 blur-3xl" />

          <div className="relative z-10 flex min-h-screen w-full flex-col justify-between px-12 py-12 xl:px-16">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur">
                <span className="font-serif text-xl italic text-[#f5dce3]">B</span>
              </div>
              <div>
                <div className="font-serif text-2xl tracking-wide text-white">BellesCart</div>
                <div className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.28em] text-white/45">
                  Administration
                </div>
              </div>
            </div>

            <div className="max-w-xl">
              <div className="mb-6 flex items-center gap-3">
                <span className="h-px w-10 bg-[#d6a7b5]" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#d6a7b5]">
                  Authorized workspace
                </span>
              </div>

              <h1 className="font-serif text-5xl leading-[1.05] text-white xl:text-6xl">
                Create your
                <br />
                <span className="italic text-[#e8c4ce]">admin access.</span>
              </h1>

              <p className="mt-7 max-w-md text-sm leading-7 text-white/55">
                Set up a secure administrator account to manage the BellesCart store and its operations.
              </p>

              <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.045] p-5 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-[#e8c4ce]">
                    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.7">
                      <path d="M12 3 5 6v5c0 4.6 2.9 8.3 7 10 4.1-1.7 7-5.4 7-10V6l-7-3Z" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Protected registration</p>
                    <p className="mt-1 text-[11px] leading-5 text-white/45">
                      A valid administrator registration key is required to create an account.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-6">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">BellesCart Admin Console</p>
              <div className="h-px w-20 bg-white/10" />
            </div>
          </div>
        </section>

        <section className="relative flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:py-14">
          <div className="absolute left-6 top-7 lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#35232e] text-white">
                <span className="font-serif text-lg italic">B</span>
              </div>
              <div>
                <div className="font-serif text-xl text-[#35232e]">BellesCart</div>
                <div className="text-[8px] font-semibold uppercase tracking-[0.22em] text-[#927a84]">Administration</div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-[560px] pt-16 lg:pt-0">
            <div className="mb-7">
              <div className="mb-3 flex items-center gap-3">
                <span className="h-px w-8 bg-[#c995a5]" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#9a7481]">
                  Administrator setup
                </span>
              </div>
              <h2 className="font-serif text-4xl leading-tight text-[#30222b] sm:text-[42px]">
                Create your account.
              </h2>
              <p className="mt-2.5 max-w-lg text-sm leading-6 text-[#766b72]">
                Enter your details to create authorized access to the BellesCart administration portal.
              </p>
            </div>

            {apiError && (
              <div role="alert" className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2">
                    <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                </div>
                <p className="text-xs leading-5 text-red-700">{apiError}</p>
              </div>
            )}

            <div className="rounded-[28px] border border-[#e8dedf] bg-white p-6 shadow-[0_20px_70px_rgba(53,35,46,0.08)] sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">

                <div>
                  <label htmlFor="name" className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5f5058]">
                    Full Name <span className="text-[#b8798b]">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isLoading}
                    required
                    autoComplete="name"
                    placeholder="Enter your full name"
                    className={inputClass('name')}
                  />
                  {errors.name && <p className="mt-1.5 text-xs text-red-600">{errors.name}</p>}
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="email" className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5f5058]">
                      Email Address <span className="text-[#b8798b]">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isLoading}
                      required
                      autoComplete="email"
                      placeholder="admin@bellescart.com"
                      className={inputClass('email')}
                    />
                    {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor="phone" className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5f5058]">
                      Phone <span className="font-normal normal-case tracking-normal text-[#aaa0a5]">(Optional)</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={isLoading}
                      autoComplete="tel"
                      placeholder="Phone number"
                      className={inputClass('phone')}
                    />
                    {errors.phone && <p className="mt-1.5 text-xs text-red-600">{errors.phone}</p>}
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label htmlFor="password" className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5f5058]">
                      Password <span className="text-[#b8798b]">*</span>
                    </label>
                    <span className="text-[10px] text-[#a0959b]">Minimum 6 characters</span>
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={isLoading}
                      required
                      autoComplete="new-password"
                      placeholder="Create a secure password"
                      className={`${inputClass('password')} pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      disabled={isLoading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#a0959b] transition hover:bg-[#f4edef] hover:text-[#5c4350] disabled:opacity-50"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                  {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5f5058]">
                    Confirm Password <span className="text-[#b8798b]">*</span>
                  </label>

                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={isLoading}
                      required
                      autoComplete="new-password"
                      placeholder="Re-enter your password"
                      className={`${inputClass('confirmPassword')} pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(prev => !prev)}
                      disabled={isLoading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#a0959b] transition hover:bg-[#f4edef] hover:text-[#5c4350] disabled:opacity-50"
                      aria-label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'}
                    >
                      <EyeIcon open={showConfirmPassword} />
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-600">{errors.confirmPassword}</p>}
                </div>

                <div className="rounded-2xl border border-[#e9dfe2] bg-[#fbf8f9] p-4">
                  <div className="mb-3 flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eee4e8] text-[#694653]">
                      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.7">
                        <circle cx="8" cy="15" r="3" />
                        <path d="m10.2 12.8 7.3-7.3 2 2-2 2 1.5 1.5-2 2-1.5-1.5-2.1 2.1" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <label htmlFor="registrationKey" className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5f5058]">
                        Registration Key <span className="text-[#b8798b]">*</span>
                      </label>
                      <p className="mt-0.5 text-[10px] text-[#9a8d94]">Required for administrator registration</p>
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type={showRegistrationKey ? 'text' : 'password'}
                      id="registrationKey"
                      name="registrationKey"
                      value={formData.registrationKey}
                      onChange={handleChange}
                      disabled={isLoading}
                      required
                      autoComplete="off"
                      placeholder="Enter your registration key"
                      className={`${inputClass('registrationKey')} bg-white pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegistrationKey(prev => !prev)}
                      disabled={isLoading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#a0959b] transition hover:bg-[#f4edef] hover:text-[#5c4350] disabled:opacity-50"
                      aria-label={showRegistrationKey ? 'Hide registration key' : 'Show registration key'}
                    >
                      <EyeIcon open={showRegistrationKey} />
                    </button>
                  </div>

                  {errors.registrationKey && <p className="mt-1.5 text-xs text-red-600">{errors.registrationKey}</p>}
                  <p className="mt-2.5 text-[10px] leading-4 text-[#94878e]">
                    Contact your system administrator if you do not have a registration key.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#35232e] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(53,35,46,0.16)] outline-none transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#442d3a] hover:shadow-[0_16px_34px_rgba(53,35,46,0.2)] focus:ring-4 focus:ring-[#9b7080]/15 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {isLoading ? (
                    <>
                      <Loader size="sm" />
                      <span>Creating Account…</span>
                    </>
                  ) : (
                    <>
                      <span>Create Admin Account</span>
                      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" stroke="currentColor" strokeWidth="1.8">
                        <path d="M5 12h13" strokeLinecap="round" />
                        <path d="m13 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-7 border-t border-[#eee5e7] pt-6 text-center">
                <p className="text-xs text-[#82767d]">Already have an admin account?</p>
                <Link
                  href="/belles-portel-25"
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[#694653] transition hover:text-[#35232e]"
                >
                  Sign in to Admin Portal
                  <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="1.8">
                    <path d="M5 12h13" strokeLinecap="round" />
                    <path d="m13 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
            </div>

            <div className="mt-6 text-center">
              <div className="flex items-center justify-center gap-2 text-[#8d8087]">
                <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="1.7">
                  <rect x="5" y="10" width="14" height="10" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" strokeLinecap="round" />
                </svg>
                <span className="text-[10px] font-medium uppercase tracking-[0.15em]">
                  Restricted administrator access
                </span>
              </div>
              <p className="mt-2 text-[10px] leading-5 text-[#a1989d]">
                By registering, you agree to the admin terms and conditions.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
