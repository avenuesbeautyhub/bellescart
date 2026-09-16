'use client';

import React from 'react';
import Link from 'next/link';
import { useSelectedLayoutSegments } from 'next/navigation';
import Button from '@/components/ui/Button';
import { useAdminAuthActions } from '@/auth/admin/actions';

const ADMIN_BASE = '/belles-portel-25';

const navLinks = [
  {
    label: 'Dashboard',
    href: `${ADMIN_BASE}/dashboard`,
    icon: 'dashboard',
  },
  {
    label: 'Products',
    href: `${ADMIN_BASE}/products`,
    icon: 'products',
  },
  {
    label: 'Categories',
    href: `${ADMIN_BASE}/categories`,
    icon: 'categories',
  },
  {
    label: 'Coupons',
    href: `${ADMIN_BASE}/coupons`,
    icon: 'coupons',
  },
  {
    label: 'Orders',
    href: `${ADMIN_BASE}/orders`,
    icon: 'orders',
  },
  {
    label: 'Users',
    href: `${ADMIN_BASE}/users`,
    icon: 'users',
  },
  {
    label: 'Privacy Requests',
    href: `${ADMIN_BASE}/privacy-requests`,
    icon: 'privacy',
  },
];

function formatSegment(segment: string) {
  return segment
    .replace(/-/g, ' ')
    .replace(/admin/i, 'Admin')
    .replace(/^./, char => char.toUpperCase());
}

function NavIcon({
  type,
  className = 'h-4 w-4',
}: {
  type: string;
  className?: string;
}) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (type) {
    case 'dashboard':
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <rect {...common} x="4" y="4" width="6" height="6" rx="1" />
          <rect {...common} x="14" y="4" width="6" height="6" rx="1" />
          <rect {...common} x="4" y="14" width="6" height="6" rx="1" />
          <rect {...common} x="14" y="14" width="6" height="6" rx="1" />
        </svg>
      );

    case 'products':
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <path {...common} d="m21 8-9 5-9-5 9-5 9 5Z" />
          <path {...common} d="M3 8v9l9 5 9-5V8" />
          <path {...common} d="M12 13v9" />
        </svg>
      );

    case 'categories':
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <rect {...common} x="4" y="4" width="6" height="6" rx="1" />
          <rect {...common} x="14" y="4" width="6" height="6" rx="1" />
          <rect {...common} x="4" y="14" width="6" height="6" rx="1" />
          <rect {...common} x="14" y="14" width="6" height="6" rx="1" />
        </svg>
      );

    case 'coupons':
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <path
            {...common}
            d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7Z"
          />
          <path {...common} d="M9 9h6M9 15h6" />
        </svg>
      );

    case 'orders':
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <path {...common} d="M6 3h12v18H6z" />
          <path {...common} d="M9 7h6M9 11h6M9 15h3" />
        </svg>
      );

    case 'users':
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <circle {...common} cx="9" cy="8" r="3" />
          <path {...common} d="M3 20v-1a6 6 0 0 1 12 0v1" />
          <path
            {...common}
            d="M16 5.5a3 3 0 0 1 0 5.8M18 20v-1a5.5 5.5 0 0 0-2.5-4.6"
          />
        </svg>
      );

    case 'privacy':
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <path {...common} d="M12 3l7 4v5c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V7l7-4z" />
        </svg>
      );

    default:
      return null;
  }
}

