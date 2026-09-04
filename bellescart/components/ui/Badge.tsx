import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'pink';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  dot?: boolean;
}

export default function Badge({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  dot = false
}: BadgeProps) {
  const variantStyles = {
    primary: 'bg-blue-100 text-blue-800 border-blue-200',
    secondary: 'bg-gray-100 text-gray-800 border-gray-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    danger: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    pink: 'bg-pink-100 text-pink-800 border-pink-200',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 border rounded-full font-semibold ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {dot && (
        <span className={`w-2 h-2 rounded-full ${
          variant === 'success' ? 'bg-green-500' :
          variant === 'warning' ? 'bg-amber-500' :
          variant === 'danger' ? 'bg-red-500' :
          variant === 'pink' ? 'bg-pink-500' :
          variant === 'info' ? 'bg-cyan-500' :
          'bg-blue-500'
        }`} />
      )}
      {children}
    </span>
  );
}
