import { User } from '../utils/types';

// API service for handling backend requests
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export type AuthResponse = {
  success: true;
  user: User;
  token: string;
};

// Dummy credentials for testing
export const DUMMY_CREDENTIALS = {
  user: {
    email: 'user@example.com',
    password: 'user123',
  },
  admin: {
    email: 'admin@bellescart.com',
    password: 'admin123',
  },
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  // For demo purposes, check against dummy credentials
  if (email === DUMMY_CREDENTIALS.user.email && password === DUMMY_CREDENTIALS.user.password) {
    return {
      success: true,
      user: {
        id: '1',
        name: 'John Doe',
        email: email,
        role: 'user' as const,
      },
      token: 'dummy-user-token',
    };
  }
  if (email === DUMMY_CREDENTIALS.admin.email && password === DUMMY_CREDENTIALS.admin.password) {
    return {
      success: true,
      user: {
        id: 'admin1',
        name: 'Admin User',
        email: email,
        role: 'admin' as const,
      },
      token: 'dummy-admin-token',
    };
  }
  throw new Error('Invalid credentials');
};

export const register = async (userData: any) => {
  // Mock registration
  return {
    success: true,
    user: {
      id: 'new-user',
      name: userData.name,
      email: userData.email,
      role: 'user',
    },
    token: 'dummy-new-user-token',
  };
};

export const fetchProducts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const fetchCart = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/cart`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
};
