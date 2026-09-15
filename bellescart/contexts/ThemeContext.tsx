'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  effectiveTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children, initialTheme }: { children: React.ReactNode; initialTheme?: Theme | null | undefined }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // For authenticated users: prioritize server preferences (initialTheme) over localStorage
    if (initialTheme !== null && initialTheme !== undefined) {
      console.log('ThemeProvider: Initializing with server theme:', initialTheme);
      return initialTheme;
    }
    // For unauthenticated users or when initialTheme is null: use localStorage or default
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('bellescart_theme') as Theme;
      if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
        console.log('ThemeProvider: Initializing with localStorage theme:', savedTheme);
        return savedTheme;
      }
    }
    console.log('ThemeProvider: Initializing with default theme: auto');
    return 'auto';
  });
  
  // Add a ref to track if we've applied the initial theme
  const hasAppliedInitialTheme = useRef(false);
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

  // Sync theme state when initialTheme prop changes (from UserPreferencesProvider)
  // Only update from initialTheme if we haven't applied it yet
  useEffect(() => {
    if (initialTheme !== null && initialTheme !== undefined && !hasAppliedInitialTheme.current) {
      console.log('ThemeProvider: Applying initial theme from server:', initialTheme);
      setThemeState(initialTheme);
      localStorage.setItem('bellescart_theme', initialTheme);
      hasAppliedInitialTheme.current = true;
    } else if (initialTheme === null) {
      // User is not authenticated, clear localStorage and reset to default
      console.log('ThemeProvider: User not authenticated, resetting to default theme');
      setThemeState('auto');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('bellescart_theme');
      }
      hasAppliedInitialTheme.current = false;
    }
  }, [initialTheme]);

  // Apply theme to document
  useEffect(() => {
    const applyTheme = () => {
      let resolvedTheme: 'light' | 'dark';

      if (theme === 'auto') {
        // Use time-based theme switching
        const hour = new Date().getHours();
        // Day time: 6 AM to 6 PM (6:00 - 18:00) → Light theme
        // Night time: 6 PM to 6 AM (18:00 - 6:00) → Dark theme
        resolvedTheme = (hour >= 6 && hour < 18) ? 'light' : 'dark';
        console.log('Auto theme based on time:', hour, '→', resolvedTheme);
      } else {
        resolvedTheme = theme;
      }

      setEffectiveTheme(resolvedTheme);

      // Apply theme class to html element for CSS variable application
      const html = document.documentElement;
      const body = document.body;
      
      // Remove both classes first
      html.classList.remove('light', 'dark');
      body.classList.remove('light', 'dark');
      
      // Add the resolved theme class
      html.classList.add(resolvedTheme);
      body.classList.add(resolvedTheme);

      console.log('Theme applied to document:', resolvedTheme);
    };

    applyTheme();

    // Set up interval to check time every minute when in auto mode
    let timeCheckInterval: NodeJS.Timeout | null = null;
    if (theme === 'auto' && typeof window !== 'undefined') {
      timeCheckInterval = setInterval(() => {
        applyTheme();
      }, 60000); // Check every minute
    }

    return () => {
      if (timeCheckInterval) {
        clearInterval(timeCheckInterval);
      }
    };
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    console.log('Setting theme to:', newTheme);
    setThemeState(newTheme);
    // Save to localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('bellescart_theme', newTheme);
    }
  }, []);



  // Listen for localStorage changes (e.g., from other tabs or server updates)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'bellescart_theme' && e.newValue) {
        const newTheme = e.newValue as Theme;
        if (['light', 'dark', 'auto'].includes(newTheme)) {
          setThemeState(newTheme);
        }
      }
    };

    // Listen for custom events (same-tab updates from server preferences)
    const handleCustomThemeChange = (e: CustomEvent) => {
      console.log('Theme context received custom event:', e.detail);
      const newTheme = e.detail as Theme;
      if (['light', 'dark', 'auto'].includes(newTheme)) {
        console.log('Setting theme from custom event:', newTheme);
        setThemeState(newTheme);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('bellescart_theme_change', handleCustomThemeChange as EventListener);
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('bellescart_theme_change', handleCustomThemeChange as EventListener);
      };
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}