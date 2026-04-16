import { Response, NextFunction, Request } from 'express';
import { IAdminInteractor } from '../providers/interfaces/IAdminInteractor';
import { AdminRequest } from '../middleware/auth';
import { isValidEmail, validatePassword, validateRequiredString } from '../utils/validators';

export class AdminController {
  private _adminInteractor: IAdminInteractor;

  constructor(adminInteractor: IAdminInteractor) {
    this._adminInteractor = adminInteractor;
  }

  adminLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Validate required fields
      const emailValidation = validateRequiredString(email, 'Email');
      if (!emailValidation.isValid) {
        res.status(400).json({
          success: false,
          message: emailValidation.message
        });
        return;
      }

      // Validate email format
      if (!isValidEmail(email)) {
        res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
        return;
      }

      const passwordValidation = validatePassword(password);
      console.log('password validation admin lgin', passwordValidation);

      if (!passwordValidation.isValid) {
        res.status(400).json({
          success: false,
          message: passwordValidation.message
        });
        return;
      }

      const result = await this._adminInteractor.adminLogin({
        email,
        password
      });

      res.status(200).json({
        success: true,
        message: 'Admin login successful',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  registerAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, password, phone, registrationKey } = req.body;

      // Validate required fields
      const nameValidation = validateRequiredString(name, 'Name');
      if (!nameValidation.isValid) {
        res.status(400).json({
          success: false,
          message: nameValidation.message
        });
        return;
      }

      const emailValidation = validateRequiredString(email, 'Email');
      if (!emailValidation.isValid) {
        res.status(400).json({
          success: false,
          message: emailValidation.message
        });
        return;
      }

      // Validate email format
      if (!isValidEmail(email)) {
        res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
        return;
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        res.status(400).json({
          success: false,
          message: passwordValidation.message
        });
        return;
      }

      const registrationKeyValidation = validateRequiredString(registrationKey, 'Registration key');
      if (!registrationKeyValidation.isValid) {
        res.status(400).json({
          success: false,
          message: registrationKeyValidation.message
        });
        return;
      }

      // Validate phone if provided
      if (phone !== undefined) {
        const phoneValidation = validateRequiredString(phone, 'Phone');
        if (!phoneValidation.isValid) {
          res.status(400).json({
            success: false,
            message: phoneValidation.message
          });
          return;
        }
      }

      const result = await this._adminInteractor.registerAdmin({
        name,
        email,
        password,
        phone,
        registrationKey
      });

      res.status(201).json({
        success: true,
        message: result.message,
        data: { admin: result.admin }
      });
    } catch (error) {
      next(error);
    }
  };

  getAdminProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AdminRequest;
      if (!authReq.admin) {
        res.status(401).json({
          success: false,
          message: 'Admin not authenticated'
        });
        return;
      }

      const admin = await this._adminInteractor.getAdminProfile(authReq.admin._id.toString());

      if (!admin) {
        res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { admin }
      });
    } catch (error) {
      next(error);
    }
  };

  updateAdminProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AdminRequest;
      if (!authReq.admin) {
        res.status(401).json({
          success: false,
          message: 'Admin not authenticated'
        });
        return;
      }

      const { name, email, phone, permissions } = req.body;

      // Validate name if provided
      if (name !== undefined) {
        const nameValidation = validateRequiredString(name, 'Name');
        if (!nameValidation.isValid) {
          res.status(400).json({
            success: false,
            message: nameValidation.message
          });
          return;
        }
      }

      // Validate email if provided
      if (email !== undefined) {
        const emailValidation = validateRequiredString(email, 'Email');
        if (!emailValidation.isValid) {
          res.status(400).json({
            success: false,
            message: emailValidation.message
          });
          return;
        }

        // Validate email format
        if (!isValidEmail(email)) {
          res.status(400).json({
            success: false,
            message: 'Invalid email format'
          });
          return;
        }
      }

      // Validate phone if provided
      if (phone !== undefined) {
        const phoneValidation = validateRequiredString(phone, 'Phone');
        if (!phoneValidation.isValid) {
          res.status(400).json({
            success: false,
            message: phoneValidation.message
          });
          return;
        }
      }

      const admin = await this._adminInteractor.updateAdminProfile(authReq.admin._id.toString(), {
        name,
        email,
        phone,
        permissions
      });

      if (!admin) {
        res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Admin profile updated successfully',
        data: { admin }
      });
    } catch (error) {
      next(error);
    }
  };

  changeAdminPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AdminRequest;
      if (!authReq.admin) {
        res.status(401).json({
          success: false,
          message: 'Admin not authenticated'
        });
        return;
      }

      const { currentPassword, newPassword } = req.body;

      // Validate required fields
      const currentPasswordValidation = validateRequiredString(currentPassword, 'Current password');
      if (!currentPasswordValidation.isValid) {
        res.status(400).json({
          success: false,
          message: currentPasswordValidation.message
        });
        return;
      }

      const newPasswordValidation = validateRequiredString(newPassword, 'New password');
      if (!newPasswordValidation.isValid) {
        res.status(400).json({
          success: false,
          message: newPasswordValidation.message
        });
        return;
      }

      // Validate new password strength
      const passwordStrengthValidation = validatePassword(newPassword);
      if (!passwordStrengthValidation.isValid) {
        res.status(400).json({
          success: false,
          message: passwordStrengthValidation.message
        });
        return;
      }

      await this._adminInteractor.changeAdminPassword(authReq.admin._id.toString(), {
        currentPassword,
        newPassword
      });

      res.status(200).json({
        success: true,
        message: 'Admin password updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AdminRequest;
      if (!authReq.admin) {
        res.status(401).json({
          success: false,
          message: 'Admin not authenticated'
        });
        return;
      }

      const users = await this._adminInteractor.getAllUsers();

      res.status(200).json({
        success: true,
        data: { users }
      });
    } catch (error) {
      next(error);
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AdminRequest;
      if (!authReq.admin) {
        res.status(401).json({
          success: false,
          message: 'Admin not authenticated'
        });
        return;
      }

      const { userId } = req.params;
      const user = await this._adminInteractor.getUserById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AdminRequest;
      if (!authReq.admin) {
        res.status(401).json({
          success: false,
          message: 'Admin not authenticated'
        });
        return;
      }

      const { userId } = req.params;
      const { name, email, phone_number, role } = req.body;

      const updatedUser = await this._adminInteractor.updateUser(userId, {
        name,
        email,
        phone: phone_number,
        role
      });

      if (!updatedUser) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: { user: updatedUser }
      });
    } catch (error) {
      next(error);
    }
  };

  updateUserStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AdminRequest;
      if (!authReq.admin) {
        res.status(401).json({
          success: false,
          message: 'Admin not authenticated'
        });
        return;
      }

      const { userId } = req.params;
      const { status } = req.body;

      if (!['active', 'inactive', 'suspended'].includes(status)) {
        res.status(400).json({
          success: false,
          error: 'Invalid status. Must be active, inactive, or suspended'
        });
        return;
      }

      await this._adminInteractor.updateUserStatus(userId, status);

      res.status(200).json({
        success: true,
        message: `User status updated to ${status}`
      });
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AdminRequest;
      if (!authReq.admin) {
        res.status(401).json({
          success: false,
          message: 'Admin not authenticated'
        });
        return;
      }

      const { userId } = req.params;
      await this._adminInteractor.deleteUser(userId);

      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  getAdminStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AdminRequest;
      if (!authReq.admin) {
        res.status(401).json({
          success: false,
          message: 'Admin not authenticated'
        });
        return;
      }

      const stats = await this._adminInteractor.getAdminStats();

      res.status(200).json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      next(error);
    }
  };

  uploadProductImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AdminRequest;
      if (!authReq.admin) {
        res.status(401).json({
          success: false,
          message: 'Admin not authenticated'
        });
        return;
      }

      const uploadedImage = await this._adminInteractor.uploadProductImage(req);

      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        data: uploadedImage
      });
    } catch (error) {
      next(error);
    }
  };

  uploadMultipleProductImages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AdminRequest;
      if (!authReq.admin) {
        res.status(401).json({
          success: false,
          message: 'Admin not authenticated'
        });
        return;
      }

      const uploadedImages = await this._adminInteractor.uploadMultipleImages(req);

      res.status(200).json({
        success: true,
        message: 'Images uploaded successfully',
        data: uploadedImages
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Images upload failed'
      });
    }
  };

  // Product Management Methods for Admin
  getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {

      console.log('get product controled entered');


      const authReq = req as AdminRequest;
      if (!authReq.admin) {
        res.status(401).json({
          success: false,
          message: 'Admin not authenticated'
        });
        return;
      }

      const {
        page = 1,
        limit = 10,
        category,
        search,
        status,
        sort = 'createdAt',
        order = 'desc'
      } = req.query;

      const products = await this._adminInteractor.getProducts({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        category: category as string,
        search: search as string,
        status: status as string,
        sort: sort as string,
        order: order as string
      });
      console.log('get products data', products);

      res.status(200).json({
        success: true,
        data: { products }
      });
    } catch (error) {
      next(error);
    }
  };

  getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AdminRequest;
      if (!authReq.admin) {
        res.status(401).json({
          success: false,
          message: 'Admin not authenticated'
        });
        return;
      }

      const { id } = req.params;
      const product = await this._adminInteractor.getProductById(id as string);

      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Product not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { product }
      });
    } catch (error) {
      next(error);
    }
  };

  getCategoryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AdminRequest;
      if (!authReq.admin) {
        res.status(401).json({
          success: false,
          message: 'Admin not authenticated'
        });
        return;
      }

      const { id } = req.params;
      const category = await this._adminInteractor.getCategoryById(id as string);

      if (!category) {
        res.status(404).json({
          success: false,
          message: 'Category not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { category }
      });
    } catch (error) {
      next(error);
    }
  };

  createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AdminRequest;
      if (!authReq.admin) {
        res.status(401).json({
          success: false,
          message: 'Admin not authenticated'
        });
        return;
      }

      const files = req.files ? (req.files as Express.Multer.File[]) : undefined;
      const result = await this._adminInteractor.createProduct(req.body, files);

      res.status(201).json({
        success: true,
        message: result.uploadedImages ? 'Product created successfully with images' : 'Product created successfully',
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Product creation failed'
      });
    }
  };

  updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AdminRequest;
      if (!authReq.admin) {
        res.status(401).json({
          success: false,
          message: 'Admin not authenticated'
        });
        return;
      }

      const { id } = req.params;
      const files = req.files ? (req.files as Express.Multer.File[]) : undefined;
      const result = await this._adminInteractor.updateProduct(id, req.body, files);

      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Product update failed'
      });
    }
  };

  deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AdminRequest;
      if (!authReq.admin) {
        res.status(401).json({
          success: false,
          message: 'Admin not authenticated'
        });
        return;
      }

      await this._adminInteractor.deleteProduct(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('hey iam here');

      const authReq = req as AdminRequest;
      if (!authReq.admin) {
        res.status(401).json({
          success: false,
          message: 'Admin not authenticated'
        });
        return;
      }

      const { page = 1, limit = 10, search, role, status } = req.query;

      const users = await this._adminInteractor.getUsers({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string,
        role: role as string,
        status: status as string
      });
      console.log('users list in admin controler', users);

      res.status(200).json({
        success: true,
        data: { users }
      });
    } catch (error) {
      next(error);
    }
  };

  // Category Management Methods for Admin
  getAllCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AdminRequest;
      if (!authReq.admin) {
        res.status(401).json({
          success: false,
          message: 'Admin not authenticated'
        });
        return;
      }

      const categories = await this._adminInteractor.getAllCategories();

      res.status(200).json({
        success: true,
        data: { categories }
      });
    } catch (error) {
      next(error);
    }
  };

  createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AdminRequest;
      if (!authReq.admin) {
        res.status(401).json({
          success: false,
          message: 'Admin not authenticated'
        });
        return;
      }

      const { name, description, isActive } = req.body;

      // Validate required fields
      const nameValidation = validateRequiredString(name, 'Name');
      if (!nameValidation.isValid) {
        res.status(400).json({
          success: false,
          message: nameValidation.message
        });
        return;
      }

      const category = await this._adminInteractor.createCategory({
        name,
        description,
        isActive: isActive !== undefined ? isActive : true
      });

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: { category }
      });
    } catch (error) {
      next(error);
    }
  };

  updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AdminRequest;
      if (!authReq.admin) {
        res.status(401).json({
          success: false,
          message: 'Admin not authenticated'
        });
        return;
      }

      const { id } = req.params;
      const { name, description, isActive } = req.body;

      // Validate name if provided
      if (name !== undefined) {
        const nameValidation = validateRequiredString(name, 'Name');
        if (!nameValidation.isValid) {
          res.status(400).json({
            success: false,
            message: nameValidation.message
          });
          return;
        }
      }

      const category = await this._adminInteractor.updateCategory(id, {
        name,
        description,
        isActive
      });

      if (!category) {
        res.status(404).json({
          success: false,
          message: 'Category not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Category updated successfully',
        data: { category }
      });
    } catch (error) {
      next(error);
    }
  };

  deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AdminRequest;
      if (!authReq.admin) {
        res.status(401).json({
          success: false,
          message: 'Admin not authenticated'
        });
        return;
      }

      const { id } = req.params;
      const category = await this._adminInteractor.deleteCategory(id);

      if (!category) {
        res.status(404).json({
          success: false,
          message: 'Category not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}
