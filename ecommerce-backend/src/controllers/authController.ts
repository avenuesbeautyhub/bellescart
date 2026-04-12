import { Response, NextFunction, Request } from 'express';
import { IUserInteractor } from '../providers/interfaces/IUserInteractor';
import { AuthRequest } from '../middleware/auth';
import { isValidEmail, validatePassword, validateRequiredString } from '../utils/validators';

export class AuthController {
  private _userInteractor: IUserInteractor;

  constructor(userInteractor: IUserInteractor) {
    this._userInteractor = userInteractor;
  }

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, password, phone } = req.body;

      // Step 1: Validate user data (without OTP)
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

      // Validate phone number if provided
      if (phone) {
        const phoneRegex = /^(\+91)?[0-9]{10}$/;
        if (!phoneRegex.test(phone)) {
          res.status(400).json({
            success: false,
            error: 'Invalid phone number format. Please enter a valid phone number with country code (+91) and 10 digits.'
          });
          return;
        }
      }
      console.log('req body data', req.body);

      const result = await this._userInteractor.sendOtp(email, { name, email, password, phone });

      res.status(200).json({
        success: true,
        message: `OTP sent to your ${email}. Please check and enter OTP to complete registration.`,
        data: {
          email,
          step: 'otp_sent'
        }
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

      const result = await this._userInteractor.login({
        email,
        password
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

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
        data: { user }
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

      const { name, phone, addresses } = req.body;

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
        addresses
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
        data: { user }
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

  verifyOtpAndRegister = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, otp } = req.body;

      console.log('req otp contrller',req.body)

      // Validate email format
      if (!isValidEmail(email)) {
        res.status(400).json({
          success: false,
          error: 'Invalid email format'
        });
        return;
      } 

      const otpValidation = validateRequiredString(otp, 'OTP');
      if (!otpValidation.isValid) {
        res.status(400).json({
          success: false,
          error: otpValidation.message
        });
        return;
      }


      // Verify OTP and complete registration
      const otpResult = await this._userInteractor.verifyOtp(email, parseInt(otp));
      if (!otpResult.isValid) {
        if (otpResult.isExpired) {
          res.status(400).json({
            success: false,
            error: 'OTP has expired. Please request a new OTP.'
          });
        } else if (otpResult.isInvalid) {
          res.status(400).json({
            success: false,
            error: 'Invalid OTP. Please check and try again.'
          });
        }
        return;
      }

      // Get stored user data and complete registration
      const result = await this._userInteractor.completeRegistration(email);

      res.status(201).json({
        success: true,
        message: 'Registration completed successfully!',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  resendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;

      // Validate email
      if (!isValidEmail(email)) {
        res.status(400).json({
          success: false,
          error: 'Invalid email format'
        });
        return;
      }

      const result = await this._userInteractor.resendOtp(email);

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          email: email,
          step: 'otp_resent'
        }
      });
    } catch (error) {
      next(error);
    }
  };

}

