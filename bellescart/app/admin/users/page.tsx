'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { adminUserService, UserData } from '@/services/admin/userService';
import { globalToast } from '@/utils/globalToast';

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await adminUserService.getUsers();
      if (response.success && response.data?.users) {
        setUsers(response.data.users);
      }
      console.log('userdata', response.data);

    } catch (error: any) {
      console.error('Failed to load users:', error);
      globalToast.admin.error('Load Failed', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="success">Active</Badge>
    ) : (
      <Badge variant="warning">Inactive</Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    return role === 'admin' ? (
      <Badge variant="primary">Admin</Badge>
    ) : (
      <Badge variant="secondary">User</Badge>
    );
  };

  const handleToggleStatus = async (user: UserData) => {
    const newStatus = user.isActive ? 'inactive' : 'active';

    try {
      const response = await adminUserService.updateUserStatus(user.id, newStatus);
      if (response.success) {
        globalToast.admin.success('Success', `User ${newStatus}d successfully`);
        loadUsers(); // Reload users to show updated status
      } else {
        globalToast.admin.error('Error', response.message || 'Failed to update user status');
      }
    } catch (error: any) {
      console.error('Toggle status error:', error);
      globalToast.admin.error('Error', 'Failed to update user status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          <div className="flex gap-4">
            <Link href="/admin/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
            <Button>Add New User</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm font-semibold mb-2">Total Users</p>
            <p className="text-3xl font-bold text-gray-900">{users.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm font-semibold mb-2">Active Users</p>
            <p className="text-3xl font-bold text-green-600">
              {users.filter(u => u.isActive === true).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm font-semibold mb-2">Admin Users</p>
            <p className="text-3xl font-bold text-blue-600">
              {users.filter(u => u.role === 'admin').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm font-semibold mb-2">New This Month</p>
            <p className="text-3xl font-bold text-purple-600">2</p>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">All Users</h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-gray-500">Loading users...</div>
            </div>
          ) : users.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-gray-500 text-center">
                <div className="text-gray-400 mb-2">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                    <path d="M8 16h.01M8 24h.01M8 32h.01M16 8h.01M16 16h.01M16 24h.01M16 32h.01M24 8h.01M24 16h.01M24 24h.01M24 32h.01M32 8h.01M32 16h.01M32 24h.01M32 32h.01M40 8h.01M40 16h.01M40 24h.01M40 32h.01" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-gray-900">No users found</p>
                <p className="text-sm text-gray-500">No users have registered yet</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Join Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-500 to-pink-700 flex items-center justify-center text-white font-bold">
                              {user.name.charAt(0)}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user.isActive)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(user.joinDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.orders}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <Link href={`/admin/users/edit/${user.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                            >
                              Edit
                            </Button>
                          </Link>
                          <Button
                            variant={user.isActive === true ? 'danger' : 'primary'}
                            size="sm"
                            onClick={() => handleToggleStatus(user)}
                          >
                            {user.isActive === true ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

    </div>
  );
}