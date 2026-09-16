'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useRequireUserAuth } from '@/auth/user';
import { usePrivacyPreferences, useUpdatePrivacyPreferences, usePrivacyRequests, useRequestDataExport, useDataExport } from '@/hooks/user/usePrivacyQueries';
import { PrivacyPreferences, PrivacyRequest } from '@/services/privacyService';

import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import { globalToast } from '@/utils/globalToast';

type IconProps = {
  className?: string;
};

const Icon = {
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
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.7}
        d="M9 12l2 2 4-4"
      />
    </svg>
  ),

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

  Download: ({ className = 'h-5 w-5' }: IconProps) => (
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
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  ),

  FileText: ({ className = 'h-5 w-5' }: IconProps) => (
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
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  ),

  Clock: ({ className = 'h-5 w-5' }: IconProps) => (
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
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),

  CheckCircle: ({ className = 'h-5 w-5' }: IconProps) => (
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
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),

  XCircle: ({ className = 'h-5 w-5' }: IconProps) => (
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
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
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
};

export default function PrivacyPage() {
  const router = useRouter();

  const {
    user,
    loaded,
    isAuthenticated,
  } = useRequireUserAuth();

  const {
    data: preferences,
    isLoading: isLoadingPreferences,
  } = usePrivacyPreferences({
    enabled: isAuthenticated && loaded,
  });

  const {
    data: requests,
    isLoading: isLoadingRequests,
  } = usePrivacyRequests({
    enabled: isAuthenticated && loaded,
  });

  const updatePreferencesMutation = useUpdatePrivacyPreferences();
  const requestDataExportMutation = useRequestDataExport();

  const [localMarketingEmails, setLocalMarketingEmails] = useState(false);
  const [viewingExport, setViewingExport] = useState<string | null>(null);

  const {
    data: exportData,
    isLoading: isLoadingExport,
  } = useDataExport(viewingExport || '', {
    enabled: !!viewingExport,
  });

  React.useEffect(() => {
    if (preferences) {
      setLocalMarketingEmails(preferences.marketingEmails);
    }
  }, [preferences]);

  if (!loaded || isLoadingPreferences || isLoadingRequests) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf9fb]">
        <Loader
          size="lg"
          text="Loading privacy settings..."
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleMarketingToggle = async () => {
    try {
      const newValue = !localMarketingEmails;
      await updatePreferencesMutation.mutateAsync({ marketingEmails: newValue });
      setLocalMarketingEmails(newValue);
      
      globalToast.general.success(
        newValue ? 'Marketing emails enabled' : 'Marketing emails disabled'
      );
    } catch (error) {
      console.error('Error updating marketing preference:', error);
      globalToast.general.error('Error', 'Failed to update marketing preference');
    }
  };

  const handleRequestExport = async () => {
    try {
      await requestDataExportMutation.mutateAsync();
      globalToast.general.success('Data export request submitted');
    } catch (error: any) {
      console.error('Error requesting data export:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to request data export';
      globalToast.general.error('Error', errorMessage);
    }
  };

  const handleDownloadExport = (requestId: string) => {
    setViewingExport(requestId);
  };

  const handleDownloadJSON = () => {
    if (exportData) {
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bellescart-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      globalToast.general.success('Data export downloaded');
      setViewingExport(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
      processing: { label: 'Processing', className: 'bg-blue-50 text-blue-700 border-blue-200' },
      completed: { label: 'Completed', className: 'bg-green-50 text-green-700 border-green-200' },
      failed: { label: 'Failed', className: 'bg-red-50 text-red-700 border-red-200' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
        {config.label}
      </span>
    );
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
                  Privacy & Data
                </div>

                <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
                  Privacy Center
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400 sm:text-base">
                  Manage your privacy preferences and access your personal data.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/10"
                >
                  Back to Profile
                  <Icon.ChevronRight className="h-3.5 w-3.5" />
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
                    Account
                  </p>

                  <div className="space-y-1">
                    <Link
                      href="/profile"
                      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-950"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition group-hover:bg-pink-50 group-hover:text-pink-600">
                        <Icon.User className="h-4 w-4" />
                      </span>

                      Profile

                      <Icon.ChevronRight className="ml-auto h-4 w-4 text-gray-300 transition group-hover:text-gray-500" />
                    </Link>

                    <Link
                      href="/settings"
                      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-950"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition group-hover:bg-pink-50 group-hover:text-pink-600">
                        <Icon.Settings className="h-4 w-4" />
                      </span>

                      Settings

                      <Icon.ChevronRight className="ml-auto h-4 w-4 text-gray-300 transition group-hover:text-gray-500" />
                    </Link>

                    <div className="flex items-center gap-3 rounded-xl bg-pink-50 px-3 py-2.5 text-sm font-semibold text-pink-700">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-pink-600 shadow-sm">
                        <Icon.Shield className="h-4 w-4" />
                      </span>

                      Privacy & Data

                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-pink-500" />
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Privacy Content */}
            <div className="min-w-0 space-y-6">

              {/* Privacy Preferences */}
              <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_10px_40px_rgba(17,12,20,0.035)]">
                <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
                      <Icon.Settings className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="text-base font-semibold text-gray-950">
                        Privacy Preferences
                      </h2>

                      <p className="mt-0.5 text-xs text-gray-400">
                        Control optional communications and data-processing preferences
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-950">
                        Marketing Communications
                      </h3>
                      <p className="mt-1 text-xs text-gray-500">
                        Receive promotional offers, new-product announcements and other marketing communications
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleMarketingToggle}
                      disabled={updatePreferencesMutation.isPending}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 ${
                        localMarketingEmails ? 'bg-pink-600' : 'bg-gray-300'
                      } ${updatePreferencesMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          localMarketingEmails ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </section>

              {/* Download My Data */}
              <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_10px_40px_rgba(17,12,20,0.035)]">
                <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Icon.Download className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="text-base font-semibold text-gray-950">
                        Download My Data
                      </h2>

                      <p className="mt-0.5 text-xs text-gray-400">
                        Request a copy of the personal information associated with your account
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        You can request a copy of all your personal data including profile information, addresses, orders, and privacy preferences.
                      </p>
                    </div>

                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleRequestExport}
                      isLoading={requestDataExportMutation.isPending}
                      className="ml-4"
                    >
                      Request My Data
                    </Button>
                  </div>
                </div>
              </section>

              {/* Privacy Requests */}
              <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_10px_40px_rgba(17,12,20,0.035)]">
                <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                      <Icon.Clock className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="text-base font-semibold text-gray-950">
                        Privacy Requests
                      </h2>

                      <p className="mt-0.5 text-xs text-gray-400">
                        View the status of your privacy requests
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  {requests && requests.length > 0 ? (
                    <div className="space-y-3">
                      {requests.map((request: PrivacyRequest) => (
                        <div
                          key={request._id}
                          className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-gray-500">
                              {request.status === 'completed' ? (
                                <Icon.CheckCircle className="h-5 w-5 text-green-600" />
                              ) : request.status === 'failed' ? (
                                <Icon.XCircle className="h-5 w-5 text-red-600" />
                              ) : (
                                <Icon.Clock className="h-5 w-5" />
                              )}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-semibold text-gray-950">
                                  Data Export
                                </h3>
                                {getStatusBadge(request.status)}
                              </div>
                              <p className="mt-1 text-xs text-gray-500">
                                Requested: {formatDate(request.requestedAt)}
                              </p>
                              {request.errorMessage && (
                                <p className="mt-1 text-xs text-red-600">
                                  {request.errorMessage}
                                </p>
                              )}
                            </div>
                          </div>

                          {request.status === 'completed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadExport(request._id)}
                            >
                              Download
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 mx-auto mb-3">
                        <Icon.FileText className="h-6 w-6" />
                      </div>
                      <p className="text-sm text-gray-500">
                        No privacy requests yet
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* Privacy Policy Link */}
              <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_10px_40px_rgba(17,12,20,0.035)]">
                <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                      <Icon.FileText className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="text-base font-semibold text-gray-950">
                        Privacy Policy
                      </h2>

                      <p className="mt-0.5 text-xs text-gray-400">
                        Learn how Belles Avenue collects, uses and protects your information
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <Link
                    href="/privacy-policy"
                    className="inline-flex items-center gap-2 text-sm font-medium text-pink-600 hover:text-pink-700"
                  >
                    View Privacy Policy
                    <Icon.ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </section>

            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Export Download Modal */}
      {viewingExport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-950">
                Your Data Export
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Review your exported data before downloading
              </p>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              {isLoadingExport ? (
                <div className="flex items-center justify-center py-8">
                  <Loader size="md" text="Loading export data..." />
                </div>
              ) : exportData ? (
                <pre className="text-xs bg-gray-50 p-4 rounded-xl overflow-x-auto">
                  {JSON.stringify(exportData, null, 2)}
                </pre>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">
                  Failed to load export data
                </p>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setViewingExport(null)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={handleDownloadJSON}
                disabled={!exportData}
              >
                Download JSON
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
