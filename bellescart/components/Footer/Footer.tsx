'use client';
import React from 'react';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-black text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold text-pink-400 mb-4">BellesCart</h3>
            <p className="text-sm">
              Your ultimate destination for quality products and exceptional shopping experience.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="hover:text-white transition">
                  Shop Now
                </Link>
              </li>
              <li>
                <Link href="/offers" className="hover:text-white transition">
                  Offers
                </Link>
              </li>
              <li>
                <Link href="/new-arrivals" className="hover:text-white transition">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/best-sellers" className="hover:text-white transition">
                  Best Sellers
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-white transition">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-white transition">
                  Returns & Refunds
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Newsletter</h4>
            <p className="text-sm mb-3">Subscribe to our newsletter for exclusive offers</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-2 bg-gray-800 text-white rounded-md sm:rounded-l-md focus:outline-none focus:ring-2 focus:ring-pink-500 min-w-0"
              />
              <button className="px-4 py-2 bg-pink-500 text-white rounded-md sm:rounded-r-md hover:bg-pink-600 transition whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-center sm:text-left">
            &copy; 2024 BellesCart. All rights reserved. Belles Avenue &copy;
          </p>
          <div className="flex gap-4 flex-wrap justify-center">
            <Link href="/privacy" className="text-sm hover:text-white transition">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm hover:text-white transition">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}