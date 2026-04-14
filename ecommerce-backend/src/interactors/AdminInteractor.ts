import { IAdminInteractor } from '../providers/interfaces/IAdminInteractor';
import { IAdminRepository } from '../providers/interfaces/IAdminRepository';
import { IProductInteractor } from '../providers/interfaces/IProductInteractor';
import { ICategoryInteractor } from '../providers/interfaces/ICategoryInteractor';
import { generateToken, generateRefreshToken } from '../utils/jwt';
import { IAdmin, IUser } from '../models/User';
import { IProduct } from '../models/Product';
import { Request } from 'express';
import { uploadMultipleImages, uploadProductImage } from '../services/cloudinaryService';
import mongoose from 'mongoose';

export class AdminInteractor implements IAdminInteractor {
  private _adminRepository: IAdminRepository;
  private _productInteractor: IProductInteractor;
  private _categoryInteractor: ICategoryInteractor;

  constructor(adminRepository: IAdminRepository, productInteractor: IProductInteractor, categoryInteractor: ICategoryInteractor) {
    this._adminRepository = adminRepository;
    this._productInteractor = productInteractor;
    this._categoryInteractor = categoryInteractor;
  }

  async adminLogin(credentials: {
    email: string;
    password: string;
  }): Promise<{ admin: Partial<IAdmin>; token: string; refreshToken: string }> {
    // Find admin with password
    const admin = await this._adminRepository.findByEmail(credentials.email);
    if (!admin) {
      throw new Error(`Invalid admin credentials for ${credentials.email}`);
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(credentials.password);
    if (!isPasswordValid) {
      throw new Error(`Invalid password for admin ${credentials.email}`);
    }

    // Update last login
    await this._adminRepository.updateLastLogin(admin._id.toString());

    // Generate tokens
    const token = generateToken(admin);
    const refreshToken = generateRefreshToken(admin);

    // Return admin data without sensitive information
    const adminResponse = {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      avatar: admin.avatar,
      phone: admin.phone,
      permissions: admin.permissions
    };

    return { admin: adminResponse, token, refreshToken };
  }

  async registerAdmin(adminData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    registrationKey: string;
  }): Promise<{ admin: Partial<IAdmin>; message: string }> {
    // Validate registration key - this is business logic that belongs in interactor



    const ADMIN_REGISTRATION_KEY = process.env.ADMIN_REGISTRATION_KEY || 'bellescart-admin-2024';

    console.log('admin reg key', ADMIN_REGISTRATION_KEY);

    if (adminData.registrationKey !== ADMIN_REGISTRATION_KEY) {
      throw new Error('Invalid registration key');
    }

    // Delegate admin creation (including duplicate check) to repository
    const newAdmin = await this._adminRepository.registerAdmin({
      name: adminData.name,
      email: adminData.email,
      password: adminData.password,
      phone: adminData.phone
    });

    // Return admin data without sensitive information
    const adminResponse = {
      id: newAdmin._id,
      name: newAdmin.name,
      email: newAdmin.email,
      role: newAdmin.role,
      avatar: newAdmin.avatar,
      phone: newAdmin.phone,
      permissions: newAdmin.permissions,
      isActive: newAdmin.isActive
    };

    return { admin: adminResponse, message: 'Admin registered successfully' };
  }

  async getAdminProfile(adminId: string): Promise<Partial<IAdmin> | null> {
    const admin = await this._adminRepository.findById(adminId);
    if (!admin) return null;

    return {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      avatar: admin.avatar,
      phone: admin.phone,
      permissions: admin.permissions,
      lastLogin: admin.lastLogin,
      isActive: admin.isActive
    };
  }

  async updateAdminProfile(adminId: string, updateData: {
    name?: string;
    email?: string;
    phone?: string;
  }): Promise<Partial<IAdmin> | null> {
    const admin = await this._adminRepository.updateProfile(adminId, updateData);
    if (!admin) return null;

    return {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      avatar: admin.avatar,
      phone: admin.phone,
      permissions: admin.permissions,
      lastLogin: admin.lastLogin,
      isActive: admin.isActive
    };
  }

