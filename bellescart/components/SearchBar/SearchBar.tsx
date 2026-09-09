'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
  autoFocus?: boolean;
  realTime?: boolean; // Enable real-time search with debounce
  debounceMs?: number; // Debounce delay in milliseconds
  value?: string; // Controlled value
  onChange?: (value: string) => void; // Controlled change handler
}

export default function SearchBar({
  className = '',
  placeholder = 'Search products...',
  onSearch,
  autoFocus = false,
  realTime = false,
  debounceMs = 300,
  value: controlledValue,
  onChange: controlledOnChange
}: SearchBarProps) {
  const router = useRouter();
  const isControlled = controlledValue !== undefined && controlledOnChange !== undefined;
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const searchQuery = isControlled ? controlledValue : internalSearchQuery;
  const setSearchQuery = isControlled ? controlledOnChange : setInternalSearchQuery;

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
    // Only initialize from URL if not controlled
    if (!isControlled) {
      const urlParams = new URLSearchParams(window.location.search);
      const searchParam = urlParams.get('search');
      if (searchParam) {
        setInternalSearchQuery(searchParam);
        setDebouncedQuery(searchParam);
      }
    }
  }, [isControlled]);

  // Debounce search query for real-time search
  useEffect(() => {
    if (!realTime) return;
    
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      if (onSearch && searchQuery.trim()) {
        onSearch(searchQuery.trim());
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchQuery, realTime, debounceMs, onSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (onSearch) {
        onSearch(searchQuery.trim());
      } else {
        router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      }
      if (!realTime) {
        setSearchQuery('');
      }
    }
  };

  if (!mounted) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full px-4 py-2 pl-10 bg-gray-100 border border-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSearch} className={`relative ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        autoFocus={autoFocus}
        className="w-full px-4 py-2 pl-10 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-black"
      />
      <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </form>
  );
}
