'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Loader from '@/components/ui/Loader';
import { useToast } from '@/contexts/ToastContext';
import { toastMessages } from '@/utils/toastHelpers';
import { useAuth, useAuthActions } from '@/auth/user';

export default function LoginPage() {
  const router = useRouter();
  const { loaded, isAuthenticated } = useAuth();
  const toast = useToast();
  const { login } = useAuthActions();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (loaded && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [loaded, isAuthenticated, router]);

  // Show loader only if not loaded AND not already authenticated
  if (!loaded && !isAuthenticated) {
    return <Loader size="lg" text="Loading..." fullScreen />;
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
    setIsLoading(true);

    try {
      const response = await login({
        email: formData.email,
        password: formData.password
      });

      if (response.success) {
        // Show success toast
        toast.showToast(toastMessages.auth.loginSuccess(response.data?.user?.name));

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        // Show error toast
        toast.showToast(toastMessages.auth.loginError(response.error));
      }
    } catch (err) {
      // Show error toast for network errors
      toast.showToast(toastMessages.general.networkError());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
            <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">Login</h1>
            <p className="text-gray-600 text-center mb-8">
              Sign in to your BellesCart account
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
              />

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
                  className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>

              <div className="flex justify-end">
                <Link href="/forgot-password" className="text-pink-500 hover:underline text-sm">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline">Google</Button>
              <Button variant="outline">Facebook</Button>
            </div>

            <p className="text-center text-gray-600 mt-6">
              Don't have an account?{' '}
              <Link href="/signup" className="text-pink-500 hover:underline font-semibold">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}