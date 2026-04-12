import { IAuthService } from '@/services/authService';
import { IRegisterRequest } from '@/dto/requestDTO/authDTO';

export interface IRegisterUserInteractor {
  execute(userData: IRegisterRequest): Promise<{ user: any; token: string }>;
}

export class RegisterUserInteractor implements IRegisterUserInteractor {
  constructor(private authService: IAuthService) {}

  async execute(userData: IRegisterRequest): Promise<{ user: any; token: string }> {
    return this.authService.register(userData);
  }
}
