import { IAuthService } from '@/services/authService';
import { ILoginRequest } from '@/dto/requestDTO/authDTO';

export interface ILoginUserInteractor {
  execute(credentials: ILoginRequest): Promise<{ user: any; token: string }>;
}

export class LoginUserInteractor implements ILoginUserInteractor {
  constructor(private authService: IAuthService) {}

  async execute(credentials: ILoginRequest): Promise<{ user: any; token: string }> {
    return this.authService.login(credentials);
  }
}
