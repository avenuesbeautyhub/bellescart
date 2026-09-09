'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAnimating, setIsAnimating] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [pathname, isReady]);

  if (!isReady) {
    return <div className="min-h-screen bg-white">{children}</div>;
  }

  return (
    <div
      className={`min-h-screen transition-opacity duration-100 ease-out ${
        isAnimating ? 'opacity-95' : 'opacity-100'
      }`}
    >
      {children}
    </div>
  );
}
