import { IAdmin, IUser } from '../../models/User';
import { IProduct } from '../../models/Product';
import { ICategory } from '../../models/Category';
import { UploadedImage } from '../../services/cloudinaryService';
import { Request } from 'express';

export interface IAdminInteractor {
  adminLogin(credentials: {
    email: string;
    password: string;
  }): Promise<{ admin: Partial<IAdmin>; token: string; refreshToken: string }>;
  registerAdmin(adminData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    registrationKey: string;
  }): Promise<{ admin: Partial<IAdmin>; message: string }>;
  getAdminProfile(adminId: string): Promise<Partial<IAdmin> | null>;
  updateAdminProfile(adminId: string, updateData: {
    name?: string;
    email?: string;
    phone?: string;
    permissions?: string[];
  }): Promise<Partial<IAdmin> | null>;
  changeAdminPassword(adminId: string, passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void>;
  getAllUsers(): Promise<Partial<IUser>[]>;
  getUserById(userId: string): Promise<Partial<IUser> | null>;
  updateUser(userId: string, updateData: {
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
  }): Promise<Partial<IUser> | null>;
  updateUserStatus(userId: string, status: 'active' | 'inactive' | 'suspended'): Promise<void>;
  deleteUser(userId: string): Promise<void>;
  getAdminStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalOrders: number;
    totalRevenue: number;
  }>;

  // Image Upload Methods
  uploadProductImage(req: Request): Promise<UploadedImage>;
  uploadMultipleImages(req: Request): Promise<UploadedImage[]>;

  // Product Management Methods
  getProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    status?: string;
    sort?: string;
    order?: string;
  }): Promise<IProduct[]>;
  getProductById(id: string): Promise<IProduct | null>;
  createProduct(productData: any, files?: Express.Multer.File[]): Promise<{ product: IProduct; uploadedImages?: UploadedImage[] }>;
  updateProduct(id: string, productData: any, files?: Express.Multer.File[]): Promise<{ product: IProduct; newImages?: UploadedImage[] }>;
  deleteProduct(id: string): Promise<void>;

  // User Management Methods
  getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }): Promise<Partial<IUser>[]>;

  // Category Management Methods
  getAllCategories(): Promise<ICategory[]>;
  createCategory(categoryData: { name: string; description?: string; isActive?: boolean }): Promise<ICategory>;
  updateCategory(id: string, categoryData: { name?: string; description?: string; isActive?: boolean }): Promise<ICategory | null>;
  deleteCategory(id: string): Promise<ICategory | null>;
  getCategoryById(id: string): Promise<ICategory | null>;
  getCategoryByName(name: string): Promise<ICategory | null>;
  getActiveCategories(): Promise<ICategory[]>;
}
