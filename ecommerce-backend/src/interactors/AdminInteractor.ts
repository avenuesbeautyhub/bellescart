import { IAdminInteractor } from '../providers/interfaces/IAdminInteractor';
import { IAdminRepository } from '../providers/interfaces/IAdminRepository';
import { IProductInteractor } from '../providers/interfaces/IProductInteractor';
import { ICategoryInteractor } from '../providers/interfaces/ICategoryInteractor';
import { generateToken, generateRefreshToken } from '../utils/jwt';
import { IAdmin, IUser, User } from '../models/User';
import { IProduct } from '../models/Product';
import { Order } from '../models/Order';
import { Request } from 'express';
import { uploadMultipleImages, uploadProductImage } from '../services/cloudinaryService';
import mongoose from 'mongoose';
import { BadRequestError, UnauthorizedError, NotFoundError } from '../utils/customError';
import { ICategory } from '@/models';

export class AdminInteractor implements IAdminInteractor {
  private _adminRepository: IAdminRepository;
  private _productInteractor: IProductInteractor;
  private _categoryInteractor: ICategoryInteractor;
  private _userModel: typeof User;

  constructor(adminRepository: IAdminRepository, productInteractor: IProductInteractor, categoryInteractor: ICategoryInteractor) {
    this._adminRepository = adminRepository;
    this._productInteractor = productInteractor;
    this._categoryInteractor = categoryInteractor;
    this._userModel = User;
  }

  async adminLogin(credentials: {
    email: string;
    password: string;
  }): Promise<{ admin: Partial<IAdmin>; token: string; refreshToken: string }> {
    // Find admin with password
    const admin = await this._adminRepository.findByEmail(credentials.email);
    if (!admin) {
      throw new BadRequestError('Invalid admin credentials');
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(credentials.password);
    if (!isPasswordValid) {
      throw new BadRequestError('Invalid password');
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
      throw new BadRequestError('Invalid registration key');
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
      throw new NotFoundError('Admin not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await admin.comparePassword(passwordData.currentPassword);
    if (!isCurrentPasswordValid) {
      throw new BadRequestError('Current password is incorrect');
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
      phone: user.phone,
      status: user.isActive
    }));
  }

  async getUserById(userId: string): Promise<Partial<IUser> | null> {
    // This would typically query the User collection, not Admin collection
    // For now, returning null as placeholder
    return null;
  }

  async updateUser(userId: string, updateData: {
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
  }): Promise<Partial<IUser> | null> {
    try {
      const user = await this._userModel.findById(userId);
      if (!user) {
        return null;
      }

      // Update user fields
      if (updateData.name !== undefined) user.name = updateData.name;
      if (updateData.email !== undefined) user.email = updateData.email;
      if (updateData.phone !== undefined) user.phone = updateData.phone;
      if (updateData.role !== undefined && ['user', 'admin'].includes(updateData.role)) {
        user.role = updateData.role as 'user' | 'admin';
      }

      await user.save();

      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        phone: user.phone,
        avatar: user.avatar
      };
    } catch (error: any) {
      throw new BadRequestError(error.message || 'Failed to update user');
    }
  }

  async updateUserStatus(userId: string, status: 'active' | 'inactive' | 'suspended'): Promise<void> {
    try {
      const user = await this._userModel.findById(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      user.isActive = status === 'active';
      await user.save();
    } catch (error: any) {
      throw new BadRequestError(error.message || 'Failed to update user status');
    }
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
      throw new BadRequestError(error.message || 'Image upload failed');
    }
  }

  async uploadMultipleImages(req: Request): Promise<any[]> {
    try {
      return await uploadMultipleImages(req);
    } catch (error: any) {
      throw new BadRequestError(error.message || 'Images upload failed');
    }
  }

