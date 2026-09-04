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
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Trigger animation after a short delay
      const timer = setTimeout(() => setShowContent(true), 100);
      const sparklesTimer = setTimeout(() => setShowSparkles(true), 300);
      const confettiTimer = setTimeout(() => setShowConfetti(true), 500);

      // Progress animation
      const progressTimer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressTimer);
            return 100;
          }
          return prev + 1.5;
        });
      }, 60);

      // Auto-dismiss after 4 seconds
      const dismissTimer = setTimeout(() => {
        // Mark welcome as shown
        localStorage.setItem('welcomeShown', 'true');
        onComplete();
      }, 4000);

      return () => {
        clearTimeout(timer);
        clearTimeout(sparklesTimer);
        clearTimeout(confettiTimer);
        clearTimeout(dismissTimer);
        clearInterval(progressTimer);
      };
    } else {
      setShowContent(false);
      setShowSparkles(false);
      setProgress(0);
      setShowConfetti(false);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-pink-600 via-rose-500 to-purple-600 flex items-center justify-center z-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating circles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`circle-${i}`}
            className="absolute rounded-full bg-white/10 blur-2xl animate-pulse"
            style={{
              width: `${100 + Math.random() * 200}px`,
              height: `${100 + Math.random() * 200}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
        
        {/* Sparkle particles */}
        {[...Array(30)].map((_, i) => (
          <div
            key={`sparkle-${i}`}
            className="absolute w-2 h-2 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random() * 2}s`,
              opacity: Math.random() * 0.6 + 0.2
            }}
          />
        ))}
      </div>

      <div className={`relative text-center transform transition-all duration-1000 ${showContent ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        }`}>
        {/* Confetti effect */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={`confetti-${i}`}
                className="absolute w-3 h-3 animate-bounce"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 1}s`,
                  backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'][Math.floor(Math.random() * 5)],
                  borderRadius: Math.random() > 0.5 ? '50%' : '0'
                }}
              />
            ))}
          </div>
        )}

        {/* Main Welcome Card */}
        <div className="bg-white/10 backdrop-blur-xl text-white px-8 md:px-16 py-10 md:py-12 rounded-3xl shadow-2xl border border-white/20 relative overflow-hidden">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-rose-500/20 animate-gradient-x"></div>
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>

          <div className="relative flex flex-col md:flex-row items-center gap-6 md:gap-8">
            {/* Animated icon */}
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-lg">
              <svg className="w-10 h-10 text-white animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.226.1l7 3a1 1 0 00.788 0l7-3a1 1 0 000-1.84l-5.38-2.31z" />
              </svg>
            </div>

            <div className="text-left">
              <h2 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-white to-pink-100 bg-clip-text text-transparent">
                Welcome back{userName ? `, ${userName}` : ''}!
              </h2>
              <p className="text-white/90 text-lg">
                Great to see you again at BellesCart
              </p>
              <p className="text-white/70 text-sm mt-1">
                Your premium shopping experience awaits
              </p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-8 w-72 md:w-80 mx-auto">
          <div className="text-center mb-3">
            <p className="text-white/80 text-sm font-medium">Preparing your personalized experience...</p>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden backdrop-blur-sm">
            <div
              className="h-full bg-gradient-to-r from-white via-pink-200 to-white rounded-full transition-all duration-300 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-0 w-full h-full bg-gradient-to-r from-transparent to-white/50 animate-shimmer"></div>
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-white/60">Loading</span>
            <span className="text-xs text-white font-medium">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Feature badges */}
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 flex gap-2 md:gap-3">
          <div className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full animate-bounce border border-white/30" style={{ animationDelay: '0.2s' }}>
            ✨ New Arrivals
          </div>
          <div className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full animate-bounce border border-white/30" style={{ animationDelay: '0.4s' }}>
            🎁 Special Offers
          </div>
          <div className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full animate-bounce border border-white/30" style={{ animationDelay: '0.6s' }}>
            💎 Premium Quality
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default WelcomeOverlay;
