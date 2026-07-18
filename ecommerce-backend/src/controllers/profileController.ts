import { Response, NextFunction, Request } from 'express';
import { IUserInteractor } from '../providers/interfaces/IUserInteractor';
import { AuthRequest } from '../middleware/auth';
import { validateRequiredString } from '../utils/validators';

export class ProfileController {
  private _userInteractor: IUserInteractor;

  constructor(userInteractor: IUserInteractor) {
    this._userInteractor = userInteractor;
  }

  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const user = await this._userInteractor.getProfile(authReq.user._id.toString());

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const { name, phone, addresses, avatar } = req.body;

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

      const user = await this._userInteractor.updateProfile(authReq.user._id.toString(), {
        name,
        phone,
        addresses,
        avatar
      });

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  };

  uploadProfilePicture = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }
      
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
        return;
      }

      // Upload to Cloudinary using the cloudinary service
      const { uploadProfilePicture } = await import('../services/cloudinaryService');
      const uploadedImage = await uploadProfilePicture(req);

      const user = await this._userInteractor.updateProfile(authReq.user._id.toString(), {
        avatar: uploadedImage.url
      });

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Profile picture uploaded successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
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
      const { validatePassword } = await import('../utils/validators');
      const passwordStrengthValidation = validatePassword(newPassword);
      if (!passwordStrengthValidation.isValid) {
        res.status(400).json({
          success: false,
          error: passwordStrengthValidation.message
        });
        return;
      }

      await this._userInteractor.changePassword(authReq.user._id.toString(), {
        currentPassword,
        newPassword
      });

      res.status(200).json({
        success: true,
        message: 'Password updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  addAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const { label, address, city, state, zipCode, country, isDefault } = req.body;

      // Validate required fields
      if (!label || !address || !city || !state || !zipCode || !country) {
        res.status(400).json({
          success: false,
          error: 'All address fields are required'
        });
        return;
      }

      const user = await this._userInteractor.addAddress(authReq.user._id.toString(), {
        label,
        address,
        city,
        state,
        zipCode,
        country,
        isDefault: isDefault || false
      });

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Address added successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  };

  updateAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const { addressId } = req.params;
      const { label, address, city, state, zipCode, country, isDefault } = req.body;

      const user = await this._userInteractor.updateAddress(authReq.user._id.toString(), addressId, {
        label,
        address,
        city,
        state,
        zipCode,
        country,
        isDefault
      });

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User or address not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Address updated successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  };

  removeAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const { addressId } = req.params;

      const user = await this._userInteractor.removeAddress(authReq.user._id.toString(), addressId);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User or address not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Address removed successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  };

  setDefaultAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const { addressId } = req.params;

      const user = await this._userInteractor.setDefaultAddress(authReq.user._id.toString(), addressId);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User or address not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Default address set successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  };

  addToWishlist = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const { productId } = req.body;

      if (!productId) {
        res.status(400).json({
          success: false,
          error: 'Product ID is required'
        });
        return;
      }

      await this._userInteractor.addToWishlist(authReq.user._id.toString(), productId);

      res.status(200).json({
        success: true,
        message: 'Product added to wishlist'
      });
    } catch (error) {
      next(error);
    }
  };

  removeFromWishlist = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const { productId } = req.params;

      if (!productId) {
        res.status(400).json({
          success: false,
          error: 'Product ID is required'
        });
        return;
      }

      await this._userInteractor.removeFromWishlist(authReq.user._id.toString(), productId);

      res.status(200).json({
        success: true,
        message: 'Product removed from wishlist'
      });
    } catch (error) {
      next(error);
    }
  };

  getWishlist = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const user = await this._userInteractor.getWishlist(authReq.user._id.toString());

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { wishlist: user.wishlist }
      });
    } catch (error) {
      next(error);
    }
  };
}