  // Product Management Methods
  async getProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    status?: string;
    sort?: string;
    order?: string;
  }): Promise<IProduct[]> {
    try {
      // Use existing product interactor to get products with filters
      const searchParams = {
        page: params?.page || 1,
        limit: params?.limit || 10,
        category: params?.category,
        search: params?.search,
        status: params?.status,
        sort: params?.sort || 'createdAt',
        order: (params?.order || 'desc') as 'asc' | 'desc'
      };

      const result = await this._productInteractor.getProducts(searchParams);
      return result.products || [];
    } catch (error: any) {
      throw new BadRequestError(error.message || 'Failed to get products');
    }
  }

  async getProductById(id: string): Promise<IProduct | null> {
    try {
      const product = await this._productInteractor.getProductById(id);
      return product;
    } catch (error: any) {
      throw new BadRequestError(error.message || 'Failed to get product');
    }
  }

  async createProduct(productData: any, files?: Express.Multer.File[]): Promise<{ product: IProduct; uploadedImages?: any[] }> {
    try {
      // Validate required fields
      if (!productData.name || !productData.price || !productData.category) {
        throw new BadRequestError('Missing required fields: name, price, category are required');
      }

      // Validate price is greater than 0
      const price = parseFloat(productData.price);
      if (isNaN(price) || price <= 0) {
        throw new BadRequestError('Price must be greater than 0');
      }

      // Validate quantity/stock is greater than 0
      const quantity = parseInt(productData.quantity) || 1;
      if (quantity <= 0) {
        throw new BadRequestError('Quantity/stock must be greater than 0');
      }

      // Validate category ID format
      if (!mongoose.Types.ObjectId.isValid(productData.category)) {
        throw new BadRequestError('Invalid category ID format');
      }

      // Validate category exists
      const category = await this._categoryInteractor.getCategoryById(productData.category.toString());
      if (!category) {
        throw new NotFoundError('Invalid category: Category not found');
      }

      // Check for duplicate product name (case-insensitive)
      const existingProduct = await this._productInteractor.findByName(productData.name.trim());
      if (existingProduct) {
        throw new BadRequestError(`Product with name '${productData.name}' already exists`);
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
        throw new NotFoundError('Product not found');
      }

      // Validate category if it's being updated
      if (productData.category && productData.category !== existingProduct.category.toString()) {
        // Validate category ID format
        if (!mongoose.Types.ObjectId.isValid(productData.category)) {
          throw new BadRequestError('Invalid category ID format');
        }

        const category = await this._categoryInteractor.getCategoryById(productData.category.toString());
        if (!category) {
          throw new NotFoundError('Invalid category: Category not found');
        }
        // Convert to ObjectId
        productData.category = new mongoose.Types.ObjectId(productData.category);
      }

      // Handle existing images from frontend
      let existingImagesFromFrontend = [];
      if (productData.existingImages) {
        try {
          existingImagesFromFrontend = JSON.parse(productData.existingImages);
        } catch (error) {
          console.warn('Failed to parse existingImages:', error);
          existingImagesFromFrontend = [];
        }
      }

      // Combine existing images with new ones (if any)
      const updatedImages = existingImagesFromFrontend.length > 0 || newImages.length === 0
        ? [...existingImagesFromFrontend, ...newImages]
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
        throw new BadRequestError('Failed to update product');
      }

      return {
        product: updatedProduct,
        newImages
      };
    } catch (error: any) {
      throw new BadRequestError(error.message || 'Product update failed');
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      const product = await this._productInteractor.deleteProduct(id);
      if (!product) {
        throw new NotFoundError('Product not found');
      }
    } catch (error: any) {
      throw new BadRequestError(error.message || 'Product deletion failed');
    }
  }

  // User Management Methods
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }): Promise<Partial<IUser>[]> {
    try {
      console.log('params in getUsers', params);

      const query: any = {};

      if (params?.role) {
        query.role = params.role;
      }

      if (params?.status) {
        query.isActive = params.status === 'true' || params.status === 'active';
      }

      if (params?.search) {
        query.$or = [
          { name: { $regex: params.search, $options: 'i' } },
          { email: { $regex: params.search, $options: 'i' } }
        ];
      }

      const users = await this._adminRepository.findAllUsers(query, {
        limit: params?.limit || 10,
        skip: ((params?.page || 1) - 1) * (params?.limit || 10),
        sort: { createdAt: -1 }
      });

      // Fetch order counts for each user
      const userIds = users.map(user => user._id);
      const orderCounts = await Order.aggregate([
        { $match: { user: { $in: userIds } } },
        { $group: { _id: '$user', count: { $sum: 1 } } }
      ]);

      // Create a map of user ID to order count
      const orderCountMap = new Map(
        orderCounts.map(item => [item._id.toString(), item.count])
      );

      // Map database fields to frontend interface
      return users.map(user => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        phone_number: user.phone,
        joinDate: (user as any).createdAt?.toISOString() || (user as any)._id.getTimestamp().toISOString(),
        orders: orderCountMap.get(user._id.toString()) || 0
      }));
    } catch (error: any) {
      throw new BadRequestError(error.message || 'Failed to get users');
    }
  }

  // ... (rest of the code remains the same)
  // Category Management Methods
  async getAllCategories(): Promise<ICategory[]> {
    try {
      const categories = await this._categoryInteractor.getAllCategories();

      // Get product count for each category
      const categoriesWithCount = await Promise.all(
        categories.map(async (category) => {
          const productsWithCategory = await this._productInteractor.getProducts({
            category: category._id.toString(),
            limit: 1 // We only need to count
          });

          return {
            name: category.name,
            description: category.description,
            isActive: category.isActive,
            _id: category._id,
            productCount: productsWithCategory.pagination?.total || 0
          } as any; // Cast to any to avoid type issues
        })
      );

      return categoriesWithCount;
    } catch (error: any) {
      throw new BadRequestError(error.message || 'Failed to get categories');
    }
  }

  async createCategory(categoryData: { name: string; description?: string; isActive?: boolean }): Promise<ICategory> {
    try {
      // Validate required fields
      if (!categoryData.name || categoryData.name.trim() === '') {
        throw new BadRequestError('Category name is required');
      }

      // Check for duplicate category name
      const existingCategory = await this._categoryInteractor.getCategoryByName(categoryData.name.trim());
      if (existingCategory) {
        throw new BadRequestError(`Category with name '${categoryData.name}' already exists`);
      }

      return await this._categoryInteractor.createCategory({
        name: categoryData.name.trim(),
        description: categoryData.description?.trim()
      });
    } catch (error: any) {
      throw new BadRequestError(error.message || 'Failed to create category');
    }
  }

  async updateCategory(id: string, categoryData: { name?: string; description?: string; isActive?: boolean }): Promise<ICategory | null> {
    try {
      // Validate category exists
      const existingCategory = await this._categoryInteractor.getCategoryById(id);
      if (!existingCategory) {
        throw new NotFoundError('Category not found');
      }

      // Validate name if provided
      if (categoryData.name) {
        if (categoryData.name.trim() === '') {
          throw new BadRequestError('Category name cannot be empty');
        }

        // Check for duplicate name (excluding current category)
        const duplicateCategory = await this._categoryInteractor.getCategoryByName(categoryData.name.trim());
        if (duplicateCategory && duplicateCategory._id.toString() !== id) {
          throw new BadRequestError(`Category with name '${categoryData.name}' already exists`);
        }
      }

      return await this._categoryInteractor.updateCategory(id, {
        name: categoryData.name?.trim(),
        description: categoryData.description?.trim(),
        isActive: categoryData.isActive
      });
    } catch (error: any) {
      throw new BadRequestError(error.message || 'Failed to update category');
    }
  }

  async deleteCategory(id: string): Promise<ICategory | null> {
    try {
      // Validate category exists
      const existingCategory = await this._categoryInteractor.getCategoryById(id);
      if (!existingCategory) {
        throw new NotFoundError('Category not found');
      }

      // Check if any products are using this category
      const productsWithCategory = await this._productInteractor.getProducts({
        category: id,
        limit: 1 // We only need to know if at least one product exists
      });

      if (productsWithCategory.products.length > 0) {
        throw new BadRequestError('Cannot delete category: it is being used by one or more products');
      }

      return await this._categoryInteractor.deleteCategory(id);
    } catch (error: any) {
      throw new BadRequestError(error.message || 'Failed to delete category');
    }
  }

  async getCategoryById(id: string): Promise<ICategory | null> {
    try {
      return await this._categoryInteractor.getCategoryById(id);
    } catch (error: any) {
      throw new BadRequestError(error.message || 'Failed to get category');
    }
  }

  async getCategoryByName(name: string): Promise<ICategory | null> {
    try {
      return await this._categoryInteractor.getCategoryByName(name);
    } catch (error: any) {
      throw new BadRequestError(error.message || 'Failed to get category');
    }
  }

  async getActiveCategories(): Promise<ICategory[]> {
    try {
      return await this._categoryInteractor.getActiveCategories();
    } catch (error: any) {
      throw new BadRequestError(error.message || 'Failed to get active categories');
    }
  }
}
