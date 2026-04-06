'use client';

import React, { useEffect, useState } from 'react';

interface LoadingOverlayProps {
  isVisible: boolean;
  onComplete?: () => void;
}

export default function LoadingOverlay({ isVisible, onComplete }: LoadingOverlayProps) {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      setIsClosing(false);

      // Start closing animation after 2 seconds
      const timer = setTimeout(() => {
        setIsClosing(true);

        // Remove from DOM after animation completes
        const closeTimer = setTimeout(() => {
          setShouldRender(false);
          onComplete?.();
        }, 600);

        return () => clearTimeout(closeTimer);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 bg-gradient-to-br from-pink-500 via-pink-400 to-pink-600 z-50 flex flex-col items-center justify-center transition-opacity duration-600 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Animated Logo/Icon */}
      <div
        className={`mb-8 transform transition-all duration-600 ${
          isClosing ? 'scale-75 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        <div className="text-6xl mb-4 animate-bounce">💎</div>
      </div>

      {/* Welcome Text */}
      <div
        className={`text-center transform transition-all duration-600 ${
          isClosing ? 'translate-y-10 opacity-0' : 'translate-y-0 opacity-100'
        }`}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Welcome Back!</h1>
        <p className="text-xl text-pink-100">Entering your dashboard...</p>
      </div>

      {/* Loading Spinner */}
      <div
        className={`mt-8 w-16 h-16 border-4 border-white border-t-pink-200 rounded-full animate-spin transform transition-opacity duration-600 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Animated Background Circle */}
      <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" />
      </div>
    </div>
  );
}