  async changeAdminPassword(adminId: string, passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    const admin = await this._adminRepository.findById(adminId);
    if (!admin) {
      throw new Error('Admin not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await admin.comparePassword(passwordData.currentPassword);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Update password - this would require updating the Admin model directly
    // For now, this is a placeholder implementation
    console.log(`Password change requested for admin ${adminId}`);
  }

  async getAllUsers(): Promise<Partial<IUser>[]> {
    const users = await this._adminRepository.getAllUsers();
    return users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone
    }));
  }

  async getUserById(userId: string): Promise<Partial<IUser> | null> {
    // This would typically query the User collection, not Admin collection
    // For now, returning null as placeholder
    return null;
  }

  async updateUserStatus(userId: string, status: 'active' | 'inactive' | 'suspended'): Promise<void> {
    // This would update the User collection, not Admin collection
    // For now, this is a placeholder implementation
    console.log(`Updating user ${userId} status to ${status}`);
  }

  async deleteUser(userId: string): Promise<void> {
    // This would delete from User collection, not Admin collection
    // For now, this is a placeholder implementation
    console.log(`Deleting user ${userId}`);
  }

  async getAdminStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalOrders: number;
    totalRevenue: number;
  }> {
    return await this._adminRepository.getAdminStats();
  }

  // Image Upload Methods
  async uploadProductImage(req: Request): Promise<any> {
    try {
      return await uploadProductImage(req);
    } catch (error: any) {
      throw new Error(error.message || 'Image upload failed');
    }
  }

  async uploadMultipleImages(req: Request): Promise<any[]> {
    try {
      return await uploadMultipleImages(req);
    } catch (error: any) {
      throw new Error(error.message || 'Images upload failed');
    }
  }

  // Product Management Methods
  async createProduct(productData: any, files?: Express.Multer.File[]): Promise<{ product: IProduct; uploadedImages?: any[] }> {
    try {
      // Validate required fields
      if (!productData.name || !productData.price || !productData.category) {
        throw new Error('Missing required fields: name, price, category are required');
      }

      // Validate price is greater than 0
      const price = parseFloat(productData.price);
      if (isNaN(price) || price <= 0) {
        throw new Error('Price must be greater than 0');
      }

      // Validate quantity/stock is greater than 0
      const quantity = parseInt(productData.quantity) || 1;
      if (quantity <= 0) {
        throw new Error('Quantity/stock must be greater than 0');
      }

      // Validate category ID format
      if (!mongoose.Types.ObjectId.isValid(productData.category)) {
        throw new Error('Invalid category ID format');
      }

      // Validate category exists
      const category = await this._categoryInteractor.getCategoryById(productData.category.toString());
      if (!category) {
        throw new Error('Invalid category: Category not found');
      }

      // Check for duplicate product name (case-insensitive)
      const existingProduct = await this._productInteractor.findByName(productData.name.trim());
      if (existingProduct) {
        throw new Error(`Product with name '${productData.name}' already exists`);
      }

      // Process images if provided
      let uploadedImages: any[] = [];
      if (files && files.length > 0) {
        // Create mock request object for multer processing
        const mockReq = { files } as any;
        Object.assign(mockReq, productData);

        uploadedImages = await uploadMultipleImages(mockReq);
      }

      // Process uploaded images to match product schema
      const productImages = uploadedImages.map((img: any, index: number) => ({
        url: img.url,
        alt: productData.imageAlts?.[index] || `${productData.name} - Image ${index + 1}`,
        isMain: index === 0 // First image is main by default
      }));

      // Create complete product data
      const finalProductData = {
        ...productData,
        images: uploadedImages.length > 0 ? productImages : [],
        // Convert and validate fields
        category: new mongoose.Types.ObjectId(productData.category),
        price: parseFloat(productData.price) || 0,
        quantity: parseInt(productData.quantity) || 1,
        status: productData.status || 'active'
      };

      // Create product directly using repository
      const product = await this._productInteractor.createProduct(finalProductData);

      return {
        product,
        uploadedImages: uploadedImages.length > 0 ? productImages : undefined
      };
    } catch (error: any) {
      throw new Error(error.message || 'Product creation failed');
    }
  }

  async updateProduct(id: string, productData: any, files?: Express.Multer.File[]): Promise<{ product: IProduct; newImages?: any[] }> {
    try {
      // Process new images if provided
      let newImages: any[] = [];
      if (files && files.length > 0) {
        // Create mock request object for multer processing
        const mockReq = { files } as any;
        Object.assign(mockReq, productData);

        const uploadedImages = await uploadMultipleImages(mockReq);
        newImages = uploadedImages.map((img: any, index: number) => ({
          url: img.url,
          alt: productData.imageAlts?.[index] || `${productData.name} - Image ${index + 1}`,
          isMain: productData.mainImageIndex === index.toString()
        }));
      }

      // Get existing product
      const existingProduct = await this._productInteractor.getProductById(id);
      if (!existingProduct) {
        throw new Error('Product not found');
      }

      // Validate category if it's being updated
      if (productData.category && productData.category !== existingProduct.category.toString()) {
        // Validate category ID format
        if (!mongoose.Types.ObjectId.isValid(productData.category)) {
          throw new Error('Invalid category ID format');
        }

        const category = await this._categoryInteractor.getCategoryById(productData.category.toString());
        if (!category) {
          throw new Error('Invalid category: Category not found');
        }
        // Convert to ObjectId
        productData.category = new mongoose.Types.ObjectId(productData.category);
      }

      // Combine existing images with new ones (if any)
      const updatedImages = productData.keepExistingImages === 'true'
        ? [...existingProduct.images, ...newImages]
        : newImages;

      // Update product data
      const finalProductData = {
        ...productData,
        images: updatedImages,
        price: parseFloat(productData.price),
        quantity: parseInt(productData.quantity) || existingProduct.quantity,
        status: productData.status || existingProduct.status
      };

      // Update product using product interactor
      const updatedProduct = await this._productInteractor.updateProduct(id, finalProductData);

      if (!updatedProduct) {
        throw new Error('Failed to update product');
      }

      return {
        product: updatedProduct,
        newImages
      };
    } catch (error: any) {
      throw new Error(error.message || 'Product update failed');
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      const product = await this._productInteractor.deleteProduct(id);
      if (!product) {
        throw new Error('Product not found');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Product deletion failed');
    }
  }
}
