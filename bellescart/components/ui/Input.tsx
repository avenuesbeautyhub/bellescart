import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export default function Input({ 
  label, 
  error, 
  helperText, 
  icon, 
  fullWidth = true,
  className = '', 
  ...props 
}: InputProps) {
  const baseInputStyles = 'w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 text-gray-900 placeholder-gray-400 transition-all duration-200';
  
  const stateStyles = error
    ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
    : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500 bg-white hover:border-gray-400';

  return (
    <div className={`mb-4 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          className={`${baseInputStyles} ${stateStyles} ${icon ? 'pl-10' : ''} ${className}`}
          {...props}
        />
      </div>
      {(error || helperText) && (
        <p className={`text-sm mt-1 ${error ? 'text-red-500' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
}
