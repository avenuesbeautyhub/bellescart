'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useRequireUserAuth } from '@/auth/user';
import { useUserPreferences, useUpdateUserPreferences, useResetUserPreferences } from '@/hooks/user/useUserPreferencesQueries';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import { globalToast } from '@/utils/globalToast';
import { initializeCsrfToken } from '@/services/apiInterceptor';

type IconProps = {
  className?: string;
};

const Icon = {
  Settings: ({ className = 'h-5 w-5' }: IconProps) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.7}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.7}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),

  Globe: ({ className = 'h-5 w-5' }: IconProps) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.7}
        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
      />
    </svg>
  ),

  Sun: ({ className = 'h-5 w-5' }: IconProps) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.7}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  ),

  Moon: ({ className = 'h-5 w-5' }: IconProps) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.7}
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  ),

  Monitor: ({ className = 'h-5 w-5' }: IconProps) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.7}
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  ),

  Bell: ({ className = 'h-5 w-5' }: IconProps) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.7}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  ),

  Shield: ({ className = 'h-5 w-5' }: IconProps) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.7}
        d="M12 3l7 4v5c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V7l7-4z"
      />
    </svg>
  ),

  Accessibility: ({ className = 'h-5 w-5' }: IconProps) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.7}
        d="M12 2a2 2 0 100 4 2 2 0 000-4zm-2 8a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2h-2a2 2 0 01-2-2v-6zm0 8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
    </svg>
  ),

  Check: ({ className = 'h-4 w-4' }: IconProps) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  ),

  ArrowRight: ({ className = 'h-4 w-4' }: IconProps) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M5 12h14m-6-6l6 6-6 6"
      />
    </svg>
  ),

  ChevronRight: ({ className = 'h-4 w-4' }: IconProps) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M9 5l7 7-7 7"
      />
    </svg>
  ),

  LogOut: ({ className = 'h-4 w-4' }: IconProps) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.7}
        d="M15 17l5-5-5-5M20 12H9m-4 8a2 2 0 01-2-2V6a2 2 0 012-2h7"
      />
    </svg>
  ),

  User: ({ className = 'h-5 w-5' }: IconProps) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.7}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  ),

  X: ({ className = 'h-4 w-4' }: IconProps) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  ),
};

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const hasLoadedRef = useRef(false);

  const {
    user,
    loaded,
    isAuthenticated,
  } = useRequireUserAuth();

  const {
    data: preferencesData,
    isLoading: isLoadingPreferences,
  } = useUserPreferences({
    enabled: isAuthenticated && loaded,
  });

  const updatePreferencesMutation = useUpdateUserPreferences();
  const resetPreferencesMutation = useResetUserPreferences();

  const [localPreferences, setLocalPreferences] = useState({
    language: 'en' as 'en' | 'hi' | 'ml',
    theme: 'auto' as 'light' | 'dark' | 'auto',
    notifications: {
      email: true,
      push: true,
      sms: false,
      orderUpdates: true,
      promotions: true,
    },
    privacy: {
      profileVisibility: 'private' as 'public' | 'private',
      showActivity: false,
    },
    accessibility: {
      fontSize: 'medium' as 'small' | 'medium' | 'large',
      highContrast: false,
      reducedMotion: false,
    },
  });

  useEffect(() => {
    initializeCsrfToken();
  }, []);

  useEffect(() => {
    if (preferencesData?.data) {
      console.log('Loading preferences from server:', preferencesData.data);
      // Only update local preferences on initial load
      // Use a ref to track if this is the initial load
      const isInitialLoad = !hasLoadedRef.current;
      
      if (isInitialLoad) {
        console.log('Initial load, using server data');
        setLocalPreferences(preferencesData.data);
        hasLoadedRef.current = true;
        
        // Sync with contexts for immediate UI update
        if (preferencesData.data.theme) {
          setTheme(preferencesData.data.theme);
        }
        if (preferencesData.data.language) {
          setLanguage(preferencesData.data.language);
        }
      } else {
        console.log('Not initial load, preserving user state, ignoring server update');
      }
    }
  }, [preferencesData, setTheme, setLanguage]);

  if (!loaded || isLoadingPreferences) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf9fb]">
        <Loader
          size="lg"
          text={t('loading_settings')}
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleSave = async () => {
    try {
      console.log('=== SAVE PREFERENCES CLICKED ===');
      console.log('Current localPreferences:', localPreferences);
      console.log('Starting save request...');
      
      const result = await updatePreferencesMutation.mutateAsync(localPreferences);
      
      console.log('=== SAVE REQUEST COMPLETED ===');
      console.log('Server response:', result);
      
      // Don't update local state based on server response
      // Keep our local preferences as they are (user's choices)
      // The server response might have defaults, but we want to preserve user choices
      
      // Ensure localStorage is updated with our current choices
      if (typeof window !== 'undefined') {
        localStorage.setItem('bellescart_theme', localPreferences.theme);
        localStorage.setItem('bellescart_language', localPreferences.language);
      }
      
      // Ensure contexts are set to our current choices
      setTheme(localPreferences.theme);
      setLanguage(localPreferences.language);
      
      console.log('Preserved local preferences after save:', localPreferences);
      
      globalToast.general.success('Settings saved successfully');
    } catch (error) {
      console.error('=== SAVE REQUEST FAILED ===');
      console.error('Settings save error:', error);
      globalToast.general.error('Error', 'Failed to save settings');
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    console.log('Theme change requested:', newTheme);
    setLocalPreferences(prev => ({ ...prev, theme: newTheme }));
    // Immediately sync with theme context for instant UI feedback
    setTheme(newTheme);
  };

  const handleLanguageChange = (newLanguage: 'en' | 'hi' | 'ml') => {
    console.log('Language change requested:', newLanguage);
    setLocalPreferences(prev => ({ ...prev, language: newLanguage }));
    // Immediately sync with language context for instant UI feedback
    setLanguage(newLanguage);
  };

  const handleNotificationChange = (key: keyof typeof localPreferences.notifications) => {
    setLocalPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }));
  };

  const handlePrivacyChange = (key: keyof typeof localPreferences.privacy, value: any) => {
    setLocalPreferences(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value,
      },
    }));
  };

  const handleAccessibilityChange = (key: keyof typeof localPreferences.accessibility, value: any) => {
    setLocalPreferences(prev => ({
      ...prev,
      accessibility: {
        ...prev.accessibility,
        [key]: value,
      },
    }));
  };

  const handleReset = async () => {
    try {
      await resetPreferencesMutation.mutateAsync();
      globalToast.general.success('Settings reset to default');
    } catch (error) {
      console.error('Settings reset error:', error);
      globalToast.general.error('Error', 'Failed to reset settings');
    }
  };

  const displayName = user?.name || 'User';

  return (
    <div className="min-h-screen bg-[#faf9fb] text-gray-900">
      <Navbar />

      <main>
        {/* Header */}
        <section className="relative overflow-hidden border-b border-gray-200 bg-[#19151a] text-white">
          <div className="absolute -right-24 -top-32 h-72 w-72 rounded-full bg-pink-500/10 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-pink-300">
                  <span className="h-px w-6 bg-pink-400" />
                  Settings
                </div>

                <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
                  {t('account_settings')}
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400 sm:text-base">
                  {t('customize_shopping_experience')}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/10"
                >
                  {t('back_to_profile')}
                  <Icon.ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[270px_minmax(0,1fr)] xl:gap-8">

            {/* Sidebar */}
            <aside className="lg:sticky lg:top-24">
              <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_10px_40px_rgba(17,12,20,0.04)]">
                <div className="relative overflow-hidden bg-[#201a20] px-5 pb-6 pt-6 text-white">
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-pink-500/10 blur-2xl" />

                  <div className="relative">
                    <div className="flex items-center gap-4">
                      <div className="flex h-[68px] w-[68px] items-center justify-center rounded-2xl bg-pink-500 text-2xl font-semibold">
                        {displayName?.charAt(0) || 'U'}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold">
                          {displayName}
                        </p>

                        <p className="mt-1 truncate text-xs text-gray-400">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3">
                  <p className="px-3 pb-2 pt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-gray-400">
                    {t('account')}
                  </p>

                  <div className="space-y-1">
                    <Link
                      href="/profile"
                      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-950"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition group-hover:bg-pink-50 group-hover:text-pink-600">
                        <Icon.User className="h-4 w-4" />
                      </span>

                      {t('profile')}

                      <Icon.ChevronRight className="ml-auto h-4 w-4 text-gray-300 transition group-hover:text-gray-500" />
                    </Link>

                    <div className="flex items-center gap-3 rounded-xl bg-pink-50 px-3 py-2.5 text-sm font-semibold text-pink-700">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-pink-600 shadow-sm">
                        <Icon.Settings className="h-4 w-4" />
                      </span>

                      {t('settings')}

                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-pink-500" />
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Settings */}
            <div className="min-w-0 space-y-6">

              {/* Language & Theme */}
              <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_10px_40px_rgba(17,12,20,0.035)]">
                <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Icon.Globe className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="text-base font-semibold text-gray-950">
                        {t('language_appearance')}
                      </h2>

                      <p className="mt-0.5 text-xs text-gray-400">
                        {t('customize_interface')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6 space-y-6">
                  {/* Language */}
                  <div>
                    <label className="mb-3 block text-sm font-medium text-gray-700">
                      {t('language')}
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { code: 'en' as const, name: t('english') },
                        { code: 'hi' as const, name: t('hindi') },
                        { code: 'ml' as const, name: t('malayalam') },
                      ].map((lang) => (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => handleLanguageChange(lang.code)}
                          className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                            localPreferences.language === lang.code
                              ? 'border-pink-500 bg-pink-50 text-pink-700'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {lang.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Theme */}
                  <div>
                    <label className="mb-3 block text-sm font-medium text-gray-700">
                      {t('theme')}
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => handleThemeChange('light')}
                        className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition ${
                          localPreferences.theme === 'light'
                            ? 'border-pink-500 bg-pink-50'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <Icon.Sun className="h-6 w-6" />
                        <span className="text-sm font-medium">{t('light')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleThemeChange('dark')}
                        className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition ${
                          localPreferences.theme === 'dark'
                            ? 'border-pink-500 bg-pink-50'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <Icon.Moon className="h-6 w-6" />
                        <span className="text-sm font-medium">{t('dark')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleThemeChange('auto')}
                        className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition ${
                          localPreferences.theme === 'auto'
                            ? 'border-pink-500 bg-pink-50'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <Icon.Monitor className="h-6 w-6" />
                        <span className="text-sm font-medium">{t('auto')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Notifications */}
              <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_10px_40px_rgba(17,12,20,0.035)]">
                <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <Icon.Bell className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="text-base font-semibold text-gray-950">
                        {t('notifications')}
                      </h2>

                      <p className="mt-0.5 text-xs text-gray-400">
                        {t('manage_notification_preferences')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6 space-y-4">
                  {[
                    { key: 'email', label: t('email_notifications') },
                    { key: 'push', label: t('push_notifications') },
                    { key: 'sms', label: t('sms_notifications') },
                    { key: 'orderUpdates', label: t('order_updates') },
                    { key: 'promotions', label: t('promotional_offers') },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"
                    >
                      <span className="text-sm font-medium text-gray-700">
                        {item.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleNotificationChange(item.key as any)}
                        className={`relative h-6 w-11 rounded-full transition-colors ${
                          localPreferences.notifications[item.key as keyof typeof localPreferences.notifications]
                            ? 'bg-pink-500'
                            : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                            localPreferences.notifications[item.key as keyof typeof localPreferences.notifications]
                              ? 'translate-x-6'
                              : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* Privacy */}
              <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_10px_40px_rgba(17,12,20,0.035)]">
                <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                      <Icon.Shield className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="text-base font-semibold text-gray-950">
                        {t('privacy')}
                      </h2>

                      <p className="mt-0.5 text-xs text-gray-400">
                        {t('control_privacy_settings')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6 space-y-4">
                  <div>
                    <label className="mb-3 block text-sm font-medium text-gray-700">
                      {t('profile_visibility')}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'public', label: t('public') },
                        { value: 'private', label: t('private') },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handlePrivacyChange('profileVisibility', option.value)}
                          className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                            localPreferences.privacy.profileVisibility === option.value
                              ? 'border-pink-500 bg-pink-50 text-pink-700'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                    <span className="text-sm font-medium text-gray-700">
                      {t('show_activity_status')}
                    </span>
                    <button
                      type="button"
                      onClick={() => handlePrivacyChange('showActivity', !localPreferences.privacy.showActivity)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        localPreferences.privacy.showActivity
                          ? 'bg-pink-500'
                          : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                          localPreferences.privacy.showActivity
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </section>

              {/* Accessibility */}
              <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_10px_40px_rgba(17,12,20,0.035)]">
                <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                      <Icon.Accessibility className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="text-base font-semibold text-gray-950">
                        {t('accessibility')}
                      </h2>

                      <p className="mt-0.5 text-xs text-gray-400">
                        {t('customize_accessibility_options')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6 space-y-4">
                  <div>
                    <label className="mb-3 block text-sm font-medium text-gray-700">
                      {t('font_size')}
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'small', label: t('small') },
                        { value: 'medium', label: t('medium') },
                        { value: 'large', label: t('large') },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleAccessibilityChange('fontSize', option.value)}
                          className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                            localPreferences.accessibility.fontSize === option.value
                              ? 'border-pink-500 bg-pink-50 text-pink-700'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                    <span className="text-sm font-medium text-gray-700">
                      {t('high_contrast_mode')}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAccessibilityChange('highContrast', !localPreferences.accessibility.highContrast)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        localPreferences.accessibility.highContrast
                          ? 'bg-pink-500'
                          : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                          localPreferences.accessibility.highContrast
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                    <span className="text-sm font-medium text-gray-700">
                      {t('reduced_motion')}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAccessibilityChange('reducedMotion', !localPreferences.accessibility.reducedMotion)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        localPreferences.accessibility.reducedMotion
                          ? 'bg-pink-500'
                          : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                          localPreferences.accessibility.reducedMotion
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </section>

              {/* Actions */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={handleSave}
                  disabled={updatePreferencesMutation.isPending}
                  className="rounded-xl"
                >
                  {updatePreferencesMutation.isPending ? t('saving') : t('save_changes')}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="rounded-xl"
                >
                  {t('reset_to_default')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}