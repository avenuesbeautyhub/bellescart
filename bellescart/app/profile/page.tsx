'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRequireUserAuth, clearUserSession } from '@/auth/user';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loaded, isAuthenticated } = useRequireUserAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profilePic, setProfilePic] = useState('');
  const [showAddAddress, setShowAddAddress] = useState(false);

  const [profile, setProfile] = useState({
    firstName: user?.name?.split(' ')[0] || 'User',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || 'user@example.com',
    phone: '+91 (555) 000-0000',
    profilePic: '👤',
  });

  const [addresses, setAddresses] = useState([
    {
      id: 1,
      label: 'Home',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'India',
      isDefault: true,
    },
  ]);

  const [newAddress, setNewAddress] = useState({
    label: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  });

  const [formData, setFormData] = useState(profile);

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSave = () => {
    setProfile(formData);
    setIsEditing(false);
  };

  const handleProfileCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  const handleAddAddress = () => {
    if (newAddress.address && newAddress.city) {
      const addressToAdd = {
        id: Math.max(0, ...addresses.map(a => a.id)) + 1,
        ...newAddress,
        isDefault: addresses.length === 0,
      };
      setAddresses([...addresses, addressToAdd]);
      setNewAddress({
        label: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
      });
      setShowAddAddress(false);
    }
  };

  const handleDeleteAddress = (id: number) => {
    setAddresses(addresses.filter(a => a.id !== id));
  };

  const handleSetDefault = (id: number) => {
    setAddresses(addresses.map(a => ({
      ...a,
      isDefault: a.id === id,
    })));
  };

  const handlePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    clearUserSession();
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-800 mb-12">My Profile</h1>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 sticky top-4">
                {/* Profile Picture */}
                <div className="text-center mb-6">
                  {profilePic ? (
                    <img src={profilePic} alt="Profile" className="w-32 h-32 mx-auto rounded-full object-cover mb-4 shadow-lg" />
                  ) : (
                    <div className="w-32 h-32 mx-auto bg-gradient-to-br from-pink-500 to-pink-700 rounded-full flex items-center justify-center text-white text-5xl font-bold mb-4 shadow-lg">
                      {profile.firstName.charAt(0)}
                      {profile.lastName.charAt(0)}
                    </div>
                  )}

                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePicChange}
                      className="hidden"
                    />
                    <div className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition">
                      Change Photo
                    </div>
                  </label>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h2 className="text-xl font-semibold text-gray-800 text-center">
                    {profile.firstName} {profile.lastName}
                  </h2>
                  <p className="text-gray-600 text-center text-sm mt-1">{profile.email}</p>
                </div>

                <div className="space-y-3 mt-6">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-600 uppercase tracking-wide">Member Since</p>
                    <p className="font-semibold text-gray-800">January 2024</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-gray-600 uppercase tracking-wide">Total Orders</p>
                    <p className="font-semibold text-gray-800">3</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs text-gray-600 uppercase tracking-wide">Total Spent</p>
                    <p className="font-semibold text-gray-800">₹45,299</p>
                  </div>
                </div>

                <Button variant="danger" className="w-full mt-6" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Personal Information */}
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-800">Personal Information</h2>
                  {!isEditing && (
                    <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                  )}
                </div>

                {isEditing ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <Input
                        label="First Name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleProfileChange}
                      />
                      <Input
                        label="Last Name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleProfileChange}
                      />
                    </div>

                    <Input
                      label="Email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleProfileChange}
                      className="mb-4"
                    />

                    <Input
                      label="Phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleProfileChange}
                      className="mb-6"
                    />

                    <div className="flex gap-4">
                      <Button onClick={handleProfileSave}>Save Changes</Button>
                      <Button variant="outline" onClick={handleProfileCancel}>
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">First Name</p>
                      <p className="font-semibold text-gray-800 text-lg">{profile.firstName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Last Name</p>
                      <p className="font-semibold text-gray-800 text-lg">{profile.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Email</p>
                      <p className="font-semibold text-gray-800 text-lg">{profile.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Phone</p>
                      <p className="font-semibold text-gray-800 text-lg">{profile.phone}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Saved Addresses */}
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-800">Saved Addresses</h2>
                  {!showAddAddress && (
                    <Button onClick={() => setShowAddAddress(true)}>+ Add New Address</Button>
                  )}
                </div>

                {showAddAddress && (
                  <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
                    <h3 className="font-semibold text-gray-800 mb-4">Add New Address</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <Input
                        label="Address Label (e.g., Home, Office)"
                        value={newAddress.label}
                        onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                        placeholder="Home"
                      />
                      <Input
                        label="Phone"
                        value={newAddress.zipCode}
                        onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                        placeholder="+91"
                      />
                    </div>

                    <Input
                      label="Street Address"
                      value={newAddress.address}
                      onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                      placeholder="123 Main Street"
                      className="mb-4"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <Input
                        label="City"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        placeholder="New York"
                      />
                      <Input
                        label="State"
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        placeholder="NY"
                      />
                      <Input
                        label="ZIP Code"
                        value={newAddress.zipCode}
                        onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                        placeholder="10001"
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button onClick={handleAddAddress}>Save Address</Button>
                      <Button variant="outline" onClick={() => setShowAddAddress(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {addresses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map(address => (
                      <div key={address.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-gray-800">{address.label}</h3>
                          {address.isDefault && (
                            <Badge variant="success" className="text-xs">Default</Badge>
                          )}
                        </div>

                        <p className="text-gray-700 text-sm mb-1">{address.address}</p>
                        <p className="text-gray-600 text-sm">{address.city}, {address.state} {address.zipCode}</p>
                        <p className="text-gray-600 text-sm mb-4">{address.country}</p>

                        <div className="flex gap-2">
                          {!address.isDefault && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSetDefault(address.id)}
                            >
                              Set as Default
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDeleteAddress(address.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No addresses saved yet</p>
                    <Button onClick={() => setShowAddAddress(true)}>Add Your First Address</Button>
                  </div>
                )}
              </div>



            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}