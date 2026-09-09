'use client';

import React from 'react';
import Image from 'next/image';
import { CartItem as CartItemType } from '@/utils/types';
import Button from '@/components/ui/Button';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  isUpdating?: boolean;
  stockValidation?: {
    valid: boolean;
    outOfStockItems: Array<{ productId: string; productName: string; requestedQuantity: number; availableQuantity: number }>;
    message: string;
  };
}

export default function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
  isUpdating = false,
  stockValidation,
}: CartItemProps) {
  // Handle both id and _id for compatibility
  const itemId = item._id;

  // Handle image display - check for images array or single image
  const images = item.product?.images ?? item.images;
  const image = item.product?.image ?? item.image;
  const imageUrl = images && images.length > 0
    ? images.find(img => img.isMain)?.url ?? images[0].url
    : image ?? '';

  // Get available stock and cart quantity
  const cartQuantity = item.cartQuantity ?? item.quantity ?? 0;
  const availableStock = item.stock ?? item.product?.quantity ?? 0;
  
  // Check if this specific item is out of stock based on validation
  const productId = item.product?._id ?? item._id;
  const stockIssue = stockValidation?.outOfStockItems?.find(
    issue => issue.productId === productId
  );
  const actualAvailableStock = stockIssue ? stockIssue.availableQuantity : availableStock;
  const isOutOfStock = actualAvailableStock === 0 || actualAvailableStock < cartQuantity;
  const isLowStock = actualAvailableStock > 0 && actualAvailableStock < 5;

  return (
    <div className="flex flex-col sm:flex-row gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
      {/* Product Image */}
      <div className="relative">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={item.product?.name ?? item.name ?? 'Product'}
            width={120}
            height={120}
            className="object-cover rounded-xl w-full sm:w-[120px] h-auto sm:h-[120px] shadow-sm"
          />
        ) : (
          <div className="w-full sm:w-[120px] h-[120px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Stock indicator badge */}
        {isOutOfStock && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {stockIssue ? `${actualAvailableStock} Left` : 'Out of Stock'}
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 hover:text-pink-600 transition-colors cursor-pointer">
            {item.product?.name ?? item.name}
          </h3>
          
          {/* Category if available */}
          {(item.product?.category ?? item.category) && (
            <p className="text-sm text-pink-500 font-medium mt-1">
              {(item.product?.category ?? item.category).name}
            </p>
          )}
          
          <div className="flex items-center gap-3 mt-2">
            <p className="text-2xl font-bold text-gray-900">₹{((item.product?.price ?? item.price) ?? 0).toFixed(2)}</p>
            {(item.product?.originalPrice ?? item.originalPrice) && (
              <p className="text-sm text-gray-400 line-through">
                ₹{((item.product?.originalPrice ?? item.originalPrice) ?? 0).toFixed(2)}
              </p>
            )}
          </div>

          {/* Stock status */}
          <div className="mt-3">
            {isOutOfStock ? (
              <div className="flex items-center gap-2 text-red-500">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">
                  {stockIssue ? `Out of Stock (Only ${actualAvailableStock} available)` : 'Out of Stock'}
                </span>
              </div>
            ) : isLowStock ? (
              <div className="flex items-center gap-2 text-orange-500">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Only {actualAvailableStock} left!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-500">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">In Stock ({actualAvailableStock} available)</span>
              </div>
            )}
          </div>
        </div>

        {/* Quantity Controls and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-6">
          <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => onUpdateQuantity(itemId, Math.max(1, cartQuantity - 1))}
              disabled={isOutOfStock || isUpdating || cartQuantity <= 1}
              className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              −
            </button>
            <span className="px-6 py-2.5 text-gray-900 font-semibold border-l border-r border-gray-200 min-w-[60px] text-center">
              {cartQuantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(itemId, Math.min(cartQuantity + 1, actualAvailableStock))}
              disabled={isOutOfStock || cartQuantity >= actualAvailableStock || isUpdating}
              className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              +
            </button>
          </div>

          <button
            onClick={() => onRemove(itemId)}
            disabled={isUpdating}
            className="flex items-center gap-2 px-4 py-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Remove
          </button>
        </div>
      </div>

      {/* Total Price */}
      <div className="text-right sm:text-left sm:min-w-[120px]">
        <p className="text-sm text-gray-500 mb-1">Subtotal</p>
        <p className="text-2xl font-bold text-gray-900">
          ₹{(((item.product?.price ?? item.price) ?? 0) * cartQuantity).toFixed(2)}
        </p>
      </div>
    </div>
  );
}