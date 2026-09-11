'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { adminUserService, UserData } from '@/services/admin/userService';
import { globalToast } from '@/utils/globalToast';

interface EditUserData {
  name: string;
  email: string;
  phone_number: string;
}

const ADMIN_BASE = '/belles-portel-25';

function getInitials(name?: string) {
  if (!name?.trim()) return 'U';

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function formatDate(date?: string) {
  if (!date) return '—';

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return '—';

  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatOrders(orders?: number) {
  return typeof orders === 'number' ? orders.toLocaleString('en-IN') : '0';
}

export default function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = React.use(params);

  const [formData, setFormData] = useState<EditUserData>({
    name: '',
    email: '',
    phone_number: '',
  });

  const [user, setUser] = useState<UserData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      setLoading(true);

      const response = await adminUserService.getUsers();

      if (response.success && response.data?.users) {
        const foundUser = response.data.users.find((u) => u.id === id);

        if (foundUser) {
          setUser(foundUser);

          setFormData({
            name: foundUser.name || '',
            email: foundUser.email || '',
            phone_number: foundUser.phone_number || '',
          });
        } else {
          globalToast.admin.error('User not found', 'The requested user could not be found.');
          router.push(`${ADMIN_BASE}/users`);
        }
      } else {
        globalToast.admin.error('Unable to load user', 'Please try again.');
        router.push(`${ADMIN_BASE}/users`);
      }
    } catch (error: any) {
      console.error('Failed to load user:', error);

      globalToast.admin.error(
        'Unable to load user',
        error?.message || 'Something went wrong while loading the user.'
      );

      router.push(`${ADMIN_BASE}/users`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof EditUserData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = formData.name.trim();
    const trimmedPhone = formData.phone_number.trim();

    if (!trimmedName) {
      globalToast.admin.error(
        'Validation Error',
        'Name is required.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await adminUserService.updateUser(id, {
        name: trimmedName,
        email: formData.email,
        phone_number: trimmedPhone,
      });

      if (response.success) {
        globalToast.admin.success(
          'User updated',
          'The user details have been updated successfully.'
        );

        router.push(`${ADMIN_BASE}/users`);
      } else {
        globalToast.admin.error(
          'Update failed',
          response.message || 'Failed to update user.'
        );
      }
    } catch (error: any) {
      console.error('Update user error:', error);

      globalToast.admin.error(
        'Update failed',
        error?.message || 'Failed to update user.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isSubmitting) return;

    router.push(`${ADMIN_BASE}/users`);
  };

  /* -------------------------------------------------------------------------- */
  /* Loading                                                                     */
  /* -------------------------------------------------------------------------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f3ee]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-4 w-48 rounded bg-stone-200" />

            <div className="flex items-end justify-between gap-6">
              <div className="space-y-3">
                <div className="h-10 w-72 rounded bg-stone-200" />
                <div className="h-4 w-96 max-w-full rounded bg-stone-200" />
              </div>

              <div className="hidden h-10 w-32 rounded bg-stone-200 sm:block" />
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="h-[520px] rounded-3xl bg-white shadow-sm" />
              <div className="h-[360px] rounded-3xl bg-white shadow-sm" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* Not found                                                                    */
  /* -------------------------------------------------------------------------- */

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f7f3ee] px-4 py-16">
        <div className="mx-auto max-w-lg rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-xl">
            ?
          </div>

          <h1 className="mt-5 font-serif text-2xl font-semibold text-[#24151f]">
            User not found
          </h1>

          <p className="mt-2 text-sm leading-6 text-stone-500">
            The user you're trying to edit could not be found.
          </p>

          <Button
            type="button"
            onClick={() => router.push(`${ADMIN_BASE}/users`)}
            className="mt-6"
          >
            Back to Users
          </Button>
        </div>
      </div>
    );
  }

  const initials = getInitials(user.name);

  return (
    <div className="min-h-screen bg-[#f7f3ee] text-[#24151f]">
      {/* -------------------------------------------------------------------- */}
      {/* Top navigation                                                        */}
      {/* -------------------------------------------------------------------- */}

      <header className="border-b border-stone-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link
              href={`${ADMIN_BASE}/users`}
              className="flex min-w-0 items-center gap-3"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#321b2b] text-sm font-semibold text-white">
                BC
              </div>

              <div className="hidden min-w-0 sm:block">
                <p className="truncate text-sm font-semibold tracking-wide text-[#24151f]">
                  BellesCart
                </p>
                <p className="text-[10px] uppercase tracking-[0.18em] text-stone-400">
                  Administration
                </p>
              </div>
            </Link>

            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="!h-9 !px-3 text-xs sm:!px-4"
            >
              <span className="mr-1.5">←</span>
              <span>Back to Users</span>
            </Button>
          </div>
        </div>
      </header>

      {/* -------------------------------------------------------------------- */}
      {/* Main                                                                  */}
      {/* -------------------------------------------------------------------- */}

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-stone-400">
          <Link
            href={`${ADMIN_BASE}/dashboard`}
            className="transition-colors hover:text-[#321b2b]"
          >
            Dashboard
          </Link>

          <span>/</span>

          <Link
            href={`${ADMIN_BASE}/users`}
            className="transition-colors hover:text-[#321b2b]"
          >
            Users
          </Link>

          <span>/</span>

          <span className="text-stone-600">Edit User</span>
        </nav>

        {/* Page heading */}
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-px w-8 bg-[#b77a8e]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9b6377]">
                Customer profile
              </span>
            </div>

            <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#24151f] sm:text-4xl">
              Edit user
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
              Update the customer's basic account information while keeping
              their account activity and role unchanged.
            </p>
          </div>

          <div className="hidden text-right md:block">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-400">
              User ID
            </p>
            <p className="mt-1 max-w-[220px] truncate font-mono text-xs text-stone-600">
              {user.id}
            </p>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Content                                                             */}
        {/* ------------------------------------------------------------------ */}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Main form */}
          <section className="overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-[0_10px_40px_rgba(36,21,31,0.04)]">
            {/* Profile heading */}
            <div className="border-b border-stone-100 px-5 py-5 sm:px-7">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#321b2b] font-serif text-lg font-semibold text-white shadow-sm">
                  {initials}
                </div>

                <div className="min-w-0">
                  <h2 className="truncate font-serif text-xl font-semibold text-[#24151f]">
                    {user.name || 'Unnamed user'}
                  </h2>

                  <p className="mt-0.5 truncate text-sm text-stone-500">
                    {user.email}
                  </p>
                </div>

                <div className="ml-auto hidden sm:block">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                      user.isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        user.isActive
                          ? 'bg-emerald-500'
                          : 'bg-red-500'
                      }`}
                    />
                    {user.isActive ? 'Active account' : 'Inactive account'}
                  </span>
                </div>
              </div>

              <div className="mt-4 sm:hidden">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                    user.isActive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      user.isActive
                        ? 'bg-emerald-500'
                        : 'bg-red-500'
                    }`}
                  />
                  {user.isActive ? 'Active account' : 'Inactive account'}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-7 px-5 py-7 sm:px-7">
                {/* Personal details */}
                <div>
                  <div className="mb-5">
                    <h3 className="text-sm font-semibold text-[#24151f]">
                      Personal details
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-stone-400">
                      Keep the customer's profile information accurate.
                    </p>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Input
                        label="Full name"
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange('name', e.target.value)
                        }
                        placeholder="Enter customer's name"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <Input
                        label="Email address"
                        type="email"
                        value={formData.email}
                        readOnly
                        disabled
                        className="cursor-not-allowed bg-stone-50 text-stone-500"
                      />

                      <p className="mt-2 text-[11px] leading-5 text-stone-400">
                        Email address cannot be changed from this page.
                      </p>
                    </div>

                    <div className="sm:col-span-2">
                      <Input
                        label="Phone number"
                        type="tel"
                        value={formData.phone_number}
                        onChange={(e) =>
                          handleInputChange(
                            'phone_number',
                            e.target.value
                          )
                        }
                        placeholder="Enter phone number"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-stone-100" />

                {/* Account info */}
                <div>
                  <div className="mb-5">
                    <h3 className="text-sm font-semibold text-[#24151f]">
                      Account information
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-stone-400">
                      Account metadata is shown here for reference.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-stone-100 bg-[#faf8f5] p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-400">
                        Role
                      </p>

                      <p className="mt-2 text-sm font-semibold text-[#24151f]">
                        {user.role === 'admin' ? 'Administrator' : 'Customer'}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-stone-100 bg-[#faf8f5] p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-400">
                        Account status
                      </p>

                      <p
                        className={`mt-2 text-sm font-semibold ${
                          user.isActive
                            ? 'text-emerald-700'
                            : 'text-red-700'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-stone-100 bg-[#faf8f5] p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-400">
                        Joined
                      </p>

                      <p className="mt-2 text-sm font-semibold text-[#24151f]">
                        {formatDate(user.joinDate)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-stone-100 bg-[#faf8f5] p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-400">
                        Orders
                      </p>

                      <p className="mt-2 text-sm font-semibold text-[#24151f]">
                        {formatOrders(user.orders)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form actions */}
              <div className="border-t border-stone-100 bg-[#fcfaf8] px-5 py-5 sm:px-7">
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto sm:min-w-[130px]"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto sm:min-w-[160px]"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Saving...
                      </span>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </section>

          {/* ---------------------------------------------------------------- */}
          {/* Sidebar                                                          */}
          {/* ---------------------------------------------------------------- */}

          <aside className="space-y-6">
            {/* Account overview */}
            <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-[0_10px_40px_rgba(36,21,31,0.04)]">
              <div className="mb-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9b6377]">
                  Account overview
                </p>

                <h2 className="mt-2 font-serif text-xl font-semibold text-[#24151f]">
                  Customer profile
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4 border-b border-stone-100 pb-4">
                  <span className="text-xs text-stone-400">
                    Role
                  </span>

                  <span className="rounded-full bg-[#f4edf1] px-2.5 py-1 text-[11px] font-semibold capitalize text-[#6f3d57]">
                    {user.role}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 border-b border-stone-100 pb-4">
                  <span className="text-xs text-stone-400">
                    Status
                  </span>

                  <span
                    className={`text-xs font-semibold ${
                      user.isActive
                        ? 'text-emerald-700'
                        : 'text-red-700'
                    }`}
                  >
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 border-b border-stone-100 pb-4">
                  <span className="text-xs text-stone-400">
                    Joined
                  </span>

                  <span className="text-xs font-medium text-stone-700">
                    {formatDate(user.joinDate)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-stone-400">
                    Total orders
                  </span>

                  <span className="text-sm font-semibold text-[#24151f]">
                    {formatOrders(user.orders)}
                  </span>
                </div>
              </div>
            </div>

            {/* Editing guidance */}
            <div className="overflow-hidden rounded-3xl bg-[#321b2b] p-6 text-white">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-lg">
                ✦
              </div>

              <h3 className="font-serif text-xl font-semibold">
                Profile care
              </h3>

              <p className="mt-2 text-sm leading-6 text-white/60">
                Make sure customer information is accurate before saving
                changes.
              </p>

              <div className="mt-5 space-y-3">
                <div className="flex gap-3">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d7a4b5]" />
                  <p className="text-xs leading-5 text-white/70">
                    Name changes are reflected across the customer's account.
                  </p>
                </div>

                <div className="flex gap-3">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d7a4b5]" />
                  <p className="text-xs leading-5 text-white/70">
                    Email is protected and cannot be edited here.
                  </p>
                </div>

                <div className="flex gap-3">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d7a4b5]" />
                  <p className="text-xs leading-5 text-white/70">
                    Account role and status remain unchanged.
                  </p>
                </div>
              </div>
            </div>

            {/* User ID */}
            <div className="rounded-3xl border border-stone-200/80 bg-white p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                Internal reference
              </p>

              <p className="mt-3 break-all font-mono text-[11px] leading-5 text-stone-500">
                {user.id}
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}