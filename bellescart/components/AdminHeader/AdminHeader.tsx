'use client';

import Link from 'next/link';
import { useSelectedLayoutSegments } from 'next/navigation';

const navLinks = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Products', href: '/admin/products' },
  { label: 'Categories', href: '/admin/categories' },
  { label: 'Orders', href: '/admin/orders' },
  { label: 'Users', href: '/admin/users' },
];

function formatSegment(segment: string) {
  return segment
    .replace(/-/g, ' ')
    .replace(/admin/i, 'Admin')
    .replace(/^./, char => char.toUpperCase());
}

export default function AdminHeader() {
  const segments = useSelectedLayoutSegments();
  const activeSegment = segments[segments.length - 1] || '';

  if (segments.length === 0) {
    return null;
  }

  return (
    <header className="bg-black text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Link href="/admin/dashboard" className="text-xl font-bold text-pink-500 hover:text-pink-400">
            BellesCart Admin
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-300">
            <span>Admin</span>
            {segments.map((segment, index) => (
              <span key={`${segment}-${index}`} className="flex items-center gap-2">
                <span className="text-gray-500">/</span>
                <span>{formatSegment(segment)}</span>
              </span>
            ))}
          </div>
        </div>

        <nav className="flex flex-wrap gap-2">
          {navLinks.map(link => {
            const isActive = link.href.includes(activeSegment);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
