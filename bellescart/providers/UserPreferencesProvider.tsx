'use client';

import { useEffect, useState } from 'react';
import { useUserPreferences } from '@/hooks/user/useUserPreferencesQueries';
import { useUserAuth } from '@/auth/user';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { UserPreferences } from '@/types/auth';
import { useQueryClient } from '@tanstack/react-query';
import { userPreferencesKeys } from '@/hooks/user/useUserPreferencesQueries';

type Theme = 'light' | 'dark' | 'auto';
type Language = 'en' | 'hi' | 'ml';

interface UserPreferencesProviderProps {
  children: React.ReactNode;
}

export function UserPreferencesProvider({ children }: UserPreferencesProviderProps) {
  const { loaded, isAuthenticated } = useUserAuth();
  const queryClient = useQueryClient();
  
  const [initialTheme, setInitialTheme] = useState<Theme | null>(() => {
    // Don't initialize from localStorage - let contexts handle it
    // We'll set this from backend when loaded
    return null;
  });

  const [initialLanguage, setInitialLanguage] = useState<Language | null>(() => {
    // Don't initialize from localStorage - let contexts handle it
    // We'll set this from backend when loaded
    return null;
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const [delayedFetchEnabled, setDelayedFetchEnabled] = useState(false);

  // Delay preferences fetch to prevent rate limiting
  useEffect(() => {
    if (isAuthenticated && loaded) {
      const timer = setTimeout(() => {
        setDelayedFetchEnabled(true);
      }, 800); // 800ms delay for preferences
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, loaded]);

  const { data: preferencesData, isLoading } = useUserPreferences({
    enabled: isAuthenticated && loaded && delayedFetchEnabled, // Stagger this query
  });

  useEffect(() => {
    if (preferencesData?.data && !isInitialized) {
      console.log('UserPreferencesProvider: Loading preferences from backend:', preferencesData.data);
      
      // Set initial theme from backend
      if (preferencesData.data.theme) {
        const theme = preferencesData.data.theme as Theme;
        setInitialTheme(theme);
        console.log('UserPreferencesProvider: Set initial theme from backend:', theme);
      }
      
      // Set initial language from backend with fallback for old language codes
      if (preferencesData.data.language) {
        const backendLanguage = preferencesData.data.language;
        // Map old language codes to new ones, default to 'en'
        const validLanguages: Language[] = ['en', 'hi', 'ml'];
        const language = validLanguages.includes(backendLanguage as Language) 
          ? backendLanguage as Language 
          : 'en';
        setInitialLanguage(language);
        console.log('UserPreferencesProvider: Set initial language from backend:', language, '(original:', backendLanguage, ')');
      }
      
      setIsInitialized(true);
    } else if (!isAuthenticated && loaded && !isInitialized) {
      // If not authenticated, mark as initialized since we already used localStorage defaults
      setIsInitialized(true);
    }
  }, [preferencesData, isAuthenticated, loaded, isInitialized]);

  // Listen for auth state changes to refetch preferences
  useEffect(() => {
    const handleAuthStateChange = () => {
      console.log('UserPreferencesProvider: Auth state changed');
      // Check if user is still authenticated before refetching
      const token = typeof window !== 'undefined' ? localStorage.getItem('bellescart_token') : null;
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('bellescart_refresh_token') : null;
      
      if (token || refreshToken) {
        // User is logged in, refetch preferences
        console.log('UserPreferencesProvider: User authenticated, refetching preferences');
        // Reset initialization state to allow loading new preferences
        setIsInitialized(false);
        setInitialTheme(null);
        setInitialLanguage(null);
        // Force refetch of preferences with a small delay to avoid rate limiting
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: userPreferencesKeys.all });
        }, 100);
      } else {
        // User is logged out, just reset state without fetching
        console.log('UserPreferencesProvider: User not authenticated, resetting state');
        setIsInitialized(false);
        setInitialTheme(null);
        setInitialLanguage(null);
        // Clear cached preferences
        queryClient.removeQueries({ queryKey: userPreferencesKeys.all });
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth-state-changed', handleAuthStateChange);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('auth-state-changed', handleAuthStateChange);
      }
    };
  }, [queryClient]);

  // Don't update preferences after initialization
  // The contexts (ThemeProvider, LanguageProvider) handle their own state management
  // and will preserve user choices via localStorage and custom events
  // We only want to set the initial values from the backend on first load

  // Show loading state only for authenticated users while fetching preferences
  // Don't show loading if user is not authenticated (logout scenario)
  if (isAuthenticated && !isInitialized && isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current mx-auto mb-2"></div>
          <p className="text-sm">Loading preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider initialTheme={initialTheme || undefined}>
      <LanguageProvider initialLanguage={initialLanguage || undefined}>
        {children}
      </LanguageProvider>
    </ThemeProvider>
  );
}
