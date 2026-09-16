'use client';

import React, { useState } from 'react';
import Link from 'next/link';

import { useRequireAdminAuth } from '@/auth/admin';
import { adminPrivacyService } from '@/services/admin/privacyService';
import { PrivacyRequest } from '@/services/privacyService';
import { globalToast } from '@/utils/globalToast';

import Navbar from '@/components/AdminHeader/AdminHeader';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';

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

  ArrowLeft: ({ className = 'h-4 w-4' }: IconProps) => (
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
        d="M10 19l-7-7m0 0l7-7m-7 7h18"
      />
    </svg>
  ),

  Refresh: ({ className = 'h-5 w-5' }: IconProps) => (
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
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  ),
};

export default function AdminPrivacyRequestsPage() {
  const {
    user: admin,
    loaded,
    isAuthenticated,
  } = useRequireAdminAuth();

  const [requests, setRequests] = useState<PrivacyRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0
  });

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const result = await adminPrivacyService.getPrivacyRequests();
      if (result.success) {
        setRequests(result.data || []);
      } else {
        globalToast.general.error('Error', result.error || 'Failed to fetch privacy requests');
      }
    } catch (error) {
      console.error('Error fetching privacy requests:', error);
      globalToast.general.error('Error', 'Failed to fetch privacy requests');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const result = await adminPrivacyService.getPrivacyStats();
      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching privacy stats:', error);
    }
  };

  React.useEffect(() => {
    if (isAuthenticated && loaded) {
      fetchRequests();
      fetchStats();
    }
  }, [isAuthenticated, loaded]);

  if (!loaded || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader size="lg" text="Loading privacy requests..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
      processing: { label: 'Processing', className: 'bg-blue-100 text-blue-800' },
      completed: { label: 'Completed', className: 'bg-green-100 text-green-800' },
      failed: { label: 'Failed', className: 'bg-red-100 text-red-800' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/belles-portel-25/dashboard"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <Icon.ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Privacy Requests
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage and monitor data export requests
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchRequests}
              isLoading={isLoading}
            >
              <Icon.Refresh className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Icon.Shield className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Icon.Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.completed}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Icon.CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Failed</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.failed}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <Icon.XCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Requests
            </h2>
          </div>

          {requests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requested At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completed At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request: PrivacyRequest) => (
                    <tr key={request._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request._id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {request.userName || 'Unknown User'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {request.userEmail || 'Unknown Email'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                        {request.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(request.requestedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.completedAt ? formatDate(request.completedAt) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 mx-auto mb-4">
                <Icon.Shield className="h-6 w-6" />
              </div>
              <p className="text-sm text-gray-500">
                No privacy requests found
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
