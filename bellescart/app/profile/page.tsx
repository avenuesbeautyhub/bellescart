'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useRequireUserAuth, clearUserSession } from '@/auth/user';
import { Address } from '@/types/auth';

import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Loader from '@/components/ui/Loader';

import {
  useProfile,
  useUpdateProfile,
  useAddAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
  useUploadProfilePicture,
} from '@/hooks/user/useProfileQueries';

import { useCurrentUser } from '@/hooks/user/useAuthQuery';
import { useWalletBalance } from '@/hooks/user/useWalletQueries';
import { globalToast } from '@/utils/globalToast';
import { initializeCsrfToken } from '@/services/apiInterceptor';

type IconProps = {
  className?: string;
};

const Icon = {
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

  MapPin: ({ className = 'h-5 w-5' }: IconProps) => (
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
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.7}
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),

  Wallet: ({ className = 'h-5 w-5' }: IconProps) => (
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
        d="M3 7h18v10H3V7zm14 5h.01"
      />
    </svg>
  ),

  ShoppingBag: ({ className = 'h-5 w-5' }: IconProps) => (
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
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
      />
    </svg>
  ),

  CreditCard: ({ className = 'h-5 w-5' }: IconProps) => (
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
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
      />
    </svg>
  ),

  Edit: ({ className = 'h-4 w-4' }: IconProps) => (
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
        d="M15.232 5.232l3.536 3.536M4 20h4l10.5-10.5a2.121 2.121 0 00-3-3L5 17v3z"
      />
    </svg>
  ),

  Camera: ({ className = 'h-4 w-4' }: IconProps) => (
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
        d="M4 7h3l1.5-2h7L17 7h3a1 1 0 011 1v11a1 1 0 01-1 1H4a1 1 0 01-1-1V8a1 1 0 011-1z"
      />
      <circle
        cx="12"
        cy="13"
        r="3.5"
        strokeWidth={1.7}
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

  Plus: ({ className = 'h-4 w-4' }: IconProps) => (
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
        d="M12 4v16m8-8H4"
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

  Phone: ({ className = 'h-4 w-4' }: IconProps) => (
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
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
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
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.7}
        d="M9 12l2 2 4-4"
      />
    </svg>
  ),

  Heart: ({ className = 'h-5 w-5' }: IconProps) => (
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
        d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"
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

  Location: ({ className = 'h-4 w-4' }: IconProps) => (
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
        d="M12 21s7-5.2 7-12a7 7 0 10-14 0c0 6.8 7 12 7 12z"
      />
      <circle
        cx="12"
        cy="9"
        r="2.2"
        strokeWidth={1.7}
      />
    </svg>
  ),
};

export default function ProfilePage() {
  const router = useRouter();

  const {
    user,
    loaded,
    isAuthenticated,
  } = useRequireUserAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [profilePic, setProfilePic] = useState('');
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [settingDefaultAddress, setSettingDefaultAddress] =
    useState<string | null>(null);

  const {
    data: profileData,
    isLoading: isLoadingProfile,
  } = useProfile({
    enabled: isAuthenticated && loaded,
  });

  const {
    data: currentUserData,
  } = useCurrentUser();

  const {
    data: walletBalanceData,
  } = useWalletBalance({
    enabled: isAuthenticated && loaded,
  });

  const updateProfileMutation = useUpdateProfile();
  const addAddressMutation = useAddAddress();
  const updateAddressMutation = useUpdateAddress();
  const deleteAddressMutation = useDeleteAddress();
  const setDefaultAddressMutation = useSetDefaultAddress();
  const uploadProfilePictureMutation =
    useUploadProfilePicture();

  const profile = useMemo(() => {
    if (!profileData?.data) {
      return {
        id: '',
        name: '',
        email: '',
        role: '',
        avatar: '',
        phone: '',
        addresses: [] as Address[],
      };
    }

    const data = profileData.data;

    return {
      id: data._id || data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      avatar:
        data.avatar ||
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      phone: data.phone || '',
      addresses: data.addresses || [],
    };
  }, [profileData]);

  const [formData, setFormData] = useState(profile);

  const [newAddress, setNewAddress] = useState({
    label: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    country: 'India',
  });

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  useEffect(() => {
    initializeCsrfToken();
  }, []);

  const displayName =
    profile.name ||
    user?.name ||
    currentUserData?.name ||
    'Welcome';

  const walletBalance =
    walletBalanceData?.data?.balance || 0;

  const defaultAddress = profile.addresses?.find(
    (address: Address) => address.isDefault
  );

  if (!loaded || isLoadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf9fb]">
        <Loader
          size="lg"
          text="Loading your profile..."
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileSave = async () => {
    try {
      await updateProfileMutation.mutateAsync(formData);

      setIsEditing(false);

      globalToast.general.success(
        'Profile updated successfully'
      );
    } catch (error) {
      console.error(
        'Profile update error:',
        error
      );

      globalToast.general.error(
        'Error',
        'Failed to update profile'
      );
    }
  };

  const handleProfileCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  const handleAddAddress = async () => {
    if (
      !newAddress.address ||
      !newAddress.city ||
      !newAddress.state ||
      !newAddress.zipCode ||
      !newAddress.country
    ) {
      globalToast.general.error(
        'Validation Error',
        'All address fields are required'
      );

      return;
    }

    try {
      const addressToAdd = {
        ...newAddress,
        isDefault:
          (profile.addresses?.length || 0) === 0,
      };

      await addAddressMutation.mutateAsync(
        addressToAdd
      );

      setNewAddress({
        label: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        phone: '',
        country: 'India',
      });

      setShowAddAddress(false);

      globalToast.general.success(
        'Address added successfully'
      );
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to add address';

      globalToast.general.error(
        'Error',
        errorMessage
      );
    }
  };

  const handleDeleteAddress = async (
    addressId: string
  ) => {
    if (
      !confirm(
        'Are you sure you want to delete this address?'
      )
    ) {
      return;
    }

    try {
      await deleteAddressMutation.mutateAsync(
        addressId
      );

      globalToast.general.success(
        'Address deleted successfully'
      );
    } catch (error) {
      console.error(
        'Address deletion error:',
        error
      );

      globalToast.general.error(
        'Error',
        'Failed to delete address'
      );
    }
  };

  const handleSetDefault = async (
    addressId: string
  ) => {
    setSettingDefaultAddress(addressId);

    try {
      await setDefaultAddressMutation.mutateAsync(
        addressId
      );

      globalToast.general.success(
        'Default address updated'
      );
    } catch (error) {
      console.error(
        'Set default address error:',
        error
      );

      globalToast.general.error(
        'Error',
        'Failed to set default address'
      );
    } finally {
      setSettingDefaultAddress(null);
    }
  };

  const handlePicChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      await uploadProfilePictureMutation.mutateAsync(
        file
      );

      setProfilePic(URL.createObjectURL(file));

      globalToast.general.success(
        'Profile picture updated'
      );
    } catch (error) {
      console.error(
        'Profile picture upload error:',
        error
      );

      globalToast.general.error(
        'Error',
        'Failed to upload profile picture'
      );
    }
  };

  const handleLogout = () => {
    clearUserSession();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#faf9fb] text-gray-900">
      <Navbar />

      <main>
        {/* =========================================================
            PREMIUM ACCOUNT HERO
        ========================================================== */}

        <section className="relative overflow-hidden border-b border-gray-200 bg-[#19151a] text-white">
          <div className="absolute -right-24 -top-32 h-72 w-72 rounded-full bg-pink-500/10 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-pink-300">
                  <span className="h-px w-6 bg-pink-400" />
                  My account
                </div>

                <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
                  Welcome back,{' '}
                  <span className="text-pink-300">
                    {displayName.split(' ')[0]}
                  </span>
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400 sm:text-base">
                  Keep your details, delivery addresses
                  and account preferences beautifully
                  organized in one place.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/10"
                >
                  Continue shopping
                  <Icon.ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            MAIN CONTENT
        ========================================================== */}

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[270px_minmax(0,1fr)] xl:gap-8">

            {/* =====================================================
                SIDEBAR
            ====================================================== */}

            <aside className="lg:sticky lg:top-24">
              <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_10px_40px_rgba(17,12,20,0.04)]">

                {/* Profile identity */}

                <div className="relative overflow-hidden bg-[#201a20] px-5 pb-6 pt-6 text-white">
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-pink-500/10 blur-2xl" />

                  <div className="relative">
                    <div className="flex items-center gap-4">
                      <div className="relative shrink-0">
                        {profilePic || profile.avatar ? (
                          <img
                            src={
                              profilePic ||
                              profile.avatar
                            }
                            alt="Profile"
                            className="h-[68px] w-[68px] rounded-2xl object-cover ring-2 ring-white/10"
                          />
                        ) : (
                          <div className="flex h-[68px] w-[68px] items-center justify-center rounded-2xl bg-pink-500 text-2xl font-semibold">
                            {displayName?.charAt(0) ||
                              'U'}
                          </div>
                        )}

                        <label
                          htmlFor="profile-picture"
                          className="absolute -bottom-2 -right-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-[#201a20] bg-white text-gray-700 shadow-lg transition hover:bg-pink-50 hover:text-pink-600"
                          title="Change profile picture"
                        >
                          <input
                            id="profile-picture"
                            type="file"
                            accept="image/*"
                            onChange={
                              handlePicChange
                            }
                            className="hidden"
                          />

                          <Icon.Camera className="h-3.5 w-3.5" />
                        </label>
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold">
                          {displayName}
                        </p>

                        <p className="mt-1 truncate text-xs text-gray-400">
                          {profile.email}
                        </p>

                        <div className="mt-2 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          <span className="text-[10px] font-medium text-gray-400">
                            Account active
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account navigation */}

                <div className="p-3">
                  <p className="px-3 pb-2 pt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-gray-400">
                    Account
                  </p>

                  <div className="space-y-1">
                    <div className="flex items-center gap-3 rounded-xl bg-pink-50 px-3 py-2.5 text-sm font-semibold text-pink-700">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-pink-600 shadow-sm">
                        <Icon.User className="h-4 w-4" />
                      </span>

                      Profile

                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-pink-500" />
                    </div>

                    <Link
                      href="/orders"
                      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-950"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition group-hover:bg-pink-50 group-hover:text-pink-600">
                        <Icon.ShoppingBag className="h-4 w-4" />
                      </span>

                      Orders

                      <Icon.ChevronRight className="ml-auto h-4 w-4 text-gray-300 transition group-hover:text-gray-500" />
                    </Link>

                    <Link
                      href="/wallet"
                      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-950"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition group-hover:bg-pink-50 group-hover:text-pink-600">
                        <Icon.Wallet className="h-4 w-4" />
                      </span>

                      Wallet

                      <Icon.ChevronRight className="ml-auto h-4 w-4 text-gray-300 transition group-hover:text-gray-500" />
                    </Link>

                    <Link
                      href="/payments"
                      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-950"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition group-hover:bg-pink-50 group-hover:text-pink-600">
                        <Icon.CreditCard className="h-4 w-4" />
                      </span>

                      Payments

                      <Icon.ChevronRight className="ml-auto h-4 w-4 text-gray-300 transition group-hover:text-gray-500" />
                    </Link>
                  </div>
                </div>

                {/* Wallet */}

                <div className="mx-3 mb-3 overflow-hidden rounded-2xl border border-pink-100 bg-gradient-to-br from-pink-50 to-white p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-pink-600">
                        Your wallet
                      </p>

                      <p className="mt-1 text-2xl font-semibold tracking-tight text-gray-950">
                        ₹
                        {walletBalance.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-pink-600 shadow-sm">
                      <Icon.Wallet className="h-4 w-4" />
                    </div>
                  </div>

                  <Link
                    href="/wallet"
                    className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-pink-600 transition hover:text-pink-700"
                  >
                    Manage wallet
                    <Icon.ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                {/* Logout */}

                <div className="border-t border-gray-100 p-3">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition group-hover:bg-red-100">
                      <Icon.LogOut className="h-4 w-4" />
                    </span>

                    Sign out
                  </button>
                </div>
              </div>
            </aside>

            {/* =====================================================
                MAIN
            ====================================================== */}

            <div className="min-w-0 space-y-6">

              {/* ===================================================
                  ACCOUNT SNAPSHOT
              ==================================================== */}

              <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_8px_30px_rgba(17,12,20,0.025)]">
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
                      <Icon.User className="h-4 w-4" />
                    </div>

                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                      Profile
                    </span>
                  </div>

                  <p className="mt-4 text-sm font-semibold text-gray-900">
                    Personal details
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {profile.phone
                      ? 'Your account information is complete.'
                      : 'Add your phone number.'}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_8px_30px_rgba(17,12,20,0.025)]">
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Icon.MapPin className="h-4 w-4" />
                    </div>

                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                      Delivery
                    </span>
                  </div>

                  <p className="mt-4 text-sm font-semibold text-gray-900">
                    {profile.addresses?.length || 0}{' '}
                    saved{' '}
                    {profile.addresses?.length === 1
                      ? 'address'
                      : 'addresses'}
                  </p>

                  <p className="mt-1 truncate text-xs text-gray-400">
                    {defaultAddress
                      ? `Default: ${
                          defaultAddress.label ||
                          'Delivery address'
                        }`
                      : 'Add an address for faster checkout.'}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_8px_30px_rgba(17,12,20,0.025)]">
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <Icon.Wallet className="h-4 w-4" />
                    </div>

                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                      Balance
                    </span>
                  </div>

                  <p className="mt-4 text-sm font-semibold text-gray-900">
                    ₹{walletBalance.toFixed(2)}
                  </p>

                  <Link
                    href="/wallet"
                    className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-pink-600 hover:text-pink-700"
                  >
                    View wallet
                    <Icon.ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </section>

              {/* ===================================================
                  PERSONAL INFORMATION
              ==================================================== */}

              <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_10px_40px_rgba(17,12,20,0.035)]">
                <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
                      <Icon.User className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="text-base font-semibold text-gray-950">
                        Personal information
                      </h2>

                      <p className="mt-0.5 text-xs text-gray-400">
                        Your basic account details
                      </p>
                    </div>
                  </div>

                  {!isEditing && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setIsEditing(true)
                      }
                      className="rounded-xl"
                    >
                      <span className="flex items-center gap-2">
                        <Icon.Edit className="h-3.5 w-3.5" />
                        Edit profile
                      </span>
                    </Button>
                  )}
                </div>

                <div className="p-5 sm:p-6">
                  {isEditing ? (
                    <div className="space-y-5">
                      <div className="rounded-2xl bg-[#faf9fb] p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-gray-500 shadow-sm">
                            <Icon.Edit className="h-4 w-4" />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              Update your details
                            </p>
                            <p className="text-xs text-gray-400">
                              Keep your information current
                              for a smoother experience.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Input
                          label="Full Name"
                          name="name"
                          value={formData.name}
                          onChange={
                            handleProfileChange
                          }
                        />

                        <Input
                          label="Email"
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={
                            handleProfileChange
                          }
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Input
                          label="Phone"
                          name="phone"
                          value={formData.phone}
                          onChange={
                            handleProfileChange
                          }
                        />

                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Account role
                          </label>

                          <div className="flex h-10 items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-semibold capitalize text-gray-500">
                            {profile.role ||
                              'Customer'}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 border-t border-gray-100 pt-5 sm:flex-row">
                        <Button
                          onClick={
                            handleProfileSave
                          }
                          disabled={
                            updateProfileMutation.isPending
                          }
                          className="rounded-xl"
                        >
                          {updateProfileMutation.isPending
                            ? 'Saving...'
                            : 'Save changes'}
                        </Button>

                        <Button
                          variant="outline"
                          onClick={
                            handleProfileCancel
                          }
                          disabled={
                            updateProfileMutation.isPending
                          }
                          className="rounded-xl"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-0 sm:grid-cols-2">
                      <div className="border-b border-gray-100 py-4 sm:border-r sm:pr-6">
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-gray-400">
                          Full name
                        </p>

                        <p className="mt-2 text-sm font-semibold text-gray-900">
                          {profile.name ||
                            'Not provided'}
                        </p>
                      </div>

                      <div className="border-b border-gray-100 py-4 sm:pl-6">
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-gray-400">
                          Email address
                        </p>

                        <p className="mt-2 break-all text-sm font-semibold text-gray-900">
                          {profile.email ||
                            'Not provided'}
                        </p>
                      </div>

                      <div className="border-b border-gray-100 py-4 sm:border-b-0 sm:border-r sm:pr-6">
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-gray-400">
                          Phone number
                        </p>

                        <p className="mt-2 text-sm font-semibold text-gray-900">
                          {profile.phone ||
                            'Not provided'}
                        </p>
                      </div>

                      <div className="py-4 sm:pl-6">
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-gray-400">
                          Account type
                        </p>

                        <div className="mt-2">
                          <Badge
                            variant="success"
                            className="capitalize"
                          >
                            {profile.role ||
                              'Customer'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* ===================================================
                  ADDRESS SECTION
              ==================================================== */}

              <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_10px_40px_rgba(17,12,20,0.035)]">
                <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Icon.MapPin className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="text-base font-semibold text-gray-950">
                        Saved addresses
                      </h2>

                      <p className="mt-0.5 text-xs text-gray-400">
                        Manage your delivery locations
                      </p>
                    </div>
                  </div>

                  {!showAddAddress && (
                    <Button
                      size="sm"
                      onClick={() =>
                        setShowAddAddress(true)
                      }
                      className="rounded-xl"
                    >
                      <span className="flex items-center gap-2">
                        <Icon.Plus className="h-4 w-4" />
                        Add address
                      </span>
                    </Button>
                  )}
                </div>

                <div className="p-5 sm:p-6">
                  {/* Add address */}

                  {showAddAddress && (
                    <div className="mb-6 overflow-hidden rounded-2xl border border-pink-100 bg-pink-50/40">
                      <div className="border-b border-pink-100 bg-white/60 px-4 py-4 sm:px-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              Add a new address
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              Save a delivery location for
                              faster checkout.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setShowAddAddress(false)
                            }
                            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-white hover:text-gray-700"
                            aria-label="Close"
                          >
                            <Icon.X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="p-4 sm:p-5">
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Input
                              label="Address Label"
                              value={
                                newAddress.label
                              }
                              onChange={(e) =>
                                setNewAddress({
                                  ...newAddress,
                                  label:
                                    e.target.value,
                                })
                              }
                              placeholder="Home"
                            />

                            <Input
                              label="Phone"
                              value={
                                newAddress.phone
                              }
                              onChange={(e) =>
                                setNewAddress({
                                  ...newAddress,
                                  phone:
                                    e.target.value,
                                })
                              }
                              placeholder="+91"
                            />
                          </div>

                          <Input
                            label="Street Address"
                            value={
                              newAddress.address
                            }
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                address:
                                  e.target.value,
                              })
                            }
                            placeholder="House number, street, area"
                          />

                          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <Input
                              label="City"
                              value={
                                newAddress.city
                              }
                              onChange={(e) =>
                                setNewAddress({
                                  ...newAddress,
                                  city:
                                    e.target.value,
                                })
                              }
                              placeholder="City"
                            />

                            <Input
                              label="State"
                              value={
                                newAddress.state
                              }
                              onChange={(e) =>
                                setNewAddress({
                                  ...newAddress,
                                  state:
                                    e.target.value,
                                })
                              }
                              placeholder="State"
                            />

                            <Input
                              label="ZIP Code"
                              value={
                                newAddress.zipCode
                              }
                              onChange={(e) =>
                                setNewAddress({
                                  ...newAddress,
                                  zipCode:
                                    e.target.value,
                                })
                              }
                              placeholder="Postal code"
                            />
                          </div>

                          <Input
                            label="Country"
                            value={
                              newAddress.country
                            }
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                country:
                                  e.target.value,
                              })
                            }
                            placeholder="India"
                          />
                        </div>

                        <div className="mt-5 flex flex-col gap-2 border-t border-pink-100 pt-4 sm:flex-row">
                          <Button
                            onClick={
                              handleAddAddress
                            }
                            disabled={
                              addAddressMutation.isPending
                            }
                            className="rounded-xl"
                          >
                            {addAddressMutation.isPending
                              ? 'Saving...'
                              : 'Save address'}
                          </Button>

                          <Button
                            variant="outline"
                            onClick={() =>
                              setShowAddAddress(false)
                            }
                            disabled={
                              addAddressMutation.isPending
                            }
                            className="rounded-xl bg-white"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Existing addresses */}

                  {profile.addresses &&
                  profile.addresses.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                      {profile.addresses.map(
                        (
                          address: Address
                        ) => (
                          <div
                            key={address._id}
                            className={`group relative overflow-hidden rounded-2xl border p-5 transition ${
                              address.isDefault
                                ? 'border-pink-200 bg-gradient-to-br from-pink-50/70 to-white'
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                            }`}
                          >
                            {address.isDefault && (
                              <div className="absolute right-0 top-0 rounded-bl-xl bg-pink-600 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.16em] text-white">
                                Default
                              </div>
                            )}

                            <div className="flex items-start gap-3">
                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                  address.isDefault
                                    ? 'bg-pink-100 text-pink-600'
                                    : 'bg-gray-100 text-gray-500'
                                }`}
                              >
                                <Icon.Location className="h-4.5 w-4.5" />
                              </div>

                              <div className="min-w-0 pr-12">
                                <h3 className="truncate text-sm font-bold text-gray-900">
                                  {address.label ||
                                    'Delivery address'}
                                </h3>

                                {address.isDefault && (
                                  <p className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-pink-600">
                                    Used by default
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50/80 p-4">
                              <p className="text-sm leading-6 text-gray-700">
                                {address.address}
                              </p>

                              <p className="text-sm leading-6 text-gray-500">
                                {address.city},{' '}
                                {address.state}{' '}
                                {address.zipCode}
                              </p>

                              <p className="text-sm leading-6 text-gray-500">
                                {address.country}
                              </p>

                              {address.phone && (
                                <div className="mt-3 flex items-center gap-2 border-t border-gray-200 pt-3 text-xs text-gray-400">
                                  <Icon.Phone className="h-3.5 w-3.5" />
                                  {address.phone}
                                </div>
                              )}
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-2">
                              {!address.isDefault && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleSetDefault(
                                      address._id!
                                    )
                                  }
                                  disabled={
                                    setDefaultAddressMutation.isPending ||
                                    settingDefaultAddress ===
                                      address._id
                                  }
                                  className="rounded-lg text-xs"
                                >
                                  {settingDefaultAddress ===
                                  address._id ? (
                                    'Setting...'
                                  ) : (
                                    <>
                                      <Icon.Check className="mr-1.5 h-3 w-3" />
                                      Set default
                                    </>
                                  )}
                                </Button>
                              )}

                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() =>
                                  handleDeleteAddress(
                                    address._id!
                                  )
                                }
                                disabled={
                                  deleteAddressMutation.isPending
                                }
                                className="rounded-lg text-xs"
                              >
                                {deleteAddressMutation.isPending
                                  ? 'Deleting...'
                                  : 'Delete'}
                              </Button>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-[#faf9fb] px-5 py-12 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-gray-300 shadow-sm">
                        <Icon.MapPin className="h-6 w-6" />
                      </div>

                      <p className="mt-4 text-sm font-semibold text-gray-800">
                        No saved addresses
                      </p>

                      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-gray-400">
                        Add your first delivery address
                        to make checkout faster next time.
                      </p>

                      <Button
                        onClick={() =>
                          setShowAddAddress(true)
                        }
                        className="mt-5 rounded-xl"
                      >
                        <span className="flex items-center gap-2">
                          <Icon.Plus className="h-4 w-4" />
                          Add your first address
                        </span>
                      </Button>
                    </div>
                  )}
                </div>
              </section>

              {/* ===================================================
                  ACCOUNT SHORTCUTS
              ==================================================== */}

              <section>
                <div className="mb-3 flex items-end justify-between">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-pink-500">
                      Quick access
                    </p>

                    <h2 className="mt-1 text-lg font-semibold tracking-tight text-gray-950">
                      Manage your account
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <Link
                    href="/orders"
                    className="group rounded-2xl border border-gray-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-500 transition group-hover:bg-pink-50 group-hover:text-pink-600">
                        <Icon.ShoppingBag className="h-4.5 w-4.5" />
                      </div>

                      <Icon.ArrowRight className="h-4 w-4 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-gray-500" />
                    </div>

                    <p className="mt-5 text-sm font-semibold text-gray-900">
                      My orders
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-400">
                      Track and manage your purchases.
                    </p>
                  </Link>

                  <Link
                    href="/wallet"
                    className="group rounded-2xl border border-gray-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-500 transition group-hover:bg-pink-50 group-hover:text-pink-600">
                        <Icon.Wallet className="h-4.5 w-4.5" />
                      </div>

                      <Icon.ArrowRight className="h-4 w-4 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-gray-500" />
                    </div>

                    <p className="mt-5 text-sm font-semibold text-gray-900">
                      Wallet
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-400">
                      ₹{walletBalance.toFixed(2)}{' '}
                      available to use.
                    </p>
                  </Link>

                  <Link
                    href="/products"
                    className="group rounded-2xl border border-gray-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-500 transition group-hover:bg-pink-50 group-hover:text-pink-600">
                        <Icon.Heart className="h-4.5 w-4.5" />
                      </div>

                      <Icon.ArrowRight className="h-4 w-4 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-gray-500" />
                    </div>

                    <p className="mt-5 text-sm font-semibold text-gray-900">
                      Discover more
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-400">
                      Explore the latest BellesCart
                      collection.
                    </p>
                  </Link>
                </div>
              </section>

              {/* ===================================================
                  SECURITY / TRUST
              ==================================================== */}

              <section className="overflow-hidden rounded-3xl border border-gray-200 bg-[#201a20] p-5 text-white sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-pink-300">
                      <Icon.Shield className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold">
                        Your account, your details.
                      </p>

                      <p className="mt-1 max-w-xl text-xs leading-5 text-gray-400">
                        Keep your contact and delivery
                        information up to date so every
                        BellesCart order reaches you smoothly.
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/products"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-bold text-gray-900 transition hover:bg-gray-100"
                  >
                    Shop collection
                    <Icon.ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}