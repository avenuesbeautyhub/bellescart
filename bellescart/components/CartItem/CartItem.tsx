'use client';

import React from 'react';
import Image from 'next/image';
import { CartItem as CartItemType } from '@/utils/types';
import Button from '@/components/ui/Button';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export default function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemProps) {
  return (
    <div className="flex gap-4 bg-white p-4 rounded-lg border border-gray-200">
      <Image
        src={item.image}
        alt={item.name}
        width={120}
        height={120}
        className="object-cover rounded-md"
      />

      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
        <p className="text-gray-600 mt-1">₹{item.price.toFixed(2)}</p>

        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
              className="px-3 py-1 text-gray-600 hover:bg-gray-100"
            >
              -
            </button>
            <span className="px-4 py-1 border-l border-r border-gray-300">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="px-3 py-1 text-gray-600 hover:bg-gray-100"
            >
              +
            </button>
          </div>

          <Button
            variant="danger"
            size="sm"
            onClick={() => onRemove(item.id)}
          >
            Remove
          </Button>
        </div>
      </div>

      <div className="text-right">
        <p className="text-xl font-bold text-gray-900">
          ₹{(item.price * item.quantity).toFixed(2)}
        </p>
      </div>
    </div>
  );
}
