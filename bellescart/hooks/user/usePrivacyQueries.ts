import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { privacyService, PrivacyPreferences, PrivacyRequest, DataExport } from '@/services/privacyService';

// Query keys
export const privacyKeys = {
  all: ['privacy'] as const,
  preferences: () => [...privacyKeys.all, 'preferences'] as const,
  requests: () => [...privacyKeys.all, 'requests'] as const,
  export: (requestId: string) => [...privacyKeys.all, 'export', requestId] as const,
};

// Queries
export const usePrivacyPreferences = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: privacyKeys.preferences(),
    queryFn: () => privacyService.getPreferences(),
    select: (data) => data.data,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes garbage collection
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

export const usePrivacyRequests = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: privacyKeys.requests(),
    queryFn: () => privacyService.getUserRequests(),
    select: (data) => data.data,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes garbage collection
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

export const useDataExport = (requestId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: privacyKeys.export(requestId),
    queryFn: () => privacyService.downloadExport(requestId),
    select: (data) => data.data,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes garbage collection
    enabled: options?.enabled ?? !!requestId,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

// Mutations
export const useUpdatePrivacyPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { marketingEmails: boolean }) => privacyService.updatePreferences(data),
    onSuccess: () => {
      // Invalidate privacy preferences query
      queryClient.invalidateQueries({ queryKey: privacyKeys.preferences() });
    },
  });
};

export const useRequestDataExport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => privacyService.requestDataExport(),
    onSuccess: () => {
      // Invalidate privacy requests query to show the new request
      queryClient.invalidateQueries({ queryKey: privacyKeys.requests() });
    },
  });
};
