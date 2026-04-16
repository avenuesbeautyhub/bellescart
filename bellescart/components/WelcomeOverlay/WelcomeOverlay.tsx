'use client';

import React, { useEffect, useState } from 'react';

interface WelcomeOverlayProps {
  isVisible: boolean;
  onComplete: () => void;
  userName?: string;
}

const WelcomeOverlay: React.FC<WelcomeOverlayProps> = ({
  isVisible,
  onComplete,
  userName
}) => {
  const [showContent, setShowContent] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isVisible) {
      // Trigger animation after a short delay
      const timer = setTimeout(() => setShowContent(true), 100);
      const sparklesTimer = setTimeout(() => setShowSparkles(true), 300);

      // Progress animation
      const progressTimer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressTimer);
            return 100;
          }
          return prev + 2;
        });
      }, 50);

      // Auto-dismiss after 3.5 seconds
      const dismissTimer = setTimeout(() => {
        // Mark welcome as shown
        localStorage.setItem('welcomeShown', 'true');
        onComplete();
      }, 3500);

      return () => {
        clearTimeout(timer);
        clearTimeout(sparklesTimer);
        clearTimeout(dismissTimer);
        clearInterval(progressTimer);
      };
    } else {
      setShowContent(false);
      setShowSparkles(false);
      setProgress(0);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center z-50">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-pink-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className={`relative text-center transform transition-all duration-1000 ${showContent ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
        }`}>
        {/* Sparkle effects */}
        {showSparkles && (
          <>
            <div className="absolute -top-4 -left-4 text-yellow-400 animate-bounce" style={{ animationDelay: '0.2s' }}> sparkle </div>
            <div className="absolute -top-4 -right-4 text-yellow-400 animate-bounce" style={{ animationDelay: '0.4s' }}> sparkle </div>
            <div className="absolute -bottom-4 -left-4 text-yellow-400 animate-bounce" style={{ animationDelay: '0.6s' }}> sparkle </div>
            <div className="absolute -bottom-4 -right-4 text-yellow-400 animate-bounce" style={{ animationDelay: '0.8s' }}> sparkle </div>
          </>
        )}

        {/* Main Welcome Card */}
        <div className="bg-gradient-to-r from-pink-500 via-pink-600 to-pink-500 text-white px-12 py-8 rounded-3xl shadow-2xl border border-pink-400 relative overflow-hidden">
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shimmer"></div>

          <div className="relative flex items-center gap-6">
            {/* Animated icon */}
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white border-opacity-30">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full animate-pulse"></div>
            </div>

            <div className="text-left">
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-pink-100 bg-clip-text text-transparent">
                Welcome back{userName ? `, ${userName}` : ''}!
              </h2>
              <p className="text-pink-100 text-lg">
                Great to see you again at BellesCart
              </p>
              <p className="text-pink-200 text-sm mt-1">
                Your favorite jewelry destination awaits
              </p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6 w-64 mx-auto">
          <div className="text-center mb-2">
            <p className="text-pink-300 text-sm font-medium">Preparing your experience...</p>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-pink-400 rounded-full transition-all duration-300 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-0 w-full h-full bg-gradient-to-r from-transparent to-white opacity-30 animate-shimmer"></div>
            </div>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-400">Loading</span>
            <span className="text-xs text-pink-400 font-medium">{progress}%</span>
          </div>
        </div>

        {/* Floating badges */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex gap-2">
          <div className="bg-green-500 text-white text-xs px-3 py-1 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}>
            New arrivals
          </div>
          <div className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}>
            Special offers
          </div>
          <div className="bg-purple-500 text-white text-xs px-3 py-1 rounded-full animate-bounce" style={{ animationDelay: '0.7s' }}>
            Premium quality
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default WelcomeOverlay;
