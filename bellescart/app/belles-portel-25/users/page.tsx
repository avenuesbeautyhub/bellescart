'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';

import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

import {
  useAdminUsers,
  useUpdateUserStatus,
} from '@/hooks/user/useAdminQueries';

import { UserData } from '@/services/admin/userService';
import { globalToast } from '@/utils/globalToast';

const ADMIN_BASE = '/belles-portel-25';

type UserFilter = 'all' | 'active' | 'inactive' | 'admin';

export default function UserManagementPage() {
  const { data: usersData, isLoading } =
    useAdminUsers();

  const updateUserStatusMutation =
    useUpdateUserStatus();

  const users = usersData?.data?.users || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] =
    useState<UserFilter>('all');

  const [updatingUserId, setUpdatingUserId] =
    useState<string | null>(null);

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="success">Active</Badge>
    ) : (
      <Badge variant="warning">Inactive</Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    return role === 'admin' ? (
      <Badge variant="primary">Admin</Badge>
    ) : (
      <Badge variant="secondary">Customer</Badge>
    );
  };

  const formatDate = (date?: string) => {
    if (!date) return '—';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return '—';
    }

    return parsedDate.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    );
  };

  const getInitials = (name?: string) => {
    if (!name?.trim()) return 'U';

    const parts = name
      .trim()
      .split(/\s+/)
      .slice(0, 2);

    return parts
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  const handleToggleStatus = async (
    user: UserData
  ) => {
    const newStatus = user.isActive
      ? 'inactive'
      : 'active';

    try {
      setUpdatingUserId(user.id);

      await updateUserStatusMutation.mutateAsync({
        id: user.id,
        status: newStatus,
      });

      globalToast.admin.success(
        'Success',
        `User ${newStatus}d successfully`
      );
    } catch (error) {
      console.error(
        'Toggle status error:',
        error
      );

      globalToast.admin.error(
        'Error',
        'Failed to update user status'
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  const stats = useMemo(() => {
    const active = users.filter(
      (user) => user.isActive === true
    ).length;

    const inactive = users.filter(
      (user) => user.isActive !== true
    ).length;

    const admins = users.filter(
      (user) => user.role === 'admin'
    ).length;

    const customers = users.filter(
      (user) => user.role !== 'admin'
    ).length;

    const totalOrders = users.reduce(
      (total, user) =>
        total + Number(user.orders || 0),
      0
    );

    const newThisMonth = users.filter(
      (user) => {
        if (!user.joinDate) return false;

        const date = new Date(user.joinDate);

        if (Number.isNaN(date.getTime())) {
          return false;
        }

        const now = new Date();

        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() ===
            now.getFullYear()
        );
      }
    ).length;

    return {
      total: users.length,
      active,
      inactive,
      admins,
      customers,
      totalOrders,
      newThisMonth,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const search = searchQuery
      .trim()
      .toLowerCase();

    return users.filter((user) => {
      if (filter === 'active' && !user.isActive) {
        return false;
      }

      if (
        filter === 'inactive' &&
        user.isActive
      ) {
        return false;
      }

      if (
        filter === 'admin' &&
        user.role !== 'admin'
      ) {
        return false;
      }

      if (search) {
        const matchesName =
          user.name
            ?.toLowerCase()
            .includes(search);

        const matchesEmail =
          user.email
            ?.toLowerCase()
            .includes(search);

        const matchesId =
          user.id
            ?.toLowerCase()
            .includes(search);

        if (
          !matchesName &&
          !matchesEmail &&
          !matchesId
        ) {
          return false;
        }
      }

      return true;
    });
  }, [users, filter, searchQuery]);

  const hasFilters =
    searchQuery.trim() !== '' ||
    filter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setFilter('all');
  };

  return (
    <div className="min-h-screen bg-[#f7f4f1] text-[#2d2329]">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <header className="border-b border-[#e6ddd8] bg-white">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[150px] flex-col justify-center gap-6 py-7 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#9b8c92]">
                <Link
                  href={`${ADMIN_BASE}/dashboard`}
                  className="transition hover:text-[#6b2745]"
                >
                  Dashboard
                </Link>

                <span className="text-[#d2c7c3]">
                  /
                </span>

                <span className="text-[#6b2745]">
                  Users
                </span>
              </div>

              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.25em] text-[#a18f96]">
                BellesCart Administration
              </p>

              <h1 className="font-serif text-4xl font-medium tracking-tight text-[#291f25] sm:text-5xl">
                Users
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-[#817278]">
                Manage customer accounts, access roles,
                account status and order activity.
              </p>
            </div>

            <div className="rounded-2xl border border-[#e6ddd8] bg-[#faf7f5] px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9b8c92]">
                Customer Accounts
              </p>

              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-serif text-3xl font-semibold text-[#4b1830]">
                  {stats.customers}
                </span>

                <span className="text-xs text-[#93858b]">
                  registered customers
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* =====================================================
            STATS
        ====================================================== */}
        <section className="mb-7">
          <div className="mb-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#a18f96]">
              Account Overview
            </p>

            <h2 className="mt-1 font-serif text-2xl text-[#30242a]">
              User activity at a glance
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
            <StatCard
              label="Total Users"
              value={stats.total}
              icon="◎"
            />

            <StatCard
              label="Active"
              value={stats.active}
              icon="✓"
              accent="green"
            />

            <StatCard
              label="Inactive"
              value={stats.inactive}
              icon="◷"
              accent="amber"
            />

            <StatCard
              label="Admin Accounts"
              value={stats.admins}
              icon="◆"
              accent="violet"
            />

            <StatCard
              label="New This Month"
              value={stats.newThisMonth}
              icon="+"
              accent="rose"
            />
          </div>
        </section>

        {/* =====================================================
            SEARCH / FILTERS
        ====================================================== */}
        <section className="mb-6 overflow-hidden rounded-2xl border border-[#e5dcd7] bg-white shadow-[0_8px_30px_rgba(52,34,43,0.04)]">
          <div className="border-b border-[#eee7e3] px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#30252b]">
                  Find users
                </h2>

                <p className="mt-0.5 text-xs text-[#94858c]">
                  Search by name, email or user ID.
                </p>
              </div>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="self-start text-xs font-semibold text-[#6b2745] transition hover:text-[#43152c] sm:self-auto"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-[1fr_220px] sm:p-6">
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-[#95868c]">
                Search
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a4959a]">
                  ⌕
                </span>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(
                      event.target.value
                    )
                  }
                  placeholder="Search name, email or user ID..."
                  className="h-11 w-full rounded-xl border border-[#ded5d1] bg-[#fcfaf9] pl-10 pr-4 text-sm text-[#292027] outline-none transition placeholder:text-[#aaa0a3] focus:border-[#7b3654] focus:bg-white focus:ring-4 focus:ring-[#7b3654]/10"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-[#95868c]">
                Account Filter
              </label>

              <select
                value={filter}
                onChange={(event) =>
                  setFilter(
                    event.target.value as UserFilter
                  )
                }
                className="h-11 w-full rounded-xl border border-[#ded5d1] bg-[#fcfaf9] px-4 text-sm text-[#292027] outline-none transition focus:border-[#7b3654] focus:bg-white focus:ring-4 focus:ring-[#7b3654]/10"
              >
                <option value="all">
                  All users
                </option>

                <option value="active">
                  Active users
                </option>

                <option value="inactive">
                  Inactive users
                </option>

                <option value="admin">
                  Admin users
                </option>
              </select>
            </div>
          </div>
        </section>

        {/* =====================================================
            RESULTS HEADER
        ====================================================== */}
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#a18f96]">
              Account Registry
            </p>

            <h2 className="mt-1 font-serif text-2xl text-[#30242a]">
              {filteredUsers.length}{' '}
              {filteredUsers.length === 1
                ? 'user'
                : 'users'}
            </h2>
          </div>

          <p className="text-xs text-[#94858b]">
            {stats.totalOrders} total orders across
            all users
          </p>
        </div>

        {/* =====================================================
            DESKTOP TABLE
        ====================================================== */}
        <section className="hidden overflow-hidden rounded-2xl border border-[#e5dcd7] bg-white shadow-[0_8px_30px_rgba(52,34,43,0.04)] lg:block">
          {isLoading ? (
            <UserTableSkeleton />
          ) : filteredUsers.length === 0 ? (
            <EmptyUsers
              hasFilters={hasFilters}
              onClear={clearFilters}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-[#eee7e3] bg-[#fbf9f8]">
                      <TableHeader>
                        User
                      </TableHeader>

                      <TableHeader>
                        Role
                      </TableHeader>

                      <TableHeader>
                        Status
                      </TableHeader>

                      <TableHeader>
                        Join Date
                      </TableHeader>

                      <TableHeader>
                        Orders
                      </TableHeader>

                      <TableHeader align="right">
                        Actions
                      </TableHeader>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#eee7e3]">
                    {filteredUsers.map(
                      (user) => (
                        <UserTableRow
                          key={user.id}
                          user={user}
                          updatingUserId={
                            updatingUserId
                          }
                          onToggleStatus={
                            handleToggleStatus
                          }
                          getInitials={getInitials}
                          formatDate={formatDate}
                          getRoleBadge={
                            getRoleBadge
                          }
                          getStatusBadge={
                            getStatusBadge
                          }
                        />
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        {/* =====================================================
            MOBILE CARDS
        ====================================================== */}
        <section className="space-y-3 lg:hidden">
          {isLoading ? (
            <MobileSkeleton />
          ) : filteredUsers.length === 0 ? (
            <div className="rounded-2xl border border-[#e5dcd7] bg-white">
              <EmptyUsers
                hasFilters={hasFilters}
                onClear={clearFilters}
              />
            </div>
          ) : (
            filteredUsers.map((user) => (
              <UserMobileCard
                key={user.id}
                user={user}
                updatingUserId={updatingUserId}
                onToggleStatus={
                  handleToggleStatus
                }
                getInitials={getInitials}
                formatDate={formatDate}
                getRoleBadge={getRoleBadge}
                getStatusBadge={getStatusBadge}
              />
            ))
          )}
        </section>
      </main>
    </div>
  );
}

/* ============================================================
   DESKTOP ROW
============================================================ */

function UserTableRow({
  user,
  updatingUserId,
  onToggleStatus,
  getInitials,
  formatDate,
  getRoleBadge,
  getStatusBadge,
}: {
  user: UserData;
  updatingUserId: string | null;
  onToggleStatus: (user: UserData) => void;
  getInitials: (name?: string) => string;
  formatDate: (date?: string) => string;
  getRoleBadge: (role: string) => React.ReactNode;
  getStatusBadge: (
    isActive: boolean
  ) => React.ReactNode;
}) {
  const isUpdating =
    updatingUserId === user.id;

  return (
    <tr className="group transition-colors hover:bg-[#fdfbfa]">
      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          <UserAvatar
            name={user.name}
            getInitials={getInitials}
          />

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#30252b]">
              {user.name}
            </p>

            <p className="max-w-[260px] truncate text-xs text-[#94858b]">
              {user.email}
            </p>
          </div>
        </div>
      </td>

      <td className="px-5 py-5">
        {getRoleBadge(user.role)}
      </td>

      <td className="px-5 py-5">
        {getStatusBadge(user.isActive)}
      </td>

      <td className="px-5 py-5 whitespace-nowrap">
        <p className="text-sm font-medium text-[#44373e]">
          {formatDate(user.joinDate)}
        </p>
      </td>

      <td className="px-5 py-5">
        <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-[#f4eeeb] px-2.5 py-1.5 text-xs font-bold text-[#5d4752]">
          {user.orders || 0}
        </span>
      </td>

      <td className="px-6 py-5">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`${ADMIN_BASE}/users/edit/${user.id}`}
          >
            <button
              type="button"
              className="rounded-lg border border-[#ddd3cf] bg-white px-3.5 py-2 text-xs font-semibold text-[#4d3c44] transition hover:border-[#7b3654] hover:text-[#6b2745]"
            >
              Edit
            </button>
          </Link>

          <button
            type="button"
            disabled={isUpdating}
            onClick={() =>
              onToggleStatus(user)
            }
            className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
              user.isActive
                ? 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                : 'bg-[#4b1830] text-white hover:bg-[#361021]'
            }`}
          >
            {isUpdating
              ? 'Updating...'
              : user.isActive
                ? 'Deactivate'
                : 'Activate'}
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ============================================================
   MOBILE CARD
============================================================ */

function UserMobileCard({
  user,
  updatingUserId,
  onToggleStatus,
  getInitials,
  formatDate,
  getRoleBadge,
  getStatusBadge,
}: {
  user: UserData;
  updatingUserId: string | null;
  onToggleStatus: (user: UserData) => void;
  getInitials: (name?: string) => string;
  formatDate: (date?: string) => string;
  getRoleBadge: (role: string) => React.ReactNode;
  getStatusBadge: (
    isActive: boolean
  ) => React.ReactNode;
}) {
  const isUpdating =
    updatingUserId === user.id;

  return (
    <article className="overflow-hidden rounded-2xl border border-[#e5dcd7] bg-white shadow-[0_6px_24px_rgba(52,34,43,0.04)]">
      <div className="flex items-start justify-between gap-4 border-b border-[#eee7e3] p-4">
        <div className="flex min-w-0 items-center gap-3">
          <UserAvatar
            name={user.name}
            getInitials={getInitials}
          />

          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-[#30252b]">
              {user.name}
            </h3>

            <p className="truncate text-xs text-[#94858b]">
              {user.email}
            </p>
          </div>
        </div>

        <div className="shrink-0">
          {getStatusBadge(user.isActive)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px bg-[#eee7e3]">
        <MobileInfo
          label="Role"
          value={getRoleBadge(user.role)}
        />

        <MobileInfo
          label="Orders"
          value={
            <span className="font-semibold text-[#4c3b43]">
              {user.orders || 0}
            </span>
          }
        />

        <MobileInfo
          label="Joined"
          value={
            <span className="text-xs font-medium text-[#4c3b43]">
              {formatDate(user.joinDate)}
            </span>
          }
        />

        <MobileInfo
          label="User ID"
          value={
            <span className="max-w-[120px] truncate font-mono text-[9px] text-[#807178]">
              {user.id}
            </span>
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-2 p-4">
        <Link
          href={`${ADMIN_BASE}/users/edit/${user.id}`}
        >
          <button
            type="button"
            className="w-full rounded-xl border border-[#ddd3cf] bg-white px-4 py-2.5 text-xs font-semibold text-[#4d3c44] transition hover:border-[#7b3654] hover:text-[#6b2745]"
          >
            Edit User
          </button>
        </Link>

        <button
          type="button"
          disabled={isUpdating}
          onClick={() =>
            onToggleStatus(user)
          }
          className={`rounded-xl px-4 py-2.5 text-xs font-semibold transition disabled:opacity-50 ${
            user.isActive
              ? 'border border-rose-200 bg-rose-50 text-rose-700'
              : 'bg-[#4b1830] text-white'
          }`}
        >
          {isUpdating
            ? 'Updating...'
            : user.isActive
              ? 'Deactivate'
              : 'Activate'}
        </button>
      </div>
    </article>
  );
}

/* ============================================================
   USER AVATAR
============================================================ */

function UserAvatar({
  name,
  getInitials,
}: {
  name?: string;
  getInitials: (name?: string) => string;
}) {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eee1e6] font-serif text-sm font-semibold text-[#6b2745]">
      {getInitials(name)}
    </div>
  );
}

/* ============================================================
   MOBILE INFO
============================================================ */

function MobileInfo({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="bg-white p-4">
      <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#a09297]">
        {label}
      </p>

      <div className="mt-1.5">
        {value}
      </div>
    </div>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  label,
  value,
  icon,
  accent = 'default',
}: {
  label: string;
  value: number;
  icon: string;
  accent?:
    | 'default'
    | 'green'
    | 'amber'
    | 'violet'
    | 'rose';
}) {
  const styles = {
    default: {
      icon: 'bg-[#f4eeeb] text-[#6b2745]',
      value: 'text-[#2f252b]',
    },
    green: {
      icon: 'bg-emerald-50 text-emerald-700',
      value: 'text-emerald-800',
    },
    amber: {
      icon: 'bg-amber-50 text-amber-700',
      value: 'text-amber-800',
    },
    violet: {
      icon: 'bg-violet-50 text-violet-700',
      value: 'text-violet-800',
    },
    rose: {
      icon: 'bg-rose-50 text-rose-700',
      value: 'text-rose-800',
    },
  };

  const style = styles[accent];

  return (
    <div className="rounded-2xl border border-[#e5dcd7] bg-white p-4 shadow-[0_5px_20px_rgba(52,34,43,0.03)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#9b8c92]">
            {label}
          </p>

          <p
            className={`mt-2 font-serif text-3xl font-semibold ${style.value}`}
          >
            {value}
          </p>
        </div>

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold ${style.icon}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   TABLE HEADER
============================================================ */

function TableHeader({
  children,
  align = 'left',
}: {
  children: React.ReactNode;
  align?: 'left' | 'right';
}) {
  return (
    <th
      className={`px-5 py-4 text-${align} text-[10px] font-bold uppercase tracking-[0.18em] text-[#93858b] first:pl-6 last:pr-6`}
    >
      {children}
    </th>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyUsers({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean;
  onClear: () => void;
}) {
  return (
    <div className="px-6 py-20 text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#f4eeeb] text-2xl text-[#80636e]">
        ◉
      </div>

      <h3 className="font-serif text-2xl text-[#30242a]">
        No users found
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#93858b]">
        {hasFilters
          ? 'No users match your current search or filter.'
          : 'No users have registered yet.'}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 text-sm font-semibold text-[#6b2745] hover:text-[#43152c]"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

/* ============================================================
   TABLE SKELETON
============================================================ */

function UserTableSkeleton() {
  return (
    <div>
      <div className="h-12 border-b border-[#eee7e3] bg-[#fbf9f8]" />

      <div className="divide-y divide-[#eee7e3]">
        {[1, 2, 3, 4, 5].map(
          (item) => (
            <div
              key={item}
              className="flex items-center gap-6 px-6 py-5"
            >
              <div className="flex flex-1 items-center gap-3">
                <div className="h-11 w-11 animate-pulse rounded-full bg-[#eee7e3]" />

                <div className="space-y-2">
                  <div className="h-3 w-32 animate-pulse rounded bg-[#eee7e3]" />

                  <div className="h-2.5 w-48 animate-pulse rounded bg-[#f1ece9]" />
                </div>
              </div>

              <div className="h-6 w-16 animate-pulse rounded-full bg-[#eee7e3]" />

              <div className="h-6 w-16 animate-pulse rounded-full bg-[#eee7e3]" />

              <div className="h-3 w-24 animate-pulse rounded bg-[#eee7e3]" />

              <div className="h-7 w-10 animate-pulse rounded-full bg-[#eee7e3]" />

              <div className="flex gap-2">
                <div className="h-9 w-16 animate-pulse rounded-lg bg-[#eee7e3]" />

                <div className="h-9 w-24 animate-pulse rounded-lg bg-[#eee7e3]" />
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

/* ============================================================
   MOBILE SKELETON
============================================================ */

function MobileSkeleton() {
  return (
    <>
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="overflow-hidden rounded-2xl border border-[#e5dcd7] bg-white"
        >
          <div className="flex items-center gap-3 p-4">
            <div className="h-11 w-11 animate-pulse rounded-full bg-[#eee7e3]" />

            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 animate-pulse rounded bg-[#eee7e3]" />
              <div className="h-2.5 w-44 animate-pulse rounded bg-[#f1ece9]" />
            </div>
          </div>

          <div className="h-20 animate-pulse bg-[#faf7f5]" />

          <div className="h-12 animate-pulse bg-white" />
        </div>
      ))}
    </>
  );
}