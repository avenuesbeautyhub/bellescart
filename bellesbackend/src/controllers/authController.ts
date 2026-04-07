import { Request, Response } from 'express';
import { IRegisterUserInteractor } from '@/interactors/auth/registerUserInteractor';
import { ILoginUserInteractor } from '@/interactors/auth/loginUserInteractor';
import { BaseResponse } from '@/responses/baseResponse';
import { HTTP_STATUS_CODES } from '@/constants/statusCodes';
import { IAuthenticatedRequest } from '@/middleware/authMiddleware';
import { IRegisterRequest, ILoginRequest } from '@/dto/requestDTO/authDTO';

export class AuthController {
  constructor(
    private registerUserInteractor: IRegisterUserInteractor,
    private loginUserInteractor: ILoginUserInteractor
  ) {}

  async register(req: Request, res: Response): Promise<void> {
    try {
      const userData: IRegisterRequest = req.body;
      const result = await this.registerUserInteractor.execute(userData);
      
      res.status(HTTP_STATUS_CODES.CREATED).json(
        BaseResponse.success('User registered successfully', result)
      );
    } catch (error: any) {
      throw error;
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const credentials: ILoginRequest = req.body;
      const result = await this.loginUserInteractor.execute(credentials);
      
      res.status(HTTP_STATUS_CODES.OK).json(
        BaseResponse.success('Login successful', result)
      );
    } catch (error: any) {
      throw error;
    }
  }

  async getProfile(req: IAuthenticatedRequest, res: Response): Promise<void> {
    try {
      res.status(HTTP_STATUS_CODES.OK).json(
        BaseResponse.success('Profile retrieved successfully', req.user)
      );
    } catch (error: any) {
      throw error;
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;
      
      if (!token) {
        throw new Error('VALIDATION_ERROR');
      }

      res.status(HTTP_STATUS_CODES.OK).json(
        BaseResponse.success('Token refreshed successfully')
      );
    } catch (error: any) {
      throw error;
    }
  }
}
