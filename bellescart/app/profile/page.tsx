'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRequireUserAuth, clearUserSession } from '@/auth/user';
import { UserProfile, Address } from '@/types/auth';
import { useRouter } from 'next/navigation';

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

export default function ProfilePage() {
  const router = useRouter();

  const {
    user,
    loaded,
    isAuthenticated,
  } = useRequireUserAuth();

  const [isEditing, setIsEditing] =
    useState(false);

  const [profilePic, setProfilePic] =
    useState('');

  const [showAddAddress, setShowAddAddress] =
    useState(false);

  const [settingDefaultAddress, setSettingDefaultAddress] =
    useState<string | null>(null);

  // ============================================================
  // QUERIES
  // ============================================================

  const {
    data: profileData,
    isLoading: isLoadingProfile,
  } = useProfile({
    enabled:
      isAuthenticated && loaded,
  });

  const {
    data: currentUserData,
  } = useCurrentUser();

  const {
    data: walletBalanceData,
  } = useWalletBalance({
    enabled:
      isAuthenticated && loaded,
  });

  // ============================================================
  // MUTATIONS
  // ============================================================

  const updateProfileMutation =
    useUpdateProfile();

  const addAddressMutation =
    useAddAddress();

  const updateAddressMutation =
    useUpdateAddress();

  const deleteAddressMutation =
    useDeleteAddress();

  const setDefaultAddressMutation =
    useSetDefaultAddress();

  const uploadProfilePictureMutation =
    useUploadProfilePicture();

  // ============================================================
  // PROFILE DATA
  // ============================================================

  const profile = React.useMemo(() => {
    if (!profileData?.data) {
      return {
        id: '',
        name: '',
        email: '',
        role: '',
        avatar: '',
        phone: '',
        addresses: [],
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
      phone:
        data.phone ||
        '+91 (555) 000-0000',
      addresses:
        data.addresses || [],
    };
  }, [profileData]);

  // ============================================================
  // FORM DATA
  // ============================================================

  const [formData, setFormData] =
    useState(profile);

  const [newAddress, setNewAddress] =
    useState({
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

  // ============================================================
  // LOADING / AUTH
  // ============================================================

  if (
    !loaded ||
    isLoadingProfile
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9fb]">

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

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileSave =
    async () => {
      try {
        await updateProfileMutation.mutateAsync(
          formData
        );

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

  const handleProfileCancel =
    () => {
      setFormData(profile);
      setIsEditing(false);
    };

  const handleAddAddress =
    async () => {
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
            (profile.addresses?.length ||
              0) === 0,
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
          error?.response?.data
            ?.message ||
          error?.message ||
          'Failed to add address';

        globalToast.general.error(
          'Error',
          errorMessage
        );
      }
    };

  const handleDeleteAddress =
    async (addressId: string) => {
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

  const handleSetDefault =
    async (addressId: string) => {
      setSettingDefaultAddress(
        addressId
      );

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

  const handlePicChange =
    async (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const file =
        e.target.files?.[0];

      if (!file) {
        return;
      }

      try {
        await uploadProfilePictureMutation.mutateAsync(
          file
        );

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

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9fb] text-gray-900">

      <Navbar />

      <main className="flex-1">

        {/* ======================================================
            PAGE HEADER
        ======================================================= */}

        <section className="border-b border-gray-100 bg-white">

          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

            <div className="flex flex-col gap-1">

              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-pink-500">
                My account
              </p>

              <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
                Profile & Settings
              </h1>

              <p className="max-w-2xl text-sm text-gray-500">
                Manage your personal details, delivery
                addresses and account preferences.
              </p>

            </div>

          </div>

        </section>

        {/* ======================================================
            MAIN
        ======================================================= */}

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:gap-8">

            {/* ==================================================
                SIDEBAR
            =================================================== */}

            <aside className="lg:sticky lg:top-24">

              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">

                {/* Profile identity */}

                <div className="bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 px-5 pb-6 pt-6 text-white">

                  <div className="flex items-center gap-4">

                    <div className="relative shrink-0">

                      {profilePic ||
                      profile.avatar ? (
                        <img
                          src={
                            profilePic ||
                            profile.avatar
                          }
                          alt="Profile"
                          className="h-16 w-16 rounded-2xl object-cover ring-2 ring-white/20"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-500 text-2xl font-bold">
                          {profile.name?.charAt(
                            0
                          ) || 'U'}
                        </div>
                      )}

                      <label
                        htmlFor="profile-picture"
                        className="absolute -bottom-2 -right-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-gray-900 bg-white text-gray-700 shadow-md transition hover:bg-pink-50 hover:text-pink-600"
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

                        <svg
                          className="h-3.5 w-3.5"
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

                      </label>

                    </div>

                    <div className="min-w-0">

                      <p className="truncate text-base font-bold">
                        {profile.name ||
                          'Welcome'}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-gray-400">
                        {profile.email}
                      </p>

                      <span className="mt-2 inline-flex rounded-full bg-white/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-gray-300">
                        {profile.role ||
                          'Customer'}
                      </span>

                    </div>

                  </div>

                </div>

                {/* Quick account links */}

                <div className="p-3">

                  <p className="px-2 pb-2 pt-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Account
                  </p>

                  <Link
                    href="/orders"
                    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-gray-950"
                  >

                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 group-hover:bg-pink-50 group-hover:text-pink-600">

                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.7}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a3 3 0 006 0M9 5a3 3 0 016 0"
                        />
                      </svg>

                    </span>

                    My Orders

                    <svg
                      className="ml-auto h-4 w-4 text-gray-300 transition group-hover:text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.7}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>

                  </Link>

                  <Link
                    href="/wallet"
                    className="group mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-gray-950"
                  >

                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 group-hover:bg-pink-50 group-hover:text-pink-600">

                      <svg
                        className="h-4 w-4"
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

                    </span>

                    Wallet

                    <svg
                      className="ml-auto h-4 w-4 text-gray-300 transition group-hover:text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.7}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>

                  </Link>

                  <Link
                    href="/payments"
                    className="group mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-gray-950"
                  >

                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 group-hover:bg-pink-50 group-hover:text-pink-600">

                      <svg
                        className="h-4 w-4"
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

                    </span>

                    Payment History

                    <svg
                      className="ml-auto h-4 w-4 text-gray-300 transition group-hover:text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.7}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>

                  </Link>

                </div>

                {/* Wallet mini card */}

                <div className="mx-3 mb-3 rounded-xl border border-pink-100 bg-pink-50 p-4">

                  <div className="flex items-center justify-between">

                    <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600">
                      Wallet balance
                    </span>

                    <svg
                      className="h-4 w-4 text-pink-400"
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

                  </div>

                  <p className="mt-1 text-xl font-bold text-gray-950">
                    ₹
                    {walletBalanceData?.data?.balance?.toFixed(
                      2
                    ) || '0.00'}
                  </p>

                  <Link
                    href="/wallet"
                    className="mt-2 inline-block text-[11px] font-bold text-pink-600 hover:text-pink-700"
                  >
                    Manage wallet →
                  </Link>

                </div>

                {/* Logout */}

                <div className="border-t border-gray-100 p-3">

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-50"
                  >

                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">

                      <svg
                        className="h-4 w-4"
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

                    </span>

                    Sign out

                  </button>

                </div>

              </div>

            </aside>

            {/* ==================================================
                MAIN CONTENT
            =================================================== */}

            <div className="min-w-0 space-y-5">

              {/* ==================================================
                  PERSONAL INFORMATION
              =================================================== */}

              <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">

                <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50">

                      <svg
                        className="h-5 w-5 text-pink-600"
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

                    </div>

                    <div>

                      <h2 className="text-base font-bold text-gray-950">
                        Personal information
                      </h2>

                      <p className="text-xs text-gray-400">
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

                        <svg
                          className="h-3.5 w-3.5"
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

                        Edit profile

                      </span>
                    </Button>
                  )}

                </div>

                <div className="p-5 sm:p-6">

                  {isEditing ? (

                    <div className="space-y-5">

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                        <Input
                          label="Full Name"
                          name="name"
                          value={
                            formData.name
                          }
                          onChange={
                            handleProfileChange
                          }
                        />

                        <Input
                          label="Email"
                          type="email"
                          name="email"
                          value={
                            formData.email
                          }
                          onChange={
                            handleProfileChange
                          }
                        />

                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                        <Input
                          label="Phone"
                          name="phone"
                          value={
                            formData.phone
                          }
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

                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Full name
                        </p>

                        <p className="mt-1.5 text-sm font-semibold text-gray-900">
                          {profile.name ||
                            'Not provided'}
                        </p>

                      </div>

                      <div className="border-b border-gray-100 py-4 sm:pl-6">

                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Email
                        </p>

                        <p className="mt-1.5 break-all text-sm font-semibold text-gray-900">
                          {profile.email ||
                            'Not provided'}
                        </p>

                      </div>

                      <div className="py-4 sm:border-r sm:pr-6">

                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Phone
                        </p>

                        <p className="mt-1.5 text-sm font-semibold text-gray-900">
                          {profile.phone ||
                            'Not provided'}
                        </p>

                      </div>

                      <div className="py-4 sm:pl-6">

                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Account type
                        </p>

                        <div className="mt-1.5">

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

              {/* ==================================================
                  ADDRESSES
              =================================================== */}

              <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">

                <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">

                      <svg
                        className="h-5 w-5 text-blue-600"
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

                    </div>

                    <div>

                      <h2 className="text-base font-bold text-gray-950">
                        Saved addresses
                      </h2>

                      <p className="text-xs text-gray-400">
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

                        <svg
                          className="h-4 w-4"
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

                        Add address

                      </span>
                    </Button>
                  )}

                </div>

                <div className="p-5 sm:p-6">

                  {/* Add address */}

                  {showAddAddress && (

                    <div className="mb-6 rounded-2xl border border-pink-100 bg-pink-50/40 p-4 sm:p-5">

                      <div className="mb-5 flex items-start justify-between gap-4">

                        <div>

                          <p className="text-sm font-bold text-gray-900">
                            Add a new address
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            Save a delivery address for faster checkout.
                          </p>

                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setShowAddAddress(
                              false
                            )
                          }
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-white hover:text-gray-700"
                        >

                          <svg
                            className="h-4 w-4"
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

                        </button>

                      </div>

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
                            setShowAddAddress(
                              false
                            )
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
                            key={
                              address._id
                            }
                            className={`group rounded-2xl border p-5 transition ${
                              address.isDefault
                                ? 'border-pink-200 bg-pink-50/30'
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                            }`}
                          >

                            {/* Address header */}

                            <div className="flex items-start justify-between gap-3">

                              <div className="flex min-w-0 items-center gap-3">

                                <div
                                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                                    address.isDefault
                                      ? 'bg-pink-100 text-pink-600'
                                      : 'bg-gray-100 text-gray-500'
                                  }`}
                                >

                                  <svg
                                    className="h-4 w-4"
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

                                </div>

                                <div className="min-w-0">

                                  <h3 className="truncate text-sm font-bold text-gray-900">
                                    {address.label ||
                                      'Address'}
                                  </h3>

                                  {address.isDefault && (
                                    <span className="mt-1 inline-flex text-[9px] font-bold uppercase tracking-wider text-pink-600">
                                      Default address
                                    </span>
                                  )}

                                </div>

                              </div>

                              {address.isDefault && (
                                <Badge
                                  variant="success"
                                  className="shrink-0 text-[9px]"
                                >
                                  Default
                                </Badge>
                              )}

                            </div>

                            {/* Address */}

                            <div className="mt-4 rounded-xl bg-gray-50 p-4">

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

                                  <svg
                                    className="h-3.5 w-3.5"
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

                                  {address.phone}

                                </div>
                              )}

                            </div>

                            {/* Actions */}

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
                                  address._id
                                    ? 'Setting...'
                                    : 'Set as default'}
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

                    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-5 py-10 text-center">

                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">

                        <svg
                          className="h-6 w-6 text-gray-300"
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

                      </div>

                      <p className="mt-4 text-sm font-bold text-gray-800">
                        No saved addresses
                      </p>

                      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-gray-400">
                        Add your first delivery address
                        to make checkout faster next time.
                      </p>

                      <Button
                        onClick={() =>
                          setShowAddAddress(
                            true
                          )
                        }
                        className="mt-4 rounded-xl"
                      >
                        Add your first address
                      </Button>

                    </div>

                  )}

                </div>

              </section>

              {/* ==================================================
                  ACCOUNT OVERVIEW
              =================================================== */}

              <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                <Link
                  href="/orders"
                  className="group rounded-2xl border border-gray-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-sm"
                >

                  <div className="flex items-center justify-between">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 group-hover:bg-pink-50">

                      <svg
                        className="h-4 w-4 text-gray-500 group-hover:text-pink-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.7}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a3 3 0 006 0M9 5a3 3 0 016 0"
                        />
                      </svg>

                    </div>

                    <svg
                      className="h-4 w-4 text-gray-300 group-hover:text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.7}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>

                  </div>

                  <p className="mt-4 text-sm font-bold text-gray-900">
                    My orders
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Track and manage your purchases
                  </p>

                </Link>

                <Link
                  href="/wallet"
                  className="group rounded-2xl border border-gray-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-sm"
                >

                  <div className="flex items-center justify-between">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 group-hover:bg-pink-50">

                      <svg
                        className="h-4 w-4 text-gray-500 group-hover:text-pink-600"
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

                    </div>

                    <svg
                      className="h-4 w-4 text-gray-300 group-hover:text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.7}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>

                  </div>

                  <p className="mt-4 text-sm font-bold text-gray-900">
                    Wallet
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    ₹
                    {walletBalanceData?.data?.balance?.toFixed(
                      2
                    ) || '0.00'}{' '}
                    available
                  </p>

                </Link>

                <Link
                  href="/products"
                  className="group rounded-2xl border border-gray-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-sm"
                >

                  <div className="flex items-center justify-between">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 group-hover:bg-pink-50">

                      <svg
                        className="h-4 w-4 text-gray-500 group-hover:text-pink-600"
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

                    </div>

                    <svg
                      className="h-4 w-4 text-gray-300 group-hover:text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.7}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>

                  </div>

                  <p className="mt-4 text-sm font-bold text-gray-900">
                    Continue shopping
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Explore the latest collection
                  </p>

                </Link>

              </section>

            </div>

          </div>

        </div>

      </main>

      <Footer />

    </div>
  );
}