function ChevronDown() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-3.5 w-3.5"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        d="m6 9 6 6 6-6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path
        d="M10 17l5-5-5-5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M15 12H3" strokeLinecap="round" />
      <path
        d="M21 19V5a2 2 0 0 0-2-2h-5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function AdminHeader() {
  const segments = useSelectedLayoutSegments();
  const { adminLogout } = useAdminAuthActions();

  if (segments.length === 0) {
    return null;
  }

  const currentPath = `/${segments.join('/')}`;

  const isActive = (href: string) => {
    const hrefPath = href.replace(ADMIN_BASE, '');

    if (hrefPath === '/dashboard') {
      return currentPath === '/dashboard';
    }

    return (
      currentPath === hrefPath ||
      currentPath.startsWith(`${hrefPath}/`)
    );
  };

  const currentSection =
    navLinks.find(link => isActive(link.href))?.label || 'Admin';

  return (
    <header className="sticky top-0 z-50 border-b border-[#e8dfe1] bg-white/95 shadow-[0_4px_20px_rgba(53,35,46,0.05)] backdrop-blur-xl">

      {/* =========================================================
          MAIN HEADER
      ========================================================== */}
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">

        <div className="flex min-h-[70px] items-center justify-between gap-4">

          {/* Brand */}
          <Link
            href={`${ADMIN_BASE}/dashboard`}
            className="group flex shrink-0 items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#35232e] shadow-sm transition-transform duration-200 group-hover:scale-105">
              <span className="font-serif text-lg italic text-[#f5dce3]">
                B
              </span>
            </div>

            <div className="hidden sm:block">
              <div className="font-serif text-xl tracking-wide text-[#30222b]">
                BellesCart
              </div>

              <div className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.25em] text-[#9b7b86]">
                Admin Console
              </div>
            </div>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-1 xl:flex">
            {navLinks.map(link => {
              const active = isActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group relative flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 ${
                    active
                      ? 'bg-[#f3e9ed] text-[#5d3d4b]'
                      : 'text-[#766a71] hover:bg-[#faf7f8] hover:text-[#35232e]'
                  }`}
                >
                  <NavIcon
                    type={link.icon}
                    className={`h-4 w-4 ${
                      active
                        ? 'text-[#785260]'
                        : 'text-[#9d9197] group-hover:text-[#694653]'
                    }`}
                  />

                  {link.label}

                  {active && (
                    <span className="absolute bottom-1 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-[#a86f80]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">

            {/* Current section on tablet/mobile */}
            <div className="hidden items-center gap-1.5 rounded-xl bg-[#faf7f8] px-3 py-2 text-xs font-semibold text-[#694653] md:flex xl:hidden">
              <span className="h-1.5 w-1.5 rounded-full bg-[#b8798b]" />
              {currentSection}
            </div>

            {/* Store */}
            <Link
              href="/"
              target="_blank"
              className="hidden h-10 items-center gap-2 rounded-xl border border-[#e4dadd] bg-white px-3.5 text-xs font-semibold text-[#66565e] transition hover:border-[#cdbac1] hover:bg-[#faf7f8] sm:flex"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-4 w-4"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path
                  d="M3 10h18M5 10v9h14v-9M4 10l1.5-5h13L20 10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M9 19v-5h6v5" strokeLinecap="round" />
              </svg>
              Store
            </Link>

            {/* Logout */}
            <Button
              variant="outline"
              size="sm"
              onClick={adminLogout}
              className="!h-10 !rounded-xl !border-[#e4dadd] !px-3.5 !text-xs !font-semibold !text-[#66565e] transition-all duration-200 hover:!border-red-200 hover:!bg-red-50 hover:!text-red-600"
            >
              <span className="flex items-center gap-2">
                <LogoutIcon />
                <span className="hidden sm:inline">Logout</span>
              </span>
            </Button>

            {/* Mobile menu indicator */}
            <details className="relative xl:hidden">
              <summary className="flex h-10 cursor-pointer list-none items-center justify-center rounded-xl border border-[#e4dadd] bg-white px-3 text-[#66565e] transition hover:bg-[#faf7f8] [&::-webkit-details-marker]:hidden">
                <ChevronDown />
              </summary>

              <div className="absolute right-0 top-12 w-64 overflow-hidden rounded-2xl border border-[#e5dadd] bg-white p-2 shadow-[0_18px_50px_rgba(53,35,46,0.14)]">
                <div className="px-3 py-2">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#a08f97]">
                    Administration
                  </p>
                </div>

                {navLinks.map(link => {
                  const active = isActive(link.href);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                        active
                          ? 'bg-[#f3e9ed] text-[#5d3d4b]'
                          : 'text-[#70646b] hover:bg-[#faf7f8] hover:text-[#35232e]'
                      }`}
                    >
                      <NavIcon
                        type={link.icon}
                        className="h-4 w-4"
                      />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </details>
          </div>
        </div>

        {/* =========================================================
            BREADCRUMB
        ========================================================== */}
        <div className="hidden items-center gap-2 border-t border-[#f0e8ea] py-2.5 text-[10px] md:flex">
          <Link
            href={`${ADMIN_BASE}/dashboard`}
            className="font-semibold text-[#9b8c93] transition hover:text-[#694653]"
          >
            Admin
          </Link>

          {segments.map((segment, index) => (
            <React.Fragment key={`${segment}-${index}`}>
              <span className="text-[#c7bcc1]">/</span>

              <span
                className={
                  index === segments.length - 1
                    ? 'font-semibold text-[#5f4c55]'
                    : 'text-[#9b8c93]'
                }
              >
                {formatSegment(segment)}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </header>
  );
}