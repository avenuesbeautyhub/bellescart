'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';

interface AdminThemeContextType {
  effectiveTheme: 'light';
}

const AdminThemeContext = createContext<AdminThemeContextType | undefined>(undefined);

function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const forceLightTheme = () => {
      const html = document.documentElement;
      const body = document.body;
      
      // Remove both classes first
      html.classList.remove('light', 'dark');
      body.classList.remove('light', 'dark');
      
      // Always add light theme
      html.classList.add('light');
      body.classList.add('light');
      
      // Also override CSS variables to ensure light theme
      html.style.setProperty('--background', '#ffffff');
      html.style.setProperty('--foreground', '#000000');
    };

    // Apply immediately
    forceLightTheme();

    // Continuously enforce light theme to override any user theme changes
    intervalRef.current = setInterval(forceLightTheme, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <AdminThemeContext.Provider value={{ effectiveTheme: 'light' }}>
      {children}
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const context = useContext(AdminThemeContext);
  if (context === undefined) {
    throw new Error('useAdminTheme must be used within an AdminThemeProvider');
  }
  return context;
}

export default AdminThemeProvider;
