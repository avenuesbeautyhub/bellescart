'use client';

import React, { useEffect, useState } from 'react';

interface LoadingOverlayProps {
  isVisible: boolean;
  onComplete?: () => void;
  message?: string;
}

export default function LoadingOverlay({ isVisible, onComplete, message = 'Loading...' }: LoadingOverlayProps) {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [isClosing, setIsClosing] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      setIsClosing(false);
      setProgress(0);

      // Animate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) return 100;
          return prev + 2;
        });
      }, 40);

      // Start closing animation after 2.5 seconds
      const timer = setTimeout(() => {
        setIsClosing(true);
        clearInterval(progressInterval);

        // Remove from DOM after animation completes
        const closeTimer = setTimeout(() => {
          setShouldRender(false);
          onComplete?.();
        }, 800);

        return () => clearTimeout(closeTimer);
      }, 2500);

      return () => {
        clearTimeout(timer);
        clearInterval(progressInterval);
      };
    }
  }, [isVisible, onComplete]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 z-50 flex flex-col items-center justify-center transition-all duration-800 ${
        isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Animated Logo */}
      <div
        className={`relative mb-8 transform transition-all duration-700 ${
          isClosing ? 'scale-50 opacity-0 translate-y-10' : 'scale-100 opacity-100 translate-y-0'
        }`}
      >
        <div className="relative">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl border border-white/30">
            <svg className="w-12 h-12 text-white animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.226.1l7 3a1 1 0 00.788 0l7-3a1 1 0 000-1.84l-5.38-2.31z" />
            </svg>
          </div>
          {/* Orbiting dots */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="absolute left-0 top-1/2 -translate-x-2 -translate-y-1/2 w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            <div className="absolute right-0 top-1/2 translate-x-2 -translate-y-1/2 w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.6s' }} />
          </div>
        </div>
      </div>

      {/* Welcome Text */}
      <div
        className={`text-center transform transition-all duration-700 delay-100 ${
          isClosing ? 'translate-y-10 opacity-0' : 'translate-y-0 opacity-100'
        }`}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
          BellesCart
        </h1>
        <p className="text-lg text-white/80 font-medium">{message}</p>
      </div>

      {/* Progress Bar */}
      <div
        className={`mt-8 w-64 transform transition-all duration-700 delay-200 ${
          isClosing ? 'translate-y-10 opacity-0' : 'translate-y-0 opacity-100'
        }`}
      >
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-white/70">
          <span>Initializing</span>
          <span>{progress}%</span>
        </div>
      </div>

      {/* Modern Loading Spinner */}
      <div
        className={`mt-8 transform transition-all duration-700 delay-300 ${
          isClosing ? 'scale-50 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-white/80 rounded-full border-t-transparent animate-spin"></div>
          <div className="absolute inset-2 border-4 border-white/30 rounded-full border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
      </div>
    </div>
  );
}
