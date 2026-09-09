import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '@/services/profileService';
import { UserProfile, Address } from '@/types/auth';

// Query keys
export const profileKeys = {
  all: ['profile'] as const,
  details: () => [...profileKeys.all, 'details'] as const,
  addresses: () => [...profileKeys.all, 'addresses'] as const,
};

// Queries
export const useProfile = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: profileKeys.details(),
    queryFn: () => profileService.getProfile(),
    staleTime: 1000 * 60 * 10, // 10 minutes (increased to reduce refetches)
    gcTime: 1000 * 60 * 15, // 15 minutes garbage collection
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: false, // Disabled to prevent 429 errors
    refetchOnReconnect: false, // Disabled to prevent 429 errors
    retry: 0, // Disabled retries to prevent error cascades
  });
};

// Mutations
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<UserProfile>) => profileService.updateProfile(data),
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: profileKeys.all });

      // Snapshot previous value
      const previousProfile = queryClient.getQueryData(profileKeys.details());

      // Optimistically update
      queryClient.setQueryData(profileKeys.details(), (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            ...newData
          }
        };
      });

      return { previousProfile };
    },
    onError: (err, newData, context) => {
      // Rollback on error
      queryClient.setQueryData(profileKeys.details(), context?.previousProfile);
    },
    onSettled: () => {
      // Refetch to ensure server state
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
};

export const useAddAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (address: Address) => profileService.addAddress(address),
    onMutate: async (newAddress) => {
      await queryClient.cancelQueries({ queryKey: profileKeys.all });
      const previousProfile = queryClient.getQueryData(profileKeys.details());

      queryClient.setQueryData(profileKeys.details(), (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            addresses: [...(old.data.addresses || []), { ...newAddress, _id: 'temp-' + Date.now() }]
          }
        };
      });

      return { previousProfile };
    },
    onError: (err, newAddress, context) => {
      queryClient.setQueryData(profileKeys.details(), context?.previousProfile);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ addressId, address }: { addressId: string; address: Address }) => 
      profileService.updateAddress(addressId, address),
    onMutate: async ({ addressId, address }) => {
      await queryClient.cancelQueries({ queryKey: profileKeys.all });
      const previousProfile = queryClient.getQueryData(profileKeys.details());

      queryClient.setQueryData(profileKeys.details(), (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            addresses: old.data.addresses?.map((addr: Address) => 
              addr._id === addressId ? { ...addr, ...address } : addr
            ) || []
          }
        };
      });

      return { previousProfile };
    },
    onError: (err, { addressId, address }, context) => {
      queryClient.setQueryData(profileKeys.details(), context?.previousProfile);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressId: string) => profileService.deleteAddress(addressId),
    onMutate: async (addressId) => {
      await queryClient.cancelQueries({ queryKey: profileKeys.all });
      const previousProfile = queryClient.getQueryData(profileKeys.details());

      queryClient.setQueryData(profileKeys.details(), (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            addresses: old.data.addresses?.filter((addr: Address) => addr._id !== addressId) || []
          }
        };
      });

      return { previousProfile };
    },
    onError: (err, addressId, context) => {
      queryClient.setQueryData(profileKeys.details(), context?.previousProfile);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
};

export const useSetDefaultAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressId: string) => profileService.setDefaultAddress(addressId),
    onMutate: async (addressId) => {
      await queryClient.cancelQueries({ queryKey: profileKeys.all });
      const previousProfile = queryClient.getQueryData(profileKeys.details());

      queryClient.setQueryData(profileKeys.details(), (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            addresses: old.data.addresses?.map((addr: Address) => ({
              ...addr,
              isDefault: addr._id === addressId
            })) || []
          }
        };
      });

      return { previousProfile };
    },
    onError: (err, addressId, context) => {
      queryClient.setQueryData(profileKeys.details(), context?.previousProfile);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
};

export const useUploadProfilePicture = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => profileService.uploadProfilePicture(file),
    onMutate: async (file) => {
      await queryClient.cancelQueries({ queryKey: profileKeys.all });
      const previousProfile = queryClient.getQueryData(profileKeys.details());

      // Create a temporary preview URL
      const previewUrl = URL.createObjectURL(file);

      queryClient.setQueryData(profileKeys.details(), (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            avatar: previewUrl
          }
        };
      });

      return { previousProfile, previewUrl };
    },
    onError: (err, file, context) => {
      queryClient.setQueryData(profileKeys.details(), context?.previousProfile);
      if (context?.previewUrl) {
        URL.revokeObjectURL(context.previewUrl);
      }
    },
    onSettled: (_data, _error, _variables, context) => {
      if (context?.previewUrl) {
        URL.revokeObjectURL(context.previewUrl);
      }
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
};
