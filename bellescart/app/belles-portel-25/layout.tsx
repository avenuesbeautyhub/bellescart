import type { Metadata } from 'next';
import AdminAuthWrapper from '@/components/admin/AdminAuthWrapper';
import { AdminCsrfProvider } from '@/providers/AdminCsrfProvider';

export const metadata: Metadata = {
  title: 'BellesCart Admin',
  description: 'Admin dashboard and management tools for BellesCart.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminCsrfProvider>
      <AdminAuthWrapper>{children}</AdminAuthWrapper>
    </AdminCsrfProvider>
  );
}
