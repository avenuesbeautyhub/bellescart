import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userPreferencesService } from '@/services/userPreferencesService';
import { UserPreferences } from '@/types/auth';

// Query keys
export const userPreferencesKeys = {
  all: ['userPreferences'] as const,
  details: () => [...userPreferencesKeys.all, 'details'] as const,
};

// Queries
export const useUserPreferences = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: userPreferencesKeys.details(),
    queryFn: () => userPreferencesService.getPreferences(),
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour garbage collection
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });
};

// Mutations
export const useUpdateUserPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<UserPreferences>) => {
      console.log('=== MUTATION FUNCTION CALLED ===');
      console.log('Mutation data:', data);
      return userPreferencesService.updatePreferences(data);
    },
    onMutate: async (newData) => {
      console.log('=== MUTATION ONMUTATE CALLED ===');
      console.log('Optimistic update data:', newData);
      await queryClient.cancelQueries({ queryKey: userPreferencesKeys.all });
      const previousPreferences = queryClient.getQueryData(userPreferencesKeys.details());

      // Don't do optimistic updates to prevent issues with server responses
      // Just store the previous data for rollback if needed

      return { previousPreferences };
    },
    onError: (err, newData, context) => {
      console.error('=== MUTATION ERROR ===');
      console.error('Error:', err);
      console.error('Data:', newData);
      queryClient.setQueryData(userPreferencesKeys.details(), context?.previousPreferences);
    },
    onSuccess: (response, variables) => {
      console.log('=== MUTATION SUCCESS ===');
      console.log('Response:', response);
      console.log('Response data:', response?.data);
      console.log('Variables sent:', variables);
      
      // Update query cache with the latest data
      if (response?.data) {
        console.log('Updating query cache with:', response);
        
        // Preserve the language that was sent in the request, not what server returns
        // This prevents server from reverting to default language
        const preservedData = {
          ...response.data,
          language: variables.language || response.data.language
        };
        
        console.log('Preserved data with original language:', preservedData);
        queryClient.setQueryData(userPreferencesKeys.details(), { ...response, data: preservedData });
        
        // Sync saved preferences with localStorage for theme and language contexts
        if (typeof window !== 'undefined') {
          console.log('Syncing to localStorage and dispatching events');
          if (response.data.theme) {
            console.log('Setting theme in localStorage:', response.data.theme);
            localStorage.setItem('bellescart_theme', response.data.theme);
            // Dispatch custom event for same-tab updates
            console.log('Dispatching theme change event:', response.data.theme);
            window.dispatchEvent(new CustomEvent('bellescart_theme_change', { detail: response.data.theme }));
          }
          if (preservedData.language) {
            console.log('Setting language in localStorage:', preservedData.language);
            localStorage.setItem('bellescart_language', preservedData.language);
            // Dispatch custom event for same-tab updates
            console.log('Dispatching language change event:', preservedData.language);
            window.dispatchEvent(new CustomEvent('bellescart_language_change', { detail: preservedData.language }));
          }
        }
      } else {
        console.warn('No data in response:', response);
      }
    },
    onSettled: () => {
      console.log('=== MUTATION SETTLED ===');
      // Don't invalidate queries to prevent server overwriting user's choices
      // The cache is already updated with the preserved data in onSuccess
      // queryClient.invalidateQueries({ queryKey: userPreferencesKeys.all });
    },
  });
};

export const useResetUserPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => userPreferencesService.resetPreferences(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: userPreferencesKeys.all });
      const previousPreferences = queryClient.getQueryData(userPreferencesKeys.details());

      return { previousPreferences };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(userPreferencesKeys.details(), context?.previousPreferences);
    },
    onSuccess: (response) => {
      console.log('=== RESET MUTATION SUCCESS ===');
      console.log('Response:', response);
      // Update query cache with the latest data
      if (response?.data) {
        queryClient.setQueryData(userPreferencesKeys.details(), response);
        
        // Sync reset preferences with localStorage for theme and language contexts
        if (typeof window !== 'undefined') {
          if (response.data.theme) {
            localStorage.setItem('bellescart_theme', response.data.theme);
            window.dispatchEvent(new CustomEvent('bellescart_theme_change', { detail: response.data.theme }));
          }
          if (response.data.language) {
            localStorage.setItem('bellescart_language', response.data.language);
            window.dispatchEvent(new CustomEvent('bellescart_language_change', { detail: response.data.language }));
          }
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userPreferencesKeys.all });
    },
  });
};

export const useDeleteUserPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => userPreferencesService.deletePreferences(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: userPreferencesKeys.all });
      const previousPreferences = queryClient.getQueryData(userPreferencesKeys.details());

      return { previousPreferences };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(userPreferencesKeys.details(), context?.previousPreferences);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userPreferencesKeys.all });
    },
  });
};