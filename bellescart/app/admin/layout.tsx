import type { Metadata } from 'next';
import AdminHeader from '@/components/AdminHeader/AdminHeader';

export const metadata: Metadata = {
  title: 'BellesCart Admin',
  description: 'Admin dashboard and management tools for BellesCart.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader />
      {children}
    </div>
  );
}
