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
          error: emailValidation.message
        });
        return;
      }

      // Validate email format
      if (!isValidEmail(email)) {
        res.status(400).json({
          success: false,
          error: 'Invalid email format'
        });
        return;
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        res.status(400).json({
          success: false,
          error: passwordValidation.message
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
          error: nameValidation.message
        });
        return;
      }

      const emailValidation = validateRequiredString(email, 'Email');
      if (!emailValidation.isValid) {
        res.status(400).json({
          success: false,
          error: emailValidation.message
        });
        return;
      }

      // Validate email format
      if (!isValidEmail(email)) {
        res.status(400).json({
          success: false,
          error: 'Invalid email format'
        });
        return;
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        res.status(400).json({
          success: false,
          error: passwordValidation.message
        });
        return;
      }

      const registrationKeyValidation = validateRequiredString(registrationKey, 'Registration key');
      if (!registrationKeyValidation.isValid) {
        res.status(400).json({
          success: false,
          error: registrationKeyValidation.message
        });
        return;
      }

      // Validate phone if provided
      if (phone !== undefined) {
        const phoneValidation = validateRequiredString(phone, 'Phone');
        if (!phoneValidation.isValid) {
          res.status(400).json({
            success: false,
            error: phoneValidation.message
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
          error: 'Admin not authenticated'
        });
        return;
      }

      const admin = await this._adminInteractor.getAdminProfile(authReq.admin._id.toString());

      if (!admin) {
        res.status(404).json({
          success: false,
          error: 'Admin not found'
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
          error: 'Admin not authenticated'
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
            error: nameValidation.message
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
            error: emailValidation.message
          });
          return;
        }

        // Validate email format
        if (!isValidEmail(email)) {
          res.status(400).json({
            success: false,
            error: 'Invalid email format'
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
            error: phoneValidation.message
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
          error: 'Admin not found'
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
          error: 'Admin not authenticated'
        });
        return;
      }

      const { currentPassword, newPassword } = req.body;

      // Validate required fields
      const currentPasswordValidation = validateRequiredString(currentPassword, 'Current password');
      if (!currentPasswordValidation.isValid) {
        res.status(400).json({
          success: false,
          error: currentPasswordValidation.message
        });
        return;
      }

      const newPasswordValidation = validateRequiredString(newPassword, 'New password');
      if (!newPasswordValidation.isValid) {
        res.status(400).json({
          success: false,
          error: newPasswordValidation.message
        });
        return;
      }

      // Validate new password strength
      const passwordStrengthValidation = validatePassword(newPassword);
      if (!passwordStrengthValidation.isValid) {
        res.status(400).json({
          success: false,
          error: passwordStrengthValidation.message
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
          error: 'Admin not authenticated'
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
          error: 'Admin not authenticated'
        });
        return;
      }

      const { userId } = req.params;
      const user = await this._adminInteractor.getUserById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
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

  updateUserStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AdminRequest;
      if (!authReq.admin) {
        res.status(401).json({
          success: false,
          error: 'Admin not authenticated'
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
          error: 'Admin not authenticated'
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
          error: 'Admin not authenticated'
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
}
