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
}

export default function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
  isUpdating = false,
}: CartItemProps) {
  // Handle both id and _id for compatibility
  const itemId = item._id;

  // Handle image display - check for images array or single image
  const imageUrl = item.images && item.images.length > 0
    ? item.images.find(img => img.isMain)?.url || item.images[0].url
    : item.image || '';

  // Get available stock and cart quantity
  const cartQuantity = item.cartQuantity || item.quantity || 0;
  const availableStock = item.stock || 0;
  const isOutOfStock = availableStock === 0;
  const isLowStock = availableStock > 0 && availableStock < 5;

  return (
    <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg border border-gray-200">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={item.name}
          width={120}
          height={120}
          className="object-cover rounded-md w-full sm:w-[120px] h-auto sm:h-[120px]"
        />
      ) : (
        <div className="w-full sm:w-[120px] h-[120px] bg-gray-200 rounded-md flex items-center justify-center">
          <span className="text-gray-400 text-sm">No Image</span>
        </div>
      )}

      <div className="flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
          <p className="text-gray-600 mt-1">₹{(item.price || 0).toFixed(2)}</p>

          {/* Stock status */}
          {isOutOfStock ? (
            <p className="text-red-600 text-sm mt-1 font-medium">Out of Stock</p>
          ) : isLowStock ? (
            <p className="text-orange-600 text-sm mt-1 font-medium">Only {availableStock} left!</p>
          ) : (
            <p className="text-green-600 text-sm mt-1">In Stock ({availableStock} available)</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-4">
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() => onUpdateQuantity(itemId, Math.max(1, cartQuantity - 1))}
              disabled={isOutOfStock || isUpdating || cartQuantity <= 1}
              className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              -
            </button>
            <span className="px-4 text-yellow-900 py-1 border-l border-r border-gray-300">
              {cartQuantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(itemId, Math.min(cartQuantity + 1, availableStock))}
              disabled={isOutOfStock || cartQuantity >= availableStock - 1 || isUpdating}
              className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>

          <Button
            variant="danger"
            size="sm"
            onClick={() => onRemove(itemId)}
            className="w-full sm:w-auto"
          >
            Remove
          </Button>
        </div>
      </div>

      <div className="text-right sm:text-left">
        <p className="text-xl font-bold text-gray-900">
          ₹{((item.price || 0) * cartQuantity).toFixed(2)}
        </p>
      </div>
    </div>
  );
}