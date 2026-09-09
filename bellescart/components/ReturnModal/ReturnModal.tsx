'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReturn: (reason: string) => void;
  isLoading?: boolean;
}

const RETURN_REASONS = [
  'Product damaged or defective',
  'Product not as described',
  'Wrong product received',
  'Product arrived too late',
  'No longer needed',
  'Changed mind',
  'Other'
];

export default function ReturnModal({ isOpen, onClose, onReturn, isLoading }: ReturnModalProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    const reason = selectedReason === 'Other' ? customReason : selectedReason;
    if (reason.trim()) {
      onReturn(reason);
    }
  };

  const handleClose = () => {
    setSelectedReason('');
    setCustomReason('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Return Order</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-gray-600 mb-4">
          Please select a reason for returning this order. The refund will be credited to your wallet.
        </p>

        <div className="space-y-3 mb-4">
          {RETURN_REASONS.map((reason) => (
            <label key={reason} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="returnReason"
                value={reason}
                checked={selectedReason === reason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-4 h-4 text-pink-600 border-gray-300 focus:ring-pink-500"
              />
              <span className="text-gray-700">{reason}</span>
            </label>
          ))}
        </div>

        {selectedReason === 'Other' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Please specify the reason
            </label>
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Enter your reason for return..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
        )}

        <div className="flex space-x-3">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !selectedReason || (selectedReason === 'Other' && !customReason.trim())}
            className="flex-1"
          >
            {isLoading ? 'Processing...' : 'Confirm Return'}
          </Button>
        </div>
      </div>
    </div>
  );
}