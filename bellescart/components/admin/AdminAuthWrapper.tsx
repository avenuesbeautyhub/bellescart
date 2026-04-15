'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useRequireAdminAuth } from '@/auth/admin';
import AdminHeader from '@/components/AdminHeader/AdminHeader';

interface AdminAuthWrapperProps {
  children: React.ReactNode;
}

export default function AdminAuthWrapper({ children }: AdminAuthWrapperProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, loaded } = useRequireAdminAuth();

  // Don't require auth for the login page (root admin page)
  const isLoginPage = pathname === '/admin';

  useEffect(() => {
    if (!loaded) return;

    // If not authenticated and not on login page, redirect to login
    if (!isAuthenticated && !isLoginPage) {
      router.replace('/admin');
      return;
    }

    // If authenticated and on login page, redirect to dashboard
    if (isAuthenticated && isLoginPage) {
      router.replace('/admin/dashboard');
      return;
    }
  }, [loaded, isAuthenticated, isLoginPage, router]);

  // Show loading state while checking authentication
  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading admin panel...</p>
      </div>
    );
  }

  // If not authenticated and not on login page, show loading during redirect
  if (!isAuthenticated && !isLoginPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Redirecting to admin login...</p>
      </div>
    );
  }

  // If authenticated and on login page, show loading during redirect
  if (isAuthenticated && isLoginPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Redirecting to admin dashboard...</p>
      </div>
    );
  }

  // On login page, don't show header, just render children
  if (isLoginPage) {
    return <>{children}</>;
  }

  // On other admin pages, show header and require authentication
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader />
      {children}
    </div>
  );
}
