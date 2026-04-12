'use client';

import React, { useEffect, useState } from 'react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return 'success: "Success"';
      case 'error':
        return 'error: "Error"';
      case 'warning':
        return 'warning: "Warning"';
      case 'info':
        return 'info: "Info"';
      default:
        return 'info: "Info"';
    }
  };

  return (
    <div
      className={`flex items-center p-4 mb-4 border rounded-lg shadow-lg animate-pulse ${getToastStyles()}`}
      style={{ animation: 'slideIn 0.3s ease-out' }}
    >
      <div className="flex-1">
        <h4 className="font-semibold">{toast.title}</h4>
        {toast.message && <p className="text-sm mt-1">{toast.message}</p>}
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="ml-4 text-lg leading-none hover:opacity-70"
      >
        ×
      </button>
    </div>
  );
};

export default Toast;
